from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Appointment

User = get_user_model()


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model."""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_email',
            'clinic', 'clinic_name', 'doctor', 'doctor_name',
            'appointment_time', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'clinic', 'doctor', 'appointment_time', 'notes'
        ]
    
    def validate_appointment_time(self, value):
        """Validate that appointment time is in the future."""
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Appointment time must be in the future.")
        return value
    
    def create(self, validated_data):
        """Create appointment with current user as patient."""
        user = self.context['request'].user
        
        # Get patient profile
        try:
            patient = user.patient_profile
        except:
            raise serializers.ValidationError("Patient profile not found.")
        
        # Create appointment
        appointment = Appointment.objects.create(
            patient=patient,
            **validated_data
        )
        
        return appointment


class AppointmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating appointments."""
    
    class Meta:
        model = Appointment
        fields = [
            'status', 'notes'
        ]


class ClinicAppointmentSerializer(serializers.ModelSerializer):
    """Serializer for clinics to view all appointments."""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    patient_phone = serializers.CharField(source='patient.phone', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'patient_email', 'patient_phone',
            'doctor', 'doctor_name', 'doctor_specialization',
            'appointment_time', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
