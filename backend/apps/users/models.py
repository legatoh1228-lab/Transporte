from django.contrib.auth.models import AbstractUser
from django.db import models
from catalogs.models import Rol
from organizations.models import EmpresaOrganizacion

class User(AbstractUser):
    rol = models.ForeignKey(Rol, on_delete=models.SET_NULL, null=True, blank=True)
    org = models.ForeignKey(EmpresaOrganizacion, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Organización Vinculada")
    
    def __str__(self):
        return f"{self.username} ({self.rol.nombre if self.rol else 'Sin Rol'})"

    class Meta:
        db_table = 'usuario_sistema'
