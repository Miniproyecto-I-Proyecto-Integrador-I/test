from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import UserSerializer
from .auth_serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from Apps.subtask.models import Subtask

User = get_user_model()


class AuthTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer

    def get_queryset(self):
        # Cada usuario solo ve su propia info
        return User.objects.filter(id=self.request.user.id)

    def get_permissions(self):
        if self.action in ['create', 'register']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='register')
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='me')
    def me(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated], url_path='update')
    def update_me(self, request):
        new_daily_hours = request.data.get('daily_hours')
        
        if new_daily_hours is not None:
            try:
                new_daily_hours = int(new_daily_hours)
                old_daily_hours = request.user.daily_hours
                
                if new_daily_hours < old_daily_hours:
                    today = timezone.localdate()
                    subtasks_queryset = Subtask.objects.filter(
                        task__user=request.user,
                        planification_date__gte=today,
                        status__in=[Subtask.Status.PENDING, Subtask.Status.IN_PROGRESS]
                    ).filter(
                        Q(note__isnull=True) | Q(note='')
                    )
                    
                    conflicts_dates = subtasks_queryset.values('planification_date').annotate(
                        total_day_hours=Sum('needed_hours')
                    ).filter(total_day_hours__gt=new_daily_hours)
                    
                    if conflicts_dates.exists():
                        dates = [c['planification_date'] for c in conflicts_dates]
                        conflicting_subtasks = subtasks_queryset.select_related('task').filter(planification_date__in=dates).order_by('planification_date')
                        
                        grouped_conflicts = {}
                        for s in conflicting_subtasks:
                            date_key = s.planification_date.isoformat()
                            if date_key not in grouped_conflicts:
                                grouped_conflicts[date_key] = {
                                    "fecha": s.planification_date,
                                    "subtasks": []
                                }
                            grouped_conflicts[date_key]["subtasks"].append({
                                "id": s.id,
                                "nombre": s.description,
                                "horas": s.needed_hours,
                                "task_title": s.task.title,
                                "task_due_date": s.task.due_date.isoformat() if s.task and s.task.due_date else None,
                            })
                        
                        return Response(list(grouped_conflicts.values()), status=status.HTTP_409_CONFLICT)
            except (ValueError, TypeError):
                pass

        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)


        