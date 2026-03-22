from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from Apps.subtask.models import Subtask
from Apps.task.models import Task

from .models import CustomUser
from .auth_serializers import RegisterSerializer

class RegisterValidationTests(TestCase):
    def setUp(self):
        self.serializer = RegisterSerializer()

    # --- Email Validation Tests ---
    
    def test_valid_emails(self):
        valid_emails = [
            "test@example.com",
            "user.name+tag+sorting@example.com",
            "x@example.com",
            "example-indeed@strange-example.com",
            "admin@mailserver1.xd", # Valid in some internal networks, but our regex is simple
            "user_name@domain.co"
        ]
        for email in valid_emails:
            # We must handle the fact our regex requires a '.' in the domain part
            try:
                self.serializer.validate_email(email)
                print(email)
            except ValidationError:
                self.fail(f"Email '{email}' was incorrectly marked as invalid.")

    def test_invalid_emails(self):
        invalid_emails = [
            "plainaddress",
            "@no-local-part.com",
            "Outlet email@domain.com",
            "email.domain.com",
            "email@domain@domain.com",
            "email@domain.com (Joe Smith)",
            "email@domain", # Missing top level domain part according to our regex
        ]
        for email in invalid_emails:
            with self.assertRaises(ValidationError):
                self.serializer.validate_email(email)

    # --- Password Validation Tests ---

    def test_valid_passwords(self):
        valid_passwords = [
            "Password123!",
            "Str0ng_Pass",
            "P@ssw0rd2024",
            "V3ry$ecure.Password"
        ]
        for password in valid_passwords:
            try:
                # The length is handled by the CharField min_length, but validate_password 
                # handles the complexity requirements.
                self.serializer.validate_password(password)
            except ValidationError:
                self.fail(f"Password '{password}' was incorrectly marked as invalid.")

    def test_invalid_passwords(self):
        invalid_passwords = [
            "short1!",       # We only test complexity here, length is DRF
            "alllowercase1!",
            "ALLUPPERCASE1!",
            "NoSpecialChar123",
            "NoNumbersHere!",
        ]
        for password in invalid_passwords:
            with self.assertRaises(ValidationError):
                self.serializer.validate_password(password)


class UpdateMeConflictDetectionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username="conflict.user",
            email="conflict@example.com",
            password="StrongPass123!",
            daily_hours=8,
        )
        self.client.force_authenticate(user=self.user)

    def test_pending_subtask_with_note_still_triggers_conflict(self):
        """Una subtarea pendiente con nota debe contarse para conflicto de límite."""
        task = Task.objects.create(
            title="Task con conflicto",
            due_date=timezone.now(),
            user=self.user,
        )

        Subtask.objects.create(
            task=task,
            description="Subtarea pendiente con nota",
            status=Subtask.Status.PENDING,
            planification_date=timezone.localdate(),
            needed_hours=6,
            note="nota previa",
        )

        response = self.client.put(
            "/api/user/update/",
            {"daily_hours": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
