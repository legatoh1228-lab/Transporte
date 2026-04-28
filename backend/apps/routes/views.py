from rest_framework import viewsets
from .models import VialidadRuta, GestionPermiso
from .serializers import VialidadRutaSerializer, GestionPermisoSerializer

class VialidadRutaViewSet(viewsets.ModelViewSet):
    queryset = VialidadRuta.objects.all()
    serializer_class = VialidadRutaSerializer

class GestionPermisoViewSet(viewsets.ModelViewSet):
    queryset = GestionPermiso.objects.all()
    serializer_class = GestionPermisoSerializer
