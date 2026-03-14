from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Supports both PATIENT and CLINIC roles.
    """
    ROLE_CHOICES = (
        ('PATIENT', _('Patient')),
        ('CLINIC', _('Clinic')),
    )
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(_('role'), max_length=10, choices=ROLE_CHOICES, default='PATIENT')
    phone = models.CharField(_('phone number'), max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(_('date of birth'), blank=True, null=True)
    is_verified = models.BooleanField(_('is verified'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        db_table = 'accounts_user'
    
    def __str__(self):
        return self.email


class PatientProfile(models.Model):
    """
    Patient profile with additional medical information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    medical_history = models.TextField(_('medical history'), blank=True)
    allergies = models.TextField(_('allergies'), blank=True)
    emergency_contact = models.CharField(_('emergency contact'), max_length=100, blank=True)
    blood_group = models.CharField(_('blood group'), max_length=10, blank=True)
    
    class Meta:
        verbose_name = _('Patient Profile')
        verbose_name_plural = _('Patient Profiles')
        db_table = 'accounts_patient_profile'
    
    def __str__(self):
        return f"{self.user.email} - Profile"


class ClinicProfile(models.Model):
    """
    Clinic profile with business information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='clinic_profile')
    clinic_name = models.CharField(_('clinic name'), max_length=200)
    license_number = models.CharField(_('license number'), max_length=100, blank=True)
    address = models.TextField(_('address'))
    latitude = models.DecimalField(_('latitude'), max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(_('longitude'), max_digits=11, decimal_places=8, null=True, blank=True)
    opening_hours = models.JSONField(_('opening hours'), default=dict, blank=True)
    specialties = models.JSONField(_('specialties'), default=list, blank=True)
    is_verified = models.BooleanField(_('is verified'), default=False)
    
    class Meta:
        verbose_name = _('Clinic Profile')
        verbose_name_plural = _('Clinic Profiles')
        db_table = 'accounts_clinic_profile'
    
    def __str__(self):
        return self.clinic_name
