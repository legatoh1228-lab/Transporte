from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import (
    Modalidad, SubModalidad, TerritorioEje, TerritorioMunicipio,
    TipoCombustible, TipoRuta, TipoTransmision, TipoVia, TipoOrganizacion, Rol,
    ConfiguracionVisual, TipoCps
)
from .serializers import (
    ModalidadSerializer, SubModalidadSerializer, TerritorioEjeSerializer,
    TerritorioMunicipioSerializer, TipoCombustibleSerializer, TipoRutaSerializer,
    TipoTransmisionSerializer, TipoViaSerializer, TipoOrganizacionSerializer, RolSerializer,
    ConfiguracionVisualSerializer, TipoCpsSerializer
)
from .models import RolPermiso
from .serializers_perms import RolPermisoSerializer

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

class RolPermisoViewSet(viewsets.ModelViewSet):
    queryset = RolPermiso.objects.all()
    serializer_class = RolPermisoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        rol_id = self.request.query_params.get('rol', None)
        if rol_id is not None:
            queryset = queryset.filter(rol_id=rol_id)
        return queryset

class ConfiguracionVisualViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracionVisual.objects.all()
    serializer_class = ConfiguracionVisualSerializer
    permission_classes = [AllowAny] # Branding needs to be public for Login page

    def get_object(self):
        # Ensure ID 1 always exists when requested
        return ConfiguracionVisual.get_solo()

    def get_queryset(self):
        return ConfiguracionVisual.objects.filter(id=1)

    def list(self, request, *args, **kwargs):
        obj = ConfiguracionVisual.get_solo()
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

class TipoCpsViewSet(viewsets.ModelViewSet):
    queryset = TipoCps.objects.all()
    serializer_class = TipoCpsSerializer
