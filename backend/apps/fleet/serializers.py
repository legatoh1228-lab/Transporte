from rest_framework import serializers
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal, VehiculoOperador, AsignacionRuta

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
    cps_tipo_codigo = serializers.ReadOnlyField(source='cps_tipo.codigo')
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

    def validate(self, data):
        org = data.get('organizacion')
        if org and org.cupo_maximo_unidades > 0:
            count = VehiculoOrganizacion.objects.filter(organizacion=org, fecha_fin__isnull=True).count()
            if not self.instance and count >= org.cupo_maximo_unidades:
                raise serializers.ValidationError(
                    {"organizacion": f"La organización ha alcanzado su cupo máximo de {org.cupo_maximo_unidades} unidades."}
                )
        return data

class AsignacionRutaSerializer(serializers.ModelSerializer):
    operador_nombre = serializers.SerializerMethodField()
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    ruta_nombre = serializers.ReadOnlyField(source='ruta.nombre')

    class Meta:
        model = AsignacionRuta
        fields = '__all__'

    def get_operador_nombre(self, obj):
        return f"{obj.operador.nombres} {obj.operador.apellidos}"
