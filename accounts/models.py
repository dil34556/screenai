from django.contrib.auth.models import AbstractUser
from django.db import models

class HRUser(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=(("admin", "Admin"), ("hr", "HR")),
        default="hr"
    )

    def __str__(self):
        return f"{self.username} - {self.role}"
