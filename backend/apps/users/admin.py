from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Vinculación', {'fields': ('rol', 'org')}),
    )
    list_display = ('username', 'email', 'rol', 'org', 'is_staff')
    list_filter = ('rol', 'is_staff', 'is_superuser')

admin.site.register(User, CustomUserAdmin)
