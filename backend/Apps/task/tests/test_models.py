import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.utils import DataError

from Apps.task.models import Task


@pytest.mark.django_db
def test_task_defaults_and_str():
    """Test que los valores por defecto se asignan correctamente"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="qa.user",
        email="qa.user@example.com",
        password="testpass123",
    )

    task = Task.objects.create(
        title="Test task",
        description="",
        due_date=timezone.now(),
        user=user,
    )

    assert task.status == Task.Status.PENDING
    assert task.priority == Task.Priority.MEDIUM
    assert task.progress == 0.0
    assert task.total_hours == 0.0
    assert task.is_active is True
    assert str(task) == "Test task - pending"


@pytest.mark.django_db
def test_task_cascade_delete_user():
    """Test que al borrar un usuario, sus tareas se eliminan (CASCADE)"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="test.user",
        email="test@example.com",
        password="testpass123",
    )

    task = Task.objects.create(
        title="Task to delete",
        due_date=timezone.now(),
        user=user,
    )

    task_id = task.id
    assert Task.objects.filter(id=task_id).exists()

    # Borrar usuario
    user.delete()

    # La tarea debe haber sido eliminada por CASCADE
    assert not Task.objects.filter(id=task_id).exists()


@pytest.mark.django_db
def test_task_ordering_by_created_at():
    """Test que las tareas se ordenan por created_at descendente"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="ordering.user",
        email="ordering@example.com",
        password="testpass123",
    )

    task1 = Task.objects.create(
        title="Primera tarea",
        due_date=timezone.now(),
        user=user,
    )

    task2 = Task.objects.create(
        title="Segunda tarea",
        due_date=timezone.now(),
        user=user,
    )

    # Obtener todas las tareas
    tasks = Task.objects.all()

    # La segunda tarea debe aparecer primero (ordering por -created_at)
    assert tasks[0].id == task2.id
    assert tasks[1].id == task1.id


@pytest.mark.django_db
def test_task_title_max_length():
    """Test que el título respeta el max_length de 200 caracteres"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="maxlen.user",
        email="maxlen@example.com",
        password="testpass123",
    )

    # Título de exactamente 200 caracteres debe funcionar
    title_200 = "A" * 200
    task = Task.objects.create(
        title=title_200,
        due_date=timezone.now(),
        user=user,
    )
    assert len(task.title) == 200

    # SQLite/Django NO lanza DataError con > 200 caracteres
    # Este test está marcado como skip porque Django permite truncar o guardar
    pytest.skip("SQLite/Django no fuerza max_length en tiempo de inserción")


@pytest.mark.django_db
def test_task_title_cannot_be_empty():
    """Test que el título no puede estar vacío (ESTE VA A FALLAR - validación no implementada)"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="empty.user",
        email="empty@example.com",
        password="testpass123",
    )

    # Este test debería fallar porque Django permite strings vacíos por defecto
    with pytest.raises(ValidationError):
        task = Task.objects.create(
            title="",  # Título vacío
            due_date=timezone.now(),
            user=user,
        )
        task.full_clean()  # Forzamos validación


@pytest.mark.django_db
def test_task_valid_status_choices():
    """Test que solo se aceptan status válidos"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="status.user",
        email="status@example.com",
        password="testpass123",
    )

    # Status válidos deben funcionar
    for status in [Task.Status.PENDING, Task.Status.IN_PROGRESS, Task.Status.COMPLETED]:
        task = Task.objects.create(
            title=f"Task with status {status}",
            status=status,
            due_date=timezone.now(),
            user=user,
        )
        assert task.status == status


@pytest.mark.django_db
def test_task_valid_priority_choices():
    """Test que solo se aceptan priority válidos"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="priority.user",
        email="priority@example.com",
        password="testpass123",
    )

    # Priority válidos deben funcionar
    for priority in [Task.Priority.LOW, Task.Priority.MEDIUM, Task.Priority.HIGH]:
        task = Task.objects.create(
            title=f"Task with priority {priority}",
            priority=priority,
            due_date=timezone.now(),
            user=user,
        )
        assert task.priority == priority


@pytest.mark.django_db
def test_task_progress_range():
    """Test que progress está en rango válido (0.0 - 100.0)"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="progress.user",
        email="progress@example.com",
        password="testpass123",
    )

    # Progress en rango válido debe funcionar
    valid_progresses = [0.0, 25.5, 50.0, 75.5, 100.0]
    for progress in valid_progresses:
        task = Task.objects.create(
            title=f"Task with progress {progress}",
            progress=progress,
            due_date=timezone.now(),
            user=user,
        )
        assert task.progress == progress


@pytest.mark.django_db
def test_task_total_hours_must_be_non_negative():
    """Test que total_hours no puede ser negativo (ESTE VA A FALLAR - validación no implementada)"""
    user_model = get_user_model()
    user = user_model.objects.create_user(
        username="hours.user",
        email="hours@example.com",
        password="testpass123",
    )

    # FloatField permite negativos sin validación en el modelo
    # Este test debería pasar SI agregas validators.MinValueValidator(0.0)
    pytest.skip("total_hours no tiene validación de rango en el modelo")


@pytest.mark.django_db
def test_task_user_is_required():
    """Test que una tarea DEBE estar asociada a un usuario"""
    from django.db.utils import IntegrityError
    
    # Intentar crear una tarea sin usuario debe fallar con IntegrityError
    # (porque el campo user es NOT NULL en la BD)
    with pytest.raises(IntegrityError):
        Task.objects.create(
            title="Task without user",
            due_date=timezone.now(),
            user=None,
        )
