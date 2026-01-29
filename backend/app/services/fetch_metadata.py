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
# Remplace par tes infos réelles
MYSQL_USER = "u100076301_enqDash"
MYSQL_PASSWORD = "capiENSPD25"
MYSQL_HOST = "123.456.78.90" # L'IP ou le domaine fourni par Hostinger
MYSQL_DB = "u100076301_enqDash"
MYSQL_TABLE = "ma_table_enquete" # La table où CSPro déverse les données

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

            # 1. Analyse de la Cardinalité (Combien de valeurs uniques ?)
            # Cela permet de savoir si c'est une lisCoût : 0 $/mois.

te déroulante ou un champ libre
            query = text(f"SELECT COUNT(DISTINCT {col_name}) FROM {MYSQL_TABLE}")
            distinct_count = connection.execute(query).scalar()
            
            # 2. Détermination du Type
            local_type = map_mysql_type_to_local(col, distinct_count)
            
            print(f"Traitement: {col_name} (Type SQL: {col['type']}, Unique: {distinct_count}) -> {local_type.value}")

            # 3. Enregistrement / Mise à jour dans PostgreSQL
            # On vérifie si la variable existe déjà par son slug
            variable = pg_db.query(Variable).filter(Variable.slug == col_name).first()
            
            if not variable:
                variable = Variable(
                    slug=col_name,
                    label=col_name, # Par défaut on met le slug, l'admin changera le label si besoin
                    data_type=local_type,
                    is_quota=False # Par défaut faux, l'admin activera
                )
                pg_db.add(variable)
                pg_db.commit()
                pg_db.refresh(variable)
            else:
                # Si elle existe, on met juste à jour le type si ça a changé
                variable.data_type = local_type
                pg_db.commit()

            # 4. Gestion des MODALITÉS (Si c'est une LISTE)
            if local_type == VariableDataType.LIST:
                # On récupère les valeurs uniques pour remplir les modalités
                # ex: SELECT DISTINCT sexe FROM table
                query_vals = text(f"SELECT DISTINCT {col_name} FROM {MYSQL_TABLE} WHERE {col_name} IS NOT NULL")
                rows = connection.execute(query_vals).fetchall()
                
                existing_mods = pg_db.query(Modalite).filter(Modalite.variable_id == variable.id).all()
                existing_values = [m.value for m in existing_mods]

                for row in rows:
                    val = str(row[0]).strip()
                    if val and val not in existing_values:
                        new_mod = Modalite(
                            variable_id=variable.id,
                            value=val,
                            label=val # Par défaut label = valeur (ex: "1"="1"), faute de dictionnaire
                        )
                        pg_db.add(new_mod)
                
                pg_db.commit()

        print("Terminé ! Le dictionnaire a été synchronisé.")

    except Exception as e:
        print(f"Une erreur est survenue : {e}")
    finally:
        connection.close()
        pg_db.close()

if __name__ == "__main__":
    main()

