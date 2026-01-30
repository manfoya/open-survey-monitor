import requests
import os
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://enq.enspd-up.com"
USERNAME = os.getenv("CSWEB_USER", "admin")
PASSWORD = os.getenv("CSWEB_PASSWORD")

def test_login_api_json():
    """Test 1: Login via JSON API endpoint (standard for SPAs)"""
    print("\n--- Test 1: POST /api/login (JSON) ---")
    url = f"{BASE_URL}/api/login"
    try:
        resp = requests.post(url, json={"username": USERNAME, "password": PASSWORD})
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
        if resp.status_code == 200 or resp.status_code == 204:
            print("=> SUCCESS (API Login)")
            return True, resp.cookies
    except Exception as e:
        print(f"Error: {e}")
    return False, None

def test_login_web_form():
    """Test 2: Login via standard Web Form (Session Cookie)"""
    print("\n--- Test 2: POST /login (Web Form) ---")
    url = f"{BASE_URL}/" # Try root instead of /login
    
    session = requests.Session()
    try:
        # 1. Get the login page to get cookies/CSRF
        print(f"1. GET {url} page...")
        r_get = session.get(url)
        print(f"   Status: {r_get.status_code}")
        if "<form" in r_get.text:
             import re
             forms = re.findall(r'<form.*?>', r_get.text)
             print(f"   Forms found: {forms}")
        
        # 2. POST credentials...
        # If the form action is missing, it posts to self (which is /)
        # But maybe it needs a CSRF token?

        
        # Try to find CSRF token if needed (simple check)
        # Assuming simple post first
        payload = {"username": USERNAME, "password": PASSWORD}
        
        # 2. Post credentials
        print("2. POST credentials...")
        r_post = session.post(url, data=payload)
        print(f"   Status: {r_post.status_code}")
        print(f"   URL after post: {r_post.url}") # Did we redirect to dashboard?
        
        if "Logout" in r_post.text or "dashboard" in r_post.text.lower() or "Data" in r_post.text:
             print("=> SUCCESS (Web Cookie Login) - Found 'Logout'/'Data' in response")
             
             # Try to find the download link for the questionnaire
             # Screenshot shows "QUESTIONNAIRE_ENQ_2025_2026_DICT"
             if "QUESTIONNAIRE_ENQ" in r_post.text:
                 print("   Found Questionnaire in dashboard!")
                 # simple regex to find hrefs
                 import re
                 links = re.findall(r'href=[\'"]?([^\'" >]+)', r_post.text)
                 print(f"   Links found: {links[:10]}...") # Print first 10
                 
                 # Try to identify the download link specifically
                 # Often it's something like /api/ui/data/download?dictionary=...
             return True, session.cookies
        else:
             print("=> FAILED (No 'Logout' found in response)")
             # Debug: print a bit of the response
             print(f"   Response snippet: {r_post.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")
    return False, None

def test_api_token_endpoint():
    print("\n--- Test 3: POST /api/token (Simple) ---")
    url = f"{BASE_URL}/api/token"
    try:
        resp = requests.post(url, json={"username": USERNAME, "password": PASSWORD})
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")


    except Exception as e:
        print(f"Error: {e}")

def test_csweb_path_login():
    """Test 4: Try /csweb/api/login specifically"""
    print("\n--- Test 4: POST /csweb/api/login ---")
    url = "https://enq.enspd-up.com/csweb/api/login"
    try:
        resp = requests.post(url, json={"username": USERNAME, "password": PASSWORD})
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

def test_legacy_token():
    """Test 5: POST /api/token with random client_id"""
    print("\n--- Test 5: POST /api/token with fake Client ID ---")
    url = f"{BASE_URL}/api/token"
    payload = {
        "grant_type": "password",
        "username": USERNAME,
        "password": PASSWORD,
        "client_id": "test", # Try fake ID
        "client_secret": "test"
    }
    try:
        resp = requests.post(url, json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text[:200]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print(f"Testing Login for CSWeb 8.0.1 at {BASE_URL}")
    print(f"User: {USERNAME}")
    
    success, cookies = test_login_api_json()
    if not success:
        success, cookies = test_login_web_form()

    # Always run debug tests
    test_api_token_endpoint()
    test_csweb_path_login()
    test_legacy_token()


