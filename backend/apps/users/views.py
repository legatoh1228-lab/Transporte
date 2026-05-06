from rest_framework import generics, status, viewsets
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, UserActivitySerializer
from django.contrib.auth import authenticate, get_user_model
from rest_framework.views import APIView
from catalogs.models import Modalidad
from organizations.models import EmpresaOrganizacion
from personnel.models import PersonalOperador
from fleet.models import FlotaVehiculo
from routes.models import VialidadRuta
from .models import UserActivity

from django.db.models import Count
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
        total_routes = VialidadRuta.objects.count()

        # Fleet Distribution
        distribution_query = FlotaVehiculo.objects.values('modalidad__nombre').annotate(count=Count('placa'))
        fleet_distribution = []
        for item in distribution_query:
            percentage = (item['count'] / total_vehicles * 100) if total_vehicles > 0 else 0
            fleet_distribution.append({
                "name": item['modalidad__nombre'],
                "count": item['count'],
                "percentage": round(percentage, 1)
            })

        # Alerts
        alerts = []
        
        # Insurance Expiration
        insurance_expiring = FlotaVehiculo.objects.filter(seguro_vence__lte=soon)
        for v in insurance_expiring:
            status = "vencido" if v.seguro_vence < today else "por vencer"
            alerts.append({
                "type": "error" if status == "vencido" else "warning",
                "icon": "assignment_late",
                "title": f"Seguro {status.capitalize()}",
                "message": f"Vehículo {v.placa} ({v.marca}). Vence: {v.seguro_vence}",
                "link": "/vehiculos"
            })

        # Technical Inspection
        tech_expiring = FlotaVehiculo.objects.filter(revision_tecnica_vence__lte=soon)
        for v in tech_expiring:
            status = "vencida" if v.revision_tecnica_vence < today else "por vencer"
            alerts.append({
                "type": "error" if status == "vencida" else "warning",
                "icon": "build_circle",
                "title": f"Revisión Técnica {status.capitalize()}",
                "message": f"Vehículo {v.placa} ({v.marca}). Vence: {v.revision_tecnica_vence}",
                "link": "/vehiculos"
            })

        # Operator Licenses
        license_expiring = PersonalOperador.objects.filter(vence_lic__lte=soon)
        for o in license_expiring:
            status = "vencida" if o.vence_lic < today else "por vencer"
            alerts.append({
                "type": "error" if status == "vencida" else "warning",
                "icon": "badge",
                "title": f"Licencia {status.capitalize()}",
                "message": f"{o.nombres} {o.apellidos} ({o.cedula}). Vence: {o.vence_lic}",
                "link": "/operadores"
            })

        # Medical Certificate
        med_expiring = PersonalOperador.objects.filter(certificado_medico_vence__lte=soon)
        for o in med_expiring:
            status = "vencido" if o.certificado_medico_vence < today else "por vencer"
            alerts.append({
                "type": "error" if status == "vencido" else "warning",
                "icon": "medical_services",
                "title": f"Certificado Médico {status.capitalize()}",
                "message": f"{o.nombres} {o.apellidos} ({o.cedula}). Vence: {o.certificado_medico_vence}",
                "link": "/operadores"
            })

        stats = {
            "organizations": total_orgs,
            "vehicles": total_vehicles,
            "operators": total_operators,
            "routes": total_routes,
            "fleet_distribution": fleet_distribution,
            "alerts": alerts[:10] # Limit to top 10 alerts
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

