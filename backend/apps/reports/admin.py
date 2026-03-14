from django.contrib import admin
from .models import MedicalReport, ReportAccess, ReportShare, ReportTemplate


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'patient', 'clinic', 'doctor', 'report_type', 'is_confidential', 'created_at')
    list_filter = ('report_type', 'is_confidential', 'created_at')
    search_fields = ('patient__user__email', 'clinic__clinic_name', 'title', 'description')
    raw_id_fields = ('patient', 'clinic', 'doctor', 'appointment')
    ordering = ('-created_at',)


@admin.register(ReportAccess)
class ReportAccessAdmin(admin.ModelAdmin):
    list_display = ('report', 'accessed_by', 'access_type', 'ip_address', 'accessed_at')
    list_filter = ('access_type', 'accessed_at')
    search_fields = ('report__title', 'accessed_by__email')
    raw_id_fields = ('report', 'accessed_by')
    ordering = ('-accessed_at',)


@admin.register(ReportShare)
class ReportShareAdmin(admin.ModelAdmin):
    list_display = ('report', 'shared_by', 'shared_email', 'access_count', 'max_access', 'expires_at', 'is_active')
    list_filter = ('is_active', 'expires_at')
    search_fields = ('report__title', 'shared_by__email', 'shared_email')
    raw_id_fields = ('report', 'shared_by')
    ordering = ('-created_at',)


@admin.register(ReportTemplate)
class ReportTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'clinic', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'clinic__clinic_name', 'description')
    raw_id_fields = ('clinic',)
    ordering = ('name',)
