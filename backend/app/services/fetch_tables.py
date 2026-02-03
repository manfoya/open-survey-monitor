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

import time

# Simple in-memory cache
_cache = {
    "data": [],
    "last_fetched": 0,
    "ttl": 600  # 10 minutes cache
}

def get_remote_tables():
    """
    Connects to the Hostinger MySQL database and lists all available tables.
    Returns a list of table names.
    Uses a 10-minute cache to avoid repeated connections.
    """
    if not all([MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_DB]):
        print("Erreur: Configuration MySQL incomplète dans .env")
        return []

    # Check cache
    current_time = time.time()
    if _cache["data"] and (current_time - _cache["last_fetched"] < _cache["ttl"]):
        print("Returning cached tables")
        return _cache["data"]

    url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    
    try:
        print(f"Connecting to remote DB to fetch tables...")
        engine = create_engine(url)
        with engine.connect() as conn:
            # Query to list tables in the specific database
            query = text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{MYSQL_DB}'")
            result = conn.execute(query)
            tables = [row[0] for row in result]
            
            # Update cache
            sorted_tables = sorted(tables)
            _cache["data"] = sorted_tables
            _cache["last_fetched"] = current_time
            
            return sorted_tables
            
    except Exception as e:
        print(f"Erreur lors de la récupération des tables: {e}")
        # Return stale cache if available in case of error
        if _cache["data"]:
            print("Returning stale cache due to error")
            return _cache["data"]
        return []

if __name__ == "__main__":
    print(f"Connexion à {MYSQL_HOST}...")
    tables = get_remote_tables()
    print(f"Tables trouvées ({len(tables)}) :")
    for t in tables:
        print(f" - {t}")
