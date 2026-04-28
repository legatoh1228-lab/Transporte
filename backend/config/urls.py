from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/catalogs/', include('catalogs.urls')),
    path('api/fleet/', include('fleet.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('api/personnel/', include('personnel.urls')),
    path('api/routes/', include('routes.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
