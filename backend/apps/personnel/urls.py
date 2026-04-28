from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonalOperadorViewSet, OperadorOrganizacionViewSet

router = DefaultRouter()
router.register(r'operators', PersonalOperadorViewSet)
router.register(r'operator-organizations', OperadorOrganizacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
