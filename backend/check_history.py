
import os
import sys
import django
import json

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screenai.settings')
django.setup()

from candidates.models import Application

def check_candidate_work_history(name_fragment="MEENAKSHI"):
    print(f"Searching for candidate with name containing: {name_fragment}")
    apps = Application.objects.filter(candidate__name__icontains=name_fragment)
    
    if not apps.exists():
        print("No application found.")
        return

    for app in apps:
        print(f"\n--- Application ID: {app.id} | Candidate: {app.candidate.name} ---")
        print(f"Status: {app.status}")
        
        # 1. Manual Experience
        print("1. Manual Experiences (DB Related Objects):")
        manual_exps = app.experiences.all()
        if manual_exps:
            for exp in manual_exps:
                print(f"   - {exp.role} at {exp.company} ({exp.duration})")
        else:
            print("   (None)")
            
        # 2. Resume Text (Parsed Data)
        print("\n2. Resume Text (Parsed JSON):")
        if app.resume_text:
            try:
                data = json.loads(app.resume_text)
                # Check structure
                extracted_data = data.get('data', data) # Handle nested or direct
                
                print("   Structure keys:", extracted_data.keys())
                
                we = extracted_data.get('work_experience', [])
                print(f"   Work Experience Entry: {we}")
                
            except json.JSONDecodeError:
                print("   [ERROR] resume_text is not valid JSON.")
                print("   Raw content snippet:", app.resume_text[:200])
        else:
            print("   (Empty)")

if __name__ == "__main__":
    check_candidate_work_history()
