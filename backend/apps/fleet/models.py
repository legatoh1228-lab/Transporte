from django.db import models
from catalogs.models import Modalidad, SubModalidad, TipoTransmision, TipoCombustible
from organizations.models import EmpresaOrganizacion

class FlotaVehiculo(models.Model):
    placa = models.CharField(max_length=15, primary_key=True)
    modalidad = models.ForeignKey(Modalidad, on_delete=models.PROTECT)
    submodalidad = models.ForeignKey(SubModalidad, on_delete=models.PROTECT)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    anio = models.SmallIntegerField(verbose_name="Año")
    color = models.CharField(max_length=30, blank=True, null=True)
    transmision = models.ForeignKey(TipoTransmision, on_delete=models.PROTECT)
    capacidad = models.SmallIntegerField(help_text="Capacidad Sentados")
    capacidad_pie = models.SmallIntegerField(blank=True, null=True, help_text="Capacidad Parados")
    combustible = models.ForeignKey(TipoCombustible, on_delete=models.PROTECT)
    aire_acondicionado = models.BooleanField(default=False)
    accesibilidad = models.BooleanField(default=False, verbose_name="Rampa/Accesibilidad")
    seguro_vence = models.DateField(blank=True, null=True)
    revision_tecnica_vence = models.DateField(blank=True, null=True)

    def __str__(self): return f"{self.placa} - {self.marca} {self.modelo}"
    class Meta:
        verbose_name = "Vehículo de la Flota"
        verbose_name_plural = "Flota de Vehículos"
        db_table = 'flota_vehiculo'

class VehiculoOrganizacion(models.Model):
    vehiculo = models.ForeignKey(FlotaVehiculo, on_delete=models.CASCADE, related_name='organizaciones')
    organizacion = models.ForeignKey(EmpresaOrganizacion, on_delete=models.CASCADE, related_name='vehiculos')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(blank=True, null=True)

    def __str__(self): return f"{self.vehiculo} @ {self.organizacion}"
    class Meta:
        verbose_name_plural = "Relaciones Vehículo-Organización"
        db_table = 'vehiculo_organizacion'
