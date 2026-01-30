# backend/scripts/check_json_format.py
import sys
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

# Config Hostinger
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")

def check_structure():
    print(f"Connexion à {MYSQL_HOST}...")
    url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    engine = create_engine(url)
    
    with engine.connect() as conn:
        # 1. Lister les tables pertinentes
        print("\n--- Tables Trouvées ---")
        result = conn.execute(text("SHOW TABLES LIKE 'QUESTIONNAIRE_%'"))
        tables = [r[0] for r in result]
        for t in tables:
            print(f"- {t}")
            
        if not tables:
            print("Aucune table 'QUESTIONNAIRE' trouvée.")
            return

        target = tables[0] # On prend la première (souvent le dictionnaire principal)
        print(f"\n--- Inspection de : {target} ---")
        
        # 2. Voir les colonnes
        cols = conn.execute(text(f"DESCRIBE {target}")).fetchall()
        print(f"{'Champ':<30} | {'Type':<20}")
        print("-" * 50)
        found_json = False
        found_blob = False
        
        for row in cols:
            field = row[0]
            dtype = row[1]
            print(f"{field:<30} | {dtype:<20}")
            
            if "json" in dtype.lower():
                found_json = True
            if "blob" in dtype.lower():
                found_blob = True

        # 3. Voir un échantillon
        print("\n--- Echantillon de données (1 ligne) ---")
        try:
            sample = conn.execute(text(f"SELECT * FROM {target} LIMIT 1")).fetchone()
            if sample:
                print(sample._mapping)
            else:
                print("(Table vide)")
        except Exception as e:
            print(f"Erreur lecture: {e}")

        # 4. Vérifier la table binaire associée
        binary_table = f"{target}_case_binary_data"
        if binary_table in tables:
            count = conn.execute(text(f"SELECT COUNT(*) FROM {binary_table}")).scalar()
            print(f"\n--- Vérification BLOB Externe ({binary_table}) ---")
            print(f"Lignes trouvées : {count}")
            if count > 0:
                print("⚠️ ATTENTION: La table binaire contient des données. Cela contredit l'hypothèse 'Tout en JSON'.")
            else:
                print("✅ Table binaire vide (Bon signe si on veut du JSON/Plat).")

        # 5. Conclusion
        print("\n--- CONCLUSION ---")
        if found_json:
            print("✅ Colonne JSON détectée dans la table principale.")
        elif found_blob:
            print("❌ Colonne BLOB détectée dans la table principale (Mauvais signe).")
        else:
            print("ℹ️ Ni JSON ni BLOB explicite. Probablement une table 'Aplatnie' (Chaque variable = 1 colonne). C'est le format idéal !")

if __name__ == "__main__":
    check_structure()
