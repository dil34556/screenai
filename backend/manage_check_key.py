import os
from dotenv import load_dotenv
import requests
import sys

# Load env from current directory
# Load env from current directory (backend/)
backend_path = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(backend_path, '.env')
print(f"DEBUG: Loading .env from {dotenv_path}")
load_dotenv(dotenv_path)

def check_key():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("ERROR: No API Key found in environment variables.")
        return

    # Check for quotes
    if api_key.startswith('"') or api_key.startswith("'"):
        print("WARNING: API Key starts with a quote character!")
    if api_key.endswith('"') or api_key.endswith("'"):
        print("WARNING: API Key ends with a quote character!")

    print(f"DEBUG: Key found: '{api_key[:5]}...{api_key[-4:]}' (Length: {len(api_key)})")

    # Simple list models call to Generative Language API
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    try:
        response = requests.get(url)
        print(f"DEBUG: Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: API Key is valid.")
            data = response.json()
            print("Available Models:")
            for m in data.get('models', [])[:5]: # Print first 5
                print(f" - {m['name']}")
                
            # Check for specific models we want
            model_names = [m['name'] for m in data.get('models', [])]
            for target in ["models/gemini-1.5-flash", "models/gemini-2.0-flash-exp"]:
                if target in model_names:
                    print(f"Found target model: {target}")
                else:
                    print(f"Target model not found in list: {target}")

        else:
            print(f"FAILURE: API Key check failed. Response: {response.text}")
            
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    check_key()
