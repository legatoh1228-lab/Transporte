from rest_framework import viewsets
from .models import PersonalOperador, OperadorOrganizacion
from .serializers import PersonalOperadorSerializer, OperadorOrganizacionSerializer

class PersonalOperadorViewSet(viewsets.ModelViewSet):
    queryset = PersonalOperador.objects.all()
    serializer_class = PersonalOperadorSerializer
    search_fields = ['cedula', 'nombres', 'apellidos', 'codigo_op']

class OperadorOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = OperadorOrganizacion.objects.all()
    serializer_class = OperadorOrganizacionSerializer
    filterset_fields = ['organizacion', 'operador']
