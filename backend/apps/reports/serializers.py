from rest_framework import serializers
from django.db.models import Q
from .models import MedicalReport, ReportAccess, ReportShare, ReportTemplate


class MedicalReportSerializer(serializers.ModelSerializer):
    """Serializer for Medical Report model."""
    patient_name = serializers.CharField(source='patient.user.get_full_name', read_only=True)
    patient_email = serializers.CharField(source='patient.user.email', read_only=True)
    clinic_name = serializers.CharField(source='clinic.clinic_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalReport
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'file_size', 'mime_type')
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None
    
    def get_file_size_display(self, obj):
        """Convert file size to human readable format."""
        size = obj.file_size
        if size < 1024:
            return f"{size} bytes"
        elif size < 1024 * 1024:
            return f"{size / 1024:.1f} KB"
        else:
            return f"{size / (1024 * 1024):.1f} MB"
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        
        hours = diff.seconds // 3600
        if hours > 0:
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        
        minutes = (diff.seconds % 3600) // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"


class ReportAccessSerializer(serializers.ModelSerializer):
    """Serializer for Report Access model."""
    accessed_by_name = serializers.CharField(source='accessed_by.get_full_name', read_only=True)
    accessed_by_email = serializers.CharField(source='accessed_by.email', read_only=True)
    
    class Meta:
        model = ReportAccess
        fields = '__all__'
        read_only_fields = ('accessed_at', 'ip_address', 'user_agent')


class ReportShareSerializer(serializers.ModelSerializer):
    """Serializer for Report Share model."""
    shared_by_name = serializers.CharField(source='shared_by.get_full_name', read_only=True)
    report_title = serializers.CharField(source='report.title', read_only=True)
    is_expired = serializers.SerializerMethodField()
    remaining_access = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportShare
        fields = '__all__'
        read_only_fields = ('created_at', 'access_count')
    
    def get_is_expired(self, obj):
        from django.utils import timezone
        return timezone.now() > obj.expires_at
    
    def get_remaining_access(self, obj):
        return max(0, obj.max_access - obj.access_count)


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for Report Template model."""
    clinic_name = serializers.CharField(source='clinic.clinic_name', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = '__all__'


class UploadReportSerializer(serializers.Serializer):
    """Serializer for uploading medical reports."""
    patient_id = serializers.IntegerField()
    clinic_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField(required=False)
    appointment_id = serializers.IntegerField(required=False)
    title = serializers.CharField(max_length=200)
    report_type = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    file = serializers.FileField()
    is_confidential = serializers.BooleanField(default=False)
    
    def validate_patient_id(self, value):
        from apps.accounts.models import PatientProfile
        try:
            PatientProfile.objects.get(id=value)
            return value
        except PatientProfile.DoesNotExist:
            raise serializers.ValidationError("Patient not found.")
    
    def validate_clinic_id(self, value):
        from apps.accounts.models import ClinicProfile
        try:
            ClinicProfile.objects.get(id=value)
            return value
        except ClinicProfile.DoesNotExist:
            raise serializers.ValidationError("Clinic not found.")


class ShareReportSerializer(serializers.Serializer):
    """Serializer for sharing medical reports."""
    report_id = serializers.IntegerField()
    shared_email = serializers.EmailField()
    expires_in_hours = serializers.IntegerField(min_value=1, max_value=168)  # Max 7 days
    max_access = serializers.IntegerField(min_value=1, max_value=100, default=1)
