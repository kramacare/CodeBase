"""
Request validation utilities for consistent API validation.
"""
import re
from datetime import datetime, date
from django.core.validators import ValidationError as DjangoValidationError
from django.core.exceptions import ValidationError
from .exceptions import ValidationException


class RequestValidator:
    """Utility class for request validation."""
    
    @staticmethod
    def validate_email(email):
        """Validate email address."""
        if not email:
            raise ValidationException('Email is required', field='email')
        
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            raise ValidationException('Invalid email format', field='email')
        
        return email.lower()
    
    @staticmethod
    def validate_phone(phone):
        """Validate phone number."""
        if not phone:
            raise ValidationException('Phone number is required', field='phone')
        
        # Remove all non-digit characters
        phone_digits = re.sub(r'[^\d]', '', phone)
        
        if len(phone_digits) < 10 or len(phone_digits) > 15:
            raise ValidationException('Phone number must be between 10 and 15 digits', field='phone')
        
        return phone_digits
    
    @staticmethod
    def validate_password(password):
        """Validate password strength."""
        if not password:
            raise ValidationException('Password is required', field='password')
        
        if len(password) < 8:
            raise ValidationException('Password must be at least 8 characters long', field='password')
        
        # Check for password strength
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
        
        if not (has_upper and has_lower and has_digit):
            raise ValidationException('Password must contain uppercase, lowercase, and digits', field='password')
        
        if not has_special:
            raise ValidationException('Password must contain at least one special character', field='password')
        
        return password
    
    @staticmethod
    def validate_date(date_string, field_name='date'):
        """Validate date string."""
        if not date_string:
            raise ValidationException(f'{field_name} is required', field=field_name)
        
        try:
            parsed_date = datetime.strptime(date_string, '%Y-%m-%d').date()
            # Check if date is not in the future
            if parsed_date > date.today():
                raise ValidationException(f'{field_name} cannot be in the future', field=field_name)
            return parsed_date
        except ValueError:
            raise ValidationException(f'Invalid {field_name} format. Use YYYY-MM-DD', field=field_name)
    
    @staticmethod
    def validate_file_size(file_size, max_size_mb=10):
        """Validate file size."""
        max_size_bytes = max_size_mb * 1024 * 1024
        
        if file_size > max_size_bytes:
            raise ValidationException(
                f'File size must be less than {max_size_mb}MB',
                field='file'
            )
        
        return file_size
    
    @staticmethod
    def validate_file_type(content_type, allowed_types=['application/pdf', 'image/jpeg', 'image/png']):
        """Validate file type."""
        if content_type not in allowed_types:
            raise ValidationException(
                f'Invalid file type. Allowed types: {", ".join(allowed_types)}',
                field='file'
            )
        
        return content_type
    
    @staticmethod
    def validate_pagination(page, page_size, max_page_size=100):
        """Validate pagination parameters."""
        if page < 1:
            raise ValidationException('Page must be greater than 0', field='page')
        
        if page_size < 1:
            raise ValidationException('Page size must be greater than 0', field='page_size')
        
        if page_size > max_page_size:
            raise ValidationException(
                f'Page size must be less than {max_page_size}',
                field='page_size'
            )
        
        return page, page_size
    
    @staticmethod
    def validate_coordinates(latitude, longitude):
        """Validate geographic coordinates."""
        try:
            lat = float(latitude)
            lng = float(longitude)
            
            if not (-90 <= lat <= 90):
                raise ValidationException('Latitude must be between -90 and 90', field='latitude')
            
            if not (-180 <= lng <= 180):
                raise ValidationException('Longitude must be between -180 and 180', field='longitude')
            
            return lat, lng
            
        except ValueError:
            raise ValidationException('Invalid coordinates format', field='coordinates')
    
    @staticmethod
    def validate_rating(rating):
        """Validate rating value."""
        try:
            rating_int = int(rating)
            if not 1 <= rating_int <= 5:
                raise ValidationException('Rating must be between 1 and 5', field='rating')
            return rating_int
        except ValueError:
            raise ValidationException('Invalid rating format', field='rating')
    
    @staticmethod
    def sanitize_string(value, max_length=255):
        """Sanitize string input."""
        if not isinstance(value, str):
            value = str(value)
        
        # Remove HTML tags
        value = re.sub(r'<[^>]*>', '', value)
        
        # Remove extra whitespace
        value = ' '.join(value.split())
        
        # Truncate if too long
        if len(value) > max_length:
            value = value[:max_length] + '...'
        
        return value.strip()
    
    @staticmethod
    def validate_json_data(data):
        """Validate JSON data structure."""
        if not isinstance(data, dict):
            raise ValidationException('Invalid JSON data format', field='data')
        
        # Check for required fields
        required_fields = ['name', 'email']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            raise ValidationException(
                f'Missing required fields: {", ".join(missing_fields)}',
                field='data',
                details={'missing_fields': missing_fields}
            )
        
        return data


class APIRequestValidator:
    """Comprehensive request validator for API endpoints."""
    
    def __init__(self, request):
        self.request = request
        self.errors = {}
    
    def validate_user_registration(self, data):
        """Validate user registration data."""
        try:
            # Validate email
            self.errors['email'] = RequestValidator.validate_email(data.get('email'))
            
            # Validate password
            self.errors['password'] = RequestValidator.validate_password(data.get('password'))
            
            # Validate phone (optional)
            phone = data.get('phone')
            if phone:
                self.errors['phone'] = RequestValidator.validate_phone(phone)
            
            # Validate role
            role = data.get('role')
            if role not in ['PATIENT', 'CLINIC']:
                self.errors['role'] = 'Role must be PATIENT or CLINIC'
            
            # Validate name
            name = data.get('name', '').strip()
            if not name:
                self.errors['name'] = 'Name is required'
            else:
                self.errors['name'] = RequestValidator.sanitize_string(name)
            
            return len(self.errors) == 0
        
        except ValidationException as e:
            self.errors['general'] = str(e)
        
        return len(self.errors) == 0
    
    def validate_appointment_booking(self, data):
        """Validate appointment booking data."""
        try:
            # Validate appointment time
            appointment_time = data.get('appointment_time')
            if not appointment_time:
                self.errors['appointment_time'] = 'Appointment time is required'
            else:
                self.errors['appointment_time'] = RequestValidator.validate_date(
                    appointment_time.split('T')[0],
                    'appointment_time'
                )
            
            # Validate clinic and doctor
            clinic_id = data.get('clinic_id')
            doctor_id = data.get('doctor_id')
            
            if not clinic_id and not doctor_id:
                self.errors['clinic_or_doctor'] = 'Either clinic_id or doctor_id must be provided'
            
            return len(self.errors) == 0
        
        except ValidationException as e:
            self.errors['general'] = str(e)
        
        return len(self.errors) == 0
    
    def get_errors(self):
        """Get all validation errors."""
        return self.errors


def validate_serializer_data(serializer):
    """Validate DRF serializer data."""
    if not serializer.is_valid():
        errors = {}
        
        for field, messages in serializer.errors.items():
            errors[field] = messages
        
        if errors:
            raise ValidationException(
                'Validation failed',
                details=errors
            )
        
        return serializer.validated_data
