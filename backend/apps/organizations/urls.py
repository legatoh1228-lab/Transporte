from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaOrganizacionViewSet, GremioViewSet

router = DefaultRouter()
router.register(r'organizations', EmpresaOrganizacionViewSet)
router.register(r'gremios', GremioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
