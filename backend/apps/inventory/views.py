from rest_framework import viewsets
from .models import Insumo, MovimientoInsumo
from .serializers import InsumoSerializer, MovimientoInsumoSerializer

class InsumoViewSet(viewsets.ModelViewSet):
    queryset = Insumo.objects.all()
    serializer_class = InsumoSerializer

class MovimientoInsumoViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInsumo.objects.all()
    serializer_class = MovimientoInsumoSerializer
