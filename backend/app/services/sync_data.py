# backend/app/services/sync_data.py

# 1. Se connecter à MySQL (Hostinger)
# 2. Récupérer les lignes non synchronisées (ex: WHERE is_synced = 0)
for row in raw_surveys:
    # row est un dict : {"id_agent": "007", "sexe": "1", "age": "25", ...}
    
    # 3. Trouver l'utilisateur correspondant dans la base Postgres
    user = db.query(User).filter(User.cspro_id == row["id_agent"]).first()
    
    # 4. Récupérer les quotas assignés à cet agent (UserQuota)
    active_user_quotas = db.query(UserQuota).filter(
        UserQuota.user_id == user.id, 
        UserQuota.is_active == True
    ).all()
    
    # 5. Passer les données au engine
    for u_quota in active_user_quotas:
        # On utilise le moteur de quota (quota_engine)
        if QuotaEngine.check(u_quota.quota.definition, row):
            # 6. Si ça match, on incrémente le compteur
            u_quota.effectif_actuel += 1
    
    # 7. Marquer comme synchronisé sur Hostinger
    mark_as_synced(row["id"])



import sys
import os
from datetime import datetime, time
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Hack pour importer les modules 'app' depuis le dossier services
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.users import User
from app.models.quotas import UserQuota$ 
from app.models.settings import GlobalSettings
from app.models.survey import SurveyData
from app.models.dictionary import Variable
# --- CONFIGURATION (À récupérer plus tard via une table Campaign) ---
# Sécurisation via variables d'environnement
MYSQL_USER = os.getenv("MYSQL_USER", "u100076301_enq2026")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST", "193.203.168.147")
MYSQL_DB = os.getenv("MYSQL_DB", "u100076301_enq2026")
MYSQL_TABLE = os.getenv("MYSQL_TABLE", "QUESTIONNAIRE_ENQ_2024_2025_DICT")

MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

