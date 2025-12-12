from django.db import models
from appscreenai.models import Employee

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
    salary_range = models.CharField(max_length=100, blank=True, null=True, help_text="Text description e.g. 12-15 LPA")
    
    # Quantitative Criteria (for Sliders)
    offered_ctc = models.FloatField(default=12.0, help_text="Target Offered CTC in Lakhs (Slider value)")
    expected_ctc_limit = models.FloatField(default=20.0, help_text="Max Expected CTC considered (Slider value)")
    min_experience = models.IntegerField(default=1, help_text="Minimum Years of Experience")
    notice_period_days = models.IntegerField(default=30, help_text="Max acceptable notice period in days")
    
    # AI-Ready Fields
    required_skills = models.JSONField(default=list, help_text="List of mandatory skills for AI matching")
    screening_questions = models.JSONField(default=list, blank=True, help_text="Custom questions for the candidate")
    
    is_active = models.BooleanField(default=True)
    recruiter = models.ForeignKey(Employee, on_delete=models.CASCADE, null=True, blank=True, related_name='job_postings')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.location})"
