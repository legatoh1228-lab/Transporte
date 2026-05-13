from django.contrib.gis.db import models
from catalogs.models import TipoRuta, TerritorioMunicipio, TipoVia
from organizations.models import EmpresaOrganizacion

class VialidadRuta(models.Model):
    nombre = models.CharField(max_length=200, unique=True)
    tipo = models.ForeignKey(TipoRuta, on_delete=models.PROTECT)
    municipio_or = models.ForeignKey(TerritorioMunicipio, on_delete=models.PROTECT, related_name='rutas_origen', verbose_name="Municipio Origen")
    municipio_des = models.ForeignKey(TerritorioMunicipio, on_delete=models.PROTECT, related_name='rutas_destino', verbose_name="Municipio Destino")
    es_anillado = models.BooleanField(default=False)
    distancia_km = models.DecimalField(max_digits=6, decimal_places=2, blank=True, null=True)
    tiempo_estimado_min = models.SmallIntegerField(blank=True, null=True)
    numero_paradas = models.SmallIntegerField(default=0)
    tipo_via = models.ForeignKey(TipoVia, on_delete=models.PROTECT)
    observaciones = models.TextField(blank=True, null=True)
    geom = models.LineStringField(srid=4326, blank=True, null=True)

    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Vialidad y Rutas"
        db_table = 'vialidad_ruta'

class GestionPermiso(models.Model):
    org = models.ForeignKey(EmpresaOrganizacion, on_delete=models.CASCADE, related_name='permisos')
    ruta = models.ForeignKey(VialidadRuta, on_delete=models.CASCADE, related_name='permisos')
    f_emision = models.DateField(verbose_name="Fecha de Emisión")
    numero_resolucion = models.CharField(max_length=50, blank=True, null=True)
    estatus = models.CharField(max_length=15, default='ACT', choices=[('ACT', 'Activo'), ('SUSP', 'Suspendido')])
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self): return f"Permiso {self.numero_resolucion} - {self.org}"
    class Meta:
        verbose_name = "Permiso de Ruta"
        verbose_name_plural = "Gestión de Permisos"
        unique_together = ('org', 'ruta')
        db_table = 'gestion_permiso'


class HorarioRuta(models.Model):
    """Horarios de ida y vuelta para un permiso orgá-ruta."""
    SENTIDO_CHOICES = [('IDA', 'Ida'), ('VUELTA', 'Vuelta')]
    permiso = models.ForeignKey(GestionPermiso, on_delete=models.CASCADE, related_name='horarios')
    sentido = models.CharField(max_length=10, choices=SENTIDO_CHOICES)
    hora_inicio = models.TimeField(verbose_name="Hora de Inicio")
    hora_fin = models.TimeField(verbose_name="Hora de Fin")
    frecuencia_minutos = models.SmallIntegerField(verbose_name="Frecuencia (minutos)")

    def __str__(self): return f"{self.permiso} - {self.sentido} {self.hora_inicio}-{self.hora_fin} c/{self.frecuencia_minutos}min"
    class Meta:
        verbose_name = "Horario de Ruta"
        verbose_name_plural = "Horarios de Ruta"
        db_table = 'horario_ruta'
