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
    # Especificaciones Mecánicas Adicionales
    serial_motor = models.CharField(max_length=100, blank=True, null=True, verbose_name="Serial de Motor")
    tipo_aceite = models.CharField(max_length=50, blank=True, null=True, verbose_name="Tipo de Aceite (Viscosidad)")
    aceite_clasificacion = models.CharField(max_length=50, blank=True, null=True, verbose_name="Clasificación de Aceite")
    aceite_marca = models.CharField(max_length=50, blank=True, null=True, verbose_name="Marca de Aceite")
    tamano_caucho = models.CharField(max_length=50, blank=True, null=True, verbose_name="Tamaño de Caucho")

    # Especificaciones exclusivas para Motos
    tipo_rin = models.CharField(max_length=50, blank=True, null=True, verbose_name="Tipo de Rin")
    medida_cadena = models.CharField(max_length=50, blank=True, null=True, verbose_name="Medida de Cadena")

    # Mantenimiento
    fecha_mantenimiento_general = models.DateField(blank=True, null=True, verbose_name="Último Mantenimiento General")
    fecha_cambio_aceite = models.DateField(blank=True, null=True, verbose_name="Último Cambio de Aceite")
    fecha_mantenimiento_motor = models.DateField(blank=True, null=True, verbose_name="Último Mantenimiento Motor")
    detalles_mantenimiento_motor = models.TextField(blank=True, null=True, verbose_name="Detalles Mantenimiento Motor")
    fecha_reemplazo_piezas = models.DateField(blank=True, null=True, verbose_name="Último Reemplazo Piezas")
    reemplazo_piezas_detalles = models.TextField(blank=True, null=True, verbose_name="Detalles Reemplazo Piezas")

    # Sistema Eléctrico / Batería
    bateria_marca = models.CharField(max_length=50, blank=True, null=True, verbose_name="Marca de Batería")
    bateria_amperaje = models.CharField(max_length=50, blank=True, null=True, verbose_name="Amperaje de Batería")
    bateria_voltaje = models.CharField(max_length=20, blank=True, null=True, verbose_name="Voltaje de Batería")
    bateria_fecha_instalacion = models.DateField(blank=True, null=True, verbose_name="Fecha de Instalación Batería")

    # Campos de Propietario y CPS
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
    colector = models.ForeignKey('personnel.PersonalColector', on_delete=models.CASCADE, related_name='asignaciones_ruta', null=True, blank=True)
    vehiculo = models.ForeignKey(FlotaVehiculo, on_delete=models.CASCADE, related_name='asignaciones_ruta')
    horario = models.ForeignKey('routes.HorarioRuta', on_delete=models.SET_NULL, related_name='asignaciones_operativas', null=True, blank=True)
    
    # Campos directos para cuando no hay GestionPermiso/HorarioRuta configurados
    ruta = models.ForeignKey('routes.VialidadRuta', on_delete=models.SET_NULL, related_name='asignaciones_directas', null=True, blank=True)
    organizacion = models.ForeignKey('organizations.EmpresaOrganizacion', on_delete=models.SET_NULL, related_name='asignaciones_operativas', null=True, blank=True)
    
    hora_inicio = models.TimeField(null=True, blank=True, verbose_name="Hora de Inicio")
    hora_fin = models.TimeField(null=True, blank=True, verbose_name="Hora de Fin")
    
    fecha_inicio = models.DateField(auto_now_add=True)
    fecha_fin = models.DateField(blank=True, null=True)
    estatus = models.CharField(max_length=20, default='Activo', choices=[('Activo', 'Activo'), ('Finalizado', 'Finalizado'), ('Inactivo', 'Inactivo')])
    observaciones = models.TextField(blank=True, null=True)

    def clean(self):
        from django.core.exceptions import ValidationError
        # Require either a horario OR a direct ruta
        if not self.horario and not self.ruta:
            raise ValidationError({'ruta': 'Debe especificar una ruta o un horario para la asignación.'})

    def save(self, *args, **kwargs):
        from django.utils import timezone
        self.full_clean()
        
        # Auto-create VehiculoOrganizacion link if organizacion is set
        if self.organizacion and self.vehiculo:
            VehiculoOrganizacion.objects.get_or_create(
                vehiculo=self.vehiculo,
                organizacion=self.organizacion,
                defaults={'fecha_inicio': timezone.now().date()}
            )
        
        # Auto-create OperadorOrganizacion link if organizacion is set
        if self.organizacion and self.operador:
            from personnel.models import OperadorOrganizacion
            OperadorOrganizacion.objects.get_or_create(
                operador=self.operador,
                organizacion=self.organizacion,
                defaults={'fecha_inicio': timezone.now().date()}
            )
        
        # Auto-create ColectorOrganizacion link if colector and organizacion are set
        if self.organizacion and self.colector:
            from personnel.models import ColectorOrganizacion
            ColectorOrganizacion.objects.get_or_create(
                colector=self.colector,
                organizacion=self.organizacion,
                defaults={'fecha_inicio': timezone.now().date()}
            )
        
        super().save(*args, **kwargs)

    def __str__(self): 
        ruta_str = self.ruta.nombre if self.ruta else (self.horario.permiso.ruta.nombre if self.horario else 'Sin Ruta')
        return f"{self.operador} | {self.vehiculo} | {ruta_str}"
    
    class Meta:
        verbose_name = "Asignación de Ruta"
        verbose_name_plural = "Asignaciones de Rutas"
        db_table = 'asignacion_ruta'

