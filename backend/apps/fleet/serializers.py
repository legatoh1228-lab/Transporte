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
    organizacion = serializers.SerializerMethodField()
    
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

    def get_organizacion(self, obj):
        rel = obj.organizaciones.filter(fecha_fin__isnull=True).first()
        if rel:
            return rel.organizacion.rif
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
    colector_nombre = serializers.SerializerMethodField()
    vehiculo_placa = serializers.ReadOnlyField(source='vehiculo.placa')
    vehiculo_marca = serializers.ReadOnlyField(source='vehiculo.marca')
    vehiculo_modelo = serializers.ReadOnlyField(source='vehiculo.modelo')
    vehiculo_capacidad = serializers.ReadOnlyField(source='vehiculo.capacidad')
    
    # Computed from horario if available, otherwise from direct fields
    ruta_nombre = serializers.SerializerMethodField()
    organizacion_nombre = serializers.SerializerMethodField()
    horario_detalle = serializers.SerializerMethodField()

    class Meta:
        model = AsignacionRuta
        fields = '__all__'

    def get_operador_nombre(self, obj):
        return f"{obj.operador.nombres} {obj.operador.apellidos}"

    def get_colector_nombre(self, obj):
        if obj.colector:
            return f"{obj.colector.nombres} {obj.colector.apellidos}"
        return None

    def get_ruta_nombre(self, obj):
        if obj.ruta:
            return obj.ruta.nombre
        if obj.horario:
            return obj.horario.permiso.ruta.nombre
        return None

    def get_organizacion_nombre(self, obj):
        if obj.organizacion:
            return obj.organizacion.razon_social
        if obj.horario:
            return obj.horario.permiso.org.razon_social
        return None

    def get_horario_detalle(self, obj):
        if obj.horario:
            inicio = obj.horario.hora_inicio.strftime('%I:%M %p') if obj.horario.hora_inicio else '--:--'
            fin = obj.horario.hora_fin.strftime('%I:%M %p') if obj.horario.hora_fin else '--:--'
            if obj.horario.sentido == 'SERVICIO' or obj.horario.frecuencia_minutos == 0:
                return f"{obj.horario.get_sentido_display()}: {inicio} - {fin}"
            return f"{obj.horario.get_sentido_display()}: {inicio} - {fin} ({obj.horario.frecuencia_minutos} min)"
        if obj.hora_inicio or obj.hora_fin:
            inicio = obj.hora_inicio.strftime('%I:%M %p') if obj.hora_inicio else '--:--'
            fin = obj.hora_fin.strftime('%I:%M %p') if obj.hora_fin else '--:--'
            return f"{inicio} - {fin}"
        return "Sin Horario"

