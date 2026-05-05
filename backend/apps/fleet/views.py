from rest_framework import viewsets
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal
from .serializers import FlotaVehiculoSerializer, VehiculoOrganizacionSerializer, TerminalSerializer

class TerminalViewSet(viewsets.ModelViewSet):
    queryset = Terminal.objects.all()
    serializer_class = TerminalSerializer

class FlotaVehiculoViewSet(viewsets.ModelViewSet):
    queryset = FlotaVehiculo.objects.all()
    serializer_class = FlotaVehiculoSerializer

class VehiculoOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOrganizacion.objects.all()
    serializer_class = VehiculoOrganizacionSerializer
