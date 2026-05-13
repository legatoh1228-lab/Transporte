from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import VialidadRuta, GestionPermiso, HorarioRuta
from .serializers import VialidadRutaSerializer, GestionPermisoSerializer, HorarioRutaSerializer

class VialidadRutaViewSet(viewsets.ModelViewSet):
    queryset = VialidadRuta.objects.all()
    serializer_class = VialidadRutaSerializer

class HorarioRutaViewSet(viewsets.ModelViewSet):
    queryset = HorarioRuta.objects.all()
    serializer_class = HorarioRutaSerializer

class GestionPermisoViewSet(viewsets.ModelViewSet):
    queryset = GestionPermiso.objects.all()
    serializer_class = GestionPermisoSerializer

    @action(detail=True, methods=['get', 'post'])
    def horarios(self, request, pk=None):
        """Gestiona los horarios vinculados a un permiso específico."""
        permiso = self.get_object()
        if request.method == 'GET':
            horarios = HorarioRuta.objects.filter(permiso=permiso)
            serializer = HorarioRutaSerializer(horarios, many=True)
            return Response(serializer.data)
        
        if request.method == 'POST':
            data = request.data.copy()
            data['permiso'] = permiso.id
            serializer = HorarioRutaSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
