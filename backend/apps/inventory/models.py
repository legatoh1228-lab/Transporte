from django.db import models
from fleet.models import FlotaVehiculo

class Insumo(models.Model):
    UNIDAD_MEDIDA_CHOICES = [
        ('Unidad', 'Unidad(es)'),
        ('Litro', 'Litro(s)'),
        ('Paila', 'Paila(s)'),
        ('Kilo', 'Kilo(s)'),
        ('Bulto', 'Bulto(s)'),
        ('Par', 'Par(es)'),
        ('Galon', 'Galón/Galones'),
        ('Tambor', 'Tambor(es)'),
    ]

    nombre = models.CharField(max_length=255, verbose_name="Nombre del Insumo / Repuesto")
    categoria = models.CharField(max_length=100, verbose_name="Categoría", help_text="Ej: Aceites, Neumáticos, Filtros, Limpieza")
    unidad_medida = models.CharField(max_length=50, choices=UNIDAD_MEDIDA_CHOICES, default='Unidad', verbose_name="Unidad de Medida")
    stock_actual = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Stock Actual")
    stock_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0, verbose_name="Stock Mínimo Alerta")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción o Detalles")
    foto = models.ImageField(upload_to='inventory/', blank=True, null=True, verbose_name="Foto de Referencia")

    class Meta:
        verbose_name = "Insumo"
        verbose_name_plural = "Insumos"
        ordering = ['categoria', 'nombre']

    def __str__(self):
        return f"{self.nombre} ({self.stock_actual} {self.unidad_medida})"


class MovimientoInsumo(models.Model):
    TIPO_CHOICES = [
        ('ENTRADA', 'Entrada (Compra/Reabastecimiento)'),
        ('SALIDA', 'Salida (Asignación/Uso)'),
    ]

    insumo = models.ForeignKey(Insumo, on_delete=models.CASCADE, related_name="movimientos", verbose_name="Insumo")
    tipo = models.CharField(max_length=15, choices=TIPO_CHOICES, verbose_name="Tipo de Movimiento")
    cantidad = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Cantidad")
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del Movimiento")
    
    # Si es SALIDA, se puede asignar opcionalmente a un vehículo
    vehiculo_destino = models.ForeignKey(FlotaVehiculo, on_delete=models.SET_NULL, blank=True, null=True, related_name="insumos_asignados", verbose_name="Vehículo Destino")
    
    observaciones = models.TextField(blank=True, null=True, verbose_name="Observaciones / Motivo")
    responsable = models.CharField(max_length=100, blank=True, null=True, verbose_name="Registrado por / Entregado a")

    class Meta:
        verbose_name = "Movimiento de Insumo"
        verbose_name_plural = "Movimientos de Insumos"
        ordering = ['-fecha']

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Actualizar stock del insumo automáticamente
        if is_new:
            if self.tipo == 'ENTRADA':
                self.insumo.stock_actual += self.cantidad
            elif self.tipo == 'SALIDA':
                self.insumo.stock_actual -= self.cantidad
            self.insumo.save()

    def __str__(self):
        return f"{self.tipo} - {self.cantidad} {self.insumo.unidad_medida} de {self.insumo.nombre}"
