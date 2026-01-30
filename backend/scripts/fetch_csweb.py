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

# Chargement .env
load_dotenv()

BASE_URL = "https://enq.enspd-up.com"
USERNAME = os.getenv("CSWEB_USER", "admin")
PASSWORD = os.getenv("CSWEB_PASSWORD")
TARGET_DICT = os.getenv("MYSQL_TABLE", "QUESTIONNAIRE_ENQ_2025_2026_DICT") # We use this as name ref

def get_authenticated_session():
    """Authentifie via le formulaire Web standard pour récupérer le cookie de session."""
    session = requests.Session()
    login_url = f"{BASE_URL}/"
    
    try:
        # 1. GET pour initialiser cookies
        session.get(login_url)
        
        # 2. POST credentials
        payload = {"username": USERNAME, "password": PASSWORD}
        resp = session.post(login_url, data=payload)
        
        if "Logout" in resp.text or "dashboard" in resp.text.lower():
            print("Login Web réussi.")
            return session
        else:
            print("Echec Login Web : Pas de dashboard détecté.")
            return None
    except Exception as e:
        print(f"Exception Login: {e}")
        return None

def fetch_data_internal_api(session):
    """Essaie de découvrir et télécharger les données via l'API interne du dashboard."""
    
    print("Analyse de la page Dashboard pour trouver les liens...")
    resp = session.get(f"{BASE_URL}/dashboard") # Try explicit dashboard path
    print(f"Page Title/Content snippet: {resp.text[:500]}") # Debug

    
    # Debug: Cherchons les patterns d'API dans le HTML
    import re
    # Cherche tout ce qui ressemble à /api/... ou /download...
    api_links = re.findall(r'["\'](/api/[^"\']+|/csweb/api/[^"\']+|/download[^"\']+)["\']', resp.text)
    print(f"Liens API potentiels trouvés dans le HTML: {api_links}")
    
    # Cherche aussi les liens de téléchargement brut
    # href=".../cases?..."
    hrefs = re.findall(r'href=["\']([^"\']+)["\']', resp.text)
    # Filtrons un peu
    interesting_hrefs = [h for h in hrefs if "api" in h or "data" in h or "download" in h]
    print(f"Liens interessants (href): {interesting_hrefs[:10]}")

    # Hypothèse d'endpoint (basé sur observation CSWeb standard)
    
    # Hypothèse d'endpoint (basé sur observation CSWeb standard)
    endpoints_to_try = [
        f"{BASE_URL}/api/dictionaries",
        f"{BASE_URL}/api/ui/dictionaries", 
        f"{BASE_URL}/csweb/api/dictionaries" 
    ]
    
    found_dict_name = None
    
    for ep in endpoints_to_try:
        r = session.get(ep)
        if r.status_code == 200:
            try:
                data = r.json()
                # data est souvent une liste : [{"name": "...", "label": "..."}]
                # ou {"rows": [...]}
                rows = data if isinstance(data, list) else data.get("rows", [])
                
                print(f"Dictionnaires trouvés sur {ep} : {len(rows)}")
                for d in rows:
                    name = d.get("name") or d.get("dictionary_name")
                    print(f" - {name}")
                    if name and "2025_2026" in name: # Cible approximative
                         found_dict_name = name
                
                if found_dict_name:
                    break
            except:
                pass
    
    if not found_dict_name:
        # Fallback si on ne trouve pas dynamiquement, on utilise celui du .env
        print(f"Pas trouvé dans la liste, essai avec {TARGET_DICT}")
        found_dict_name = TARGET_DICT

    # 2. Télécharger les données (Cases)
    # Endpoint probable : /api/data/{dict_name} ou /api/cases/{dict_name}
    print(f" Tentative de téléchargement pour : {found_dict_name}")
    
    data_endpoints = [
         f"{BASE_URL}/api/data/{found_dict_name}",
         f"{BASE_URL}/api/cases/{found_dict_name}",
         f"{BASE_URL}/api/ui/data/{found_dict_name}" # Parfois utilisé par le UI
    ]
    
    for dep in data_endpoints:
        print(f"GET {dep} ...")
        r = session.get(dep)
        if r.status_code == 200:
            try:
                json_data = r.json()
                # Vérifions si on a des données ou une structure enveloppe
                cases = json_data if isinstance(json_data, list) else json_data.get("data", [])
                print(f"  => {len(cases)} enquêtes récupérées !")
                return cases
            except Exception as e:
                print(f"  => Erreur lecture JSON: {e}")
        else:
             print(f"  => Erreur HTTP {r.status_code}")
             
    return []

def sync_to_postgres(cases):
    db = SessionLocal()
    count = 0
    try:
        for case in cases:
            # Structure variable selon version API, on essaie de s'adapter
            # Cas 1: { "id": "...", "data": {...} }
            # Cas 2: { "caseIds": "...", "data": "..." } (parfois string JSON imbriqué)
            
            uuid = case.get("id") or case.get("caseids") # CSWeb old met caseids en minuscules parfois
            
            # Si pas d'UUID direct, c'est peut-être dans keys
            if not uuid and "keys" in case:
                uuid = str(case["keys"]) # Fallback moche
            
            if not uuid:
                continue

            raw_data = case.get("data")
            if not raw_data:
                continue
                
            # Si data est une string (vieux CSWeb), faut la parser
            if isinstance(raw_data, str):
                try:
                    raw_data = json.loads(raw_data)
                except:
                    pass # garde raw string si echec
            
            # Upsert
            survey = db.query(SurveyData).filter(SurveyData.questionnaire_uuid == str(uuid)).first()
            if not survey:
                survey = SurveyData(questionnaire_uuid=str(uuid))
                db.add(survey)
            
            # Stockage
            survey.answers = raw_data
            
            # Tentative d'extraction intelligente de date/status
            survey.date_synchro = datetime.now()
            survey.status = SurveyStatus.complet # Par défaut
            
            count += 1
            
        db.commit()
    except Exception as e:
        print(f"Erreur DB: {e}")
        db.rollback()
    finally:
        db.close()
    
    print(f"Synchronisation Terminée : {count} enregistrements maj.")

if __name__ == "__main__":
    session = get_authenticated_session()
    if session:
        cases = fetch_data_internal_api(session)
        if cases:
            sync_to_postgres(cases)
        else:
            print("Aucune donnée récupérée.")
