from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from .models import UserActivity

User = get_user_model()

class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'action', 'details', 'ip_address', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.ReadOnlyField(source='rol.nombre')
    org_nombre = serializers.ReadOnlyField(source='org.razon_social')

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'rol', 'rol_nombre', 'org', 'org_nombre', 'avatar', 'password', 'is_active')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
