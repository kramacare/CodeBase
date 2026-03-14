"""
Error handling middleware for consistent API responses.
"""
import logging
import traceback
import json
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
from .exceptions import QueueSmartException
from .logging_config import setup_logging

logger = logging.getLogger('errors')

# Setup logging
setup_logging()


class ErrorHandlerMiddleware:
    """Global error handling middleware."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        """Handle exceptions and return consistent error responses."""
        response = self.get_response(request)
        
        # Add error handling to response
        response._error_handler = self.handle_error
        
        return response
    
    def handle_error(self, request, exception):
        """Handle exceptions and return consistent error response."""
        # Log the error
        logger.error(
            f"Error occurred: {str(exception)}",
            extra={
                'exception_type': type(exception).__name__,
                'exception_message': str(exception),
                'traceback': traceback.format_exc(),
                'user_id': request.user.id if request.user.is_authenticated else None,
                'ip_address': self.get_client_ip(request),
                'path': request.path,
                'method': request.method,
            }
        )
        
        # Determine status code
        if hasattr(exception, 'status_code'):
            status_code = exception.status_code
        elif isinstance(exception, QueueSmartException):
            status_code = exception.status_code
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        
        # Create error response
        error_data = {
            'success': False,
            'error': str(exception),
            'error_code': getattr(exception, 'code', 'INTERNAL_ERROR'),
            'timestamp': timezone.now().isoformat(),
            'path': request.path,
            'method': request.method,
        }
        
        # Add details if available
        if hasattr(exception, 'details'):
            error_data['details'] = exception.details
        
        # Add validation errors if applicable
        if isinstance(exception, QueueSmartException) and hasattr(exception, 'field'):
            error_data['field'] = exception.field
            error_data['validation_errors'] = {exception.field: [str(exception)]}
        
        # Add request ID if available
        if hasattr(request, 'request_id'):
            error_data['request_id'] = request.request_id
        
        return JsonResponse(error_data, status=status_code)
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ValidationErrorHandlerMiddleware(ErrorHandlerMiddleware):
    """Middleware specifically for validation errors."""
    
    def handle_error(self, request, exception):
        """Handle validation errors with detailed feedback."""
        error_data = {
            'success': False,
            'error': str(exception),
            'error_type': 'validation_error',
            'timestamp': timezone.now().isoformat(),
            'validation_errors': {}
        }
        
        # Add field-specific validation errors
        if isinstance(exception, QueueSmartException) and hasattr(exception, 'field'):
            field_name = exception.field
            error_data['field'] = field_name
            error_data['validation_errors'][field_name] = [str(exception)]
        
        return JsonResponse(error_data, status=status.HTTP_400_BAD_REQUEST)


class DatabaseErrorHandlerMiddleware(ErrorHandlerMiddleware):
    """Middleware for database errors."""
    
    def handle_error(self, request, exception):
        """Handle database errors with user-friendly messages."""
        error_data = {
            'success': False,
            'error': 'Database operation failed',
            'error_type': 'database_error',
            'timestamp': timezone.now().isoformat(),
            'path': request.path,
            'method': request.method,
        }
        
        # Add specific database error details
        if hasattr(exception, 'error_code'):
            error_data['database_error_code'] = exception.error_code
        
        return JsonResponse(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Middleware factory function
def get_error_handler_middleware():
    """Factory function to create error handler middleware."""
    return ErrorHandlerMiddleware


def get_validation_error_handler_middleware():
    """Factory function to create validation error handler middleware."""
    return ValidationErrorHandlerMiddleware


def get_database_error_handler_middleware():
    """Factory function to create database error handler middleware."""
    return DatabaseErrorHandlerMiddleware


def get_error_response(exception, request=None):
    """Create consistent error response."""
    from datetime import timezone
    
    error_data = {
        'success': False,
        'error': str(exception),
        'timestamp': timezone.now().isoformat(),
    }
    
    # Add details if available
    if hasattr(exception, 'details'):
        error_data['details'] = exception.details
    
    # Add status code
    if hasattr(exception, 'status_code'):
        status_code = exception.status_code
    elif isinstance(exception, QueueSmartException):
        status_code = exception.status_code
    else:
        status_code = 500
    
    return JsonResponse(error_data, status=status_code)
