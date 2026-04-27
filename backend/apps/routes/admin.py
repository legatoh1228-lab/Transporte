from django.contrib.gis import admin
from .models import VialidadRuta, GestionPermiso

@admin.register(VialidadRuta)
class VialidadRutaAdmin(admin.GISModelAdmin):
    list_display = ('nombre', 'tipo', 'municipio_or', 'municipio_des', 'distancia_km')
    search_fields = ('nombre',)

@admin.register(GestionPermiso)
class GestionPermisoAdmin(admin.ModelAdmin):
    list_display = ('org', 'ruta', 'numero_resolucion', 'f_emision', 'estatus')
    list_filter = ('estatus',)
