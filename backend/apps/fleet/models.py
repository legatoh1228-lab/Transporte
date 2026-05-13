from django.contrib.gis.db import models
from catalogs.models import Modalidad, SubModalidad, TipoTransmision, TipoCombustible, TerritorioMunicipio, TipoCps
from organizations.models import EmpresaOrganizacion

class Terminal(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    municipio = models.ForeignKey(TerritorioMunicipio, on_delete=models.PROTECT, related_name='terminales')
    tipo = models.CharField(max_length=50, choices=[
        ('Principal', 'Principal'),
        ('Secundario', 'Secundario'),
        ('Parada', 'Parada de Transferencia'),
    ], default='Principal')
    capacidad_andenes = models.SmallIntegerField(default=0)
    estatus = models.CharField(max_length=20, default='Activo', choices=[
        ('Activo', 'Activo'),
        ('Mantenimiento', 'En Mantenimiento'),
        ('Inactivo', 'Inactivo'),
    ])
    location = models.PointField(srid=4326, blank=True, null=True)

    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Terminales"
        db_table = 'terminal'

class FlotaVehiculo(models.Model):
    placa = models.CharField(max_length=15, primary_key=True)
    modalidad = models.ForeignKey(Modalidad, on_delete=models.PROTECT)
    submodalidad = models.ForeignKey(SubModalidad, on_delete=models.PROTECT)
    marca = models.CharField(max_length=50)
    modelo = models.CharField(max_length=50)
    anio = models.SmallIntegerField(verbose_name="Año")
    color = models.CharField(max_length=30, blank=True, null=True)
    transmision = models.ForeignKey(TipoTransmision, on_delete=models.PROTECT)
    capacidad = models.SmallIntegerField(help_text="Capacidad de pasajeros")
    combustible = models.ForeignKey(TipoCombustible, on_delete=models.PROTECT)
    aire_acondicionado = models.BooleanField(default=False)
    accesibilidad = models.BooleanField(default=False, verbose_name="Rampa/Accesibilidad")
    seguro_vence = models.DateField(blank=True, null=True)
    revision_tecnica_vence = models.DateField(blank=True, null=True)
    foto = models.ImageField(upload_to='vehicles/', blank=True, null=True, verbose_name="Foto del Vehículo")
    # Nuevos campos - Rev. 1
    propietario_nombre = models.CharField(max_length=150, blank=True, null=True, verbose_name="Propietario")
    propietario_cedula = models.CharField(max_length=15, blank=True, null=True, verbose_name="Cédula Propietario")
    propietario_rif = models.CharField(max_length=15, blank=True, null=True, verbose_name="RIF Propietario")
    serial_carroceria = models.CharField(max_length=50, blank=True, null=True, verbose_name="Serial de Carrocería")
    cps_tipo = models.ForeignKey(TipoCps, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Tipo de CPS (DT9/DT10)")

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

class VehiculoOperador(models.Model):
    vehiculo = models.ForeignKey(FlotaVehiculo, on_delete=models.CASCADE, related_name='operadores_asignados')
    operador = models.ForeignKey('personnel.PersonalOperador', on_delete=models.CASCADE, related_name='vehiculos_asignados')
    fecha_asignacion = models.DateTimeField(auto_now_add=True)
    estatus = models.CharField(max_length=20, default='Activo', choices=[('Activo', 'Activo'), ('Inactivo', 'Inactivo')])

    def __str__(self): return f"{self.vehiculo} -> {self.operador}"
    class Meta:
        verbose_name_plural = "Asignaciones Vehículo-Operador"
        db_table = 'vehiculo_operador'
        unique_together = ('vehiculo', 'operador')

class AsignacionRuta(models.Model):
    operador = models.ForeignKey('personnel.PersonalOperador', on_delete=models.CASCADE, related_name='asignaciones_ruta')
    vehiculo = models.ForeignKey(FlotaVehiculo, on_delete=models.CASCADE, related_name='asignaciones_ruta')
    ruta = models.ForeignKey('routes.VialidadRuta', on_delete=models.CASCADE, related_name='asignaciones_operativas')
    fecha_inicio = models.DateField(auto_now_add=True)
    fecha_fin = models.DateField(blank=True, null=True)
    estatus = models.CharField(max_length=20, default='Activo', choices=[('Activo', 'Activo'), ('Finalizado', 'Finalizado'), ('Inactivo', 'Inactivo')])
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self): return f"{self.operador} | {self.vehiculo} | {self.ruta}"
    class Meta:
        verbose_name = "Asignación de Ruta"
        verbose_name_plural = "Asignaciones de Rutas"
        db_table = 'asignacion_ruta'


