from django.db import models

class Modalidad(models.Model):
    nombre = models.CharField(max_length=20, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Modalidades"
        db_table = 'modalidad'

class SubModalidad(models.Model):
    modalidad = models.ForeignKey(Modalidad, on_delete=models.CASCADE, related_name='submodalidades')
    nombre = models.CharField(max_length=50)
    def __str__(self): return f"{self.modalidad} - {self.nombre}"
    class Meta:
        verbose_name_plural = "Sub-Modalidades"
        db_table = 'submodalidad'

class TerritorioEje(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    color_hex = models.CharField(max_length=7, default='#000000')
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Territorio Ejes"
        db_table = 'territorio_eje'

class TerritorioMunicipio(models.Model):
    eje = models.ForeignKey(TerritorioEje, on_delete=models.CASCADE, related_name='municipios')
    nombre = models.CharField(max_length=100)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Territorio Municipios"
        db_table = 'territorio_municipio'

class TipoCombustible(models.Model):
    nombre = models.CharField(max_length=15, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Tipos de Combustible"
        db_table = 'tipo_combustible'

class TipoRuta(models.Model):
    nombre = models.CharField(max_length=15, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Tipos de Ruta"
        db_table = 'tipo_ruta'

class TipoTransmision(models.Model):
    nombre = models.CharField(max_length=20, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Tipos de Transmisión"
        db_table = 'tipo_transmision'

class TipoVia(models.Model):
    nombre = models.CharField(max_length=30, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Tipos de Vía"
        db_table = 'tipo_via'

class TipoOrganizacion(models.Model):
    nombre = models.CharField(max_length=20, unique=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Tipos de Organización"
        db_table = 'tipo_organizacion'

class TipoCps(models.Model):
    codigo = models.CharField(max_length=5, unique=True)
    descripcion = models.CharField(max_length=100, blank=True, null=True)
    def __str__(self): return self.codigo
    class Meta:
        verbose_name = "Tipo de CPS"
        verbose_name_plural = "Tipos de CPS"
        db_table = 'tipo_cps'

class Rol(models.Model):
    nombre = models.CharField(max_length=30, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    def __str__(self): return self.nombre
    class Meta:
        verbose_name_plural = "Roles"
        db_table = 'rol'

class RolPermiso(models.Model):
    rol = models.ForeignKey(Rol, on_delete=models.CASCADE, related_name='permisos')
    modulo = models.CharField(max_length=50)
    accion = models.CharField(max_length=20)
    permitido = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.rol} - {self.modulo} - {self.accion}: {'Sí' if self.permitido else 'No'}"

    class Meta:
        verbose_name_plural = "Permisos de Rol"
        db_table = 'rol_permiso'
        unique_together = ('rol', 'modulo', 'accion')

class ConfiguracionVisual(models.Model):
    nombre_sistema = models.CharField(max_length=100, default="Sistema de Transporte Aragua")
    logo = models.ImageField(upload_to='branding/', null=True, blank=True)
    login_bg = models.ImageField(upload_to='branding/', null=True, blank=True, verbose_name="Fondo de Login")
    primary_color = models.CharField(max_length=7, default="#032448") # HEX
    secondary_color = models.CharField(max_length=7, default="#f5f5f5")
    
    class Meta:
        verbose_name = "Configuración Visual"
        verbose_name_plural = "Configuraciones Visuales"
        db_table = 'configuracion_visual'

    def __str__(self):
        return f"Configuración: {self.nombre_sistema}"

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(id=1)
        return obj
