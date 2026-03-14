from django.urls import path
from .views import (
    AppointmentListView,
    AppointmentCreateView,
    AppointmentDetailView,
    clinic_appointments_view,
    my_appointments_view,
    cancel_appointment_view,
    appointment_stats_view
)

urlpatterns = [
    # Main appointment endpoints
    path('', AppointmentListView.as_view(), name='appointment-list'),
    path('create/', AppointmentCreateView.as_view(), name='appointment-create'),
    path('<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),
    
    # Additional appointment endpoints
    path('clinic/', clinic_appointments_view, name='clinic-appointments'),
    path('my/', my_appointments_view, name='my-appointments'),
    path('<int:appointment_id>/cancel/', cancel_appointment_view, name='cancel-appointment'),
    path('stats/', appointment_stats_view, name='appointment-stats'),
]
