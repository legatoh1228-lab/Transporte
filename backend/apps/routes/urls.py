from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VialidadRutaViewSet, GestionPermisoViewSet, HorarioRutaViewSet

router = DefaultRouter()
router.register(r'rutas', VialidadRutaViewSet)
router.register(r'permissions', GestionPermisoViewSet)
router.register(r'horarios', HorarioRutaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
