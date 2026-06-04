from rest_framework import viewsets
from .models import PersonalOperador, OperadorOrganizacion, PersonalColector, ColectorOrganizacion
from .serializers import PersonalOperadorSerializer, OperadorOrganizacionSerializer, PersonalColectorSerializer, ColectorOrganizacionSerializer

class PersonalOperadorViewSet(viewsets.ModelViewSet):
    queryset = PersonalOperador.objects.all()
    serializer_class = PersonalOperadorSerializer
    search_fields = ['cedula', 'nombres', 'apellidos', 'codigo_op']

class OperadorOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = OperadorOrganizacion.objects.all()
    serializer_class = OperadorOrganizacionSerializer
    filterset_fields = ['organizacion', 'operador']

class PersonalColectorViewSet(viewsets.ModelViewSet):
    queryset = PersonalColector.objects.all()
    serializer_class = PersonalColectorSerializer
    search_fields = ['cedula', 'nombres', 'apellidos', 'codigo_col']

class ColectorOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = ColectorOrganizacion.objects.all()
    serializer_class = ColectorOrganizacionSerializer
    filterset_fields = ['organizacion', 'colector']
