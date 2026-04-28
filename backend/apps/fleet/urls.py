from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FlotaVehiculoViewSet, VehiculoOrganizacionViewSet

router = DefaultRouter()
router.register(r'vehicles', FlotaVehiculoViewSet)
router.register(r'vehicle-organizations', VehiculoOrganizacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
