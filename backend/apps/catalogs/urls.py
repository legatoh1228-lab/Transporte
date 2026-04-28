from django.urls import path
from .views import catalogs_status

urlpatterns = [
    path('status/', catalogs_status, name='catalogs-status'),
]
