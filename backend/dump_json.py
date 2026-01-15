
import os
import sys
import django
import json

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screenai.settings')
django.setup()

from candidates.models import Application

def dump_resume_json(name="MEENAKSHI"):
    app = Application.objects.filter(candidate__name__icontains=name).first()
    if app and app.resume_text:
        try:
            data = json.loads(app.resume_text)
            with open('dump.json', 'w') as f:
                json.dump(data, f, indent=2)
            print("Dumped to dump.json")
        except:
            print("Failed to parse JSON")
    else:
        print("No app or resume_text found")

if __name__ == "__main__":
    dump_resume_json()
