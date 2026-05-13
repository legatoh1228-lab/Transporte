from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VialidadRutaViewSet, GestionPermisoViewSet

router = DefaultRouter()
router.register(r'rutas', VialidadRutaViewSet)
router.register(r'permissions', GestionPermisoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
