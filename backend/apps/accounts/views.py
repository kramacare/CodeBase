from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .models import PatientProfile, ClinicProfile
from .serializers import (
    PatientSignupSerializer,
    ClinicSignupSerializer,
    LoginSerializer,
    UserProfileSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT token view with email instead of username."""
    serializer_class = LoginSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def patient_signup_view(request):
    """Patient registration endpoint."""
    serializer = PatientSignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Patient registration successful',
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def clinic_signup_view(request):
    """Clinic registration endpoint."""
    serializer = ClinicSignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Clinic registration successful',
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """Login endpoint for both patients and clinics."""
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']  # Fixed typo
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'message': 'Login successful',
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile_view(request):
    """Get current user profile."""
    user = request.user
    serializer = UserProfileSerializer(user)
    
    # Add profile-specific data
    profile_data = serializer.data
    
    if user.role == 'PATIENT':
        try:
            patient_profile = user.patient_profile
            profile_data['medical_history'] = patient_profile.medical_history
            profile_data['allergies'] = patient_profile.allergies
            profile_data['emergency_contact'] = patient_profile.emergency_contact
            profile_data['blood_group'] = patient_profile.blood_group
        except PatientProfile.DoesNotExist:
            pass
    
    elif user.role == 'CLINIC':
        try:
            clinic_profile = user.clinic_profile
            profile_data['clinic_name'] = clinic_profile.clinic_name
            profile_data['address'] = clinic_profile.address
            profile_data['license_number'] = clinic_profile.license_number
            profile_data['latitude'] = clinic_profile.latitude
            profile_data['longitude'] = clinic_profile.longitude
            profile_data['specialties'] = clinic_profile.specialties
            profile_data['is_verified'] = clinic_profile.is_verified
        except ClinicProfile.DoesNotExist:
            pass
    
    return Response({
        'message': 'Profile retrieved successfully',
        'user': profile_data
    }, status=status.HTTP_200_OK)
