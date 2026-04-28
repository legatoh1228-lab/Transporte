from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaOrganizacionViewSet

router = DefaultRouter()
router.register(r'organizations', EmpresaOrganizacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
