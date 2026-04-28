from rest_framework import viewsets
from .models import EmpresaOrganizacion
from .serializers import EmpresaOrganizacionSerializer

class EmpresaOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = EmpresaOrganizacion.objects.all()
    serializer_class = EmpresaOrganizacionSerializer
