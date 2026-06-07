from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, UserActivitySerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from catalogs.models import Modalidad
from organizations.models import EmpresaOrganizacion, Gremio, OrganizacionCps
from personnel.models import PersonalOperador, PersonalColector
from fleet.models import FlotaVehiculo, Terminal
from routes.models import VialidadRuta
from .models import UserActivity

from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            # Register activity
            UserActivity.objects.create(
                user=user,
                action="Inicio de sesión exitoso",
                ip_address=get_client_ip(request)
            )
            return Response({
                "message": "Login exitoso",
                "user": UserSerializer(user).data
            })
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # permission_classes = [IsAuthenticated] # Activar en producción

    def update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        response = super().update(request, *args, **kwargs)
        # Register activity
        user = self.get_object()
        UserActivity.objects.create(
            user=user, # En un entorno real, sería request.user si es el mismo
            action="Actualización de perfil",
            ip_address=get_client_ip(request)
        )
        return response

class DashboardStatsView(APIView):
    permission_classes = [AllowAny] # Change to IsAuthenticated in production

    def get(self, request):
        today = timezone.now().date()
        soon = today + timedelta(days=30)

        # Basic Stats
        total_orgs = EmpresaOrganizacion.objects.count()
        total_vehicles = FlotaVehiculo.objects.count()
        total_operators = PersonalOperador.objects.count()
        total_colectores = PersonalColector.objects.count()
        total_routes = VialidadRuta.objects.count()

        # Fleet Distribution by Modality (Actual DB names)
        distribution_query = FlotaVehiculo.objects.values('modalidad__nombre').annotate(count=Count('placa')).order_by('-count')
        fleet_distribution = []
        for item in distribution_query:
            percentage = (item['count'] / total_vehicles * 100) if total_vehicles > 0 else 0
            fleet_distribution.append({
                "name": item['modalidad__nombre'],
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Axis Distribution (Very important for Aragua)
        # We derive this from the routes origins
        axis_query = VialidadRuta.objects.values('municipio_or__eje__nombre').annotate(count=Count('id')).order_by('-count')
        axis_distribution = []
        total_r = total_routes if total_routes > 0 else 1
        for item in axis_query:
            if item['municipio_or__eje__nombre']:
                axis_distribution.append({
                    "name": item['municipio_or__eje__nombre'],
                    "count": item['count'],
                    "percentage": round((item['count'] / total_r) * 100, 1)
                })

def get_system_alerts(limit=None):
    today = timezone.now().date()
    soon = today + timedelta(days=30)
    alerts = []
    
    # Insurance Expiration
    insurance_expiring = FlotaVehiculo.objects.filter(seguro_vence__lte=soon)
    for v in insurance_expiring:
        status_label = "vencido" if v.seguro_vence < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencido" else "warning",
            "icon": "assignment_late",
            "title": f"Seguro {status_label.capitalize()}",
            "message": f"Vehículo {v.placa} ({v.marca}). Vence: {v.seguro_vence}",
            "link": "/vehiculos",
            "date": v.seguro_vence
        })

    # Technical Inspection
    tech_expiring = FlotaVehiculo.objects.filter(revision_tecnica_vence__lte=soon)
    for v in tech_expiring:
        status_label = "vencida" if v.revision_tecnica_vence < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencida" else "warning",
            "icon": "build_circle",
            "title": f"Revisión Técnica {status_label.capitalize()}",
            "message": f"Vehículo {v.placa} ({v.marca}). Vence: {v.revision_tecnica_vence}",
            "link": "/vehiculos",
            "date": v.revision_tecnica_vence
        })

    # Operator Licenses
    license_expiring = PersonalOperador.objects.filter(vence_lic__lte=soon)
    for o in license_expiring:
        status_label = "vencida" if o.vence_lic < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencida" else "warning",
            "icon": "badge",
            "title": f"Licencia {status_label.capitalize()}",
            "message": f"{o.nombres} {o.apellidos} ({o.cedula}). Vence: {o.vence_lic}",
            "link": "/operadores",
            "date": o.vence_lic
        })

    # Medical Certificate
    med_expiring = PersonalOperador.objects.filter(certificado_medico_vence__lte=soon)
    for o in med_expiring:
        status_label = "vencido" if o.certificado_medico_vence < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencido" else "warning",
            "icon": "medical_services",
            "title": f"Certificado Médico {status_label.capitalize()}",
            "message": f"{o.nombres} {o.apellidos} ({o.cedula}). Vence: {o.certificado_medico_vence}",
            "link": "/operadores",
            "date": o.certificado_medico_vence
        })

    # Saberes Certificate (Missing)
    saberes_missing = PersonalOperador.objects.filter(certificado_saberes=False)
    for o in saberes_missing:
        alerts.append({
            "type": "error",
            "icon": "gpp_bad",
            "title": "Certificado de Saberes Faltante",
            "message": f"Operador {o.nombres} {o.apellidos} ({o.cedula}) no posee certificado registrado.",
            "link": "/operadores",
            "date": today
        })

    # Saberes Certificate (Expiring)
    saberes_expiring = PersonalOperador.objects.filter(certificado_saberes=True, fecha_vencimiento_saberes__lte=soon)
    for o in saberes_expiring:
        status_label = "vencido" if o.fecha_vencimiento_saberes and o.fecha_vencimiento_saberes < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencido" else "warning",
            "icon": "school",
            "title": f"Certificado Saberes {status_label.capitalize()}",
            "message": f"{o.nombres} {o.apellidos} ({o.cedula}). Vence: {o.fecha_vencimiento_saberes}",
            "link": "/operadores",
            "date": o.fecha_vencimiento_saberes
        })

    # CPS (Permits) Expiration - NEW
    cps_expiring = OrganizacionCps.objects.filter(fecha_vencimiento__lte=soon)
    for c in cps_expiring:
        status_label = "vencido" if c.fecha_vencimiento < today else "por vencer"
        alerts.append({
            "type": "error" if status_label == "vencido" else "warning",
            "icon": "verified_user",
            "title": f"Permiso CPS {status_label.capitalize()}",
            "message": f"{c.organizacion.razon_social} (CPS: {c.codigo}). Vence: {c.fecha_vencimiento}",
            "link": "/organizaciones",
            "date": c.fecha_vencimiento
        })

    # Alertas de Stock Crítico (Inventario)
    try:
        from inventory.models import Insumo
        from django.db.models import F
        low_stock_insumos = Insumo.objects.filter(stock_actual__lte=F('stock_minimo'))
        for i in low_stock_insumos:
            alerts.append({
                "type": "error",
                "icon": "inventory_2",
                "title": "Stock de Insumo Crítico",
                "message": f"'{i.nombre}' ({i.categoria}) en nivel crítico. Quedan {i.stock_actual} {i.unidad_medida}.",
                "link": "/insumos",
                "date": today
            })
    except ImportError:
        pass

    # Sort by date (oldest first or nearest to expire)
    alerts.sort(key=lambda x: x['date'] if x['date'] else today)
    
    if limit:
        return alerts[:limit]
    return alerts

class AlertsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response(get_system_alerts())

class DashboardComposicionView(APIView):
    """
    Devuelve la composición de elementos según el selector (entidad).
    Entidades: fleet, terminales, vehicles, operators, gremios, routes
    """
    permission_classes = [AllowAny]

    def get(self, request):
        entidad = request.query_params.get('entidad', 'fleet')
        data = []

        if entidad == 'fleet':
            # Composición por modalidad
            query = FlotaVehiculo.objects.values('modalidad__nombre').annotate(count=Count('placa'))
            data = [{"name": x['modalidad__nombre'], "value": x['count']} for x in query]
        
        elif entidad == 'terminales':
            # Composición por municipio
            query = Terminal.objects.values('municipio__nombre').annotate(count=Count('id'))
            data = [{"name": x['municipio__nombre'], "value": x['count']} for x in query]
            
        elif entidad == 'gremios':
            # Composición de organizaciones por gremio
            query = Gremio.objects.annotate(count=Count('organizaciones'))
            data = [{"name": x.razon_social, "value": x.count} for x in query]
            
        elif entidad == 'routes':
            # Composición por tipo de ruta
            query = VialidadRuta.objects.values('tipo__nombre').annotate(count=Count('id'))
            data = [{"name": x['tipo__nombre'], "value": x['count']} for x in query]
            
        elif entidad == 'operators':
            # Composición por grado de licencia
            query = PersonalOperador.objects.values('grado_licencia').annotate(count=Count('cedula'))
            data = [{"name": f"Grado {x['grado_licencia']}", "value": x['count']} for x in query]

        return Response(data)

