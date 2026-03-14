from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

User = get_user_model()


class Review(models.Model):
    """Review model for patient feedback on clinics."""
    
    patient = models.ForeignKey(
        'accounts.PatientProfile',
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('patient')
    )
    clinic = models.ForeignKey(
        'clinics.Clinic',
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name=_('clinic')
    )
    rating = models.IntegerField(
        _('rating'),
        validators=[
            MinValueValidator(1, message=_('Rating must be at least 1')),
            MaxValueValidator(5, message=_('Rating must be at most 5'))
        ],
        help_text=_('Rating from 1 to 5')
    )
    comment = models.TextField(_('comment'), blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)
    
    class Meta:
        verbose_name = _('Review')
        verbose_name_plural = _('Reviews')
        db_table = 'reviews_review'
        ordering = ['-created_at']
        # Ensure a patient can only review a clinic once
        unique_together = ['patient', 'clinic']
    
    def __str__(self):
        return f"{self.patient.user.email} - {self.clinic.name} - {self.rating}★"
    
    @property
    def patient_name(self):
        """Get patient's full name."""
        return self.patient.user.get_full_name() or self.patient.user.email
    
    @property
    def patient_email(self):
        """Get patient's email."""
        return self.patient.user.email


class ReviewReply(models.Model):
    """Reply to reviews by clinic staff."""
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='replies',
        verbose_name=_('review')
    )
    clinic = models.ForeignKey(
        'accounts.ClinicProfile',
        on_delete=models.CASCADE,
        related_name='review_replies',
        verbose_name=_('clinic')
    )
    reply = models.TextField(_('reply'))
    is_helpful = models.BooleanField(_('is helpful'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('Review Reply')
        verbose_name_plural = _('Review Replies')
        db_table = 'reviews_reply'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Reply to {self.review}"


class ReviewFlag(models.Model):
    """Flag inappropriate reviews."""
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='flags',
        verbose_name=_('review')
    )
    reporter = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reported_reviews',
        verbose_name=_('reporter')
    )
    reason = models.CharField(_('reason'), max_length=200)
    description = models.TextField(_('description'), blank=True)
    is_resolved = models.BooleanField(_('is resolved'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    resolved_at = models.DateTimeField(_('resolved at'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('Review Flag')
        verbose_name_plural = _('Review Flags')
        db_table = 'reviews_flag'
        unique_together = ['review', 'reporter']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Flag by {self.reporter.email} on {self.review}"
