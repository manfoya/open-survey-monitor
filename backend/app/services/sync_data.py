# backend/app/services/sync_data.py

import sys
import os
from datetime import datetime, time, date, timedelta
from decimal import Decimal
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# hack pour imports modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.users import User, RoleEnum
from app.models.quotas import Quota, UserQuota
from app.services.quota_engine import QuotaEngine
from app.models.zones import Affectation
from app.models.settings import GlobalSettings
from app.models.survey import SurveyData, SurveyStatus
from app.models.dictionary import Variable

# chargement variables env du fichier .env racine
load_dotenv()

# configuration mysql sécurisée (Hostinger)
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")
MYSQL_TABLE_DEFAULT = os.getenv("MYSQL_TABLE")

def get_mysql_connection():
    if not MYSQL_PASSWORD:
        print("erreur: mysql_password manquant dans .env")
        return None
    
    url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    try:
        engine = create_engine(url)
        return engine.connect()
    except Exception as e:
        print(f"erreur connexion mysql: {e}")
        return None

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    calcul de distance haversine en mètres
    """
    from math import radians, cos, sin, asin, sqrt
    
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
        
    try:
        # conversion degrés -> radians
        lon1, lat1, lon2, lat2 = map(radians, [float(lon1), float(lat1), float(lon2), float(lat2)])
        
        dlon = lon2 - lon1 
        dlat = lat2 - lat1 
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a)) 
        r = 6371 # rayon terre km
        return c * r * 1000
    except:
        return None

def clean_for_json(data):
    """
    Nettoie récursivement un dictionnaire ou une liste pour le rendre sérialisable en JSON.
    Gère : datetime, date, time, timedelta, Decimal.
    """
    if isinstance(data, dict):
        return {k: clean_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_for_json(v) for v in data]
    elif isinstance(data, (datetime, date, time)):
        return data.isoformat()
    elif isinstance(data, timedelta):
        return str(data)  # ou data.total_seconds()
    elif isinstance(data, Decimal):
        return float(data)
    return data

def parse_time(val):
    """Parse time from various formats (HH:MM, HH:MM:SS, or time object)"""
    if val is None or val == "":
        return None
    if isinstance(val, time):
        return datetime.combine(datetime.today(), val)
    val_str = str(val).strip()
    # Essayer plusieurs formats
    for fmt in ["%H:%M:%S", "%H:%M", "%H%M%S", "%H%M"]:
        try:
            return datetime.strptime(val_str, fmt)
        except ValueError:
            continue
    return None

def sync_surveys():
    print(f"[{datetime.now()}] Démarrage synchronisation optimisée...")
    
    db = SessionLocal()
    conn_source = None
    
    try:
        # 1. Chargement Settings & Metadata (Une seule fois)
        settings = db.query(GlobalSettings).first()
        if not settings:
            settings = GlobalSettings()
        
        # Détermination de la table cible
        target_table = settings.target_table_name if settings.target_table_name else MYSQL_TABLE_DEFAULT
        print(f" -> Table source : {target_table}")

        # Pre-load Agents (Pour éviter N+1 requêtes)
        # On garde les deux maps : ID et Objet complet (pour Zones)
        agents_map = {} # Code -> ID
        agents_obj_map = {} # Code -> User Object
        all_agents = db.query(User).filter(User.cspro_code != None).all()
        for u in all_agents:
            agents_map[str(u.cspro_code)] = u.id
            agents_obj_map[str(u.cspro_code)] = u
        
        print(f" -> Agents chargés en cache : {len(agents_map)}")

        # ===== RESET DES QUOTAS =====
        # Reset de tous les effectifs à 0 avant recalcul
        print(" -> Reset des quotas à 0...")
        db.query(UserQuota).update({UserQuota.effectif_actuel: 0})
        db.flush()
        
        # Pre-load des définitions de Quotas
        # Structure: { user_id: [ (UserQuota, definition_dict) ] }
        user_quotas_map = {}
        all_active_quotas = db.query(UserQuota).filter(UserQuota.is_active == True).all()
        
        count_q = 0
        for uq in all_active_quotas:
            # On doit charger la définition depuis la relation Quota
            # Note: idéalement faire un join, mais ici boucle mémoire ok
            quota_def = db.query(Quota).filter(Quota.id == uq.quota_id).first()
            if quota_def and quota_def.definition:
                if uq.user_id not in user_quotas_map:
                    user_quotas_map[uq.user_id] = []
                user_quotas_map[uq.user_id].append((uq, quota_def.definition))
                count_q += 1
        
        print(f" -> Règles de quotas chargées : {count_q}")
        
        # Charge Mapping Variables (Slug -> Source Column)
        variables_map = {}
        all_vars = db.query(Variable).filter(Variable.source_column != None).all()
        for v in all_vars:
            variables_map[v.slug] = v.source_column
        print(f" -> Variables mappées : {len(variables_map)}")

        # 2. Lecture par lots
        BATCH_SIZE = 500 # Réduit pour éviter les timeouts
        offset = 0
        total_processed = 0
        
        while True:
            # On demande une nouvelle connexion pour chaque batch pour éviter le "Gone Away"
            # si le traitement local est trop long
            conn_source = get_mysql_connection()
            if not conn_source:
                print("Erreur: Impossible d'établir la connexion source pour le batch.")
                break

            try:
                # On lit par paquets
                query = text(f"SELECT * FROM {target_table} LIMIT {BATCH_SIZE} OFFSET {offset}")
                rows = conn_source.execute(query).fetchall()
            except Exception as e:
                print(f"Erreur SQL Source: {e}")
                break
            finally:
                conn_source.close() # On ferme tout de suite après lecture
            
            if not rows:
                break
            
            keys = rows[0]._fields
            current_batch_uuids = []
            row_dicts = []

            for row in rows:
                data = dict(zip(keys, row))
                uuid = None
                if settings.variable_id_interne:
                     uuid = data.get(settings.variable_id_interne)
                if not uuid:
                     uuid = data.get('questionnaire_uuid') or data.get('uuid') or data.get('id')

                if uuid:
                    uuid_str = str(uuid)
                    current_batch_uuids.append(uuid_str)
                    row_dicts.append((uuid_str, data))
            
            if not current_batch_uuids:
                offset += BATCH_SIZE
                continue

            existing_surveys = db.query(SurveyData).filter(SurveyData.questionnaire_uuid.in_(current_batch_uuids)).all()
            existing_map = {s.questionnaire_uuid: s for s in existing_surveys}
            
            new_objects = []
            
            for uuid_str, data in row_dicts:
                agent_code = None
                if settings.variable_code_agent:
                    agent_code = data.get(settings.variable_code_agent)
                if not agent_code:
                    agent_code = data.get('agent_id') or data.get('code_agent')

                agent_code_str = str(agent_code) if agent_code else None
                
                survey = existing_map.get(uuid_str)
                
                # --- MODIF : ON NE SKIP PAS LES VALIDES ---
                # On traite tout le monde pour les quotas
                
                if not survey:
                    survey = SurveyData(questionnaire_uuid=uuid_str)
                    new_objects.append(survey)
                
                # Update basic fields
                survey.agent_code = agent_code_str
                # Nettoyage JSON
                clean_data = clean_for_json(data)
                survey.answers = clean_data
                
                if agent_code_str and agent_code_str in agents_map:
                    survey.user_id = agents_map[agent_code_str]
                
                # --- STATUT ---
                is_partial = False
                if settings.variable_indicateur_partiel:
                    val_partiel = data.get(settings.variable_indicateur_partiel)
                    if str(val_partiel) == str(settings.valeur_partiel):
                        is_partial = True
                
                qc_results = {}
                is_valid = False 

                if is_partial:
                    survey.status = SurveyStatus.partiel
                    survey.is_valid = False
                    qc_results['status'] = {"status": "info", "val": "partiel_source"}
                else:
                    is_valid = True 
                    survey.status = SurveyStatus.complet

                    # --- QC CHECKS ---
                    
                    # Durée
                    start_val = data.get(settings.variable_duree_start) if settings.variable_duree_start else None
                    end_val = data.get(settings.variable_duree_end) if settings.variable_duree_end else None
                    duree = 0
                    if start_val and end_val:
                        try:
                            t1 = parse_time(start_val)
                            t2 = parse_time(end_val)
                            if t1 and t2:
                                duree = int((t2 - t1).total_seconds() / 60)
                                if duree < 0: duree += 24 * 60
                        except Exception as e:
                            duree = 0
                    survey.duree_minutes = duree

                    # GPS
                    lat = data.get(settings.variable_gps_lat) if settings.variable_gps_lat else data.get('gps_latitude')
                    lon = data.get(settings.variable_gps_lon) if settings.variable_gps_lon else data.get('gps_longitude')
                    if lat: survey.latitude = float(lat)
                    if lon: survey.longitude = float(lon)

                    # Date
                    date_str = data.get(settings.variable_date_enquete) if settings.variable_date_enquete else None
                    if date_str:
                        date_parsed = None
                        val_str = str(date_str).strip()
                        for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%Y%m%d", "%d-%m-%Y"]:
                            try:
                                date_parsed = datetime.strptime(val_str, fmt)
                                break
                            except ValueError: 
                                continue
                        if date_parsed:
                            survey.date_entretien = date_parsed
                    else:
                        if not survey.date_entretien: 
                            survey.date_entretien = datetime.now()

                    survey.date_synchro = datetime.now()

                    # QC Logique
                    if settings.check_duree and settings.min_duree_minutes:
                        if duree < settings.min_duree_minutes:
                            qc_results['duree'] = {"status": "fail", "val": duree}
                            is_valid = False
                        else:
                            qc_results['duree'] = {"status": "ok", "val": duree}
                    
                    if settings.check_heure:
                        h_val = data.get(settings.variable_heure_enquete) if settings.variable_heure_enquete else None
                        if not h_val and start_val: h_val = start_val
                        parsed_h = parse_time(h_val)
                        if parsed_h:
                            t_check = parsed_h.time()
                            is_hour_valid = True
                            if settings.heure_debut_travail and t_check < settings.heure_debut_travail: is_hour_valid = False
                            if settings.heure_fin_travail and t_check > settings.heure_fin_travail: is_hour_valid = False
                            
                            if not is_hour_valid:
                                qc_results['heure'] = {"status": "fail", "val": str(t_check)}
                                is_valid = False
                            else:
                                qc_results['heure'] = {"status": "ok", "val": str(t_check)}
                    
                    if settings.check_gps and agent_code_str in agents_obj_map:
                        agent_obj = agents_obj_map[agent_code_str]
                        if survey.latitude and survey.longitude:
                            zone = agent_obj.get_active_zone(db) 
                            if zone:
                                dist = calculate_distance(survey.latitude, survey.longitude, zone.latitude_centrale, zone.longitude_centrale)
                                if dist is not None and dist > settings.tolerance_gps_metres:
                                    qc_results['gps'] = {"status": "fail", "val": int(dist), "zone": zone.nom_zone}
                                    is_valid = False
                                else:
                                    qc_results['gps'] = {"status": "ok", "val": int(dist) if dist else 0}

                survey.is_valid = is_valid
                survey.qc_results = clean_for_json(qc_results)

                # --- UPDATE QUOTAS (NEW LOGIC) ---
                if is_valid and agent_code_str and agent_code_str in agents_map:
                     agent_user_id = agents_map[agent_code_str]
                     
                     # Récupérer les quotas préchargés pour cet agent
                     user_qs = user_quotas_map.get(agent_user_id, [])

                     # Préparation des données mappées (Slug -> Valeur)
                     mapped_data = clean_data.copy()
                     
                     # 1. Appliquer le mapping explicite (source_column)
                     for slug, source_col in variables_map.items():
                         if source_col in clean_data:
                             mapped_data[slug] = clean_data[source_col]
                     
                     # 2. Fallback: Case-insensitive match pour les slugs non mappés
                     # On crée un dict { "q102": "valeur", "Q102": "valeur" ... } pour être sûr
                     keys_lower = {k.lower(): v for k, v in clean_data.items()}
                     
                     for uq_item, definition_item in user_qs:
                         # Hack: on injecte les valeurs manquantes en cherchant en minuscule
                         # Cette étape est coûteuse, on pourrait l'optimiser, mais c'est sûr.
                         # On parcourt les règles du quota pour voir de quels champs il a besoin
                         # (Note: QuotaEngine ne nous dit pas quels champs il veut, donc on fait un "Best Effort" global ou on modifie le moteur)
                         # Approche simple: On essaie de matcher les keys du data avec les slugs des variables
                         pass 
                     
                     # Mieux : on injecte TOUTES les clés en lowercase et uppercase dans mapped_data pour augmenter les chances ?
                     # Non, risque de collision.
                     # On va plutôt modifier mapped_data pour inclure les versions slugs si trouvées insensiblement.
                     
                     # Pour chaque variable 'is_quota', si on ne la trouve pas dans mapped_data, on cherche en insensitive
                     # Optimisation : On le fait juste pour les besoins du QuotaEngine ?
                     # Non, faisons le simple :
                     
                     for key in list(clean_data.keys()):
                         mapped_data[key.upper()] = clean_data[key]
                         mapped_data[key.lower()] = clean_data[key]
                         # Ainsi Q102, q102 seront trouvés
                     
                     for uq_item, definition_item in user_qs:
                         try:
                             # Debug log pour comprendre pourquoi ça ne match pas (limité aux 5 premiers logs)
                             if total_processed < 5:
                                print(f"\n[DEBUG] Survey {uuid_str} | Valid={is_valid} | Agent={agent_code_str}")
                                print(f" - Checking Quota {uq_item.quota_id} (User {agent_user_id})")
                                print(f" - Definition: {definition_item}")
                                # On affiche quelques clés de mapped_data pour vérifier
                                sample_keys = list(mapped_data.keys())[:5]
                                print(f" - Data Keys (sample): {sample_keys}")
                                match_result = QuotaEngine.check(definition_item, mapped_data)
                                print(f" -> Match Result: {match_result}")

                             if QuotaEngine.check(definition_item, mapped_data):
                                 uq_item.effectif_actuel += 1
                         except Exception as e:
                             print(f"Erreur eval quota {uq_item.id}: {e}")

                total_processed += 1
            
            if new_objects:
                db.add_all(new_objects)
            
            db.commit()
            print(f" -> Batch traité: {len(row_dicts)} lignes (Offset: {offset})")
            
            offset += BATCH_SIZE

        print(f"[{datetime.now()}] Synchronisation terminée. {total_processed} enquêtes traitées.")
        
    except Exception as e:
        print(f"ERREUR CRITIQUE: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    sync_surveys()
