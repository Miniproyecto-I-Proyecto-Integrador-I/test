from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Esto hará que aparezca la sección "USERS" en tu Admin
# Y al usar UserAdmin obligará a Django a usar el formulario de "Cambiar contraseña" 
# que encripta los datos en lugar de un campo de texto normal.
admin.site.register(CustomUser, UserAdmin)