from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaOrganizacionViewSet, GremioViewSet, OrganizacionCpsViewSet

router = DefaultRouter()
router.register(r'organizations', EmpresaOrganizacionViewSet)
router.register(r'gremios', GremioViewSet)
router.register(r'cps', OrganizacionCpsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
