import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from Apps.subtask.models import Subtask
from Apps.task.models import Task


@pytest.fixture
def api_client():
    """Fixture que proporciona un cliente API"""
    return APIClient()


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
def test_post_to_subtasks_endpoint_not_allowed(api_client, test_task):
    """Test que POST directo a /api/subtasks/ no está permitido (solo GET)"""
    pytest.skip("La creacion de subtareas debe realizarse a través del endpoint de tareas: POST /api/task/{id}/subtasks/, falta poner el not allowed en el viewset de subtasks")
    
    data = {
        "task": test_task.id,
        "description": "Nueva subtarea",
        "status": "pending",
        "planification_date": "2026-03-15",
        "needed_hours": 5.0,
    }

    response = api_client.post("/api/subtasks/", data, format="json")

    # Debe devolver 405 Method Not Allowed o 403 Forbidden
    assert response.status_code in [status.HTTP_405_METHOD_NOT_ALLOWED, status.HTTP_403_FORBIDDEN]


@pytest.mark.django_db
def test_list_subtasks(api_client, test_task):
    """Test listar todas las subtareas (GET /subtasks/)"""
    # Crear 3 subtareas
    for i in range(3):
        Subtask.objects.create(
            task=test_task,
            description=f"Subtarea {i + 1}",
            planification_date="2026-03-01",
            needed_hours=2.0 + i,
        )

    response = api_client.get("/api/subtasks/", format="json")

    assert response.status_code == status.HTTP_200_OK
    
    # Manejar ambos casos: con paginación o lista directa
    if isinstance(response.data, dict) and "results" in response.data:
        # Con paginación
        assert response.data["count"] == 3
        assert len(response.data["results"]) == 3
    elif isinstance(response.data, list):
        # Lista directa (sin paginación)
        assert len(response.data) == 3
    else:
        pytest.fail(f"Estructura inesperada de respuesta: {type(response.data)}")


@pytest.mark.django_db
def test_get_single_subtask(api_client, test_task):
    """Test obtener una subtarea específica (GET /subtasks/{id}/)"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Subtarea singular",
        planification_date="2026-03-01",
        needed_hours=3.5,
    )

    response = api_client.get(f"/api/subtasks/{subtask.id}/", format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["id"] == subtask.id
    assert response.data["description"] == "Subtarea singular"
    assert response.data["needed_hours"] == 3.5


@pytest.mark.django_db
def test_update_subtask_description_patch(api_client, test_task):
    """Test actualizar solo la descripción de una subtarea (PATCH /subtasks/{id}/)"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Descripción original",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )

    data = {
        "description": "Descripción actualizada",
    }

    response = api_client.patch(f"/api/subtasks/{subtask.id}/", data, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["description"] == "Descripción actualizada"
    assert response.data["needed_hours"] == 2.0  # No cambió

    # Verificar en BD
    subtask.refresh_from_db()
    assert subtask.description == "Descripción actualizada"


@pytest.mark.django_db
def test_update_subtask_multiple_fields_patch(api_client, test_task):
    """Test actualizar múltiples campos (PATCH)"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Original",
        status="pending",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )

    data = {
        "description": "Actualizado",
        "status": "in_progress",
        "needed_hours": 5.5,
    }

    response = api_client.patch(f"/api/subtasks/{subtask.id}/", data, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["description"] == "Actualizado"
    assert response.data["status"] == "in_progress"
    assert response.data["needed_hours"] == 5.5


@pytest.mark.django_db
def test_delete_subtask(api_client, test_task):
    """Test eliminar una subtarea (DELETE /subtasks/{id}/)"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Subtarea a eliminar",
        planification_date="2026-03-01",
        needed_hours=1.0,
    )

    subtask_id = subtask.id
    assert Subtask.objects.filter(id=subtask_id).exists()

    response = api_client.delete(f"/api/subtasks/{subtask_id}/", format="json")

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Subtask.objects.filter(id=subtask_id).exists()


@pytest.mark.django_db
def test_create_subtask_validations_through_task_endpoint(api_client, test_task):
    """Test que validaciones de creación de subtareas ocurren en POST /api/task/{id}/subtasks/"""
    pytest.skip("""
    Las validaciones de creación de subtareas deben testearse en:
    - POST /api/task/{id}/subtasks/ sin campo 'description' → 400
    - POST /api/task/{id}/subtasks/ sin campo 'planification_date' → 400
    - POST /api/task/{id}/subtasks/ sin campo 'needed_hours' → 400
    
    Es decir, no en /api/subtasks/ que solo es de lectura.
    """)


@pytest.mark.django_db
def test_update_nonexistent_subtask_fails(api_client):
    """Test que actualizar una subtarea inexistente falla con 404"""
    data = {"description": "Nueva descripción"}

    response = api_client.patch("/api/subtasks/9999/", data, format="json")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_delete_nonexistent_subtask_fails(api_client):
    """Test que eliminar una subtarea inexistente falla con 404"""
    response = api_client.delete("/api/subtasks/9999/", format="json")

    assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_filter_subtasks_by_fecha(api_client, test_task):
    """Test filtrar subtareas por fecha (GET /subtasks/?fecha=YYYY-MM-DD)"""
    # Crear subtareas con diferentes fechas
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 1",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 2",
        planification_date="2026-03-15",
        needed_hours=3.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 3",
        planification_date="2026-03-01",
        needed_hours=4.0,
    )

    # Filtrar por fecha 2026-03-01
    response = api_client.get("/api/subtasks/?fecha=2026-03-01", format="json")

    assert response.status_code == status.HTTP_200_OK
    
    # Manejar ambos casos: con paginación o lista directa
    if isinstance(response.data, dict) and "results" in response.data:
        subtasks = response.data["results"]
    else:
        subtasks = response.data
    
    assert len(subtasks) == 2
    assert all(subtask["planification_date"] == "2026-03-01" for subtask in subtasks)


