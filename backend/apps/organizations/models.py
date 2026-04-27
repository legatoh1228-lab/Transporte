from django.db import models
from catalogs.models import TipoOrganizacion

class EmpresaOrganizacion(models.Model):
    rif = models.CharField(max_length=15, primary_key=True)
    razon_social = models.CharField(max_length=255)
    tipo = models.ForeignKey(TipoOrganizacion, on_delete=models.PROTECT, related_name='organizaciones')
    rep_legal_ci = models.CharField(max_length=15, verbose_name="Cédula Rep. Legal")
    rep_legal_nom = models.CharField(max_length=150, verbose_name="Nombre Rep. Legal")
    telefono = models.CharField(max_length=20, blank=True, null=True)
    correo = models.EmailField(max_length=255, blank=True, null=True)
    direccion_fiscal = models.TextField(blank=True, null=True)
    fecha_constitucion = models.DateField(blank=True, null=True)
    esta_activa = models.BooleanField(default=True)

    def __str__(self): return f"{self.rif} - {self.razon_social}"
    class Meta:
        verbose_name = "Empresa u Organización"
        verbose_name_plural = "Empresas y Organizaciones"
        db_table = 'empresa_organizacion'
