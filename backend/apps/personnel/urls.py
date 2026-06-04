from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonalOperadorViewSet, OperadorOrganizacionViewSet, PersonalColectorViewSet, ColectorOrganizacionViewSet

router = DefaultRouter()
router.register(r'operators', PersonalOperadorViewSet)
router.register(r'operator-organizations', OperadorOrganizacionViewSet)
router.register(r'collectors', PersonalColectorViewSet)
router.register(r'collector-organizations', ColectorOrganizacionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
