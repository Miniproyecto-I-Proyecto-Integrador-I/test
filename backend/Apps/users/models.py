from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import (MaxValueValidator, MinValueValidator)


class CustomUser(AbstractUser):
    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
        null=True,
    )
    email = models.EmailField(unique=True)  # Hace el email único y obligatorio
    daily_hours = models.PositiveIntegerField(
        default=8, 
        help_text="Horas disponibles al día", 
        validators=[MaxValueValidator(24), MinValueValidator(1)]
    )
    bio = models.TextField(max_length=500, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.username if self.username else self.email