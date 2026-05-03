from django.core.management.base import BaseCommand
from catalogs.models import Modalidad, SubModalidad, TipoCombustible, TipoTransmision, TipoOrganizacion, Rol

class Command(BaseCommand):
    help = 'Seeds the transport catalogs with Venezuelan specific data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Iniciando carga de catálogos de transporte (Aragua, Venezuela)..."))

        # 1. Modalidades (Categorías principales)
        modalities = [
            (1, "COLECTIVO"),
            (2, "CARRITOS / TAXI"),
            (3, "MOTO"),
            (4, "CARGA"),
            (5, "ESPECIAL")
        ]

        for m_id, m_name in modalities:
            Modalidad.objects.update_or_create(id=m_id, defaults={'nombre': m_name})
            self.stdout.write(self.style.SUCCESS(f"  [✓] Modalidad: {m_name}"))

        # 2. Sub-modalidades (Léxico Venezolano)
        submodalities = [
            # COLECTIVO (id=1)
            (1, 1, "ENCAVA (610 / 900)"),
            (2, 1, "CAMIONETICA (Minibús)"),
            (3, 1, "BUSETA"),
            (4, 1, "AUTOBÚS (Bus Grande)"),
            (10, 1, "RÚSTICO (Jeep / Troncal)"),
            
            # CARRITOS / TAXI (id=2)
            (5, 2, "CARRO (Sedán / 5 Puestos)"),
            (6, 2, "CARRITOS POR PUESTO"),
            (7, 2, "VAN / PANEL (Ejecutivo)"),
            (11, 2, "CAMIONETA (Pickup / Rural)"),
            
            # MOTO (id=3)
            (8, 3, "MOTO TAXI (Estándar)"),
            (9, 3, "MOTO DE CARGA (Triciclo)"),
            (12, 3, "MOTO PARTICULAR"),
            
            # CARGA (id=4)
            (13, 4, "CAMIÓN (Carga Pesada)"),
            (14, 4, "PICKUP / 350 (Carga Liviana)")
        ]

        for sm_id, m_id, sm_name in submodalities:
            try:
                mod = Modalidad.objects.get(id=m_id)
                SubModalidad.objects.update_or_create(id=sm_id, defaults={'modalidad': mod, 'nombre': sm_name})
                self.stdout.write(f"    - Sub-modalidad: {sm_name}")
            except Modalidad.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"    [!] Error: Modalidad {m_id} no existe para {sm_name}"))

        # 3. Fuel Types
        fuels = [
            (1, "GASOLINA"),
            (2, "GASOIL (Diesel)"),
            (3, "GAS (GNV)"),
            (4, "MIXTO"),
            (5, "ELECTRICO")
        ]
        for f_id, f_name in fuels:
            TipoCombustible.objects.get_or_create(id=f_id, defaults={'nombre': f_name})
            self.stdout.write(self.style.SUCCESS(f"  [✓] Combustible: {f_name}"))

        # 4. Transmission Types
        transmissions = [
            (1, "AUTOMATICA"),
            (2, "SINCRONICA (Manual)")
        ]
        for t_id, t_name in transmissions:
            TipoTransmision.objects.update_or_create(id=t_id, defaults={'nombre': t_name})
            self.stdout.write(self.style.SUCCESS(f"  [✓] Transmisión: {t_name}"))

        # 5. Organization Types
        org_types = [
            (1, "PÚBLICA"),
            (2, "PRIVADA / LÍNEA"),
            (3, "COOPERATIVA"),
            (4, "SINDICATO")
        ]
        for ot_id, ot_name in org_types:
            TipoOrganizacion.objects.update_or_create(id=ot_id, defaults={'nombre': ot_name})
            self.stdout.write(self.style.SUCCESS(f"  [✓] Tipo Org: {ot_name}"))

        # 6. Roles
        roles = [
            (1, "SUPERADMIN", "Acceso total al sistema"),
            (2, "ADMINISTRADOR", "Gestión de datos y reportes"),
            (3, "OPERADOR", "Registro de información diaria"),
            (4, "CONSULTOR", "Solo lectura de datos")
        ]
        for r_id, r_name, r_desc in roles:
            role_obj, created = Rol.objects.update_or_create(id=r_id, defaults={'nombre': r_name, 'descripcion': r_desc})
            self.stdout.write(self.style.SUCCESS(f"  [✓] Rol: {r_name}"))

            # Default Permissions for SUPERADMIN
            if r_name == "SUPERADMIN":
                from catalogs.models import RolPermiso
                for module in ['Organizaciones', 'Vehículos', 'Operadores', 'Rutas', 'Permisos', 'Usuarios', 'Configuración', 'Dashboard']:
                    for action in ['Leer', 'Crear', 'Actualizar', 'Eliminar']:
                        RolPermiso.objects.get_or_create(rol=role_obj, modulo=module, accion=action, defaults={'permitido': True})

        self.stdout.write(self.style.SUCCESS("\nCarga de catálogos y roles completada con éxito."))
