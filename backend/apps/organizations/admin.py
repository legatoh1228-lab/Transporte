from django.contrib import admin
from .models import EmpresaOrganizacion

@admin.register(EmpresaOrganizacion)
class EmpresaOrganizacionAdmin(admin.ModelAdmin):
    list_display = ('rif', 'razon_social', 'tipo', 'esta_activa')
    search_fields = ('rif', 'razon_social')