if not MYSQL_PASSWORD:
    print("❌ Erreur: La variable d'environnement MYSQL_PASSWORD n'est pas définie dans .env")
    sys.exit(1)

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Fonction simple pour calculer la distance entre deux points (Haversine).
    Retourne la distance en mètres.
    """
    from math import radians, cos, sin, asin, sqrt
    if not lat1 or not lon1 or not lat2 or not lon2:
        return 999999 # Distance infinie si pas de coordonnées
    
    # Conversion degrés -> radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Rayon de la terre en km
    return c * r * 1000 # Retour en mètres

def sync_surveys():
    print("🚀 Démarrage de la synchronisation...")
    
    db = SessionLocal()
    
    try:
        # 1. Charger la Configuration (L'Arbitre)
        settings = db.query(GlobalSettings).first()
        if not settings:
            print("⚠️ Pas de GlobalSettings trouvé. Utilisation des valeurs par défaut.")
            settings = GlobalSettings() # Valeurs par défaut

        # 2. Charger les Variables utiles (Quotas & Qualité)
        # On ne veut pas tout télécharger, juste ce qui sert à calculer
        # (Ici on simplifie en prenant tout, mais en prod on filtrerait)
        
        # 3. Connexion Source (MySQL Hostinger)
        try:
            engine_source = create_engine(MYSQL_URL)
            conn_source = engine_source.connect()
        except Exception as e:
            print(f"❌ Erreur connexion MySQL: {e}")
            return

        # 4. Récupérer les nouvelles données
        # (Idéalement on utilise un curseur 'last_id', ici on prend tout pour l'exemple)
        print("📥 Téléchargement des données depuis Hostinger...")
        # On suppose que les colonnes s'appellent : id, agent_id (ou user_code), start_time, end_time, gps_latitude, gps_longitude
        # Adapte la requête SQL selon tes VRAIS noms de colonnes CSPro !
        query = text(f"SELECT * FROM {MYSQL_TABLE}") 
        rows = conn_source.execute(query).fetchall()
        
        processed_count = 0
        
        # On récupère les noms de colonnes pour mapper en dict
        keys = rows[0]._fields if rows else []

        for row in rows:
            # Conversion Row -> Dict pour manipulation facile
            data = dict(zip(keys, row))
            
            source_id = data.get('id') # ID unique de l'enquête
            cspro_id = data.get('agent_id') # L'identifiant de l'agent (ex: AG_007)

            # A. Identification de l'Agent
            agent = db.query(User).filter(User.cspro_id == cspro_id).first()
            if not agent:
                # Si on ne connait pas l'agent, on ignore (ou on loggue une erreur)
                # print(f"⚠️ Agent inconnu: {cspro_id}")
                continue

            # B. Vérification si l'enquête existe déjà (Doublon ?)
            existing_survey = db.query(SurveyData).filter(SurveyData.source_id == source_id).first()
            if existing_survey:
                continue # On passe au suivant, déjà traité

            # =========================================================
            # C. LE CONTRÔLE QUALITÉ (Le cœur du sujet !)
            # =========================================================
            
            qc_results = {}
            is_globally_valid = True # On part du principe qu'il est innocent jusqu'à preuve du contraire

            # --- 1. Test Durée ---
            duree_reelle = 0
            
            # Récupération dynamique des heures
            start_str = data.get(settings.variable_duree_start) if settings.variable_duree_start else None
            end_str = data.get(settings.variable_duree_end) if settings.variable_duree_end else None
            
            if start_str and end_str:
                # TENTATIVE DE PARSING (A adapter selon le format CSPro, souvent HH:MM ou HHMM)
                try:
                    # Ex calcul simple si format HH:MM
                     t1 = datetime.strptime(str(start_str), "%H:%M")
                     t2 = datetime.strptime(str(end_str), "%H:%M")
                     delta = t2 - t1
                     duree_reelle = int(delta.total_seconds() / 60)
                except:
                     duree_reelle = 0 # Erreur de parsing
            else:
                 # Fallback si pas configuré (valeur par défaut ou erreur ?)
                 # Ici on met 15 pour ne pas tout casser si non configuré
                 duree_reelle = 15 

            if settings.check_duree:
                if duree_reelle < settings.min_duree_minutes:
                    qc_results['duree'] = {"status": "FAIL", "val": f"{duree_reelle}min"}
                    is_globally_valid = False
                else:
                    qc_results['duree'] = {"status": "OK", "val": f"{duree_reelle}min"}

            # --- 2. Test GPS (Hors Zone) ---
            # Récupération dynamique
            lat = None
            lon = None
            if settings.variable_gps_lat and settings.variable_gps_lon:
                lat = data.get(settings.variable_gps_lat)
                lon = data.get(settings.variable_gps_lon)
            else:
                # Fallback noms classiques
                lat = data.get('gps_latitude') or data.get('gps_lat')
                lon = data.get('gps_longitude') or data.get('gps_lon')
            
            # NOTE : Pour vérifier la zone, il faut que l'agent soit assigné à une zone
            # et que la zone ait un point central.
            # user_zone_lat = agent.zone.latitude ... (À adapter selon ton modèle Zone)
            
            if settings.check_gps:
                if lat and lon:
                    # Simulation : Imaginons que l'agent doit être à (6.35, 2.40)
                    # dist = calculate_distance(lat, lon, agent.zone.lat, agent.zone.lon)
                    dist = 100 # Valeur fictive pour l'exemple
                    
                    if dist > settings.tolerance_gps_metres:
                        qc_results['gps'] = {"status": "FAIL", "val": f"{int(dist)}m"}
                        is_globally_valid = False
                    else:
                        qc_results['gps'] = {"status": "OK", "val": f"{int(dist)}m"}
                else:
                    # Pas de GPS du tout = Échec si le contrôle est strict
                    qc_results['gps'] = {"status": "FAIL", "val": "No Signal"}
                    is_globally_valid = False

            # --- 3. Test Heure & Jours ---
            if settings.check_heure:
                # Vérifier si l'heure de l'enquête est dans les bornes
                pass 
            
            # =========================================================
            # D. ENREGISTREMENT
            # =========================================================

            new_survey = SurveyData(
                user_id=agent.id,
                source_id=source_id,
                date_enquete=datetime.now(), 
                duree_minutes=duree_reelle,
                gps_lat=lat,
                gps_lon=lon,
                is_valid=is_globally_valid,
                status=SurveyStatus.complet if is_globally_valid else SurveyStatus.partiel, # <--- Fix status
                qc_results=qc_results,
                answers=data
            )
            db.add(new_survey)

            # =========================================================
            # E. MISE À JOUR DES QUOTAS
            # =========================================================
            
            # Note : On ne compte le quota que si l'enquête est VALIDE ?
            # Ou on compte tout ? Souvent on compte tout pour l'avancement, 
            # mais on paye sur le valide. Ici, comptons si valide.
            
            if is_globally_valid:
                # On récupère les quotas assignés à l'agent
                user_quotas = db.query(UserQuota).filter(
                    UserQuota.user_id == agent.id,
                    UserQuota.is_active == True
                ).all()

                for uq in user_quotas:
                    # On appelle le moteur magique de Martial
                    # Il checke si les données 'data' matchent la définition JSON
                    if QuotaEngine.check(uq.quota.definition, data):
                        uq.effectif_actuel += 1
            
            processed_count += 1
            
        db.commit()
        print(f"✅ Synchronisation terminée ! {processed_count} enquêtes traitées.")

    except Exception as e:
        print(f"❌ Erreur critique : {e}")
        db.rollback()
    finally:
        db.close()
        if 'conn_source' in locals():
            conn_source.close()

if __name__ == "__main__":
    sync_surveys()

