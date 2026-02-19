from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Esto hará que aparezca la sección "USERS" en tu Admin
admin.site.register(CustomUser)