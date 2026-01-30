# backend/app/services/fetch_tables.py
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Configuration MySQL (Source)
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")

def get_remote_tables():
    """
    Connects to the Hostinger MySQL database and lists all available tables.
    Returns a list of table names.
    """
    if not all([MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DB]):
        print("Erreur: Configuration MySQL incomplète dans .env")
        return []

    url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            # Query to list tables in the specific database
            query = text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{MYSQL_DB}'")
            result = conn.execute(query)
            tables = [row[0] for row in result]
            
            # Filtrer les tables techniques si besoin
            # tables = [t for t in tables if not t.startswith("sys_")]
            
            return sorted(tables)
            
    except Exception as e:
        print(f"Erreur lors de la récupération des tables: {e}")
        return []

if __name__ == "__main__":
    print(f"Connexion à {MYSQL_HOST}...")
    tables = get_remote_tables()
    print(f"Tables trouvées ({len(tables)}) :")
    for t in tables:
        print(f" - {t}")
