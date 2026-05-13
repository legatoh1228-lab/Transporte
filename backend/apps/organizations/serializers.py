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
    
    class Meta:
        model = EmpresaOrganizacion
        fields = '__all__'
