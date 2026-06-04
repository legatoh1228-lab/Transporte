from rest_framework import serializers
from .models import PersonalOperador, OperadorOrganizacion, PersonalColector, ColectorOrganizacion

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

class PersonalColectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalColector
        fields = '__all__'

class ColectorOrganizacionSerializer(serializers.ModelSerializer):
    colector_nombre = serializers.ReadOnlyField(source='colector.nombres')
    organizacion_nombre = serializers.ReadOnlyField(source='organizacion.razon_social')
    
    class Meta:
        model = ColectorOrganizacion
        fields = '__all__'
