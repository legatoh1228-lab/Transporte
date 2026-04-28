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
        stats = {
            "organizations": EmpresaOrganizacion.objects.count(),
            "vehicles": FlotaVehiculo.objects.count(),
            "operators": PersonalOperador.objects.count(),
            "routes": VialidadRuta.objects.count(),
        }
        return Response(stats)

class UserActivityView(generics.ListAPIView):
    serializer_class = UserActivitySerializer
    permission_classes = [AllowAny] # Change to IsAuthenticated

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return UserActivity.objects.filter(user_id=user_id).order_by('-created_at')[:5]

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

