from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import CustomUser
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    serializer_class=UserSerializer
    
    def get_queryset(self):
        queryset=CustomUser.objects.all()
        return queryset