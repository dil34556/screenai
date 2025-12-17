import os
import django
import sys

# Setup Django Environment
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "screenai.settings")
django.setup()

from appscreenai.models import Employee

def setup_admins():
    # 1. Create Default Admin
    email = "admin@screenai.com"
    password = "admin123"
    try:
        emp, created = Employee.objects.get_or_create(email=email)
        emp.password = password
        emp.is_admin = True
        emp.save()
        print(f"SUCCESS: Default Admin Ready -> Email: {email} | Password: {password}")
    except Exception as e:
        print(f"ERROR creating default admin: {e}")

    # 2. Promote christo@gmail.com (from screenshot)
    target_email = "christo@gmail.com"
    try:
        user = Employee.objects.get(email=target_email)
        user.is_admin = True
        user.save()
        print(f"SUCCESS: Promoted {target_email} to Admin.")
    except Employee.DoesNotExist:
        print(f"INFO: {target_email} not found in database. You may need to register it first.")
    except Exception as e:
        print(f"ERROR promoting {target_email}: {e}")

if __name__ == "__main__":
    setup_admins()
