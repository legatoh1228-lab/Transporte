from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import EmpresaOrganizacion, Gremio
from routes.models import GestionPermiso, VialidadRuta
from .serializers import EmpresaOrganizacionSerializer, GremioSerializer
import datetime

class EmpresaOrganizacionViewSet(viewsets.ModelViewSet):
    queryset = EmpresaOrganizacion.objects.all()
    serializer_class = EmpresaOrganizacionSerializer

    def _sync_rutas(self, org, rutas_data):
        GestionPermiso.objects.filter(org=org).delete()
        for r_data in rutas_data:
            ruta_id = r_data.get('ruta_id')
            if ruta_id:
                try:
                    ruta = VialidadRuta.objects.get(id=ruta_id)
                    GestionPermiso.objects.create(
                        org=org,
                        ruta=ruta,
                        f_emision=datetime.date.today(),
                        numero_resolucion=r_data.get('numero_resolucion', ''),
                        hora_salida_ida=r_data.get('hora_salida_ida') or None,
                        hora_regreso_ida=r_data.get('hora_regreso_ida') or None,
                        frecuencia_ida_min=r_data.get('frecuencia_ida_min') or None,
                        hora_salida_vuelta=r_data.get('hora_salida_vuelta') or None,
                        hora_regreso_vuelta=r_data.get('hora_regreso_vuelta') or None,
                        frecuencia_vuelta_min=r_data.get('frecuencia_vuelta_min') or None,
                    )
                except VialidadRuta.DoesNotExist:
                    pass

    def create(self, request, *args, **kwargs):
        rutas_data = request.data.pop('rutas', [])
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        org = serializer.instance
        if isinstance(rutas_data, list):
            self._sync_rutas(org, rutas_data)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        rutas_data = request.data.pop('rutas', None)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if rutas_data is not None and isinstance(rutas_data, list):
            self._sync_rutas(instance, rutas_data)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

class GremioViewSet(viewsets.ModelViewSet):
    queryset = Gremio.objects.all()
    serializer_class = GremioSerializer
