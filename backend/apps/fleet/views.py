from rest_framework import viewsets
from .models import FlotaVehiculo, VehiculoOrganizacion, Terminal, VehiculoOperador, AsignacionRuta
from .serializers import (
    FlotaVehiculoSerializer, VehiculoOrganizacionSerializer, 
    TerminalSerializer, VehiculoOperadorSerializer, AsignacionRutaSerializer
)

class AsignacionRutaViewSet(viewsets.ModelViewSet):
    queryset = AsignacionRuta.objects.all().order_by('-fecha_inicio')
    serializer_class = AsignacionRutaSerializer
    filterset_fields = ['vehiculo', 'operador', 'horario', 'estatus']

    def perform_create(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            serializer.save()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)

    def perform_update(self, serializer):
        from django.core.exceptions import ValidationError as DjangoValidationError
        from rest_framework.exceptions import ValidationError as DRFValidationError
        try:
            serializer.save()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict if hasattr(e, 'message_dict') else e.messages)

class TerminalViewSet(viewsets.ModelViewSet):
    queryset = Terminal.objects.all()
    serializer_class = TerminalSerializer
    filterset_fields = ['municipio', 'tipo', 'estatus']
    search_fields = ['nombre']

class FlotaVehiculoViewSet(viewsets.ModelViewSet):
    queryset = FlotaVehiculo.objects.all()
    serializer_class = FlotaVehiculoSerializer
    filterset_fields = ['modalidad', 'submodalidad', 'marca']
    search_fields = ['placa', 'marca', 'modelo']

class VehiculoOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOrganizacion.objects.all()
    serializer_class = VehiculoOrganizacionSerializer
    filterset_fields = ['organizacion', 'vehiculo']

class VehiculoOperadorViewSet(viewsets.ModelViewSet):
    queryset = VehiculoOperador.objects.all()
    serializer_class = VehiculoOperadorSerializer
    
    def perform_create(self, serializer):
        # Desactivar asignaciones previas para este vehículo
        vehiculo = serializer.validated_data.get('vehiculo')
        VehiculoOperador.objects.filter(vehiculo=vehiculo, estatus='Activo').update(estatus='Inactivo')
        serializer.save(estatus='Activo')

