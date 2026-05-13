from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import EmpresaOrganizacion, Gremio, OrganizacionCps
from .serializers import EmpresaOrganizacionSerializer, GremioSerializer, OrganizacionCpsSerializer

class GremioViewSet(viewsets.ModelViewSet):
    queryset = Gremio.objects.all()
    serializer_class = GremioSerializer

class OrganizacionCpsViewSet(viewsets.ModelViewSet):
    queryset = OrganizacionCps.objects.all()
    serializer_class = OrganizacionCpsSerializer
    filterset_fields = ['organizacion', 'activa']

class EmpresaOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = EmpresaOrganizacion.objects.all()
    serializer_class = EmpresaOrganizacionSerializer

    @action(detail=True, methods=['get', 'post'])
    def cps(self, request, pk=None):
        """Gestiona los CPS vinculados a una organización específica."""
        org = self.get_object()
        if request.method == 'GET':
            cps = OrganizacionCps.objects.filter(organizacion=org)
            serializer = OrganizacionCpsSerializer(cps, many=True)
            return Response(serializer.data)
        
        if request.method == 'POST':
            data = request.data.copy()
            data['organizacion'] = org.rif
            serializer = OrganizacionCpsSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
