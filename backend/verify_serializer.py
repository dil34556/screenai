
import os
import sys
import django
import json

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screenai.settings')
django.setup()

from candidates.models import Application
from candidates.serializers import ApplicationSerializer

def test_serializer_work_experience(name_fragment="MEENAKSHI"):
    print(f"Testing Serializer for candidate: {name_fragment}")
    app = Application.objects.filter(candidate__name__icontains=name_fragment).first()
    
    if not app:
        print("No application found.")
        return

    print(f"Found App ID: {app.id}")
    
    serializer = ApplicationSerializer(app)
    data = serializer.data
    
    print("\n--- Serialized Data (Work Experience) ---")
    we = data.get('work_experience')
    print(json.dumps(we, indent=2))
    
    if we and len(we) > 0:
        print("\nSUCCESS: Serializer returned work experience items.")
    else:
        print("\nFAILURE: Work experience list is empty or None.")

if __name__ == "__main__":
    test_serializer_work_experience()
