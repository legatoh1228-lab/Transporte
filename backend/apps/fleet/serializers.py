from rest_framework import serializers
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal, VehiculoOperador

class TerminalSerializer(serializers.ModelSerializer):
    municipio_nombre = serializers.ReadOnlyField(source='municipio.nombre')
    
    class Meta:
        model = Terminal
        fields = '__all__'

class VehiculoOperadorSerializer(serializers.ModelSerializer):
    operador_nombre = serializers.SerializerMethodField()
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    
    class Meta:
        model = VehiculoOperador
        fields = '__all__'
        
    def get_operador_nombre(self, obj):
        return f"{obj.operador.nombres} {obj.operador.apellidos}"

class FlotaVehiculoSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.ReadOnlyField(source='modalidad.nombre')
    submodalidad_nombre = serializers.ReadOnlyField(source='submodalidad.nombre')
    transmision_nombre = serializers.ReadOnlyField(source='transmision.nombre')
    combustible_nombre = serializers.ReadOnlyField(source='combustible.nombre')
    operador_asignado = serializers.SerializerMethodField()
    
    class Meta:
        model = FlotaVehiculo
        fields = '__all__'

    def get_operador_asignado(self, obj):
        asignacion = obj.operadores_asignados.filter(estatus='Activo').first()
        if asignacion:
            return {
                'id': asignacion.id,
                'cedula': asignacion.operador.cedula,
                'nombres': asignacion.operador.nombres,
                'apellidos': asignacion.operador.apellidos,
            }
        return None

class VehiculoOrganizacionSerializer(serializers.ModelSerializer):
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    organizacion_nombre = serializers.ReadOnlyField(source='organizacion.razon_social')
    
    class Meta:
        model = VehiculoOrganizacion
        fields = '__all__'

