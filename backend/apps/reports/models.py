from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class MedicalReport(models.Model):
    """Medical report model for patient records."""
    REPORT_TYPES = (
        ('LAB_RESULT', _('Lab Result')),
        ('X_RAY', _('X-Ray')),
        ('MRI', _('MRI')),
        ('CT_SCAN', _('CT Scan')),
        ('ULTRASOUND', _('Ultrasound')),
        ('PRESCRIPTION', _('Prescription')),
        ('DISCHARGE_SUMMARY', _('Discharge Summary')),
        ('OTHER', _('Other')),
    )
    
    patient = models.ForeignKey(
        'accounts.PatientProfile',
        on_delete=models.CASCADE,
        related_name='medical_reports',
        verbose_name=_('patient')
    )
    clinic = models.ForeignKey(
        'accounts.ClinicProfile',
        on_delete=models.CASCADE,
        related_name='medical_reports',
        verbose_name=_('clinic')
    )
    doctor = models.ForeignKey(
        'clinics.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medical_reports',
        verbose_name=_('doctor')
    )
    appointment = models.ForeignKey(
        'appointments.Appointment',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medical_reports',
        verbose_name=_('appointment')
    )
    title = models.CharField(_('title'), max_length=200)
    report_type = models.CharField(_('report type'), max_length=20, choices=REPORT_TYPES)
    description = models.TextField(_('description'), blank=True)
    file = models.FileField(_('file'), upload_to='reports/%Y/%m/')
    file_name = models.CharField(_('file name'), max_length=255, blank=True)
    file_size = models.PositiveIntegerField(_('file size'), default=0)
    mime_type = models.CharField(_('MIME type'), max_length=100, blank=True)
    is_confidential = models.BooleanField(_('is confidential'), default=False)
    is_shared = models.BooleanField(_('is shared with patient'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Medical Report')
        verbose_name_plural = _('Medical Reports')
        db_table = 'reports_medical_report'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.user.email} - {self.title}"


class ReportAccess(models.Model):
    """Track access to medical reports."""
    report = models.ForeignKey(
        MedicalReport,
        on_delete=models.CASCADE,
        related_name='access_logs',
        verbose_name=_('report')
    )
    accessed_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='report_accesses',
        verbose_name=_('accessed by')
    )
    access_type = models.CharField(_('access type'), max_length=20, choices=[
        ('VIEW', _('View')),
        ('DOWNLOAD', _('Download')),
        ('SHARE', _('Share')),
    ])
    ip_address = models.GenericIPAddressField(_('IP address'), null=True, blank=True)
    user_agent = models.TextField(_('user agent'), blank=True)
    accessed_at = models.DateTimeField(_('accessed at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Report Access')
        verbose_name_plural = _('Report Accesses')
        db_table = 'reports_access'
        ordering = ['-accessed_at']
    
    def __str__(self):
        return f"{self.accessed_by.email} accessed {self.report}"


class ReportShare(models.Model):
    """Shared reports with external parties."""
    report = models.ForeignKey(
        MedicalReport,
        on_delete=models.CASCADE,
        related_name='shares',
        verbose_name=_('report')
    )
    shared_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_reports',
        verbose_name=_('shared by')
    )
    share_token = models.CharField(_('share token'), max_length=255, unique=True)
    shared_email = models.EmailField(_('shared email'), blank=True)
    expires_at = models.DateTimeField(_('expires at'))
    is_active = models.BooleanField(_('is active'), default=True)
    access_count = models.PositiveIntegerField(_('access count'), default=0)
    max_access = models.PositiveIntegerField(_('max access'), default=1)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Report Share')
        verbose_name_plural = _('Report Shares')
        db_table = 'reports_share'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Share of {self.report}"


class ReportTemplate(models.Model):
    """Report templates for clinics."""
    clinic = models.ForeignKey(
        'accounts.ClinicProfile',
        on_delete=models.CASCADE,
        related_name='report_templates',
        verbose_name=_('clinic')
    )
    name = models.CharField(_('template name'), max_length=200)
    description = models.TextField(_('template description'), blank=True)
    fields = models.JSONField(_('template fields'), default=list)
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Report Template')
        verbose_name_plural = _('Report Templates')
        db_table = 'reports_template'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.clinic.clinic_name} - {self.name}"
