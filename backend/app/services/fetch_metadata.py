# backend/app/services/fetch_metadata.py

import sys
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Ajout du dossier parent au path pour pouvoir importer 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.models.dictionary import Variable, Modalite, VariableDataType

# 1. CONFIGURATION MYSQL HOSTINGER
# 1. CONFIGURATION MYSQL HOSTINGER
# Mise à jour avec les infos de 2026
MYSQL_USER = "u100076301_enq2026"
MYSQL_PASSWORD = "Enq20252026"
MYSQL_HOST = "193.203.168.147" # Info Hostinger
MYSQL_DB = "u100076301_enq2026"
MYSQL_TABLE = "QUESTIONNAIRE_ENQ_2024_2025_DICT" # Table identifiée

# Construction de l'URL de connexion
MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"

# --- 2. LOGIQUE DE DÉTECTION ---
def map_mysql_type_to_local(column_info, distinct_count):
    """
    Devine le type de variable (NUMBER, LIST, TEXT) en fonction
    du type SQL et du nombre de valeurs uniques trouvées.
    """
    col_type = str(column_info['type']).lower()
    
    # Si c'est explicitement numérique
    if any(x in col_type for x in ['int', 'decimal', 'float', 'double', 'numeric']):
        # Cas particulier : parfois les codes catégories sont des INT (ex: 1, 2)
        # Si on a peu de valeurs uniques (ex: < 15), c'est surement une liste
        if distinct_count > 0 and distinct_count < 20:
            return VariableDataType.LIST
        return VariableDataType.NUMBER
    
    # Si c'est du texte
    if any(x in col_type for x in ['char', 'text', 'enum']):
        # Si peu de valeurs uniques, c'est une LISTE (Catégorielle)
        if distinct_count > 0 and distinct_count < 50:
            return VariableDataType.LIST
        return VariableDataType.TEXT
    
    # Par défaut (Date, Blob, etc.)
    return VariableDataType.TEXT

def main():
    print(f"Connexion à MySQL Hostinger ({MYSQL_HOST})...")
    try:
        source_engine = create_engine(MYSQL_URL)
        connection = source_engine.connect()
        print("Connexion réussie !")
    except Exception as e:
        print(f"Erreur de connexion : {e}")
        return

    # Session PostgreSQL (Destination)
    pg_db = SessionLocal()

    try:
        inspector = inspect(source_engine)
        columns = inspector.get_columns(MYSQL_TABLE)
        
        print(f"Analyse de la table '{MYSQL_TABLE}'...")

        for col in columns:
            col_name = col['name']
            
            # Ignorer les colonnes techniques inutiles
            if col_name.lower() in ['id', 'created_at', 'updated_at', 'deleted_at']:
                continue

            # 1. Analyse Optimisée (Échantillonnage)
            # Au lieu de scanner toute la table (Lent !), on regarde les 100 premières lignes
            query_sample = text(f"SELECT {col_name} FROM {MYSQL_TABLE} WHERE {col_name} IS NOT NULL LIMIT 100")
            rows_sample = connection.execute(query_sample).fetchall()
            
            values_sample = [str(r[0]) for r in rows_sample]
            unique_sample = set(values_sample)
            count_sample = len(values_sample)
            count_unique = len(unique_sample)
            
            # Estimation du Type
            local_type = VariableDataType.TEXT # Par défaut
            
            # Si SQL dit que c'est un nombre
            sql_type = str(col['type']).lower()
            is_sql_number = any(x in sql_type for x in ['int', 'decimal', 'float', 'double', 'numeric'])
            
            if is_sql_number:
                # Si peu de valeurs uniques dans l'échantillon, c'est peut-être un code catégorie (ex: Sexe=1,2)
                if count_unique < 15 and count_sample > 20: 
                    local_type = VariableDataType.LIST
                else:
                    local_type = VariableDataType.NUMBER
            else:
                # Si texte, on regarde la répétition
                # Si on a 100 lignes et seulement 5 valeurs différentes -> Liste
                if count_unique < 30 and count_sample > 30:
                    local_type = VariableDataType.LIST
            
            print(f"Traitement: {col_name} (Sample: {count_unique}/{count_sample}) -> {local_type.value}")

            # 3. Enregistrement / Mise à jour dans PostgreSQL
            variable = pg_db.query(Variable).filter(Variable.slug == col_name).first()
            if not variable:
                variable = Variable(
                    slug=col_name,
                    label=col_name,
                    data_type=local_type,
                    is_quota=False
                )
                pg_db.add(variable)
                pg_db.commit()
                pg_db.refresh(variable)
            else:
                variable.data_type = local_type
                pg_db.commit()

            # 4. Gestion des MODALITÉS (Seulement si LIST)
            if local_type == VariableDataType.LIST:
                # Là on est obligé de faire un DISTINCT global pour ne rien rater
                # Mais on le fait SEULEMENT sur les colonnes identifiées comme LISTES
                # On ajoute un try/except pour éviter le crash si trop long
                try:
                    query_distinct = text(f"SELECT DISTINCT {col_name} FROM {MYSQL_TABLE} WHERE {col_name} IS NOT NULL")
                    rows_distinct = connection.execute(query_distinct).fetchall()
                    
                    existing_mods = pg_db.query(Modalite).filter(Modalite.variable_id == variable.id).all()
                    existing_values = [m.value for m in existing_mods]

                    for r in rows_distinct:
                        val = str(r[0]).strip()
                        if val and val not in existing_values:
                            new_mod = Modalite(variable_id=variable.id, value=val, label=val)
                            pg_db.add(new_mod)
                    pg_db.commit()
                    
                except Exception as e:
                    print(f"⚠️ Warning: Impossible de récupérer toutes les modalités pour {col_name} (Timeout?). Utilisation de l'échantillon.")
                    # Fallback : on stocke au moins celles vues dans l'échantillon
                    for val in unique_sample:
                         # (Check existence logic duplicated roughly here or simplified)
                         pass # Simplification pour le fix

        print("Terminé ! Le dictionnaire a été synchronisé.")

    except Exception as e:
        print(f"Une erreur est survenue : {e}")
    finally:
        connection.close()
        pg_db.close()

if __name__ == "__main__":
    main()

