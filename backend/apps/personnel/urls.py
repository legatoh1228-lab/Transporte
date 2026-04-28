from django.urls import path
from .views import personnel_status

urlpatterns = [
    path('status/', personnel_status, name='personnel-status'),
]
