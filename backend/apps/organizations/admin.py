from django.contrib import admin
from .models import EmpresaOrganizacion, Gremio, OrganizacionCps

@admin.register(Gremio)
class GremioAdmin(admin.ModelAdmin):
    list_display = ('rif', 'razon_social', 'telefono', 'correo')
    search_fields = ('rif', 'razon_social')

class OrganizacionCpsInline(admin.TabularInline):
    model = OrganizacionCps
    extra = 1

@admin.register(EmpresaOrganizacion)
class EmpresaOrganizacionAdmin(admin.ModelAdmin):
    list_display = ('rif', 'razon_social', 'get_tipo_nombre', 'gremio', 'esta_activa')
    search_fields = ('rif', 'razon_social')
    list_filter = ('tipo', 'esta_activa', 'gremio')
    inlines = [OrganizacionCpsInline]

    def get_tipo_nombre(self, obj):
        return obj.tipo.nombre if obj.tipo else "-"
    get_tipo_nombre.short_description = "Tipo de Organización"

@admin.register(OrganizacionCps)
class OrganizacionCpsAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'organizacion', 'tipo_cps', 'activa', 'fecha_vencimiento')
    list_filter = ('activa', 'tipo_cps')
    search_fields = ('codigo', 'organizacion__razon_social')