class DashboardStatsView(APIView):
    permission_classes = [AllowAny] # Change to IsAuthenticated in production

    def get(self, request):
        # Basic Stats
        total_orgs = EmpresaOrganizacion.objects.count()
        total_vehicles = FlotaVehiculo.objects.count()
        total_operators = PersonalOperador.objects.count()
        total_colectores = PersonalColector.objects.count()
        total_routes = VialidadRuta.objects.count()

        # Fleet Distribution by Modality (Actual DB names)
        distribution_query = FlotaVehiculo.objects.values('modalidad__nombre').annotate(count=Count('placa')).order_by('-count')
        fleet_distribution = []
        for item in distribution_query:
            percentage = (item['count'] / total_vehicles * 100) if total_vehicles > 0 else 0
            fleet_distribution.append({
                "name": item['modalidad__nombre'] if item['modalidad__nombre'] else 'No Especificado',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Operator Distribution by License Grade
        op_dist_query = PersonalOperador.objects.values('licencia_grado').annotate(count=Count('cedula')).order_by('-count')
        operator_distribution = []
        for item in op_dist_query:
            percentage = (item['count'] / total_operators * 100) if total_operators > 0 else 0
            grado = item['licencia_grado']
            operator_distribution.append({
                "name": f"Grado {grado}" if grado else 'Desconocido',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Colector Distribution by Instruction Grade
        col_dist_query = PersonalColector.objects.values('grado_instruccion').annotate(count=Count('cedula')).order_by('-count')
        colector_distribution = []
        for item in col_dist_query:
            percentage = (item['count'] / total_colectores * 100) if total_colectores > 0 else 0
            grado = item['grado_instruccion']
            colector_distribution.append({
                "name": f"{grado}" if grado else 'Desconocido',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Organizations Distribution by Type
        org_dist_query = EmpresaOrganizacion.objects.values('tipo__nombre').annotate(count=Count('rif')).order_by('-count')
        org_distribution = []
        for item in org_dist_query:
            percentage = (item['count'] / total_orgs * 100) if total_orgs > 0 else 0
            org_distribution.append({
                "name": item['tipo__nombre'] if item['tipo__nombre'] else 'Otros',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Routes Distribution by Type
        route_dist_query = VialidadRuta.objects.values('tipo__nombre').annotate(count=Count('id')).order_by('-count')
        route_distribution = []
        for item in route_dist_query:
            percentage = (item['count'] / total_routes * 100) if total_routes > 0 else 0
            route_distribution.append({
                "name": item['tipo__nombre'] if item['tipo__nombre'] else 'Sin Clasificar',
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Axis Distribution (Very important for Aragua)
        # We derive this from the routes origins
        axis_query = VialidadRuta.objects.values('municipio_or__eje__nombre').annotate(count=Count('id')).order_by('-count')
        axis_distribution = []
        total_r = total_routes if total_routes > 0 else 1
        for item in axis_query:
            if item['municipio_or__eje__nombre']:
                axis_distribution.append({
                    "name": item['municipio_or__eje__nombre'],
                    "count": item['count'],
                    "percentage": round((item['count'] / total_r) * 100, 1)
                })

        try:
            from inventory.models import Insumo
            total_insumos = Insumo.objects.count()
            insumo_dist_query = Insumo.objects.values('categoria').annotate(count=Count('id')).order_by('-count')
            insumos_distribution = []
            for item in insumo_dist_query:
                percentage = (item['count'] / total_insumos * 100) if total_insumos > 0 else 0
                insumos_distribution.append({
                    "name": item['categoria'] if item['categoria'] else 'Sin Categoría',
                    "count": item['count'],
                    "percentage": round(percentage, 1)
                })
        except ImportError:
            total_insumos = 0
            insumos_distribution = []

        stats = {
            "organizations": total_orgs,
            "vehicles": total_vehicles,
            "operators": total_operators,
            "colectores": total_colectores,
            "routes": total_routes,
            "insumos": total_insumos,
            "fleet_distribution": fleet_distribution,
            "operator_distribution": operator_distribution,
            "colector_distribution": colector_distribution,
            "org_distribution": org_distribution,
            "route_distribution": route_distribution,
            "axis_distribution": axis_distribution,
            "insumos_distribution": insumos_distribution,
            "alerts": get_system_alerts(limit=10)
        }
        return Response(stats)

class UserActivityView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [AllowAny] # Change to IsAuthenticated

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return UserActivity.objects.filter(user_id=user_id).order_by('-created_at')[:5]

class GlobalAuditView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [AllowAny] # Change to IsAuthenticated en producción

    def get_queryset(self):
        return UserActivity.objects.all().order_by('-created_at')[:100]


class ChangePasswordView(APIView):
    permission_classes = [AllowAny] # Change to IsAuthenticated

    def post(self, request, user_id):
        user = User.objects.get(id=user_id)
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({"error": "La contraseña actual es incorrecta."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        UserActivity.objects.create(
            user=user,
            action="Cambio de contraseña",
            ip_address=get_client_ip(request)
        )

        return Response({"message": "Contraseña actualizada exitosamente."})


class ConsolidadoStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        tipo = request.query_params.get('tipo')
        item_id = request.query_params.get('id')
        
        if not tipo or not item_id:
            return Response({"error": "Faltan parámetros 'tipo' o 'id'"}, status=status.HTTP_400_BAD_REQUEST)

        orgs = EmpresaOrganizacion.objects.all()
        vehiculos = FlotaVehiculo.objects.all()
        operadores = PersonalOperador.objects.all()
        colectores = PersonalColector.objects.all()
        rutas = VialidadRuta.objects.all()

        if tipo == 'municipio':
            orgs = orgs.filter(municipio_id=item_id, esta_activa=True)
            vehiculos = vehiculos.filter(
                organizaciones__organizacion__municipio_id=item_id,
                organizaciones__fecha_fin__isnull=True
            )
            operadores = operadores.filter(
                vinculos_organizacion__organizacion__municipio_id=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            colectores = colectores.filter(
                vinculos_organizacion__organizacion__municipio_id=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            rutas = rutas.filter(
                Q(municipio_or_id=item_id) | 
                Q(municipio_des_id=item_id) | 
                Q(permisos__org__municipio_id=item_id, permisos__estatus='ACT')
            ).distinct()
        elif tipo == 'gremio':
            orgs = orgs.filter(gremio_id=item_id, esta_activa=True)
            vehiculos = vehiculos.filter(
                organizaciones__organizacion__gremio_id=item_id,
                organizaciones__fecha_fin__isnull=True
            )
            operadores = operadores.filter(
                vinculos_organizacion__organizacion__gremio_id=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            colectores = colectores.filter(
                vinculos_organizacion__organizacion__gremio_id=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            rutas = rutas.filter(permisos__org__gremio_id=item_id, permisos__estatus='ACT').distinct()
        elif tipo == 'organizacion':
            orgs = orgs.filter(rif=item_id)
            vehiculos = vehiculos.filter(
                organizaciones__organizacion__rif=item_id,
                organizaciones__fecha_fin__isnull=True
            )
            operadores = operadores.filter(
                vinculos_organizacion__organizacion__rif=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            colectores = colectores.filter(
                vinculos_organizacion__organizacion__rif=item_id,
                vinculos_organizacion__fecha_fin__isnull=True
            )
            rutas = rutas.filter(permisos__org__rif=item_id, permisos__estatus='ACT').distinct()
        elif tipo == 'grado_licencia':
            operadores = operadores.filter(licencia_grado=item_id)
            orgs = orgs.filter(
                operadores__operador__licencia_grado=item_id, 
                operadores__fecha_fin__isnull=True
            ).distinct()
            vehiculos = vehiculos.filter(
                organizaciones__organizacion__operadores__operador__licencia_grado=item_id,
                organizaciones__fecha_fin__isnull=True,
                organizaciones__organizacion__operadores__fecha_fin__isnull=True
            ).distinct()
            colectores = colectores.filter(
                vinculos_organizacion__organizacion__operadores__operador__licencia_grado=item_id,
                vinculos_organizacion__fecha_fin__isnull=True,
                vinculos_organizacion__organizacion__operadores__fecha_fin__isnull=True
            ).distinct()
            rutas = rutas.filter(
                permisos__org__operadores__operador__licencia_grado=item_id, 
                permisos__estatus='ACT',
                permisos__org__operadores__fecha_fin__isnull=True
            ).distinct()
        else:
            return Response({"error": "Tipo de filtro no válido"}, status=status.HTTP_400_BAD_REQUEST)

        orgs_data = list(orgs.values('rif', 'razon_social', 'tipo__nombre', 'municipio__nombre', 'esta_activa').distinct())
        
        veh_qs = vehiculos.filter(organizaciones__fecha_fin__isnull=True).values('placa', 'marca', 'modelo', 'modalidad__nombre', 'organizaciones__organizacion__razon_social').distinct()
        vehiculos_data = [
            {
                "placa": v['placa'],
                "marca": v['marca'],
                "modelo": v['modelo'],
                "modalidad__nombre": v['modalidad__nombre'],
                "org__razon_social": v['organizaciones__organizacion__razon_social']
            } for v in veh_qs
        ]
        
        op_qs = operadores.filter(vinculos_organizacion__fecha_fin__isnull=True).values('cedula', 'nombres', 'apellidos', 'licencia_grado', 'vinculos_organizacion__organizacion__razon_social').distinct()
        operadores_data = [
            {
                "cedula": o['cedula'],
                "nombres": o['nombres'],
                "apellidos": o['apellidos'],
                "grado_licencia": o['licencia_grado'],
                "org__razon_social": o['vinculos_organizacion__organizacion__razon_social']
            } for o in op_qs
        ]
        
        col_qs = colectores.filter(vinculos_organizacion__fecha_fin__isnull=True).values('cedula', 'nombres', 'apellidos', 'vinculos_organizacion__organizacion__razon_social').distinct()
        colectores_data = [
            {
                "cedula": c['cedula'],
                "nombres": c['nombres'],
                "apellidos": c['apellidos'],
                "org__razon_social": c['vinculos_organizacion__organizacion__razon_social']
            } for c in col_qs
        ]
        
        rutas_data = list(rutas.values('id', 'nombre', 'tipo__nombre', 'municipio_or__nombre', 'municipio_des__nombre', 'distancia_km').distinct())

        data = {
            "metrics": {
                "organizaciones": orgs.distinct().count(),
                "vehiculos": vehiculos.distinct().count(),
                "operadores": operadores.distinct().count(),
                "colectores": colectores.distinct().count(),
                "rutas": rutas.distinct().count()
            },
            "lists": {
                "organizaciones": orgs_data,
                "vehiculos": vehiculos_data,
                "operadores": operadores_data,
                "colectores": colectores_data,
                "rutas": rutas_data
            }
        }
        return Response(data)
