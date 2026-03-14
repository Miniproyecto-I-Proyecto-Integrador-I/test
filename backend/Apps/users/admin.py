from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
	fieldsets = UserAdmin.fieldsets + (
		("Información adicional", {"fields": ("bio", "daily_hours")}),
	)
	add_fieldsets = UserAdmin.add_fieldsets + (
		("Información adicional", {"fields": ("bio", "daily_hours")}),
	)