from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlotaVehiculoViewSet, VehiculoOrganizacionViewSet, TerminalViewSet

router = DefaultRouter()
router.register(r'vehicles', FlotaVehiculoViewSet)
router.register(r'vehicle-organizations', VehiculoOrganizacionViewSet)
router.register(r'terminales', TerminalViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
