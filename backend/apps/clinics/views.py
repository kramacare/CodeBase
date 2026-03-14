from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Clinic, Doctor
from .serializers import (
    ClinicSerializer,
    DoctorSerializer,
    DoctorCreateSerializer,
    DoctorUpdateSerializer
)
from django.contrib.auth import get_user_model

User = get_user_model()


class ClinicListView(generics.ListAPIView):
    """List all clinics (patients can view)."""
    serializer_class = ClinicSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Clinic.objects.select_related('owner').prefetch_related('doctors')
        
        # Filter by search query
        search = self.request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(address__icontains=search)
            )
        
        return queryset.order_by('-created_at')


class ClinicDetailView(generics.RetrieveAPIView):
    """Get clinic details (patients can view)."""
    queryset = Clinic.objects.select_related('owner').prefetch_related('doctors')
    serializer_class = ClinicSerializer
    permission_classes = [permissions.AllowAny]


class ClinicDoctorListView(generics.ListAPIView):
    """Get doctors for a specific clinic."""
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        clinic_id = self.kwargs['clinic_id']
        return Doctor.objects.filter(
            clinic_id=clinic_id,
            is_active=True
        ).select_related('clinic')


class DoctorManageView(generics.ListCreateAPIView):
    """Manage doctors (clinic users only)."""
    serializer_class = DoctorCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role != 'CLINIC':
            return Doctor.objects.none()
        
        try:
            clinic = user.clinic_profile
            return Doctor.objects.filter(clinic=clinic).select_related('clinic')
        except:
            return Doctor.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'CLINIC':
            raise generics.PermissionDenied("Only clinic users can manage doctors")
        
        try:
            clinic = user.clinic_profile
            serializer.save(clinic=clinic)
        except:
            raise generics.PermissionDenied("Clinic profile not found")


class DoctorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get/update/delete individual doctor (clinic users only)."""
    queryset = Doctor.objects.select_related('clinic')
    serializer_class = DoctorUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        doctor_id = self.kwargs['pk']
        
        if user.role != 'CLINIC':
            raise generics.PermissionDenied("Only clinic users can manage doctors")
        
        try:
            clinic = user.clinic_profile
            return Doctor.objects.get(id=doctor_id, clinic=clinic)
        except Doctor.DoesNotExist:
            raise generics.NotFound
        except:
            raise generics.PermissionDenied("Clinic profile not found")
    
    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'CLINIC':
            try:
                clinic = user.clinic_profile
                serializer.save(clinic=clinic)
            except:
                pass
    
    def perform_destroy(self, instance):
        user = self.request.user
        if user.role == 'CLINIC':
            if instance.clinic.owner == user:
                instance.delete()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def nearby_clinics_view(request):
    """Find clinics near a location using Haversine formula."""
    import math
    
    try:
        lat = float(request.query_params.get('lat', 0))
        lng = float(request.query_params.get('lng', 0))
        radius = float(request.query_params.get('radius', 10))  # Default 10km
        
        if lat == 0 or lng == 0:
            return Response(
                {'error': 'Latitude and longitude are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all clinics with coordinates
        clinics = Clinic.objects.filter(
            latitude__isnull=False,
            longitude__isnull=False
        ).prefetch_related('doctors')
        
        nearby_clinics = []
        
        for clinic in clinics:
            # Calculate distance using Haversine formula
            distance = calculate_distance(lat, lng, clinic.latitude, clinic.longitude)
            
            # Only include clinics within radius
            if distance <= radius:
                # Get doctors for this clinic
                doctors = []
                for doctor in clinic.doctors.filter(is_active=True):
                    doctors.append({
                        'id': doctor.id,
                        'name': doctor.name,
                        'specialization': doctor.specialization
                    })
                
                nearby_clinics.append({
                    'id': clinic.id,
                    'name': clinic.name,
                    'address': clinic.address,
                    'distance': round(distance, 2),
                    'doctors': doctors
                })
        
        # Sort by distance
        nearby_clinics.sort(key=lambda x: x['distance'])
        
        return Response({
            'message': 'Nearby clinics retrieved successfully',
            'clinics': nearby_clinics,
            'total': len(nearby_clinics),
            'search_params': {
                'latitude': lat,
                'longitude': lng,
                'radius_km': radius
            }
        })
        
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid coordinates provided'},
            status=status.HTTP_400_BAD_REQUEST
        )


def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    using the Haversine formula.
    """
    import math
    
    # Convert decimal degrees to radians
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    
    # Haversine formula
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    
    # Calculate the result
    distance = c * r
    
    return distance


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_clinic_view(request):
    """Get current user's clinic (for clinic users)."""
    user = request.user
    
    if user.role != 'CLINIC':
        return Response(
            {'error': 'Only clinic users can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        clinic = user.clinic_profile
        serializer = ClinicSerializer(clinic)
        return Response(serializer.data)
    except:
        return Response(
            {'error': 'Clinic profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
