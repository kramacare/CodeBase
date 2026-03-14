from django.contrib import admin
from .models import Appointment

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'clinic', 'doctor', 'appointment_time', 'status')
    list_filter = ('status', 'clinic')
    search_fields = ('patient__user__email', 'clinic__name', 'doctor__name')
    raw_id_fields = ('patient', 'clinic', 'doctor')
    ordering = ('-appointment_time',)
