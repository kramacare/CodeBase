from django.urls import path
from .views import (
    ClinicListView,
    ClinicDetailView,
    ClinicDoctorListView,
    DoctorManageView,
    DoctorDetailView,
    nearby_clinics_view,
    my_clinic_view
)

urlpatterns = [
    # Clinic endpoints
    path('', ClinicListView.as_view(), name='clinic-list'),
    path('<int:pk>/', ClinicDetailView.as_view(), name='clinic-detail'),
    path('<int:pk>/doctors/', ClinicDoctorListView.as_view(), name='clinic-doctors'),
    
    # Doctor management endpoints (clinic users only)
    path('doctors/', DoctorManageView.as_view(), name='doctor-manage'),
    path('doctors/<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    
    # Additional endpoints
    path('nearby/', nearby_clinics_view, name='nearby-clinics'),
    path('my/', my_clinic_view, name='my-clinic'),
]
