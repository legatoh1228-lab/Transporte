from rest_framework import serializers
from .models import Insumo, MovimientoInsumo
from fleet.serializers import FlotaVehiculoSerializer

class InsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumo
        fields = '__all__'

class MovimientoInsumoSerializer(serializers.ModelSerializer):
    insumo_nombre = serializers.CharField(source='insumo.nombre', read_only=True)
    insumo_unidad = serializers.CharField(source='insumo.unidad_medida', read_only=True)
    vehiculo_placa = serializers.CharField(source='vehiculo_destino.placa', read_only=True)
    vehiculo_marca = serializers.CharField(source='vehiculo_destino.marca', read_only=True)

    class Meta:
        model = MovimientoInsumo
        fields = '__all__'
