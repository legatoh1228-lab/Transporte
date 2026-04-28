from rest_framework import serializers
from .models import VialidadRuta, GestionPermiso

class VialidadRutaSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    municipio_or_nombre = serializers.ReadOnlyField(source='municipio_or.nombre')
    municipio_des_nombre = serializers.ReadOnlyField(source='municipio_des.nombre')
    
    class Meta:
        model = VialidadRuta
        fields = '__all__'

class GestionPermisoSerializer(serializers.ModelSerializer):
    org_nombre = serializers.ReadOnlyField(source='org.razon_social')
    ruta_nombre = serializers.ReadOnlyField(source='ruta.nombre')
    
    class Meta:
        model = GestionPermiso
        fields = '__all__'
