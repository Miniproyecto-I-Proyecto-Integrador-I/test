from rest_framework import serializers
from .models import Subtask, Task

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__' 


