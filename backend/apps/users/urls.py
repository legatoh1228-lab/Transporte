from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, LoginView, UserViewSet, DashboardStatsView, UserActivityView, ChangePasswordView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('users/<int:user_id>/activities/', UserActivityView.as_view(), name='user-activities'),
    path('users/<int:user_id>/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('', include(router.urls)),
]
