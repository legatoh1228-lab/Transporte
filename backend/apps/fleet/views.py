from rest_framework import viewsets
from .models import FlotaVehiculo, VehiculoOrganizacion
from .serializers import FlotaVehiculoSerializer, VehiculoOrganizacionSerializer

class FlotaVehiculoViewSet(viewsets.ModelViewSet):
    queryset = FlotaVehiculo.objects.all()
    serializer_class = FlotaVehiculoSerializer

class VehiculoOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOrganizacion.objects.all()
    serializer_class = VehiculoOrganizacionSerializer
