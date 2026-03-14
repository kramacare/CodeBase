"""
Custom exceptions for the QueueSmart application.
"""


class QueueSmartException(Exception):
    """Base exception class for QueueSmart application."""
    
    def __init__(self, message, status_code=None, details=None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(QueueSmartException):
    """Raised when request validation fails."""
    
    def __init__(self, message, field=None, code=None):
        super().__init__(message, status_code=400)
        self.field = field
        self.code = code


class AuthenticationException(QueueSmartException):
    """Raised when authentication fails."""
    
    def __init__(self, message, code=None):
        super().__init__(message, status_code=401)
        self.code = code


class AuthorizationException(QueueSmartException):
    """Raised when authorization fails."""
    
    def __init__(self, message, code=None):
        super().__init__(message, status_code=403)
        self.code = code


class NotFoundException(QueueSmartException):
    """Raised when a resource is not found."""
    
    def __init__(self, message, resource=None):
        super().__init__(message, status_code=404)
        self.resource = resource


class ConflictException(QueueSmartException):
    """Raised when there's a conflict in the request."""
    
    def __init__(self, message, code=None):
        super().__init__(message, status_code=409)
        self.code = code


class RateLimitException(QueueSmartException):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, message, retry_after=None):
        super().__init__(message, status_code=429)
        self.retry_after = retry_after


class ServerException(QueueSmartException):
    """Raised when there's an internal server error."""
    
    def __init__(self, message, error_code=None):
        super().__init__(message, status_code=500)
        self.error_code = error_code
