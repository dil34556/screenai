import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GEMINI_API_KEY")
print(f"Key loaded: '{key}'")
print(f"Length: {len(key) if key else 0}")
if key and (key.startswith('"') or key.startswith("'")):
    print("WARNING: Key starts with quote!")
