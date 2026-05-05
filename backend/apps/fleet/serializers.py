from rest_framework import serializers
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal

class TerminalSerializer(serializers.ModelSerializer):
    municipio_nombre = serializers.ReadOnlyField(source='municipio.nombre')
    
    class Meta:
        model = Terminal
        fields = '__all__'

class FlotaVehiculoSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.ReadOnlyField(source='modalidad.nombre')
    submodalidad_nombre = serializers.ReadOnlyField(source='submodalidad.nombre')
    transmision_nombre = serializers.ReadOnlyField(source='transmision.nombre')
    combustible_nombre = serializers.ReadOnlyField(source='combustible.nombre')
    
    class Meta:
        model = FlotaVehiculo
        fields = '__all__'

class VehiculoOrganizacionSerializer(serializers.ModelSerializer):
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    organizacion_nombre = serializers.ReadOnlyField(source='organizacion.razon_social')
    
    class Meta:
        model = VehiculoOrganizacion
        fields = '__all__'
