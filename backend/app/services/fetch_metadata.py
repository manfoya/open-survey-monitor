# backend/app/services/fetch_metadata.py

import sys
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal
from app.models.dictionary import Variable, Modalite, VariableDataType
from app.models.settings import GlobalSettings

# 1. CHARGEMENT DES VARIABLES D'ENVIRONNEMENT
load_dotenv()

# Configuration MySQL (Source - Hostinger)
# Note : Ne jamais mettre de valeurs par défaut sensibles ici. Tout doit être dans le .env
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")
# Table par défaut si non configurée dans les Settings de l'app
MYSQL_TABLE_DEFAULT = os.getenv("MYSQL_TABLE", "QUESTIONNAIRE_ENQ_2024_2025_DICT") 

if not MYSQL_PASSWORD or not MYSQL_USER:
    print("❌ Erreur: Les variables MYSQL_USER ou MYSQL_PASSWORD manquent dans le fichier .env")
    sys.exit(1)

# Construction de l'URL de connexion
MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

def main():
    print(f"🔌 Connexion à MySQL Hostinger ({MYSQL_HOST})...")
    
    source_engine = None
    connection = None
    
    try:
        source_engine = create_engine(MYSQL_URL)
        connection = source_engine.connect()
        print("✅ Connexion réussie !")
    except Exception as e:
        print(f"❌ Erreur de connexion à la source : {e}")
        return

    # Session PostgreSQL (Destination - App locale)
    pg_db = SessionLocal()

    # Détermination de la table cible
    target_table = MYSQL_TABLE_DEFAULT
    
    # On regarde si une config spécifique existe en base
    try:
        settings = pg_db.query(GlobalSettings).first()
        if settings and settings.target_table_name:
            target_table = settings.target_table_name
            print(f"📋 Utilisation de la table configurée dans l'app : {target_table}")
        else:
            print(f"📋 Utilisation de la table par défaut (.env) : {target_table}")
    except Exception as e:
        print(f"⚠️ Erreur lecture settings, passage en défaut: {e}")

    try:
        inspector = inspect(source_engine)
        # Vérifie si la table existe avant de continuer
        if not inspector.has_table(target_table):
            print(f"❌ Erreur: La table '{target_table}' n'existe pas dans la base MySQL source.")
            return

        columns = inspector.get_columns(target_table)
        print(f"🚀 Analyse de la table '{target_table}' en cours...")

        for col in columns:
            col_name = col['name']
            
            # Ignorer les colonnes techniques
            if col_name.lower() in ['id', 'created_at', 'updated_at', 'deleted_at', 'uuid']:
                continue

            # --- 1. ANALYSE INTELLIGENTE (ÉCHANTILLONNAGE) ---
            # On regarde les 100 premières lignes non nulles pour deviner le type
            query_sample = text(f"SELECT {col_name} FROM {target_table} WHERE {col_name} IS NOT NULL LIMIT 100")
            rows_sample = connection.execute(query_sample).fetchall()
            
            values_sample = [str(r[0]) for r in rows_sample]
            unique_sample = set(values_sample)
            count_sample = len(values_sample)
            count_unique = len(unique_sample)
            
            # Estimation du Type par défaut
            local_type = VariableDataType.TEXT 
            
            # Récupération du type SQL brut
            sql_type = str(col['type']).lower()
            is_sql_number = any(x in sql_type for x in ['int', 'decimal', 'float', 'double', 'numeric'])
            
            if is_sql_number:
                # Si c'est un nombre SQL mais avec très peu de variations (ex: 1=Homme, 2=Femme) -> LISTE
                if count_unique < 15 and count_sample > 20: 
                    local_type = VariableDataType.LIST
                else:
                    local_type = VariableDataType.NUMBER
            else:
                # Si c'est du texte
                # Si on a beaucoup de données mais peu de valeurs uniques -> LISTE
                if count_unique < 30 and count_sample > 30:
                    local_type = VariableDataType.LIST
            
            print(f"   🔹 Traitement: {col_name} (Unique: {count_unique}/{count_sample}) -> {local_type.value}")

            # --- 2. SAUVEGARDE DANS POSTGRESQL ---
            variable = pg_db.query(Variable).filter(Variable.slug == col_name).first()
            if not variable:
                variable = Variable(
                    slug=col_name,
                    label=col_name, # On utilise le nom technique comme label par défaut
                    data_type=local_type,
                    is_quota=False
                )
                pg_db.add(variable)
                pg_db.commit()
                pg_db.refresh(variable)
            else:
                # On met à jour le type si ça a changé
                if variable.data_type != local_type:
                    variable.data_type = local_type
                    pg_db.commit()

            # --- 3. GESTION DES MODALITÉS (Si c'est une LISTE) ---
            if local_type == VariableDataType.LIST:
                values_to_insert = set()
                
                try:
                    # Tentative : Récupérer TOUTES les valeurs uniques (peut être lent)
                    query_distinct = text(f"SELECT DISTINCT {col_name} FROM {target_table} WHERE {col_name} IS NOT NULL")
                    rows_distinct = connection.execute(query_distinct).fetchall()
                    values_to_insert = {str(r[0]).strip() for r in rows_distinct}
                    
                except Exception as e:
                    print(f"   ⚠️ Warning: Timeout ou erreur sur le DISTINCT pour {col_name}. Utilisation de l'échantillon.")
                    # Fallback : On utilise au moins les valeurs vues dans l'échantillon des 100 lignes
                    values_to_insert = {str(v).strip() for v in unique_sample}

                # Insertion des modalités
                if values_to_insert:
                    existing_mods = pg_db.query(Modalite).filter(Modalite.variable_id == variable.id).all()
                    existing_values = {m.value for m in existing_mods}

                    new_count = 0
                    for val in values_to_insert:
                        if val and val not in existing_values:
                            new_mod = Modalite(variable_id=variable.id, value=val, label=val)
                            pg_db.add(new_mod)
                            new_count += 1
                    
                    if new_count > 0:
                        pg_db.commit()
                        print(f"      -> {new_count} nouvelles modalités ajoutées.")

        print("\n✅ Terminé ! Le dictionnaire de variables a été synchronisé.")

    except Exception as e:
        print(f"\n❌ Une erreur critique est survenue : {e}")
    finally:
        if connection:
            connection.close()
        pg_db.close()

if __name__ == "__main__":
    main()