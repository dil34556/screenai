from django.db import models
from jobs.models import JobPosting

class Candidate(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Application(models.Model):
    STATUS_CHOICES = [
        ('NEW', 'New Applied'),
        ('SCREENED', 'AI Screened'),
        ('INTERVIEW', 'Interview Scheduled'),
        ('OFFER', 'Offer Sent'),
        ('REJECTED', 'Rejected'),
    ]

    job = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    resume = models.FileField(upload_to='resumes/')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    applied_at = models.DateTimeField(auto_now_add=True)
    platform = models.CharField(max_length=50, default='Website', blank=True)

    # AI Analysis Fields
    ai_match_score = models.IntegerField(null=True, blank=True, help_text="0-100 score from Gemini")
    ai_summary = models.TextField(blank=True, help_text="AI generated summary of the candidate")
    ai_missing_skills = models.JSONField(default=list, blank=True, help_text="Skills from JD missing in resume")
    answers = models.JSONField(default=list, blank=True, help_text="Candidate answers to screening questions")
    
    def __str__(self):
        return f"{self.candidate.name} - {self.job.title}"
