from django.contrib import admin
from .models import FlotaVehiculo, VehiculoOrganizacion

@admin.register(FlotaVehiculo)
class FlotaVehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'marca', 'modelo', 'modalidad', 'combustible')
    search_fields = ('placa', 'marca', 'modelo')

@admin.register(VehiculoOrganizacion)
class VehiculoOrganizacionAdmin(admin.ModelAdmin):
    list_display = ('vehiculo', 'organizacion', 'fecha_inicio')
