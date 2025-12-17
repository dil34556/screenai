from django.db import models


class Employee(models.Model):
<<<<<<< HEAD
    email = models.EmailField()
    password = models.CharField(max_length=255)
=======
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, blank=True)
    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=50, blank=True)
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb

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
=======
class Application(models.Model):
    STATUS_CHOICES = [
        ("new", "New"),
        ("screening", "Screening"),
        ("shortlisted", "Shortlisted"),
        ("interview", "Interview"),
        ("hired", "Hired"),
        ("rejected", "Rejected"),
    ]

    # Candidate who applied
    employee = models.ForeignKey(
        Employee,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="applications"
    )

    # Job Reference (connects to your JobListPage)
    job_id = models.IntegerField(
        null=True,
        blank=True,
        help_text="ID of the job this application belongs to"
    )

    # When user applied
    date_applied = models.DateField()

    # Status in pipeline (Analytics uses this)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="new"
    )

    # Where candidate applied from (Platform Performance)
    source = models.CharField(
        max_length=50,
        blank=True,
        help_text="LinkedIn, Indeed, Website, Naukri etc"
    )

    # Used for HR Team Performance analytics
    calls = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Application (Job {self.job_id}) - {self.status}"
>>>>>>> 7885fd4af6c61c3dd0271b0ca3549411252d6cfb
