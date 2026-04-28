from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/catalogs/', include('catalogs.urls')),
    path('api/fleet/', include('fleet.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('api/personnel/', include('personnel.urls')),
    path('api/routes/', include('routes.urls')),
]
