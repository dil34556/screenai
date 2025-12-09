from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password


# Admin User
class HRUser(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=(("admin", "Admin"),),
        default="admin"
    )


# Employee Model
class Employee(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=200)

    def save(self, *args, **kwargs):
        self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
