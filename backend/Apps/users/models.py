from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import (MaxValueValidator, MinValueValidator)


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # Hace el email único y obligatorio
    daily_hours = models.PositiveIntegerField(default=8, help_text="Horas disponibles al día", validators=[MaxValueValidator(24), MinValueValidator(1)]
)
    bio = models.TextField(max_length=500, blank=True)
    
    def __str__(self):
        return self.username