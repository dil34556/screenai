
import os
import django
import json
from django.http import QueryDict

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screenai.settings')
django.setup()

from candidates.serializers import ApplicationSerializer
from jobs.models import JobPosting
from candidates.models import Candidate

# Mock Data
try:
    job = JobPosting.objects.first()
    if not job:
        print("No job found. Creating one.")
        job = JobPosting.objects.create(title="Test Job", description="Desc", location="Loc")
        
    candidate = Candidate.objects.first()
    if not candidate:
        candidate = Candidate.objects.create(name="Test Candidate", email="test@test.com")

    # Simulate FormData (QueryDict)
    qdict = QueryDict(mutable=True)
    qdict.update({
        'job': job.id,
        'candidate': candidate.id, # Serializer might expect object lookup if we didn't handle nested create for candidate? 
        # Wait, ApplicationSerializer has candidate_details (read_only). 
        # But for creation it needs 'candidate' ID?
        # Let's check models. Application has candidate ForeignKey.
        # Frontend sends 'name', 'email', 'phone'. It creates candidate automatically?
        # Serializer 'create' method in Step 980 only does:
        # application = Application.objects.create(**validated_data)
        # It doesn't create Candidate.
        # BUT ApplicationListView or View might handle Candidate creation?
        # Or ApplicationSerializer handles it?
        # In Step 980, ApplicationSerializer fields='__all__'.
        # It has candidate_details = CandidateSerializer(..., read_only=True).
        # So 'candidate' field (FK) is expected in input.
        
        # Frontend ApplyPage.js sends:
        # data.append('name', formData.name);
        # data.append('email', formData.email);
        # data.append('phone', formData.phone);
        # It DOES NOT send candidate ID.
        
        # Wait! If frontend sends name/email/phone, but NOT candidate ID, 
        # and ApplicationSerializer expects 'candidate' (because fields='__all__'),
        # validation will fail if 'candidate' is required.
        
        # Let's check ApplyPage.js Step 985. It sends name, email, phone.
        # It calls `submitApplication`.
        # API `candidates/views.py` usually handles creation.
        # Let's check `candidates/views.py` (which I haven't seen fully, only parsed).
        
        'skills': 'Python, Django',
        'experiences': json.dumps([{'company': 'Tech Corp', 'role': 'Dev', 'duration': '2 years'}]),
        'name': 'New Guy',
        'email': 'new@guy.com',
        'phone': '1234567890'
    })

    print("Testing Serializer with data:", qdict)
    
    # We might need to mock the context or view behavior if logic is in View.
    # But let's check `to_internal_value` logic mostly.
    
    serializer = ApplicationSerializer(data=qdict)
    if serializer.is_valid():
        print("Serializer Valid!")
        print("Validated Data:", serializer.validated_data)
        # Note: In real app, 'candidate' field is missing from qdict, so isValid might be false unless View handles it manually.
    else:
        print("Serializer Errors:", serializer.errors)

except Exception as e:
    print(f"Error: {e}")
