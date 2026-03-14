from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Clinic(models.Model):
    """Clinic model representing healthcare facilities."""
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='owned_clinics',
        verbose_name=_('owner')
    )
    name = models.CharField(_('clinic name'), max_length=200)
    address = models.TextField(_('address'))
    phone = models.CharField(_('phone number'), max_length=20, blank=True, null=True)
    latitude = models.DecimalField(_('latitude'), max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(_('longitude'), max_digits=11, decimal_places=8, null=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Clinic')
        verbose_name_plural = _('Clinics')
        db_table = 'clinics_clinic'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class Doctor(models.Model):
    """Doctor model representing medical practitioners."""
    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name='doctors',
        verbose_name=_('clinic')
    )
    name = models.CharField(_('doctor name'), max_length=200)
    specialization = models.CharField(_('specialization'), max_length=100)
    token_prefix = models.CharField(_('token prefix'), max_length=1, default='A')
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Doctor')
        verbose_name_plural = _('Doctors')
        db_table = 'clinics_doctor'
        ordering = ['name']
    
    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"
