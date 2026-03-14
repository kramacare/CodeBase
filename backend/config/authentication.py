"""
Custom authentication and permission classes for DRF.
"""
from rest_framework import authentication, permissions
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class CustomTokenAuthentication(authentication.TokenAuthentication):
    """Custom token authentication with enhanced security."""
    
    def authenticate_credentials(self, key):
        """Enhanced token authentication."""
        try:
            token = Token.objects.select_related('user').get(key=key)
            if token and token.user.is_active:
                # Check if token is expired
                if token.created < timezone.now() - timedelta(hours=24):
                    logger.warning(f"Expired token used: {key[:20]}...")
                    return None
                
                return token.user
            else:
                logger.warning(f"Invalid token used: {key[:20]}...")
                return None
        except Exception as e:
            logger.error(f"Token authentication error: {str(e)}")
            return None


class JWTAuthentication(authentication.BaseAuthentication):
    """JWT authentication with custom claims."""
    
    def authenticate(self, request):
        """Authenticate JWT token."""
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import InvalidToken
        
        token = self.get_token_from_request(request)
        if not token:
            return None
        
        try:
            # Decode JWT token
            payload = AccessToken(token)
            user_id = payload.get('user_id')
            
            if not user_id:
                logger.warning(f"JWT token without user_id: {token[:20]}")
                return None
            
            user = User.objects.get(id=user_id, is_active=True)
            if not user:
                logger.warning(f"JWT token for inactive user: {token[:20]}")
                return None
            
            return user
            
        except InvalidToken:
            logger.warning(f"Invalid JWT token: {token[:20]}")
            return None
        except Exception as e:
            logger.error(f"JWT authentication error: {str(e)}")
            return None
    
    def get_token_from_request(self, request):
        """Extract token from request."""
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
        
        try:
            # Remove 'Bearer ' prefix
            token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
            return token
        except IndexError:
            return None


class IsOwnerOrStaff(permissions.BasePermission):
    """Permission to check if user is owner or staff."""
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permission."""
        if request.user.is_authenticated:
            if hasattr(obj, 'owner') and obj.owner == request.user:
                return True
            if hasattr(obj, 'clinic') and obj.clinic.owner == request.user:
                return True
            if hasattr(obj, 'patient') and obj.patient.user == request.user:
                return True
        
        return False
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        return request.user.is_authenticated


class IsClinicStaff(permissions.BasePermission):
    """Permission to check if user is clinic staff."""
    
    def has_permission(self, request, view):
        """Check if user is clinic staff."""
        return request.user.is_authenticated and request.user.role == 'CLINIC'


class IsPatient(permissions.BasePermission):
    """Permission to check if user is patient."""
    
    def has_permission(self, request, view):
        """Check if user is patient."""
        return request.user.is_authenticated and request.user.role == 'PATIENT'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow read access to anyone, write access only to owner."""
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permission."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if request.user.is_authenticated:
            if hasattr(obj, 'owner') and obj.owner == request.user:
                return True
            if hasattr(obj, 'clinic') and obj.clinic.owner == request.user:
                return True
            if hasattr(obj, 'patient') and obj.patient.user == request.user:
                return True
        
        return False
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        return request.method in permissions.SAFE_METHODS


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """Allow read access to authenticated users, write access to staff."""
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_authenticated


class IsSuperUserOrReadOnly(permissions.BasePermission):
    """Allow read access to anyone, write access only to superusers."""
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_authenticated and request.user.is_superuser


class IsOwnerOrClinicStaff(permissions.BasePermission):
    """Allow access if user is owner or clinic staff."""
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permission."""
        if request.user.is_authenticated:
            if hasattr(obj, 'owner') and obj.owner == request.user:
                return True
            if hasattr(obj, 'clinic') and obj.clinic.owner == request.user:
                return True
        
        return False
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        return request.user.is_authenticated and (
            request.user.role == 'CLINIC' or 
            request.user.is_superuser
        )


class IsPatientOrClinicStaff(permissions.BasePermission):
    """Allow access if user is patient or clinic staff."""
    
    def has_permission(self, request, view):
        """Check view-level permission."""
        return request.user.is_authenticated and (
            request.user.role == 'PATIENT' or 
            request.user.role == 'CLINIC' or
            request.user.is_superuser
        )


class IsActiveUser(permissions.BasePermission):
    """Permission to check if user is active."""
    
    def has_permission(self, request, view):
        """Check if user is active."""
        return request.user.is_authenticated and request.user.is_active
