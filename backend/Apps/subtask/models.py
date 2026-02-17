from django.db import models
from Apps.task.models import Task  # Importamos el modelo Task para la relación

class Subtask(models.Model):
    
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROGRESS = "in_progress", "En Progreso"
        COMPLETED = "completed", "Completado"

    # Relación 1 a muchos: Cada Subtask pertenece a 1 Task
    # related_name="subtasks" permite hacer: mi_tarea.subtasks.all()
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name="subtasks"
    )

    # Atributos solicitados
    description = models.CharField(max_length=300) # VARCHAR(300)
    
    status = models.CharField(
        max_length=50, # VARCHAR(50)
        choices=Status.choices,
        default=Status.PENDING
    )

    planification_date = models.DateField() # DATE
    
    needed_hours = models.FloatField() # FLOAT

    # Metadatos básicos
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Subtask: {self.description[:30]}... (Task: {self.task.title})"