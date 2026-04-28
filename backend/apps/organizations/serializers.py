from rest_framework import serializers
from .models import EmpresaOrganizacion

class EmpresaOrganizacionSerializer(serializers.ModelSerializer):
    tipo_nombre = serializers.ReadOnlyField(source='tipo.nombre')
    
    class Meta:
        model = EmpresaOrganizacion
        fields = '__all__'
