from django.db import models

class Applicant(models.Model):
    # If you already have a Job model, you can link it here
    # job = models.ForeignKey("Job", on_delete=models.CASCADE, related_name="applicants", null=True, blank=True)

    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to="resumes/")  # PDF/DOCX etc.

    years_of_experience = models.IntegerField()
    motivation = models.TextField()  # "Why do you want to join…"
    preferred_schedule = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.email})"
