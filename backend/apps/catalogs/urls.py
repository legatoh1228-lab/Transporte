from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ModalidadViewSet, SubModalidadViewSet, TerritorioEjeViewSet,
    TerritorioMunicipioViewSet, TipoCombustibleViewSet, TipoRutaViewSet,
    TipoTransmisionViewSet, TipoViaViewSet, TipoOrganizacionViewSet, RolViewSet,
    RolPermisoViewSet
)

router = DefaultRouter()
router.register(r'modalidades', ModalidadViewSet)
router.register(r'submodalidades', SubModalidadViewSet)
router.register(r'ejes', TerritorioEjeViewSet)
router.register(r'municipios', TerritorioMunicipioViewSet)
router.register(r'combustibles', TipoCombustibleViewSet)
router.register(r'tipos-ruta', TipoRutaViewSet)
router.register(r'transmisiones', TipoTransmisionViewSet)
router.register(r'vias', TipoViaViewSet)
router.register(r'tipos-organizacion', TipoOrganizacionViewSet)
router.register(r'roles', RolViewSet)
router.register(r'permisos-rol', RolPermisoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
