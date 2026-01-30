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
from app.models.settings import GlobalSettings
from app.models.survey import SurveyData, SurveyStatus
from app.models.dictionary import Variable
from app.services.quota_engine import QuotaEngine

# chargement variables env du fichier .env racine
load_dotenv()

# configuration mysql sécurisée
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")
MYSQL_TABLE = os.getenv("MYSQL_TABLE")

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
        
    # conversion degrés -> radians
    lon1, lat1, lon2, lat2 = map(radians, [float(lon1), float(lat1), float(lon2), float(lat2)])
    
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # rayon terre km
    return c * r * 1000

def sync_surveys():
    print("demarrage synchronisation...")
    
    db = SessionLocal()
    conn_source = None
    
    try:
        # chargement settings
        settings = db.query(GlobalSettings).first()
        if not settings:
            # fallback si settings pas initialisé
            settings = GlobalSettings()
            
        conn_source = get_mysql_connection()
        if not conn_source:
            return

        # lecture données source
        # note: optimisation possible en sélectionnant uniquement les colonnes nécessaires
        query = text(f"SELECT * FROM {MYSQL_TABLE}")
        rows = conn_source.execute(query).fetchall()
        
        if not rows:
            print("aucune donnée trouvée sur le serveur source.")
            return

        keys = rows[0]._fields
        processed_count = 0
        
        for row in rows:
            data = dict(zip(keys, row))
            
            # récupération identifiants
            uuid = data.get('questionnaire_uuid') or data.get('uuid') or data.get('id') # adapter selon colonne réelle
            agent_code = data.get('agent_id') or data.get('code_agent')
            
            if not uuid:
                continue

            # recherche existant pour update ou insert
            survey = db.query(SurveyData).filter(SurveyData.questionnaire_uuid == str(uuid)).first()
            
            # optimisation : si l'enquête est déjà complète et validée, on ne la touche plus
            # sauf si on veut permettre la correction a posteriori ? pour l'instant on optimise
            if survey and survey.status == SurveyStatus.complet and survey.is_valid:
                 processed_count += 0 # on compte pas ou on ignore
                 continue

            if not survey:
                survey = SurveyData(questionnaire_uuid=str(uuid))
                db.add(survey)
            
            # mise à jour champs de base (upsert)
            survey.agent_code = str(agent_code) if agent_code else None
            survey.answers = data
            
            agent = db.query(User).filter(User.cspro_code == survey.agent_code).first()
            if agent:
                survey.user_id = agent.id
            
            # --- controle qualite ---
            qc_results = {}
            is_valid = True # valide par défaut, invalidé si échec d'un test actif
            
            # mapping dynamique variables
            # duree
            start_val = data.get(settings.variable_duree_start) if settings.variable_duree_start else None
            end_val = data.get(settings.variable_duree_end) if settings.variable_duree_end else None
            
            duree = 0
            if start_val and end_val:
                try:
                    # format attendu hh:mm ou hhmm, adaptation simple ici
                    # a adapter selon format réel cspro
                    t1 = datetime.strptime(str(start_val), "%H:%M")
                    t2 = datetime.strptime(str(end_val), "%H:%M")
                    duree = int((t2 - t1).total_seconds() / 60)
                except:
                    duree = 0
            
            survey.duree_minutes = duree

            # gps
            lat = data.get(settings.variable_gps_lat) if settings.variable_gps_lat else data.get('gps_latitude')
            lon = data.get(settings.variable_gps_lon) if settings.variable_gps_lon else data.get('gps_longitude')
            
            if lat: survey.latitude = float(lat)
            if lon: survey.longitude = float(lon)
            
            # date enquete
            date_str = data.get(settings.variable_date_enquete) if settings.variable_date_enquete else None
            if date_str:
                try:
                    survey.date_entretien = datetime.strptime(str(date_str), "%Y-%m-%d") # format iso supposé
                except:
                    pass
            else:
                 survey.date_entretien = datetime.now() # fallback
                 
            survey.date_synchro = datetime.now()

            # application regles qc si actives
            
            # 1. duree
            if settings.check_duree and settings.min_duree_minutes:
                if duree < settings.min_duree_minutes:
                    qc_results['duree'] = {"status": "fail", "val": duree}
                    is_valid = False
                else:
                    qc_results['duree'] = {"status": "ok", "val": duree}
            
            # 2. gps (zone)
            if settings.check_gps and agent:
                zone = agent.get_active_zone(db)
                if zone:
                    dist = calculate_distance(survey.latitude, survey.longitude, zone.latitude_centrale, zone.longitude_centrale)
                    if dist is not None:
                         if dist > settings.tolerance_gps_metres:
                             qc_results['gps'] = {"status": "fail", "val": int(dist), "zone": zone.nom_zone}
                             is_valid = False
                         else:
                             qc_results['gps'] = {"status": "ok", "val": int(dist)}
                    else:
                        qc_results['gps'] = {"status": "fail", "val": "no_calc"}
                        is_valid = False
                else:
                    # pas de zone assignée = pas de controle possible ou erreur ?
                    # on décide de ne pas invalider si pas de zone, sauf consigne contraire
                    qc_results['gps'] = {"status": "skip", "val": "no_zone"}
            
            # 3. jours interdits
            if settings.check_jours and survey.date_entretien:
                # transformation "dimanche,samedi" -> liste
                jours_interdits = [j.strip().lower() for j in (settings.jours_interdits or "").split(',')]
                jour_enquete = survey.date_entretien.strftime("%A").lower()
                # attention strftime dépend locale, ici on suppose anglais par défaut ou config
                # mapping manuel français si besoin
                map_jours = {"monday": "lundi", "tuesday": "mardi", "wednesday": "mercredi",
                             "thursday": "jeudi", "friday": "vendredi", "saturday": "samedi", "sunday": "dimanche"}
                jour_fr = map_jours.get(jour_enquete, jour_enquete)
                
                if jour_fr in jours_interdits:
                     qc_results['jours'] = {"status": "fail", "val": jour_fr}
                     is_valid = False
                else:
                     qc_results['jours'] = {"status": "ok", "val": jour_fr}

            # 4. heures
            if settings.check_heure and settings.heure_debut_travail and settings.heure_fin_travail:
                # logique a implementer si heure dispo
                pass

            survey.is_valid = is_valid
            survey.qc_results = qc_results
            survey.status = SurveyStatus.complet if is_valid else SurveyStatus.partiel
            
            processed_count += 1
        
        db.commit()
        print(f"synchronisation terminee. {processed_count} enquetes traitees.")
        
    except Exception as e:
        print(f"erreur critique: {e}")
        db.rollback()
    finally:
        db.close()
        if conn_source:
            conn_source.close()

if __name__ == "__main__":
    sync_surveys()
