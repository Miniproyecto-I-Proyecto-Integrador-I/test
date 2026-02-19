from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    
    daily_hours = models.PositiveIntegerField(default=8, help_text="Horas disponibles al día")
    bio = models.TextField(max_length=500, blank=True)
    
    def __str__(self):
        return self.username