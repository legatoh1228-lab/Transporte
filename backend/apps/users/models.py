from django.contrib.auth.models import AbstractUser
from django.db import models
from catalogs.models import Rol
from organizations.models import EmpresaOrganizacion

class User(AbstractUser):
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    org = models.ForeignKey(EmpresaOrganizacion, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Organización Vinculada")
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.rol.nombre if self.rol else 'Sin Rol'})"

    class Meta:
        db_table = 'usuario_sistema'

class UserActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action = models.CharField(max_length=255)
    details = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} at {self.created_at}"

    class Meta:
        db_table = 'user_activity'
        ordering = ['-created_at']