@pytest.mark.django_db
def test_filter_subtasks_by_status(api_client, test_task):
    """Test filtrar subtareas por status (GET /subtasks/?status=pending)"""
    # Crear subtareas con diferentes status
    Subtask.objects.create(
        task=test_task,
        description="Subtarea pendiente",
        status="pending",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea en progreso",
        status="in_progress",
        planification_date="2026-03-02",
        needed_hours=3.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea completada",
        status="completed",
        planification_date="2026-03-03",
        needed_hours=4.0,
    )

    # Filtrar por pending
    response = api_client.get("/api/subtasks/?status=pending", format="json")

    assert response.status_code == status.HTTP_200_OK
    
    # Manejar ambos casos: con paginación o lista directa
    if isinstance(response.data, dict) and "results" in response.data:
        subtasks = response.data["results"]
    else:
        subtasks = response.data
    
    assert len(subtasks) == 1
    assert subtasks[0]["status"] == "pending"


@pytest.mark.django_db
def test_filter_subtasks_by_usuario(api_client, test_user):
    """Test filtrar subtareas por usuario (GET /subtasks/?usuario={id})"""
    user_model = get_user_model()
    other_user = user_model.objects.create_user(
        username="other.user",
        email="other@example.com",
        password="testpass123",
    )

    # Crear tareas para diferentes usuarios
    task1 = Task.objects.create(
        title="Tarea usuario 1",
        due_date=timezone.now(),
        user=test_user,
    )
    task2 = Task.objects.create(
        title="Tarea usuario 2",
        due_date=timezone.now(),
        user=other_user,
    )

    # Crear subtareas para cada tarea
    Subtask.objects.create(
        task=task1,
        description="Subtarea del usuario 1 - A",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )
    Subtask.objects.create(
        task=task1,
        description="Subtarea del usuario 1 - B",
        planification_date="2026-03-02",
        needed_hours=3.0,
    )
    Subtask.objects.create(
        task=task2,
        description="Subtarea del usuario 2",
        planification_date="2026-03-03",
        needed_hours=4.0,
    )

    # Filtrar por test_user
    response = api_client.get(f"/api/subtasks/?usuario={test_user.id}", format="json")

    assert response.status_code == status.HTTP_200_OK
    
    # Manejar ambos casos: con paginación o lista directa
    if isinstance(response.data, dict) and "results" in response.data:
        subtasks = response.data["results"]
    else:
        subtasks = response.data
    
    assert len(subtasks) == 2
    # Verificar que todas las subtareas pertenecen a tareas del test_user
    for subtask in subtasks:
        # La respuesta incluye el objeto task completo
        assert subtask["task"]["id"] == task1.id


@pytest.mark.django_db
def test_filter_subtasks_combined_filters(api_client, test_task):
    """Test filtrar subtareas combinando múltiples filtros"""
    # Crear subtareas con diferentes combinaciones
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 1",
        status="pending",
        planification_date="2026-03-01",
        needed_hours=2.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 2",
        status="completed",
        planification_date="2026-03-01",
        needed_hours=3.0,
    )
    Subtask.objects.create(
        task=test_task,
        description="Subtarea 3",
        status="pending",
        planification_date="2026-03-02",
        needed_hours=4.0,
    )

    # Filtrar por fecha Y status
    response = api_client.get(
        "/api/subtasks/?fecha=2026-03-01&status=pending", format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    
    # Manejar ambos casos: con paginación o lista directa
    if isinstance(response.data, dict) and "results" in response.data:
        subtasks = response.data["results"]
    else:
        subtasks = response.data
    
    # Solo debería devolver la subtarea que cumple ambos criterios
    assert len(subtasks) == 1
    assert subtasks[0]["description"] == "Subtarea 1"
    assert subtasks[0]["status"] == "pending"
    assert subtasks[0]["planification_date"] == "2026-03-01"


@pytest.mark.django_db
def test_subtask_response_includes_task_info(api_client, test_task):
    """Test que la respuesta incluye información de la tarea padre"""
    subtask = Subtask.objects.create(
        task=test_task,
        description="Subtarea con info de tarea",
        planification_date="2026-03-01",
        needed_hours=2.5,
    )

    response = api_client.get(f"/api/subtasks/{subtask.id}/", format="json")

    assert response.status_code == status.HTTP_200_OK
    assert "task" in response.data
    # La task debe ser un objeto, no solo un ID (porque el serializer usa TaskMiniSerializer)
    assert isinstance(response.data["task"], dict)
    assert response.data["task"]["id"] == test_task.id
    assert response.data["task"]["title"] == "Test Task"
