import requests
import os
import sys
import json
from datetime import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Ajout du dossier parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.survey import SurveyData, SurveyStatus
from app.models.users import User

# Chargement .env
load_dotenv()

# Configuration CSWeb
CSWEB_URL = os.getenv("CSWEB_URL", "http://votre-site-csweb/api") # A DEFINIR DANS .ENV
CSWEB_USER = os.getenv("CSWEB_USER", "admin")
CSWEB_PASSWORD = os.getenv("CSWEB_PASSWORD") # Cellui de la base Hostinger

def get_access_token():
    """Récupère un token OAuth2 ou utilise Basic Auth selon la config CSWeb."""
    # Note: CSWeb 7+ utilise souvent un token Bearer.
    # Pour l'instant, on tente une approche simple : Login endpoint
    login_url = f"{CSWEB_URL}/login" # Ou token endpoint
    
    # CECI EST UN EXEMPLE GENÉRIQUE - L'URL EXACTE DEPEND DE LA VERSION CSWEB
    # Souvent: POST /api/v1/token
    try:
        # CSWeb nécessite souvent un grant_type pour OAuth2
        payload = {
            "grant_type": "password",
            "username": CSWEB_USER,
            "password": CSWEB_PASSWORD
        }
        response = requests.post(f"{CSWEB_URL}/token", json=payload)
        
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"Erreur Auth: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Exception Auth: {e}")
        return None

def fetch_surveys(token):
    """Récupère les données JSON via l'API."""
    headers = {"Authorization": f"Bearer {token}"}
    # Endpoint standard CSWeb API pour les données
    # api/v1/data/{dictionary_name}
    # On va supposer un endpoint générique pour l'instant
    url = f"{CSWEB_URL}/cases" 
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Erreur Fetch: {response.status_code}")
            return []
    except Exception as e:
        print(f"Exception Fetch: {e}")
        return []

def sync_data():
    db = SessionLocal()
    token = get_access_token()
    
    if not token:
        print("Impossible d'obtenir un token. Vérifiez URL/User/Pass.")
        # Fallback pour test dev si pas d'API réelle encore
        return

    cases = fetch_surveys(token)
    print(f"{len(cases)} cas récupérés depuis CSWeb.")

    for case in cases:
        # Structure typique CSWeb JSON:
        # { "id": "uuid", "data": { "DICTIONNAIRE": { ... } } }
        case_id = case.get("id")
        case_data = case.get("data")
        
        if not case_id: 
            continue

        # Sauvegarde dans PostgreSQL
        survey = db.query(SurveyData).filter(SurveyData.questionnaire_uuid == case_id).first()
        if not survey:
            survey = SurveyData(questionnaire_uuid=case_id)
            db.add(survey)
        
        # On stocke tout le JSON propre dans le champ 'answers' (JSONB)
        # Plus besoin de colonnes individuelles !
        survey.answers = case_data
        survey.status = SurveyStatus.complet # A affiner selon logique
        
        db.commit()
    
    print("Synchro terminée.")
    db.close()

if __name__ == "__main__":
    sync_data()
