"""
Logging configuration for the QueueSmart application.
"""
import logging
import os
from datetime import datetime


class QueueSmartFormatter(logging.Formatter):
    """Custom formatter for structured logging."""
    
    def format(self, record):
        """Format log record with additional context."""
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'user_id': getattr(record, 'user_id', None),
            'ip_address': getattr(record, 'ip_address', None),
            'request_id': getattr(record, 'request_id', None),
            'session_id': getattr(record, 'session_id', None),
        }
        
        return f"{log_data['timestamp']} - {log_data['level']} - {log_data['module']}:{log_data['function']}:{log_data['line']} - {log_data['message']} - User:{log_data['user_id']} - IP:{log_data['ip_address']} - Request:{log_data['request_id']} - Session:{log_data['session_id']}"


class RequestLoggingMiddleware:
    """Middleware to log all requests."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        """Log request details."""
        # Generate request ID
        import uuid
        request_id = str(uuid.uuid4())
        
        # Log request details
        logger = logging.getLogger('requests')
        logger.info(
            "Request received",
            extra={
                'request_id': request_id,
                'user_id': request.user.id if request.user.is_authenticated else None,
                'ip_address': self.get_client_ip(request),
                'method': request.method,
                'path': request.path,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'content_type': request.content_type,
                'content_length': len(request.body) if hasattr(request, 'body') else 0,
                'query_params': dict(request.GET),
                'session_id': getattr(request, 'sessionid', None),
            }
        )
        
        # Add request ID to request for later use
        request.request_id = request_id
        
        response = self.get_response(request)
        response['X-Request-ID'] = request_id
        
        return response
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityLoggingMiddleware:
    """Middleware for security-related logging."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        """Log security events."""
        logger = logging.getLogger('security')
        
        # Check for suspicious activity
        suspicious_patterns = [
            'admin', 'test', 'debug', 'config', 'env'
        ]
        
        request_data = {
            'path': request.path,
            'method': request.method,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'ip_address': self.get_client_ip(request),
            'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            'query_params': dict(request.GET),
            'headers': dict(request.headers),
        }
        
        # Check for suspicious patterns
        suspicious = any(pattern in request.path.lower() for pattern in suspicious_patterns)
        if suspicious:
            logger.warning(
                "Suspicious request detected",
                extra={
                    'suspicious_patterns': suspicious_patterns,
                    **request_data
                }
            )
        
        # Check for common attack patterns
        attack_patterns = [
            '<script>', 'javascript:', 'sqlmap', 'nmap', 'nikto'
        ]
        
        request_body = request.body.decode('utf-8', errors='ignore') if hasattr(request, 'body') else ''
        if any(pattern.lower() in request_body.lower() for pattern in attack_patterns):
            logger.error(
                "Potential attack detected",
                extra={
                    'attack_patterns': attack_patterns,
                    'request_body': request_body,
                    **request_data
                }
            )
        
        return self.get_response(request)


def setup_logging():
    """Setup logging configuration."""
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Create formatters
    formatter = QueueSmartFormatter()
    
    # Create handlers
    from logging.handlers import RotatingFileHandler, StreamHandler
    
    # File handler for all logs
    file_handler = RotatingFileHandler(
        filename=os.path.join(log_dir, 'queuesmart.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    # Console handler
    console_handler = StreamHandler()
    console_handler.setFormatter(formatter)
    
    # Add handlers to root logger
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Create specific loggers
    loggers = [
        'requests',
        'security',
        'database',
        'authentication',
        'queue',
        'appointments',
        'reports'
    ]
    
    for logger_name in loggers:
        log = logging.getLogger(logger_name)
        log.setLevel(logging.INFO)
        log.addHandler(file_handler)


def setup_structured_logging():
    """Setup structured logging with JSON output."""
    import json
    
    class JSONFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                'timestamp': datetime.utcnow().isoformat(),
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno,
                'user_id': getattr(record, 'user_id', None),
                'ip_address': getattr(record, 'ip_address', None),
                'request_id': getattr(record, 'request_id', None),
                'session_id': getattr(record, 'session_id', None),
            }
            
            return json.dumps(log_data)
    
    # Configure structured logging for production
    if os.getenv('DJANGO_SETTINGS_MODULE') == 'config.production':
        json_handler = logging.StreamHandler()
        json_handler.setFormatter(JSONFormatter())
        
        json_logger = logging.getLogger('structured')
        json_logger.addHandler(json_handler)
        json_logger.setLevel(logging.INFO)
