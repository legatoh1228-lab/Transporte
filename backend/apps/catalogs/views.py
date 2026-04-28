from rest_framework import viewsets
from .models import (
    Modalidad, SubModalidad, TerritorioEje, TerritorioMunicipio,
    TipoCombustible, TipoRuta, TipoTransmision, TipoVia, TipoOrganizacion, Rol
)
from .serializers import (
    ModalidadSerializer, SubModalidadSerializer, TerritorioEjeSerializer,
    TerritorioMunicipioSerializer, TipoCombustibleSerializer, TipoRutaSerializer,
    TipoTransmisionSerializer, TipoViaSerializer, TipoOrganizacionSerializer, RolSerializer
)

class ModalidadViewSet(viewsets.ModelViewSet):
    queryset = Modalidad.objects.all()
    serializer_class = ModalidadSerializer

class SubModalidadViewSet(viewsets.ModelViewSet):
    queryset = SubModalidad.objects.all()
    serializer_class = SubModalidadSerializer

class TerritorioEjeViewSet(viewsets.ModelViewSet):
    queryset = TerritorioEje.objects.all()
    serializer_class = TerritorioEjeSerializer

class TerritorioMunicipioViewSet(viewsets.ModelViewSet):
    queryset = TerritorioMunicipio.objects.all()
    serializer_class = TerritorioMunicipioSerializer

class TipoCombustibleViewSet(viewsets.ModelViewSet):
    queryset = TipoCombustible.objects.all()
    serializer_class = TipoCombustibleSerializer

class TipoRutaViewSet(viewsets.ModelViewSet):
    queryset = TipoRuta.objects.all()
    serializer_class = TipoRutaSerializer

class TipoTransmisionViewSet(viewsets.ModelViewSet):
    queryset = TipoTransmision.objects.all()
    serializer_class = TipoTransmisionSerializer

class TipoViaViewSet(viewsets.ModelViewSet):
    queryset = TipoVia.objects.all()
    serializer_class = TipoViaSerializer

class TipoOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = TipoOrganizacion.objects.all()
    serializer_class = TipoOrganizacionSerializer

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
