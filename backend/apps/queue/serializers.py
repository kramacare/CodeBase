from rest_framework import serializers
from django.db.models import Q
from .models import QueueToken, QueueSession, QueueSettings


class QueueTokenSerializer(serializers.ModelSerializer):
    """Serializer for QueueToken model."""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    token_display = serializers.CharField(source='__str__', read_only=True)
    wait_time = serializers.SerializerMethodField()
    
    class Meta:
        model = QueueToken
        fields = '__all__'
        read_only_fields = ('joined_at', 'called_at', 'started_at', 'completed_at')
    
    def get_wait_time(self, obj):
        """Calculate wait time in minutes."""
        if obj.status == 'COMPLETED' and obj.started_at:
            return (obj.completed_at - obj.started_at).total_seconds() / 60
        elif obj.status in ['WAITING', 'WITH_DOCTOR']:
            from django.utils import timezone
            return (timezone.now() - obj.joined_at).total_seconds() / 60
        return obj.estimated_wait_time


class QueueSessionSerializer(serializers.ModelSerializer):
    """Serializer for QueueSession model."""
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    active_patients = serializers.SerializerMethodField()
    
    class Meta:
        model = QueueSession
        fields = '__all__'
        read_only_fields = ('started_at', 'ended_at')
    
    def get_active_patients(self, obj):
        """Count of currently waiting patients."""
        from .models import QueueToken
        return QueueToken.objects.filter(
            clinic=obj.clinic,
            status='WAITING'
        ).count()


class QueueSettingsSerializer(serializers.ModelSerializer):
    """Serializer for QueueSettings model."""
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    
    class Meta:
        model = QueueSettings
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')


class JoinQueueSerializer(serializers.Serializer):
    """Serializer for joining queue."""
    clinic_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)
    priority = serializers.IntegerField(required=False, default=0)
    
    def validate_clinic_id(self, value):
        from apps.clinics.models import Clinic
        try:
            Clinic.objects.get(id=value)
            return value
        except Clinic.DoesNotExist:
            raise serializers.ValidationError("Clinic not found.")
    
    def validate_doctor_id(self, value):
        if value:
            from apps.clinics.models import Doctor
            try:
                Doctor.objects.get(id=value, is_active=True)
                return value
            except Doctor.DoesNotExist:
                raise serializers.ValidationError("Doctor not found or inactive.")


class TokenActionSerializer(serializers.Serializer):
    """Serializer for token actions."""
    action = serializers.ChoiceField(choices=[
        ('call_next', 'Call Next'),
        ('skip', 'Skip'),
        ('complete', 'Complete'),
        ('cancel', 'Cancel')
    ])
    notes = serializers.CharField(required=False, allow_blank=True)


class UpdateTokenSerializer(serializers.Serializer):
    """Serializer for updating token status."""
    status = serializers.ChoiceField(choices=[
        ('WAITING', 'Waiting'),
        ('CALLED', 'Called'),
        ('WITH_DOCTOR', 'With Doctor'),
        ('COMPLETED', 'Completed'),
        ('SKIPPED', 'Skipped'),
        ('CANCELLED', 'Cancelled'),
    ])
    notes = serializers.CharField(required=False, allow_blank=True)
