# Reglas de Priorización y Filtrado - Vista "Hoy" (Mi Día)

Este documento detalla las reglas de negocio implementadas en el backend (Django) y consumidas por el frontend (React) para determinar qué subtareas se visualizan y en qué orden dentro de la vista "Mi Día".

## Regla 1: Ordenamiento Cronológico (Urgente vs Próximo)
El concepto de "Urgente" (lo que se debe hacer primero) versus "Próximo" está inherentemente dictado por la **fecha de planificación** de la subtarea (`planification_date`).

- **Implementación en Backend (`SubtaskViewSet.get_queryset`):**
  ```python
  return Subtask.objects.filter(task__user=self.request.user).order_by('planification_date', 'created_at')
  ```
- **Lógica resultante:** El sistema ordena la respuesta en orden ascendente (desde la fecha más antigua hacia la más reciente). 
  - Las subtareas cuyas fechas de planificación ya pasaron o son exactamente para el día de hoy aparecen **de primero en la lista (Urgente)**.
  - Las subtareas agendadas para días futuros se agrupan en las posiciones inferiores de la lista **(Próximas)**.

## Regla 2: Herencia de Prioridad (Alta, Media, Baja)
Las subtareas no tienen una prioridad propia independiente. La prioridad se determina **heredando** la etiqueta de la tarea principal (`Task`) a la que pertenecen.

- **Implementación DB (`Apps/task/models.py`):**
  La entidad padre `Task` contiene la etiqueta de prioridad predeterminada:
  ```python
  class Priority(models.TextChoices):
      LOW = "low", "Baja"
      MEDIUM = "medium", "Media"
      HIGH = "high", "Alta"
  ```
- **Visualización:** El frontend (`TodayPage.tsx`) toma el objeto expandido de la tarea principal e interpola el atributo `subtask.task.priority` dentro de la tarjeta de la subtarea para proveer contexto visual ("Urgencia de bloque padre") al estudiante.

## Regla 3: Filtrado Dinámico de Subtareas Específicas
Para una precisión extrema al visualizar el día específico, las reglas admiten recortes de tiempo mediante parámetros en la URL utilizando `django-filters`.

- **Implementación de Filtros (`SubtaskFilter`):**
  Los estudiantes (desde el UI de `TodayPage`) pueden restringir exhaustivamente las tareas a mostrar usando fechas de corte:
  - `planification_date_gte`: Excluye todo lo vencido antes de una fecha.
  - `planification_date_lte`: Excluye todo lo agendado después de una fecha.
  - Ejemplo para ver **estrictamente HOY**: Ambos filtros se igualarían a la fecha actual para crear una burbuja inamovible de tiempo.

*Nota:* Adicionalmente se proveen filtros combinados como filtrado por estados (`pending`, `completed`), cantidad mínima/máxima de horas necesarias (`needed_hours_min/max`) o texto en el campo materia del padre (`subject`).
---

# Documentación de Prioridades "Hoy" de la API (Mi Día)

Este conjunto de endpoints permite obtener y buscar las actividades calculadas bajo las lógicas de urgencia descritas en `REGLAS_HOY.md`.

## Endpoints

### 1. Obtener Subtareas (Actividades del Día)

Retorna la lista de actividades delegadas para el usuario actual. El orden predeterminado en el que las sub-tareas se retornan dictan la **urgencia** (Primeras fechas = Urgentes/Atrasadas).

- **URL:** `/api/subtasks/`
- **Método:** `GET`
- **Headers Requeridos:**
  ```json
  {
    "Authorization": "Bearer <tu_access_token>"
  }
  ```
- **Filtros de Query Parámetros Soportados (Opcionales):**
  Al enviar peticiones `GET`, se pueden estructurar recortes paramétricos:
  - `?planification_date=YYYY-MM-DD`: Tareas designadas estrictamente a un día.
  - `?planification_date_gte=YYYY-MM-DD`: Tareas agendadas o atrasadas *después o en* una fecha.
  - `?planification_date_lte=YYYY-MM-DD`: Tareas agendadas *antes o en* una fecha.
  - `?status=pending|in_progress|completed`: Filtrar por el estado progresivo.
  - `?task_title=Matemáticas`: Filtrado por aproximación sobre el título de su tarea Padre.
  - `?priority=high|medium|low`: Filtra por la urgencia estática asignada a su clase padre.

- **Response Exitosa (200 OK):**
  ```json
  [
    {
      "id": 15,
      "description": "Estudiar Álgebra Lineal",
      "status": "pending",
      "planification_date": "2023-10-31",
      "needed_hours": 2.5,
      "task": {
        "id": 3,
        "title": "Examen Final Matemáticas",
        "priority": "high",
        "subject": "Matemática Aplicada",
        "type": "Evaluación"
      }
    }
  ]
  ```
