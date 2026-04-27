from django.contrib import admin
from .models import PersonalOperador, OperadorOrganizacion

@admin.register(PersonalOperador)
class PersonalOperadorAdmin(admin.ModelAdmin):
    list_display = ('cedula', 'nombres', 'apellidos', 'licencia_grado')
    search_fields = ('cedula', 'nombres', 'apellidos')

@admin.register(OperadorOrganizacion)
class OperadorOrganizacionAdmin(admin.ModelAdmin):
    list_display = ('operador', 'organizacion', 'fecha_inicio')
