from django.db import models
from jobs.models import JobPosting

class Candidate(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
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
    
    # Source & Metadata
    # Source & Metadata
    platform = models.CharField(max_length=50, default='Website', help_text="Source platform (e.g. LinkedIn, Indeed, Custom)")
    notes = models.TextField(blank=True, default='', help_text="Internal notes for recruiters")
    experience_years = models.IntegerField(null=True, blank=True, help_text="Years of professional experience")
    current_ctc = models.FloatField(null=True, blank=True, help_text="Current CTC in Lakhs (e.g. 11.5)")
    expected_ctc = models.FloatField(null=True, blank=True, help_text="Expected CTC in Lakhs")
    notice_period = models.IntegerField(null=True, blank=True, help_text="Notice period in days")
    
    applied_at = models.DateTimeField(auto_now_add=True)



    # Screening Answers
    answers = models.JSONField(default=list, blank=True, help_text="Candidate answers to screening questions")

    # 👇 parsed fields
    total_years_experience = models.FloatField(null=True, blank=True)
    skills = models.JSONField(default=list, blank=True, help_text="List of skills")

    education = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    resume_text = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.candidate.name} - {self.job.title}"

class Experience(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='experiences')
    company = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    duration = models.CharField(max_length=100, blank=True, help_text="e.g. 2 years, 2020-2022")

    def __str__(self):
        return f"{self.role} at {self.company}"

class ApplicationComment(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment on {self.application} at {self.created_at}"
