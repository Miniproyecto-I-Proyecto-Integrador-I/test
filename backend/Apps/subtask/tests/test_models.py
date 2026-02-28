import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError

from Apps.subtask.models import Subtask
from Apps.task.models import Task


@pytest.fixture
def test_user():
    """Fixture que crea un usuario para las pruebas"""
    user_model = get_user_model()
    return user_model.objects.create_user(
        username="test.user",
        email="test@example.com",
        password="testpass123",
    )


@pytest.fixture
def test_task(test_user):
    """Fixture que crea una tarea para las pruebas"""
    return Task.objects.create(
        title="Test Task",
        due_date=timezone.now(),
        user=test_user,
    )


@pytest.mark.django_db
def test_subtask_defaults_and_str(test_task):
    """Test que los valores por defecto se asignan correctamente"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Test subtask",
        planification_date="2026-03-01",
        needed_hours=5.0,
    )

    assert subtask.status == Subtask.Status.PENDING
    assert subtask.needed_hours == 5.0
    assert "Test subtask" in str(subtask)
    assert "Test Task" in str(subtask)


@pytest.mark.django_db
def test_subtask_cascade_delete_task(test_task):
    """Test que al borrar una tarea, sus subtareas se eliminan (CASCADE)"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Subtask to delete",
        planification_date="2026-03-01",
        needed_hours=3.0,
    )

    subtask_id = subtask.id
    assert Subtask.objects.filter(id=subtask_id).exists()

    # Borrar tarea
    test_task.delete()

    # La subtarea debe haber sido eliminada por CASCADE
    assert not Subtask.objects.filter(id=subtask_id).exists()


@pytest.mark.django_db
def test_subtask_valid_status_choices(test_task):
    """Test que solo se aceptan status válidos"""
    # Status válidos deben funcionar
    for status in [Subtask.Status.PENDING, Subtask.Status.IN_PROGRESS, Subtask.Status.COMPLETED]:
        subtask = Subtask.objects.create(
            task=test_task,
            description=f"Subtask with status {status}",
            status=status,
            planification_date="2026-03-01",
            needed_hours=2.0,
        )
        assert subtask.status == status


@pytest.mark.django_db
def test_subtask_description_max_length(test_task):
    """Test que la descripción respeta el max_length de 300 caracteres"""
    # Descripción de exactamente 300 caracteres debe funcionar
    description_300 = "A" * 300
    subtask = Subtask.objects.create(
        task=test_task,
        description=description_300,
        planification_date="2026-03-01",
        needed_hours=4.0,
    )
    assert len(subtask.description) == 300



@pytest.mark.django_db
def test_subtask_task_is_required():
    """Test que una subtarea DEBE estar asociada a una tarea"""
    # Intentar crear una subtarea sin tarea debe fallar con IntegrityError
    with pytest.raises(IntegrityError):
        Subtask.objects.create(
            task=None,
            description="Subtask without task",
            planification_date="2026-03-01",
            needed_hours=2.0,
        )


@pytest.mark.django_db
def test_subtask_needed_hours_must_be_provided(test_task):
    """Test que needed_hours es requerido"""
    # Intentar crear sin needed_hours debe fallar
    with pytest.raises(IntegrityError):
        Subtask.objects.create(
            task=test_task,
            description="Subtask without hours",
            planification_date="2026-03-01",
            # needed_hours no proporcionado
        )


@pytest.mark.django_db
def test_subtask_planification_date_is_required(test_task):
    """Test que planification_date es requerido"""
    # Intentar crear sin planification_date debe fallar
    with pytest.raises(IntegrityError):
        Subtask.objects.create(
            task=test_task,
            description="Subtask without date",
            needed_hours=3.0,
            # planification_date no proporcionado
        )


@pytest.mark.django_db
def test_subtask_related_name_works(test_task):
    """Test que el related_name 'subtasks' funciona correctamente"""
    # Crear múltiples subtareas
    Subtask.objects.create(
        task=test_task,
        description="Subtask 1",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtask 2",
        planification_date="2026-03-02",
        needed_hours=3.0,
    )

    # Acceder a subtareas desde la tarea
    subtasks = test_task.subtasks.all()
    assert subtasks.count() == 2
    assert subtasks[0].description == "Subtask 1"
    assert subtasks[1].description == "Subtask 2"


@pytest.mark.django_db
def test_subtask_created_at_auto_set(test_task):
    """Test que created_at se establece automáticamente"""
    before_creation = timezone.now()
    
    subtask = Subtask.objects.create(
        task=test_task,
        description="Test auto timestamp",
        planification_date="2026-03-01",
        needed_hours=1.5,
    )
    
    after_creation = timezone.now()
    
    assert subtask.created_at is not None
    assert before_creation <= subtask.created_at <= after_creation
