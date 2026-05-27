from django.contrib.gis.db import models
from catalogs.models import Modalidad, SubModalidad, TipoTransmision, TipoCombustible, TerritorioMunicipio, TipoCps
# from organizations.models import EmpresaOrganizacion # Eliminado para evitar importaciones circulares

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
    marca = models.CharField(max_length=50, default="No especificado", blank=True)
    modelo = models.CharField(max_length=50, default="No especificado", blank=True)
    anio = models.SmallIntegerField(verbose_name="Año", default=2026, blank=True, null=True)
    color = models.CharField(max_length=30, blank=True, null=True)
    transmision = models.ForeignKey(TipoTransmision, on_delete=models.PROTECT, blank=True, null=True)
    capacidad = models.SmallIntegerField(help_text="Capacidad de pasajeros", default=0, blank=True, null=True)
    combustible = models.ForeignKey(TipoCombustible, on_delete=models.PROTECT)
    aire_acondicionado = models.BooleanField(default=False)
    accesibilidad = models.BooleanField(default=False, verbose_name="Rampa/Accesibilidad")
    seguro_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Seguro de Casco")
    rcv_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento RCV")
    certificado_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Certificado de Circulación")
    revision_tecnica_vence = models.DateField(blank=True, null=True, verbose_name="Vencimiento Revisión Técnica")
    foto = models.ImageField(upload_to='vehicles/', blank=True, null=True, verbose_name="Foto del Vehículo")
    # Nuevos campos - Rev. 1
    propietario = models.CharField(max_length=150, blank=True, null=True, verbose_name="Propietario")
    propietario_identificacion = models.CharField(max_length=15, blank=True, null=True, verbose_name="Identificación Propietario")
    serial_carroceria = models.CharField(max_length=50, blank=True, null=True, verbose_name="Serial de Carrocería")
    cps = models.CharField(max_length=50, blank=True, null=True, verbose_name="Tipo de CPS (DT9/DT10)")
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones")

    def __str__(self): return f"{self.placa} - {self.marca} {self.modelo}"
    class Meta:
        verbose_name = "Vehículo de la Flota"
        verbose_name_plural = "Flota de Vehículos"
        db_table = 'flota_vehiculo'

