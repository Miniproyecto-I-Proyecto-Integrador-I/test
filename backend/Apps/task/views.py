from rest_framework import viewsets
from django.db.models import Prefetch
from Apps.subtask.models import Subtask
from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        queryset = Task.objects.all()

        return queryset.distinct()