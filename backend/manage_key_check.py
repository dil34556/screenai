import os
from dotenv import load_dotenv

# Explicitly load from current directory .env
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
print(f"Loading env from: {env_path}")
load_dotenv(env_path)

def check_keys():
    print("Checking for API Keys...")
    keys = []
    
    # Primary
    k1 = os.getenv("GOOGLE_API_KEY")
    k1_gem = os.getenv("GEMINI_API_KEY")
    if k1: 
        print(f"Found GOOGLE_API_KEY: ...{k1[-4:]}")
        keys.append(k1)
    elif k1_gem:
        print(f"Found GEMINI_API_KEY: ...{k1_gem[-4:]}")
        keys.append(k1_gem)
    else:
        print("MISSING Primary Key (GOOGLE_API_KEY or GEMINI_API_KEY)")

    # Secondary
    for i in range(2, 6):
        k = os.getenv(f"GEMINI_API_KEY_{i}")
        if k:
            print(f"Found GEMINI_API_KEY_{i}: ...{k[-4:]}")
            keys.append(k)
        else:
            print(f"GEMINI_API_KEY_{i} NOT found")
            
    print(f"\nTotal Keys Available to System: {len(keys)}")

if __name__ == "__main__":
    check_keys()
