import os

BASE_DIR = os.getcwd()
BACKEND_DIR = os.path.join(BASE_DIR, 'backend')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend', 'src')

BACKEND_OUT = os.path.join(BASE_DIR, 'BACKEND_CODE.txt')
FRONTEND_OUT = os.path.join(BASE_DIR, 'FRONTEND_CODE.txt')

IGNORE_DIRS = {
    '__pycache__', 'migrations', 'node_modules', 'build', 'dist', 
    '.git', '.venv', 'env', 'venv', '.idea', '.vscode'
}

IGNORE_FILES = {
    'db.sqlite3', 'package-lock.json', 'yarn.lock', '.DS_Store'
}

EXTENSIONS_BACKEND = {'.py'}
EXTENSIONS_FRONTEND = {'.js', '.jsx', '.css', '.html'}

def is_ignored(path):
    parts = path.split(os.sep)
    for p in parts:
        if p in IGNORE_DIRS:
            return True
    return False

def collect_files(directory, valid_extensions):
    code_content = ""
    for root, dirs, files in os.walk(directory):
        # Filter dirs in-place
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if file in IGNORE_FILES:
                continue
            
            ext = os.path.splitext(file)[1].lower()
            if ext in valid_extensions:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, BASE_DIR)
                
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    code_content += f"\n{'='*50}\n"
                    code_content += f"FILE: {rel_path}\n"
                    code_content += f"{'='*50}\n\n"
                    code_content += content + "\n"
                except Exception as e:
                    print(f"Skipping {rel_path}: {e}")
    return code_content

print("Exporting Backend Code...")
backend_code = collect_files(BACKEND_DIR, EXTENSIONS_BACKEND)
with open(BACKEND_OUT, 'w', encoding='utf-8') as f:
    f.write(backend_code)
print(f"Backend code written to {BACKEND_OUT}")

print("Exporting Frontend Code...")
frontend_code = collect_files(FRONTEND_DIR, EXTENSIONS_FRONTEND)
with open(FRONTEND_OUT, 'w', encoding='utf-8') as f:
    f.write(frontend_code)
print(f"Frontend code written to {FRONTEND_OUT}")
