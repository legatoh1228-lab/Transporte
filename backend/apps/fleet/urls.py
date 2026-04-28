from django.urls import path
from .views import fleet_status

urlpatterns = [
    path('status/', fleet_status, name='fleet-status'),
]
