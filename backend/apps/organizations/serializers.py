from rest_framework import serializers
from .models import EmpresaOrganizacion, Gremio

class GremioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gremio
        fields = '__all__'

class EmpresaOrganizacionSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    gremio_nombre = serializers.ReadOnlyField(source='gremio.razon_social')
    rutas = serializers.SerializerMethodField()
    
    class Meta:
        model = EmpresaOrganizacion
        fields = '__all__'

    def get_rutas(self, obj):
        from routes.models import GestionPermiso
        permisos = GestionPermiso.objects.filter(org=obj).select_related('ruta')
        return [{
            'id': p.id,
            'ruta_id': p.ruta.id,
            'ruta_nombre': p.ruta.nombre,
            'numero_resolucion': p.numero_resolucion,
            'hora_salida_ida': p.hora_salida_ida,
            'hora_regreso_ida': p.hora_regreso_ida,
            'frecuencia_ida_min': p.frecuencia_ida_min,
            'hora_salida_vuelta': p.hora_salida_vuelta,
            'hora_regreso_vuelta': p.hora_regreso_vuelta,
            'frecuencia_vuelta_min': p.frecuencia_vuelta_min,
        } for p in permisos]
