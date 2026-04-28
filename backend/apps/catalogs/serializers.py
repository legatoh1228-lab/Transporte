from rest_framework import serializers
from .models import (
    Modalidad, SubModalidad, TerritorioEje, TerritorioMunicipio,
    TipoCombustible, TipoRuta, TipoTransmision, TipoVia, TipoOrganizacion, Rol
)

class ModalidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidad
        fields = '__all__'

class SubModalidadSerializer(serializers.ModelSerializer):
    modalidad_nombre = serializers.ReadOnlyField(source='modalidad.nombre')
    class Meta:
        model = SubModalidad
        fields = '__all__'

class TerritorioEjeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TerritorioEje
        fields = '__all__'

class TerritorioMunicipioSerializer(serializers.ModelSerializer):
    eje_nombre = serializers.ReadOnlyField(source='eje.nombre')
    class Meta:
        model = TerritorioMunicipio
        fields = '__all__'

class TipoCombustibleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoCombustible
        fields = '__all__'

class TipoRutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoRuta
        fields = '__all__'

class TipoTransmisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoTransmision
        fields = '__all__'

class TipoViaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVia
        fields = '__all__'

class TipoOrganizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoOrganizacion
        fields = '__all__'

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'
