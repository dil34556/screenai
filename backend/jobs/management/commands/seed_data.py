from django.core.management.base import BaseCommand
from jobs.models import JobPosting

class Command(BaseCommand):
    help = 'Seeds initial data for testing'

    def handle(self, *args, **kwargs):
        if JobPosting.objects.filter(title="Senior Python Developer").exists():
            self.stdout.write(self.style.SUCCESS('Job already exists, skipping seed.'))
            return

        JobPosting.objects.create(
            title="Senior Python Developer",
            description="""We are looking for an experienced Python developer to join our AI team.
            
Responsibilities:
- Build scalable backend APIs using Django.
- Integrate LLMs (Gemini, GPT) into production workflows.
- Optimize database queries and architecture.

Requirements:
- 5+ years of Python experience.
- Strong knowledge of Django and DRF.
- Experience with Vector Databases is a plus.""",
            location="San Francisco (Remote)",
            job_type="REMOTE",
            required_skills=["Python", "Django", "REST API", "AWS"],
            screening_questions=[
                {"question": "How many years of Django experience do you have?", "type": "number"},
                {"question": "Describe a challenging bug you fixed.", "type": "text"}
            ]
        )
        self.stdout.write(self.style.SUCCESS('Successfully seeded "Senior Python Developer" job.'))
