from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsumoViewSet, MovimientoInsumoViewSet

router = DefaultRouter()
router.register(r'insumos', InsumoViewSet)
router.register(r'movimientos', MovimientoInsumoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
