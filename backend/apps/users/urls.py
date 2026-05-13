from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, UserViewSet, DashboardStatsView, DashboardComposicionView, UserActivityView, ChangePasswordView, GlobalAuditView, AlertsView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('dashboard-composition/', DashboardComposicionView.as_view(), name='dashboard-composition'),
    path('alerts/', AlertsView.as_view(), name='alerts'),
    path('activities/', GlobalAuditView.as_view(), name='global-activities'),
    path('users/<int:user_id>/activities/', UserActivityView.as_view(), name='user-activities'),
    path('users/<int:user_id>/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]

