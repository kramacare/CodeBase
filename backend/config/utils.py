"""
Utility functions for consistent API responses.
"""
from rest_framework.response import Response
from rest_framework import status
from collections import OrderedDict
from django.utils import timezone
from datetime import datetime
import json


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """Create consistent success response."""
    response_data = {
        'success': True,
        'message': message or 'Operation successful',
        'timestamp': timezone.now().isoformat(),
    }
    
    if data is not None:
        response_data['data'] = data
    
    return Response(response_data, status=status_code)


def error_response(message, error_code=None, details=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Create consistent error response."""
    response_data = {
        'success': False,
        'error': message,
        'error_code': error_code or 'VALIDATION_ERROR',
        'timestamp': timezone.now().isoformat(),
    }
    
    if details is not None:
        response_data['details'] = details
    
    return Response(response_data, status=status_code)


def not_found_response(resource='Resource', message=None):
    """Create consistent not found response."""
    return error_response(
        message=message or f'{resource} not found',
        error_code='NOT_FOUND',
        status_code=status.HTTP_404_NOT_FOUND
    )


def unauthorized_response(message=None):
    """Create consistent unauthorized response."""
    return error_response(
        message=message or 'Authentication required',
        error_code='UNAUTHORIZED',
        status_code=status.HTTP_401_UNAUTHORIZED
    )


def forbidden_response(message=None):
    """Create consistent forbidden response."""
    return error_response(
        message=message or 'Access denied',
        error_code='FORBIDDEN',
        status_code=status.HTTP_403_FORBIDDEN
    )


def conflict_response(message=None):
    """Create consistent conflict response."""
    return error_response(
        message=message or 'Resource conflict',
        error_code='CONFLICT',
        status_code=status.HTTP_409_CONFLICT
    )


def server_error_response(message=None, error_code=None):
    """Create consistent server error response."""
    return error_response(
        message=message or 'Internal server error',
        error_code=error_code or 'INTERNAL_ERROR',
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def rate_limit_response(retry_after=None):
    """Create consistent rate limit response."""
    return error_response(
        message='Rate limit exceeded',
        error_code='RATE_LIMIT_EXCEEDED',
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        details={'retry_after': retry_after}
    )


def validation_error_response(errors):
    """Create validation error response with detailed errors."""
    return error_response(
        message='Validation failed',
        error_code='VALIDATION_ERROR',
        details={'validation_errors': errors},
        status_code=status.HTTP_400_BAD_REQUEST
    )


def paginate_queryset(queryset, request, pagination_class):
    """Paginate queryset using provided pagination class."""
    paginator = pagination_class()
    page = paginator.paginate_queryset(queryset, request)
    
    # Get paginated response
    return paginator.get_paginated_response(page.object_list)


def format_datetime(dt):
    """Format datetime consistently."""
    if dt is None:
        return None
    
    if isinstance(dt, datetime):
        return dt.isoformat()
    
    return str(dt)


def calculate_age(birth_date):
    """Calculate age from birth date."""
    if not birth_date:
        return None
    
    today = timezone.now().date()
    age = today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )
    
    return age


def mask_email(email):
    """Mask email for privacy."""
    if not email or '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    local_masked = local[0] + '*' * (len(local) - 1)
    return f"{local_masked}@{domain}"


def generate_request_id():
    """Generate unique request ID."""
    import uuid
    return str(uuid.uuid4())


def format_file_size(size_bytes):
    """Format file size in human readable format."""
    if size_bytes == 0:
        return '0 Bytes'
    
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes} {unit}"
        size_bytes /= 1024.0
    
    if size_bytes < 1024.0:
        return f"{size_bytes:.2f} KB"
    
    if size_bytes < 1024.0:
        return f"{size_bytes:.2f} MB"
    
    return f"{size_bytes:.2f} GB"


def sanitize_filename(filename):
    """Sanitize filename for security."""
    import os
    import re
    
    # Get file extension
    name, ext = os.path.splitext(filename)
    
    # Remove special characters and spaces
    clean_name = re.sub(r'[^\w\s\-.]', '', name)
    clean_name = re.sub(r'\s+', '_', clean_name)
    
    # Limit length
    if len(clean_name) > 50:
        clean_name = clean_name[:50]
    
    return f"{clean_name}{ext}"


def get_client_info(request):
    """Get client information for logging."""
    return {
        'ip_address': get_client_ip(request),
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
        'platform': request.META.get('HTTP_SEC_CH_UA_PLATFORM', ''),
        'browser': request.META.get('HTTP_SEC_CH_UA_BROWSER', ''),
        'language': request.META.get('HTTP_ACCEPT_LANGUAGE', ''),
        'referer': request.META.get('HTTP_REFERER', ''),
        'method': request.method,
        'path': request.path,
        'query_params': dict(request.GET),
        'content_type': request.content_type,
        'content_length': len(request.body) if hasattr(request, 'body') else 0,
    }


def get_client_ip(request):
    """Get client IP address."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def build_api_response(request, data, message=None, status_code=200):
    """Build API response with metadata."""
    response_data = {
        'success': True,
        'message': message or 'Operation successful',
        'timestamp': timezone.now().isoformat(),
        'request_id': getattr(request, 'request_id', None),
        'processing_time_ms': 0,  # Would be calculated in production
    }
    
    if data is not None:
        response_data['data'] = data
    
    return Response(response_data, status=status_code)


def create_hateoas_headers():
    """Create security headers."""
    return {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'",
    }


def apply_cors_headers(response):
    """Apply CORS headers to response."""
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response['Access-Control-Max-Age'] = '86400'
    response['Access-Control-Allow-Credentials'] = 'true'


def log_api_request(request, user_action=None):
    """Log API request for analytics."""
    logger = logging.getLogger('api')
    
    log_data = {
        'timestamp': timezone.now().isoformat(),
        'user_id': request.user.id if request.user.is_authenticated else None,
        'user_role': getattr(request.user, 'role', None),
        'action': user_action,
        'method': request.method,
        'path': request.path,
        'query_params': dict(request.GET),
        'ip_address': get_client_ip(request),
        'user_agent': request.META.get('HTTP_USER_AGENT', ''),
    }
    
    logger.info(f"API Request: {user_action}", extra=log_data)


def validate_json_payload(payload, required_fields=None):
    """Validate JSON payload."""
    if not isinstance(payload, dict):
        raise ValueError('Payload must be a dictionary')
    
    if required_fields:
        missing_fields = [field for field in required_fields if field not in payload]
        if missing_fields:
            raise ValueError(f'Missing required fields: {", ".join(missing_fields)}')
    
    return payload


def extract_token_from_request(request):
    """Extract JWT token from request."""
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    if not auth_header:
        return None
    
    try:
        token = auth_header.split(' ')[1] if ' ' in auth_header else auth_header
        return token
    except IndexError:
        return None
