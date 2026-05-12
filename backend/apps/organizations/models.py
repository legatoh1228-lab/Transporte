from django.db import models
from catalogs.models import TipoOrganizacion, TipoCps


class Gremio(models.Model):
    rif = models.CharField(max_length=15, unique=True)
    razon_social = models.CharField(max_length=255)
    direccion = models.TextField(blank=True, null=True)
    anio_creacion = models.SmallIntegerField(blank=True, null=True, verbose_name="Año de Creación")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=255, blank=True, null=True)

    def __str__(self): return f"{self.rif} - {self.razon_social}"
    class Meta:
        verbose_name = "Gremio"
        verbose_name_plural = "Gremios"
        db_table = 'gremio'


class EmpresaOrganizacion(models.Model):
    rif = models.CharField(max_length=15, primary_key=True)
    razon_social = models.CharField(max_length=255)
    tipo = models.ForeignKey(TipoOrganizacion, on_delete=models.PROTECT, related_name='organizaciones')
    gremio = models.ForeignKey(Gremio, on_delete=models.SET_NULL, null=True, blank=True, related_name='organizaciones')
    rep_legal_ci = models.CharField(max_length=15, verbose_name="Cédula Rep. Legal")
    rep_legal_nom = models.CharField(max_length=150, verbose_name="Nombre Rep. Legal")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=255, blank=True, null=True)
    direccion_fiscal = models.TextField(blank=True, null=True)
    fecha_constitucion_mercantil = models.DateField(blank=True, null=True, verbose_name="Fecha de Constitución Mercantil")
    cupo_maximo_unidades = models.SmallIntegerField(blank=True, null=True, verbose_name="Cupo Máximo de Unidades")
    esta_activa = models.BooleanField(default=True)

    def __str__(self): return f"{self.rif} - {self.razon_social}"
    class Meta:
        verbose_name = "Empresa u Organización"
        verbose_name_plural = "Empresas y Organizaciones"
        db_table = 'empresa_organizacion'


class OrganizacionCps(models.Model):
    """Certificación de Prestación de Servicio (DT9 o DT10) de la organización."""
    organizacion = models.ForeignKey(EmpresaOrganizacion, on_delete=models.CASCADE, related_name='cps_registros')
    codigo = models.CharField(max_length=50, verbose_name="Código del Permiso")
    fecha_expedicion = models.DateField(verbose_name="Fecha de Expedición")
    fecha_vencimiento = models.DateField(verbose_name="Fecha de Vencimiento")
    modalidad = models.CharField(max_length=50, blank=True, null=True, verbose_name="Modalidad (p.ej. Colectivo Suburbano)")
    tipo_cps = models.ForeignKey(TipoCps, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Tipo CPS")
    cupo_maximo_unidades = models.SmallIntegerField(blank=True, null=True, verbose_name="Cupo Máximo de Unidades")
    activa = models.BooleanField(default=True)

    def __str__(self): return f"CPS {self.codigo} - {self.organizacion}"
    class Meta:
        verbose_name = "CPS de Organización"
        verbose_name_plural = "CPS de Organizaciones"
        db_table = 'organizacion_cps'
