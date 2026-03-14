from django.contrib import admin
from .models import Doctor, Clinic

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('name', 'clinic', 'specialization', 'is_active')
    list_filter = ('specialization', 'is_active', 'clinic')
    search_fields = ('name', 'specialization', 'clinic__name')
    raw_id_fields = ('clinic',)


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'phone', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'address')
    raw_id_fields = ('owner',)
