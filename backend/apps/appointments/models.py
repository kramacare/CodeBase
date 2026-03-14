from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

User = get_user_model()


class Appointment(models.Model):
    """Appointment model for patient scheduling."""
    STATUS_CHOICES = (
        ('SCHEDULED', _('Scheduled')),
        ('COMPLETED', _('Completed')),
        ('CANCELLED', _('Cancelled')),
        ('NO_SHOW', _('No Show')),
    )
    
    patient = models.ForeignKey(
        'accounts.PatientProfile',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name=_('patient')
    )
    clinic = models.ForeignKey(
        'clinics.Clinic',
        on_delete=models.CASCADE,
        related_name='appointments',
        verbose_name=_('clinic')
    )
    doctor = models.ForeignKey(
        'clinics.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments',
        verbose_name=_('doctor')
    )
    appointment_time = models.DateTimeField(_('appointment time'))
    status = models.CharField(_('status'), max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    notes = models.TextField(_('notes'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Appointment')
        verbose_name_plural = _('Appointments')
        db_table = 'appointments_appointment'
        ordering = ['-appointment_time']
    
    def __str__(self):
        return f"{self.patient.user.email} - {self.clinic.name} - {self.appointment_time}"
    
    def save(self, *args, **kwargs):
        # Set completed_at when status changes to COMPLETED
        if self.status == 'COMPLETED' and not self.completed_at:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)


class AppointmentSlot(models.Model):
    """Available appointment slots for doctors."""
    doctor = models.ForeignKey(
        'clinics.Doctor',
        on_delete=models.CASCADE,
        related_name='available_slots',
        verbose_name=_('doctor')
    )
    date = models.DateField(_('date'))
    start_time = models.TimeField(_('start time'))
    end_time = models.TimeField(_('end time'))
    max_patients = models.PositiveIntegerField(_('max patients'), default=1)
    is_available = models.BooleanField(_('is available'), default=True)
    booked_patients = models.PositiveIntegerField(_('booked patients'), default=0)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Appointment Slot')
        verbose_name_plural = _('Appointment Slots')
        db_table = 'appointments_slot'
        unique_together = ['doctor', 'date', 'start_time']
        ordering = ['date', 'start_time']
    
    def __str__(self):
        return f"{self.doctor.name} - {self.date} {self.start_time}"


class Prescription(models.Model):
    """Prescription associated with appointments."""
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='prescription',
        verbose_name=_('appointment')
    )
    medicines = models.JSONField(_('medicines'), default=list)
    dosage = models.TextField(_('dosage instructions'), blank=True)
    notes = models.TextField(_('doctor notes'), blank=True)
    follow_up_date = models.DateField(_('follow up date'), null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Prescription')
        verbose_name_plural = _('Prescriptions')
        db_table = 'appointments_prescription'
    
    def __str__(self):
        return f"Prescription for {self.appointment}"
