from django.urls import path
from .views import organizations_status

urlpatterns = [
    path('status/', organizations_status, name='organizations-status'),
]
