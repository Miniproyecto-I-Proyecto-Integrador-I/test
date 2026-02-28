from django.db import models
from Apps.task.models import Task
from django.core.validators import MinValueValidator

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
    
    needed_hours = models.FloatField(validators=[MinValueValidator(0.0)]) # FLOAT

    # Metadatos básicos
    created_at = models.DateTimeField(auto_now_add=True)

# --- NUEVA LÓGICA DE ACTUALIZACIÓN AUTOMÁTICA ---

    def save(self, *args, **kwargs):
        """Al guardar una subtarea, recalculamos la tarea padre."""
        super().save(*args, **kwargs)
        self.task.update_metrics() # Llama al método que creamos en Task

    def delete(self, *args, **kwargs):
        """Al eliminar una subtarea, recalculamos antes de que se pierda la relación."""
        task_reference = self.task
        super().delete(*args, **kwargs)
        task_reference.update_metrics() # Recalcula tras la eliminación

    def __str__(self):
        return f"Subtask: {self.description[:30]}... (Task: {self.task.title})"