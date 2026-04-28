from rest_framework import serializers
from .models import PersonalOperador, OperadorOrganizacion

class PersonalOperadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalOperador
        fields = '__all__'

class OperadorOrganizacionSerializer(serializers.ModelSerializer):
    operador_nombre = serializers.ReadOnlyField(source='operador.nombres')
    organizacion_nombre = serializers.ReadOnlyField(source='organizacion.razon_social')
    
    class Meta:
        model = OperadorOrganizacion
        fields = '__all__'
