from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from .models import Appointment
from .serializers import (
    AppointmentSerializer,
    AppointmentCreateSerializer,
    AppointmentUpdateSerializer,
    ClinicAppointmentSerializer
)


class AppointmentListView(generics.ListAPIView):
    """List appointments for current user."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Appointment.objects.filter(patient__user=user)
        elif user.role == 'CLINIC':
            return Appointment.objects.filter(clinic__owner=user)
        else:
            return Appointment.objects.none()


class AppointmentCreateView(generics.CreateAPIView):
    """Create new appointment."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AppointmentCreateSerializer
    
    def perform_create(self, serializer):
        # Only patients can create appointments
        if self.request.user.role != 'PATIENT':
            raise permissions.PermissionDenied("Only patients can create appointments.")
        serializer.save()


class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete appointment."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'PATIENT':
            return Appointment.objects.filter(patient__user=user)
        elif user.role == 'CLINIC':
            return Appointment.objects.filter(clinic__owner=user)
        else:
            return Appointment.objects.none()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return AppointmentUpdateSerializer
        return AppointmentSerializer
    
    def perform_update(self, serializer):
        # Only clinic staff can update appointment status
        if self.request.user.role != 'CLINIC':
            raise permissions.PermissionDenied("Only clinic staff can update appointments.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only patients can cancel their own appointments
        if self.request.user.role == 'PATIENT':
            if instance.patient.user != self.request.user:
                raise permissions.PermissionDenied("You can only cancel your own appointments.")
            instance.status = 'CANCELLED'
            instance.save()
        elif self.request.user.role == 'CLINIC':
            # Clinic staff can delete appointments
            instance.delete()
        else:
            raise permissions.PermissionDenied("Permission denied.")


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def clinic_appointments_view(request):
    """Get all appointments for clinic."""
    user = request.user
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic staff can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic_profile = user.clinic_profile
    except:
        return Response(
            {'error': 'Clinic profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get query parameters
    doctor_id = request.GET.get('doctor_id')
    status_filter = request.GET.get('status')
    date_filter = request.GET.get('date')
    
    # Build queryset
    queryset = Appointment.objects.filter(clinic=clinic_profile)
    
    if doctor_id:
        queryset = queryset.filter(doctor_id=doctor_id)
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    if date_filter:
        queryset = queryset.filter(appointment_time__date=date_filter)
    
    # Order by appointment time
    queryset = queryset.order_by('appointment_time')
    
    serializer = ClinicAppointmentSerializer(queryset, many=True)
    
    return Response({
        'message': 'Clinic appointments retrieved successfully',
        'appointments': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_appointments_view(request):
    """Get current user's appointments."""
    user = request.user
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient_profile = user.patient_profile
    except:
        return Response(
            {'error': 'Patient profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get query parameters
    status_filter = request.GET.get('status')
    date_filter = request.GET.get('date')
    
    # Build queryset
    queryset = Appointment.objects.filter(patient=patient_profile)
    
    if status_filter:
        queryset = queryset.filter(status=status_filter)
    
    if date_filter:
        queryset = queryset.filter(appointment_time__date=date_filter)
    
    # Order by appointment time
    queryset = queryset.order_by('appointment_time')
    
    serializer = AppointmentSerializer(queryset, many=True)
    
    return Response({
        'message': 'Your appointments retrieved successfully',
        'appointments': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_appointment_view(request, appointment_id):
    """Cancel appointment."""
    user = request.user
    
    try:
        appointment = Appointment.objects.get(id=appointment_id)
    except Appointment.DoesNotExist:
        return Response(
            {'error': 'Appointment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions
    if user.role == 'PATIENT':
        if appointment.patient.user != user:
            return Response(
                {'error': 'You can only cancel your own appointments'},
                status=status.HTTP_403_FORBIDDEN
            )
    elif user.role == 'CLINIC':
        if appointment.clinic.owner != user:
            return Response(
                {'error': 'You can only cancel appointments for your clinic'},
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if appointment can be cancelled
    if appointment.status in ['COMPLETED', 'CANCELLED']:
        return Response(
            {'error': f'Cannot cancel appointment with status: {appointment.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Cancel appointment
    appointment.status = 'CANCELLED'
    appointment.save()
    
    return Response({
        'message': 'Appointment cancelled successfully',
        'appointment': AppointmentSerializer(appointment).data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def appointment_stats_view(request):
    """Get appointment statistics."""
    user = request.user
    
    if user.role == 'CLINIC':
        try:
            clinic_profile = user.clinic_profile
            queryset = Appointment.objects.filter(clinic=clinic_profile)
        except:
            return Response(
                {'error': 'Clinic profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    elif user.role == 'PATIENT':
        try:
            patient_profile = user.patient_profile
            queryset = Appointment.objects.filter(patient=patient_profile)
        except:
            return Response(
                {'error': 'Patient profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Calculate statistics
    total = queryset.count()
    scheduled = queryset.filter(status='SCHEDULED').count()
    completed = queryset.filter(status='COMPLETED').count()
    cancelled = queryset.filter(status='CANCELLED').count()
    no_show = queryset.filter(status='NO_SHOW').count()
    
    # Today's appointments
    today = timezone.now().date()
    today_appointments = queryset.filter(appointment_time__date=today).count()
    
    # Upcoming appointments
    upcoming = queryset.filter(
        appointment_time__gt=timezone.now(),
        status='SCHEDULED'
    ).count()
    
    return Response({
        'message': 'Appointment statistics retrieved successfully',
        'stats': {
            'total_appointments': total,
            'scheduled': scheduled,
            'completed': completed,
            'cancelled': cancelled,
            'no_show': no_show,
            'today_appointments': today_appointments,
            'upcoming_appointments': upcoming
        }
    }, status=status.HTTP_200_OK)
