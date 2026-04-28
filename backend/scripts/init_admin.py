import os
import sys
import django

# Add the project root and apps directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from catalogs.models import Rol
from users.models import User

def init_admin():
    print("--- Inicializando Datos de Administración ---")
    
    # 1. Crear el Rol de SUPERUSUARIO
    rol_admin, created = Rol.objects.get_or_create(
        nombre='SUPERUSUARIO',
        defaults={'descripcion': 'Administrador global del sistema con todos los privilegios.'}
    )
    
    if created:
        print(f"✅ Rol '{rol_admin.nombre}' creado.")
    else:
        print(f"ℹ️ Rol '{rol_admin.nombre}' ya existe.")

    # 2. Crear el Superusuario del Sistema
    username = 'admin'
    email = 'admin@transporte.com'
    password = 'adminpassword'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            rol=rol_admin
        )
        print(f"✅ Usuario '{username}' creado con éxito.")
        print(f"🔑 Credenciales: {username} / {password}")
    else:
        # Asegurar que el usuario existente tenga el rol de SUPERUSUARIO
        user = User.objects.get(username=username)
        user.rol = rol_admin
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"ℹ️ Usuario '{username}' ya existe. Rol actualizado a SUPERUSUARIO.")

    print("--- Proceso Finalizado ---")

if __name__ == "__main__":
    init_admin()
