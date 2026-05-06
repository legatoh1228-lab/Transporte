from rest_framework import viewsets
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal, VehiculoOperador
from .serializers import FlotaVehiculoSerializer, VehiculoOrganizacionSerializer, TerminalSerializer, VehiculoOperadorSerializer

class TerminalViewSet(viewsets.ModelViewSet):
    queryset = Terminal.objects.all()
    serializer_class = TerminalSerializer

class FlotaVehiculoViewSet(viewsets.ModelViewSet):
    queryset = FlotaVehiculo.objects.all()
    serializer_class = FlotaVehiculoSerializer

class VehiculoOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOrganizacion.objects.all()
    serializer_class = VehiculoOrganizacionSerializer

class VehiculoOperadorViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOperador.objects.all()
    serializer_class = VehiculoOperadorSerializer
    
    def perform_create(self, serializer):
        # Desactivar asignaciones previas para este vehículo
        vehiculo = serializer.validated_data.get('vehiculo')
        VehiculoOperador.objects.filter(vehiculo=vehiculo, estatus='Activo').update(estatus='Inactivo')
        serializer.save(estatus='Activo')

