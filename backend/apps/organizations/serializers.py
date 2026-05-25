from rest_framework import serializers
from .models import EmpresaOrganizacion, Gremio, OrganizacionCps

class GremioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gremio
        fields = '__all__'

class OrganizacionCpsSerializer(serializers.ModelSerializer):
    tipo_cps_codigo = serializers.ReadOnlyField(source='tipo_cps.codigo')
    
    class Meta:
        model = OrganizacionCps
        fields = '__all__'

class EmpresaOrganizacionSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    gremio_nombre = serializers.ReadOnlyField(source='gremio.razon_social')
    municipio_nombre = serializers.ReadOnlyField(source='municipio.nombre')
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
            'municipio_or': p.ruta.municipio_or.nombre if p.ruta.municipio_or else 'N/A',
            'municipio_des': p.ruta.municipio_des.nombre if p.ruta.municipio_des else 'N/A',
            'tipo_ruta': p.ruta.tipo.nombre if p.ruta.tipo else 'N/A',
            'numero_resolucion': p.numero_resolucion,
            'hora_salida_ida': p.hora_salida_ida,
            'hora_regreso_ida': p.hora_regreso_ida,
            'frecuencia_ida_min': p.frecuencia_ida_min,
            'hora_salida_vuelta': p.hora_salida_vuelta,
            'hora_regreso_vuelta': p.hora_regreso_vuelta,
            'frecuencia_vuelta_min': p.frecuencia_vuelta_min,
        } for p in permisos]

    def create(self, validated_data):
        rutas_data = self.context['request'].data.get('rutas', [])
        instance = super().create(validated_data)
        self._save_rutas(instance, rutas_data)
        return instance

    def update(self, instance, validated_data):
        rutas_data = self.context['request'].data.get('rutas', [])
        instance = super().update(instance, validated_data)
        self._save_rutas(instance, rutas_data)
        return instance

    def _save_rutas(self, instance, rutas_data):
        from routes.models import GestionPermiso, HorarioRuta, VialidadRuta
        from datetime import date
        
        existing_permisos = {p.ruta.id: p for p in GestionPermiso.objects.filter(org=instance)}
        new_ruta_ids = [int(r['ruta_id']) for r in rutas_data if r.get('ruta_id')]
        
        for r_id, p in list(existing_permisos.items()):
            if r_id not in new_ruta_ids:
                p.delete()
        
        for r_data in rutas_data:
            r_id = r_data.get('ruta_id')
            if not r_id:
                continue
            r_id = int(r_id)
            ruta_obj = VialidadRuta.objects.get(id=r_id)
            
            p = GestionPermiso.objects.filter(org=instance, ruta=ruta_obj).first()
            if not p:
                p = GestionPermiso.objects.create(
                    org=instance,
                    ruta=ruta_obj,
                    f_emision=date.today(),
                    numero_resolucion=r_data.get('numero_resolucion', ''),
                    hora_salida_ida=r_data.get('hora_salida_ida') or None,
                    hora_regreso_ida=r_data.get('hora_regreso_ida') or None,
                    frecuencia_ida_min=int(r_data.get('frecuencia_ida_min')) if r_data.get('frecuencia_ida_min') else None,
                    hora_salida_vuelta=r_data.get('hora_salida_vuelta') or None,
                    hora_regreso_vuelta=r_data.get('hora_regreso_vuelta') or None,
                    frecuencia_vuelta_min=int(r_data.get('frecuencia_vuelta_min')) if r_data.get('frecuencia_vuelta_min') else None,
                )
            else:
                p.numero_resolucion = r_data.get('numero_resolucion', '')
                p.hora_salida_ida = r_data.get('hora_salida_ida') or None
                p.hora_regreso_ida = r_data.get('hora_regreso_ida') or None
                p.frecuencia_ida_min = int(r_data.get('frecuencia_ida_min')) if r_data.get('frecuencia_ida_min') else None
                p.hora_salida_vuelta = r_data.get('hora_salida_vuelta') or None
                p.hora_regreso_vuelta = r_data.get('hora_regreso_vuelta') or None
                p.frecuencia_vuelta_min = int(r_data.get('frecuencia_vuelta_min')) if r_data.get('frecuencia_vuelta_min') else None
                p.save()
            
            # Now create/update the HorarioRuta entries
            if p.hora_salida_ida and p.hora_regreso_ida and p.frecuencia_ida_min:
                HorarioRuta.objects.update_or_create(
                    permiso=p,
                    sentido='IDA',
                    defaults={
                        'hora_inicio': p.hora_salida_ida,
                        'hora_fin': p.hora_regreso_ida,
                        'frecuencia_minutos': p.frecuencia_ida_min
                    }
                )
            else:
                HorarioRuta.objects.filter(permiso=p, sentido='IDA').delete()
                
            if p.hora_salida_vuelta and p.hora_regreso_vuelta and p.frecuencia_vuelta_min:
                HorarioRuta.objects.update_or_create(
                    permiso=p,
                    sentido='VUELTA',
                    defaults={
                        'hora_inicio': p.hora_salida_vuelta,
                        'hora_fin': p.hora_regreso_vuelta,
                        'frecuencia_minutos': p.frecuencia_vuelta_min
                    }
                )
            else:
                HorarioRuta.objects.filter(permiso=p, sentido='VUELTA').delete()
