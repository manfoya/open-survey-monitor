# backend/app/services/sync_data.py

import sys
import os
from datetime import datetime, time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# hack pour imports modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.users import User, RoleEnum
from app.models.quotas import UserQuota
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
        # On crée un dictionnaire { 'code_cspro': user_id }
        # On suppose que User.cspro_code est peuplé
        agents_map = {}
        agents_obj_map = {} # Pour récupérer l'objet complet si besoin (zones)
        all_agents = db.query(User).filter(User.cspro_code != None).all()
        for u in all_agents:
            agents_map[str(u.cspro_code)] = u.id
            agents_obj_map[str(u.cspro_code)] = u
        
        print(f" -> Agents chargés en cache : {len(agents_map)}")

        conn_source = get_mysql_connection()
        if not conn_source:
            return

        # 2. Lecture par lots (Batch Processing)
        # Pour éviter de charger 100 000 lignes en RAM
        BATCH_SIZE = 1000
        offset = 0
        total_processed = 0
        
        while True:
            # On lit par paquets
            query = text(f"SELECT * FROM {target_table} LIMIT {BATCH_SIZE} OFFSET {offset}")
            rows = conn_source.execute(query).fetchall()
            
            if not rows:
                break
            
            keys = rows[0]._fields
            current_batch_uuids = []
            row_dicts = []

            # Pré-traitement du batch pour extraire les UUIDs
            for row in rows:
                data = dict(zip(keys, row))
                
                # Extraction UUID (Dynamique)
                uuid = None
                if settings.variable_id_interne:
                     uuid = data.get(settings.variable_id_interne)
                
                # Fallback UUID
                if not uuid:
                     uuid = data.get('questionnaire_uuid') or data.get('uuid') or data.get('id')

                if uuid:
                    uuid_str = str(uuid)
                    current_batch_uuids.append(uuid_str)
                    row_dicts.append((uuid_str, data))
            
            if not current_batch_uuids:
                offset += BATCH_SIZE
                continue

            # 3. Chargement des Surveys existants pour ce batch (1 seule requête)
            existing_surveys = db.query(SurveyData).filter(SurveyData.questionnaire_uuid.in_(current_batch_uuids)).all()
            existing_map = {s.questionnaire_uuid: s for s in existing_surveys}
            
            # 4. Traitement du batch
            new_objects = []
            
            for uuid_str, data in row_dicts:
                # Extraction Code Agent (Dynamique)
                agent_code = None
                if settings.variable_code_agent:
                    agent_code = data.get(settings.variable_code_agent)
                
                # Fallback Agent
                if not agent_code:
                    agent_code = data.get('agent_id') or data.get('code_agent')

                agent_code_str = str(agent_code) if agent_code else None
                
                survey = existing_map.get(uuid_str)
                
                # Optimisation: Si complet et validé, on skip (sauf si force update)
                if survey and survey.status == SurveyStatus.complet and survey.is_valid:
                    continue

                if not survey:
                    survey = SurveyData(questionnaire_uuid=uuid_str)
                    new_objects.append(survey) # On l'ajoutera en bloc
                
                # Mise à jour des champs
                survey.agent_code = agent_code_str
                survey.answers = data
                
                # Liaison Agent (Memory Lookup - Ultra rapide)
                if agent_code_str and agent_code_str in agents_map:
                    survey.user_id = agents_map[agent_code_str]
                
                # --- LOGIQUE PARTIEL vs COMPLET ---
                # Par défaut, on considère complet sauf preuve du contraire
                is_partial = False
                
                if settings.variable_indicateur_partiel:
                    val_partiel = data.get(settings.variable_indicateur_partiel)
                    # On compare en string pour être sûr (ex: "1" == "1")
                    if str(val_partiel) == str(settings.valeur_partiel):
                        is_partial = True
                
                qc_results = {}
                is_valid = False # Sera True seulement si complet ET QC OK

                if is_partial:
                    survey.status = SurveyStatus.partiel
                    survey.is_valid = False
                    qc_results['status'] = {"status": "info", "val": "partiel_source"}
                else:
                    # C'est un complet (déclaré), on lance les contrôles QC
                    is_valid = True 

                    # Mapping Variables
                    start_val = data.get(settings.variable_duree_start) if settings.variable_duree_start else None
                    end_val = data.get(settings.variable_duree_end) if settings.variable_duree_end else None
                    
                    duree = 0
                    if start_val and end_val:
                        try:
                            # Parsing date basique
                            t1 = datetime.strptime(str(start_val), "%H:%M")
                            t2 = datetime.strptime(str(end_val), "%H:%M")
                            duree = int((t2 - t1).total_seconds() / 60)
                        except:
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
                        try:
                            survey.date_entretien = datetime.strptime(str(date_str), "%Y-%m-%d")
                        except:
                             pass
                    else:
                         if not survey.date_entretien: survey.date_entretien = datetime.now()

                    survey.date_synchro = datetime.now()

                    # Règles QC (Seulement pour les COMPLETS)
                    # 1. Durée
                    if settings.check_duree and settings.min_duree_minutes:
                        if duree < settings.min_duree_minutes:
                            qc_results['duree'] = {"status": "fail", "val": duree}
                            is_valid = False
                        else:
                            qc_results['duree'] = {"status": "ok", "val": duree}
                    
                    # 2. GPS (Nécessite Zone de l'agent)
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
                    
                    # Fin QC
                    # Si le QC échoue (is_valid=False), le statut reste COMPLET (car l'enquête est finie)
                    # mais elle sera marquée Invalide.
                    survey.status = SurveyStatus.complet

                survey.is_valid = is_valid
                survey.qc_results = qc_results

                total_processed += 1
            
            # Sauvegarde du batch
            if new_objects:
                db.add_all(new_objects)
            
            db.commit()
            print(f" -> Batch traité: {len(row_dicts)} lignes (Offset: {offset})")
            
            offset += BATCH_SIZE
            # Safety break for dev
            # if offset > 10000: break 

        print(f"[{datetime.now()}] Synchronisation terminée. {total_processed} enquêtes traitées.")
        
    except Exception as e:
        print(f"ERREUR CRITIQUE: {e}")
        db.rollback()
    finally:
        db.close()
        if conn_source:
            conn_source.close()

if __name__ == "__main__":
    sync_surveys()
