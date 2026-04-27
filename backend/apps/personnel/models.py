from django.db import models
from organizations.models import EmpresaOrganizacion

class PersonalOperador(models.Model):
    cedula = models.CharField(max_length=15, primary_key=True)
    codigo_op = models.CharField(max_length=20, unique=True, verbose_name="Código Operador")
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    licencia_grado = models.SmallIntegerField(choices=[(2, '2da'), (3, '3ra'), (4, '4ta'), (5, '5ta')], help_text="2, 3, 4, 5")
    vence_lic = models.DateField(verbose_name="Vencimiento Licencia")
    certificado_medico_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Certificado Médico")
    tipo_sangre = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self): return f"{self.cedula} - {self.nombres} {self.apellidos}"
    class Meta:
        verbose_name_plural = "Personal Operador"
        db_table = 'personal_operador'

class OperadorOrganizacion(models.Model):
    operador = models.ForeignKey(PersonalOperador, on_delete=models.CASCADE, related_name='vinculos_organizacion')
    organizacion = models.ForeignKey(EmpresaOrganizacion, on_delete=models.CASCADE, related_name='operadores')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(blank=True, null=True)

    def __str__(self): return f"{self.operador} @ {self.organizacion}"
    class Meta:
        verbose_name_plural = "Relaciones Operador-Organización"
        db_table = 'operador_organizacion'
