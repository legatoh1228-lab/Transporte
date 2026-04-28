from django.urls import path
from .views import routes_status

urlpatterns = [
    path('status/', routes_status, name='routes-status'),
]
