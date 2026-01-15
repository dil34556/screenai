import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'screenai.settings')
django.setup()

from jobs.models import JobPosting

jobs = JobPosting.objects.all()
print(f"Total Jobs: {jobs.count()}")
for job in jobs:
    print(f"Job: {job.title} (ID: {job.id})")
    print(f"Screening Questions Type: {type(job.screening_questions)}")
    print(f"Screening Questions: {job.screening_questions}")
    print("-" * 20)
