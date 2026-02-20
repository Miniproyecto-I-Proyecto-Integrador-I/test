from rest_framework import viewsets
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        today = timezone.localdate()

        queryset = Task.objects.prefetch_related('subtasks').filter(
            due_date__date=today
        )

        return queryset