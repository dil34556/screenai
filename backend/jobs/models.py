from django.db import models

class JobPosting(models.Model):
    JOB_TYPES = [
        ('REMOTE', 'Remote'),
        ('HYBRID', 'Hybrid'),
        ('ONSITE', 'On-site'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Full job description")
    department = models.CharField(max_length=100, default='Engineering')
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES, default='ONSITE')
    
    # AI-Ready Fields
    required_skills = models.JSONField(default=list, help_text="List of mandatory skills for AI matching")
    screening_questions = models.JSONField(default=list, blank=True, help_text="Custom questions for the candidate")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.location})"
