
import sys
import os
import gzip
import json
import io
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_DB = os.getenv("MYSQL_DB")

def inspect_blob():
    url = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}/{MYSQL_DB}"
    engine = create_engine(url)
    
    with engine.connect() as conn:
        print("Reading blob from QUESTIONNAIRE_ENQ_2025_2026_DICT...")
        result = conn.execute(text("SELECT questionnaire FROM QUESTIONNAIRE_ENQ_2025_2026_DICT LIMIT 1")).fetchone()
        
        if not result or not result[0]:
            print("No data found.")
            return

        blob_data = result[0]
        print(f"Blob size: {len(blob_data)} bytes")
        print(f"Header: {blob_data[:10].hex()}")

        try:
            # Attempt GZIP Decompression
            with gzip.GzipFile(fileobj=io.BytesIO(blob_data)) as f:
                content = f.read().decode('utf-8')
                
            print("\n--- DECOMPRESSED CONTENT (Start) ---")
            print(content[:500])
            print("--- DECOMPRESSED CONTENT (End) ---")
            
            # Check if JSON
            try:
                json_obj = json.loads(content)
                print("\n✅ IT IS JSON!")
                print(f"Keys: {list(json_obj.keys())}")
            except json.JSONDecodeError:
                print("\n❌ It is NOT JSON (or invalid JSON).")
                
        except Exception as e:
            print(f"\n❌ Failed to decompress/read: {e}")

if __name__ == "__main__":
    inspect_blob()
