from django.db import models
from Apps.task.models import Task
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError # <--- IMPORTANTE

class Subtask(models.Model):
    
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROGRESS = "in_progress", "En Progreso"
        COMPLETED = "completed", "Completado"

    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        related_name="subtasks"
    )

    description = models.CharField(max_length=300)
    
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING
    )

    planification_date = models.DateField() 
    needed_hours = models.FloatField(validators=[MinValueValidator(0.0)])
    created_at = models.DateTimeField(auto_now_add=True)

    # --- NUEVA LÓGICA DE VALIDACIÓN ---
    def clean(self):
        """Valida que la fecha de la subtarea no sea mayor a la de la tarea padre."""
        super().clean()
        if self.task and self.task.due_date and self.planification_date:
            # Comparamos solo la parte de la fecha (.date())
            if self.planification_date > self.task.due_date.date():
                raise ValidationError({
                    'planification_date': f"La fecha ({self.planification_date}) no puede ser posterior a la entrega de la tarea ({self.task.due_date.date()})."
                })

    def save(self, *args, **kwargs):
        """Ejecuta la validación y luego guarda/actualiza métricas."""
        self.full_clean() # <--- OBLIGATORIO: Llama a la función clean() definida arriba
        super().save(*args, **kwargs)
        self.task.update_metrics()

    def delete(self, *args, **kwargs):
        task_reference = self.task
        super().delete(*args, **kwargs)
        task_reference.update_metrics()

    def __str__(self):
        return f"Subtask: {self.description[:30]}... (Task: {self.task.title})"