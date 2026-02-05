# backend/scripts/sync_api_to_mysql.py

"""
Script de synchronisation des données de l'API vers la base de données.
Version finale utilisant pymysql pour une compatibilité maximale sur Hostinger.
"""

import os
import requests
import pymysql # On utilise uniquement cette librairie
import json
from dotenv import load_dotenv

# 1. Charger les variables du fichier .env
load_dotenv()

# Vérification basique
if not os.getenv("CSWEB_PASSWORD"):
    raise Exception("Erreur: Le fichier .env semble vide ou manquant.")

# --- CONFIGURATION VIA ENV ---
API_BASE = os.getenv("CSWEB_URL")
CLIENT_ID = os.getenv("CSWEB_CLIENT_ID")
CLIENT_SECRET = os.getenv("CSWEB_CLIENT_SECRET")
USERNAME = os.getenv("CSWEB_USERNAME")
PASSWORD = os.getenv("CSWEB_PASSWORD")
DICT_NAME = os.getenv("CSWEB_DICT_NAME")

# Configuration PyMySQL (Les clés doivent correspondre aux arguments de pymysql)
DB_CONFIG = {
    'host': os.getenv("MYSQL_HOST") or os.getenv("DB_HOST"),
    'database': os.getenv("MYSQL_DB") or os.getenv("DB_NAME"),
    'user': os.getenv("MYSQL_USER") or os.getenv("DB_USER"),
    'password': os.getenv("MYSQL_PASSWORD") or os.getenv("DB_PASSWORD"),
    'cursorclass': pymysql.cursors.DictCursor # Optionnel, mais pratique pour le debug
}

def get_access_token():
    print("1. Connexion sécurisée en cours...")
    url = f"{API_BASE}/token"
    # Fallback pour /api/token
    if "/api" not in url and "api" not in API_BASE:
         url = f"{API_BASE}/api/token"
         
    payload = {
        "grant_type": "password",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username": USERNAME,
        "password": PASSWORD
    }
    
    try:
        r = requests.post(url, json=payload, timeout=30)
        
        if r.status_code == 404 and "/api" in url:
             url = url.replace("/api", "")
             r = requests.post(url, json=payload, timeout=30)

        r.raise_for_status()
        return r.json().get("access_token")
    except Exception as e:
        print(f"Erreur de connexion : {e}")
        return None

def download_data(token):
    print(f"2. Téléchargement des données pour {DICT_NAME}...")
    base = API_BASE.rstrip('/')
    if base.endswith("/api"): 
         url = f"{base}/dictionaries/{DICT_NAME}/cases"
    else:
         url = f"{base}/api/dictionaries/{DICT_NAME}/cases"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        r = requests.get(url, headers=headers, allow_redirects=True, timeout=120)
        r.raise_for_status()
        
        data = r.json()
        
        if isinstance(data, dict) and "data" in data:
             cases = data["data"]
        else:
             cases = data

        count = len(cases)
        print(f"   -> Succès ! {count} questionnaires récupérés.")
        return cases
    except Exception as e:
        print(f"   -> Erreur de téléchargement : {e}")
        return None


import datetime

