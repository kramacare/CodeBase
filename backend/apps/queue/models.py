from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

User = get_user_model()


class QueueToken(models.Model):
    """Queue token model for managing patient flow."""
    clinic = models.ForeignKey(
        'clinics.Clinic',
        on_delete=models.CASCADE,
        related_name='tokens',
        verbose_name=_('clinic')
    )
    doctor = models.ForeignKey(
        'clinics.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tokens',
        verbose_name=_('doctor')
    )
    patient = models.ForeignKey(
        'accounts.PatientProfile',
        on_delete=models.CASCADE,
        related_name='tokens',
        verbose_name=_('patient')
    )
    token_number = models.PositiveIntegerField(_('token number'))
    token_label = models.CharField(_('token label'), max_length=1)  # A, B, C, etc.
    status = models.CharField(_('status'), max_length=20, choices=[
        ('WAITING', _('Waiting')),
        ('CALLED', _('Called')),
        ('WITH_DOCTOR', _('With Doctor')),
        ('COMPLETED', _('Completed')),
        ('SKIPPED', _('Skipped')),
        ('CANCELLED', _('Cancelled')),
    ], default='WAITING')
    source = models.CharField(_('source'), max_length=10, choices=[
        ('ONLINE', _('Online')),
        ('DESK', _('Desk')),
        ('QR', _('QR Code')),
    ], default='ONLINE')
    priority = models.PositiveIntegerField(_('priority'), default=0)
    estimated_wait_time = models.PositiveIntegerField(_('estimated wait time'), default=15)  # in minutes
    joined_at = models.DateTimeField(_('joined at'), auto_now_add=True)
    called_at = models.DateTimeField(_('called at'), null=True, blank=True)
    started_at = models.DateTimeField(_('started at'), null=True, blank=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    notes = models.TextField(_('notes'), blank=True)
    
    class Meta:
        verbose_name = _('Queue Token')
        verbose_name_plural = _('Queue Tokens')
        db_table = 'queue_token'
        ordering = ['token_number']
        unique_together = ['clinic', 'token_number', 'token_label']
    
    def __str__(self):
        return f"{self.token_label}-{self.token_number:03d}"
    
    def save(self, *args, **kwargs):
        # Set called_at when status changes to CALLED
        if self.status == 'CALLED' and not self.called_at:
            self.called_at = timezone.now()
        elif self.status == 'WITH_DOCTOR' and not self.started_at:
            self.started_at = timezone.now()
        elif self.status == 'COMPLETED' and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)


class QueueSession(models.Model):
    """Daily queue session for clinics."""
    clinic = models.ForeignKey(
        'clinics.Clinic',
        on_delete=models.CASCADE,
        related_name='queue_sessions',
        verbose_name=_('clinic')
    )
    date = models.DateField(_('date'))
    is_active = models.BooleanField(_('is active'), default=True)
    current_token_number = models.PositiveIntegerField(_('current token number'), default=0)
    total_patients = models.PositiveIntegerField(_('total patients'), default=0)
    completed_patients = models.PositiveIntegerField(_('completed patients'), default=0)
    skipped_patients = models.PositiveIntegerField(_('skipped patients'), default=0)
    started_at = models.DateTimeField(_('started at'), auto_now_add=True)
    ended_at = models.DateTimeField(_('ended at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Queue Session')
        verbose_name_plural = _('Queue Sessions')
        db_table = 'queue_session'
        unique_together = ['clinic', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.clinic.name} - {self.date}"


class QueueSettings(models.Model):
    """Queue settings for clinics."""
    clinic = models.OneToOneField(
        'clinics.Clinic',
        on_delete=models.CASCADE,
        related_name='queue_settings',
        verbose_name=_('clinic')
    )
    max_queue_size = models.PositiveIntegerField(_('max queue size'), default=100)
    average_consultation_time = models.PositiveIntegerField(_('average consultation time'), default=15)  # in minutes
    token_prefixes = models.JSONField(_('token prefixes'), default=list)
    auto_advance = models.BooleanField(_('auto advance'), default=True)
    notification_enabled = models.BooleanField(_('notification enabled'), default=True)
    
    class Meta:
        verbose_name = _('Queue Settings')
        verbose_name_plural = _('Queue Settings')
        db_table = 'queue_settings'
    
    def __str__(self):
        return f"{self.clinic.name} - Settings"
