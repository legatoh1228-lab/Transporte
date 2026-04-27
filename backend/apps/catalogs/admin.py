from django.contrib import admin
from .models import *

@admin.register(Modalidad)
class ModalidadAdmin(admin.ModelAdmin): pass

@admin.register(SubModalidad)
class SubModalidadAdmin(admin.ModelAdmin): list_display = ('nombre', 'modalidad')

@admin.register(TerritorioEje)
class TerritorioEjeAdmin(admin.ModelAdmin): pass

@admin.register(TerritorioMunicipio)
class TerritorioMunicipioAdmin(admin.ModelAdmin): list_display = ('nombre', 'eje')

admin.site.register([TipoCombustible, TipoRuta, TipoTransmision, TipoVia, TipoOrganizacion, Rol])