class VehiculoOrganizacion(models.Model):
    vehiculo = models.ForeignKey(FlotaVehiculo, on_delete=models.CASCADE, related_name='organizaciones')
    organizacion = models.ForeignKey('organizations.EmpresaOrganizacion', on_delete=models.CASCADE, related_name='vehiculos')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField(blank=True, null=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        # 1. Validar cupo de unidades
        if self.organizacion.cupo_maximo_unidades and self.organizacion.cupo_maximo_unidades > 0:
            count = VehiculoOrganizacion.objects.filter(
                organizacion=self.organizacion, 
                fecha_fin__isnull=True
            )
            if self.pk:
                count = count.exclude(pk=self.pk)
            
            if count.count() >= self.organizacion.cupo_maximo_unidades:
                raise ValidationError({
                    'organizacion': f"La organización ha alcanzado su cupo máximo de {self.organizacion.cupo_maximo_unidades} unidades."
                })

        # 2. Validar coincidencia de modalidad CPS (si existe un CPS activo en la organización)
        # Buscamos los CPS activos de la organización
        cps_activos = self.organizacion.cps_registros.filter(activa=True)
        if cps_activos.exists() and self.vehiculo.cps:
            # Si el CPS del vehículo es un guión, vacío o un placeholder de "no aplica", omitimos la validación
            veh_cps_raw = str(self.vehiculo.cps).strip().upper()
            if veh_cps_raw in ['', '-', 'N/A', 'NA', 'NO', 'SIN REGISTRO', 'S/R', 'S/C']:
                return

            # Comparamos el código de los CPS activos con el campo cps del vehículo de forma flexible
            veh_cps = str(self.vehiculo.cps).replace("-", "").replace("/", "").strip().upper()
            
            matches = False
            for cps_act in cps_activos:
                org_cps = str(cps_act.tipo_cps.codigo).replace("-", "").replace("/", "").strip().upper()
                if org_cps in veh_cps:
                    matches = True
                    break
            
            if not matches:
                modalidades_list = ", ".join([str(c.tipo_cps.codigo) for c in cps_activos])
                raise ValidationError({
                    'vehiculo': f"El vehículo ({self.vehiculo.cps}) no coincide con ninguna modalidad CPS de la organización ({modalidades_list})."
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

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
    # Reemplazamos 'ruta' por 'horario' para enlazar con la organización, la ruta y las horas
    horario = models.ForeignKey('routes.HorarioRuta', on_delete=models.CASCADE, related_name='asignaciones_operativas', null=True, blank=True)
    
    fecha_inicio = models.DateField(auto_now_add=True)
    fecha_fin = models.DateField(blank=True, null=True)
    estatus = models.CharField(max_length=20, default='Activo', choices=[('Activo', 'Activo'), ('Finalizado', 'Finalizado'), ('Inactivo', 'Inactivo')])
    observaciones = models.TextField(blank=True, null=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        from organizations.models import EmpresaOrganizacion
        from personnel.models import OperadorOrganizacion
        from fleet.models import VehiculoOrganizacion

        if not self.horario:
            raise ValidationError({'horario': 'Debe especificar un horario (que incluye la ruta y la organización).'})

        if self.estatus == 'Activo':
            organizacion_horario = self.horario.permiso.org

            # 1. Validar Pertenencia del Vehículo a la Organización
            vehiculo_org = VehiculoOrganizacion.objects.filter(
                vehiculo=self.vehiculo,
                organizacion=organizacion_horario,
                fecha_fin__isnull=True
            ).exists()
            if not vehiculo_org:
                raise ValidationError({'vehiculo': f'El vehículo {self.vehiculo.placa} no está asignado activamente a la organización {organizacion_horario.razon_social}.'})

            # 2. Validar Pertenencia del Operador a la Organización
            operador_org = OperadorOrganizacion.objects.filter(
                operador=self.operador,
                organizacion=organizacion_horario,
                fecha_fin__isnull=True
            ).exists()
            if not operador_org:
                raise ValidationError({'operador': f'El operador {self.operador.cedula} no está vinculado activamente a la organización {organizacion_horario.razon_social}.'})

            # 3. Validar Colisiones de Horarios para el Vehículo y el Operador
            asignaciones_activas = AsignacionRuta.objects.filter(estatus='Activo').exclude(pk=self.pk)
            
            for asignacion in asignaciones_activas:
                if asignacion.horario and (asignacion.vehiculo == self.vehiculo or asignacion.operador == self.operador):
                    # Check time overlap
                    # Overlap happens if (A.inicio < B.fin) and (A.fin > B.inicio)
                    if (self.horario.hora_inicio < asignacion.horario.hora_fin) and (self.horario.hora_fin > asignacion.horario.hora_inicio):
                        if asignacion.vehiculo == self.vehiculo:
                            raise ValidationError({'vehiculo': f'El vehículo ya tiene una asignación activa en un horario que choca con este ({asignacion.horario}).'})
                        if asignacion.operador == self.operador:
                            raise ValidationError({'operador': f'El operador ya tiene una asignación activa en un horario que choca con este ({asignacion.horario}).'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self): 
        if self.horario:
            return f"{self.operador} | {self.vehiculo} | {self.horario.permiso.ruta} ({self.horario.hora_inicio}-{self.horario.hora_fin})"
        return f"{self.operador} | {self.vehiculo} | Sin Horario"
    
    class Meta:
        verbose_name = "Asignación de Ruta"
        verbose_name_plural = "Asignaciones de Rutas"
        db_table = 'asignacion_ruta'