def sync_to_database(data):
    print("3. Connexion à la base de données (PyMySQL)...")
    conn = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # --- ETAPE 1 : Analyser votre table MySQL automatiquement ---
        table_name = "data_enquete_2026"
        
        # On demande à MySQL : "Quelles sont tes colonnes ?"
        cursor.execute(f"SHOW COLUMNS FROM {table_name}")
        db_columns_info = cursor.fetchall()
        
        # On garde la liste des noms de colonnes
        # On ignore 'id' car c'est une clé primaire auto-incrémentée
        valid_columns = [col['Field'] for col in db_columns_info if col['Field'].lower() != 'id']
        
        print(f"   -> Table détectée avec {len(valid_columns)} colonnes à remplir.")

        if not valid_columns:
            print("❌ Erreur : Aucune colonne valide trouvée dans la table.")
            return

        # --- ETAPE 2 : Préparer la requête SQL Dynamique ---
        cols_str = ", ".join(valid_columns)
        placeholders = ", ".join(["%s"] * len(valid_columns))
        
        # Correction de la syntaxe SQL ici (tout sur une ligne ou avec \ en fin de ligne)
        update_str = ", ".join([f"{col} = VALUES({col})" for col in valid_columns])
        
        sql = f"INSERT INTO {table_name} ({cols_str}) VALUES ({placeholders}) ON DUPLICATE KEY UPDATE {update_str}"

        values_to_insert = []
        count_skipped = 0

        # --- ETAPE 3 : Aplatir le JSON de CSPro ---
        for item in data:
            # On ignore les lignes supprimées si nécessaire
            if item.get("deleted") is True:
                continue

            raw_content = item.get("level-1")
            if not raw_content:
                count_skipped += 1
                continue

            try:
                # 1. On décode le contenu (les SECTIONS)
                survey_content = json.loads(raw_content)
                
                # 2. On crée un "Dictionnaire Plat" avec TOUTES les variables
                flat_data = {}
                
                # A. Données Racine (Gestion id vs caseids)
                # Note: Parfois c'est 'caseids', parfois 'id' pour le GUID. On assure le coup.
                flat_data['ID_QUEST'] = item.get("caseids", "").strip() 
                
                # B. Données des Sections (SECTION_0, SECTION_1...)
                for section_name, section_vars in survey_content.items():
                    if isinstance(section_vars, dict):
                        for key, val in section_vars.items():
                            # Gestion des listes (Checkbox) -> JSON String
                            if isinstance(val, list):
                                flat_data[key] = val 
                                # On remplit aussi la version _JSON si la colonne existe
                                flat_data[key + '_JSON'] = json.dumps(val) 
                                flat_data[key + 'REPEATING_JSON'] = json.dumps(val) 
                            
                            # Gestion des Heures CSPro (format HHMMSS comme entier, ex: 105854 = 10:58:54)
                            elif key.startswith("HEURE_") and isinstance(val, (int, float)):
                                try:
                                    # CSPro stocke les heures en HHMMSS collé (ex: 25616 = 2h56m16s)
                                    val_int = int(val)
                                    hh = val_int // 10000           
                                    mm = (val_int % 10000) // 100   
                                    ss = val_int % 100              
                                    time_val = f"{hh:02d}:{mm:02d}:{ss:02d}"
                                    flat_data[key] = time_val
                                except Exception as e:
                                    print(f"Erreur parsing heure {key}={val}: {e}")
                                    flat_data[key] = None
                            else:
                                flat_data[key] = val

                # --- ETAPE 4 : Faire correspondre avec MySQL ---
                row_values = []
                for col_name in valid_columns:
                    val = flat_data.get(col_name)
                    # Si la valeur est une liste (et qu'on n'a pas pris la version _JSON), on stringify pour éviter l'erreur SQL
                    if isinstance(val, list):
                         val = json.dumps(val)
                    row_values.append(val)
                
                values_to_insert.append(tuple(row_values))

            except json.JSONDecodeError:
                print(f"   -> Erreur JSON interne pour ID: {item.get('id')}")
                continue

        # --- ETAPE 5 : Exécution ---
        if values_to_insert:
            # On imprime la requête pour debug si jamais ça plante encore
            # print(f"DEBUG SQL: {sql[:100]}...") 
            cursor.executemany(sql, values_to_insert)
            conn.commit()
            print(f"   -> SUCCÈS : {cursor.rowcount} lignes synchronisées automatiquement !")
        else:
            print("   -> Aucune donnée valide trouvée.")

    except pymysql.MySQLError as err:
        print(f"❌ Erreur SQL critique : {err}")
    finally:
        if conn:
            conn.close()
            print("4. Connexion fermée.")

# --- EXÉCUTION DU SCRIPT ---
if __name__ == "__main__":
    t = get_access_token()
    
    if t:
        d = download_data(t)
        
        if d:
            sync_to_database(d)
        else:
            print("\n ÉCHEC : Impossible de récupérer les données.")
    else:
        print("\n ÉCHEC : Impossible d'obtenir un token d'accès.")