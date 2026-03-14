from django.contrib import admin
from .models import QueueToken, QueueSession, QueueSettings

@admin.register(QueueSession)
class QueueSessionAdmin(admin.ModelAdmin):
    list_display = ('clinic', 'date', 'total_patients', 'completed_patients', 'is_active')
    list_filter = ('date', 'is_active', 'clinic')
    search_fields = ('clinic__name',)
    raw_id_fields = ('clinic',)
    ordering = ('-date',)

@admin.register(QueueSettings)
class QueueSettingsAdmin(admin.ModelAdmin):
    list_display = ('clinic', 'max_queue_size', 'average_consultation_time', 'auto_advance')
    list_filter = ('auto_advance', 'notification_enabled')
    search_fields = ('clinic__clinic_name',)
    raw_id_fields = ('clinic',)

@admin.register(QueueToken)
class QueueTokenAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'clinic', 'patient', 'doctor', 'status', 'joined_at')
    list_filter = ('status', 'source', 'clinic')
    search_fields = ('patient__user__email', 'clinic__name', 'token_number')
    raw_id_fields = ('clinic', 'doctor', 'patient')
    ordering = ('-joined_at',)
