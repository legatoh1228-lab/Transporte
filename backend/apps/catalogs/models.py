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
