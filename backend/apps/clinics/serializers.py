from rest_framework import serializers
from django.db.models import Q
from .models import Clinic, Doctor


class ClinicSerializer(serializers.ModelSerializer):
    """Serializer for Clinic model."""
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    
    class Meta:
        model = Clinic
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model."""
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    
    class Meta:
        model = Doctor
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class DoctorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating doctors (clinic users only)."""
    class Meta:
        model = Doctor
        fields = ('name', 'specialization', 'token_prefix', 'is_active')


class DoctorUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating doctors (clinic users only)."""
    class Meta:
        model = Doctor
        fields = ('name', 'specialization', 'token_prefix', 'is_active')
