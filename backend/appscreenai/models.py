from django.db import models


class Employee(models.Model):
    email = models.EmailField()
    password = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.email


class Applicant(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='resumes/')
    years_of_experience = models.IntegerField()
    motivation = models.TextField()
    preferred_schedule = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
