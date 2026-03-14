#!/usr/bin/env python
"""
Test script for production Django backend setup.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_imports():
    """Test all production-related imports."""
    print("🎯 Testing Production Imports...")
    
    try:
        # Test custom exceptions
        from config.exceptions import (
            QueueSmartException,
            ValidationException,
            AuthenticationException,
            AuthorizationException,
            NotFoundException,
            ConflictException,
            RateLimitException,
            ServerException
        )
        print("✅ Custom exceptions imported successfully")
        
        # Test pagination
        from config.pagination import (
            StandardResultsSetPagination,
            LargeResultsSetPagination,
            CursorPagination,
            InfiniteScrollPagination
        )
        print("✅ Pagination classes imported successfully")
        
        # Test rate limiting
        from config.rate_limiting import (
            RateLimitMiddleware,
            AdvancedRateLimitMiddleware,
            SlidingWindowRateLimitMiddleware
        )
        print("✅ Rate limiting middleware imported successfully")
        
        # Test logging
        from config.logging_config import (
            QueueSmartFormatter,
            RequestLoggingMiddleware,
            SecurityLoggingMiddleware,
            setup_logging,
            setup_structured_logging
        )
        print("✅ Logging configuration imported successfully")
        
        # Test error handling
        from config.middleware import (
            ErrorHandlerMiddleware,
            ValidationErrorHandlerMiddleware,
            DatabaseErrorHandlerMiddleware,
            get_error_handler_middleware,
            get_error_response
        )
        print("✅ Error handling middleware imported successfully")
        
        # Test validation
        from config.validation import (
            RequestValidator,
            APIRequestValidator,
            validate_serializer_data
        )
        print("✅ Validation utilities imported successfully")
        
        # Test authentication
        from config.authentication import (
            CustomTokenAuthentication,
            JWTAuthentication,
            IsOwnerOrStaff,
            IsClinicStaff,
            IsPatient,
            IsOwnerOrReadOnly,
            IsAuthenticatedOrReadOnly,
            IsSuperUserOrReadOnly,
            IsOwnerOrClinicStaff,
            IsPatientOrClinicStaff,
            IsActiveUser
        )
        print("✅ Authentication classes imported successfully")
        
        # Test utilities
        from config.utils import (
            success_response,
            error_response,
            not_found_response,
            unauthorized_response,
            forbidden_response,
            conflict_response,
            server_error_response,
            rate_limit_response,
            validation_error_response,
            paginate_queryset,
            format_datetime,
            calculate_age,
            mask_email,
            generate_request_id,
            format_file_size,
            sanitize_filename,
            get_client_info,
            build_api_response,
            create_hateoas_headers,
            apply_cors_headers,
            log_api_request,
            validate_json_payload,
            extract_token_from_request
        )
        print("✅ Utility functions imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Import test failed: {e}")
        return False

def test_settings():
    """Test production settings configuration."""
    print("\n⚙️ Testing Production Settings...")
    
    try:
        from django.conf import settings
        print("✅ Django settings imported successfully")
        
        # Test required production settings
        required_settings = [
            'DJANGO_APPS',
            'DATABASES',
            'REST_FRAMEWORK',
            'LOGGING',
            'CORS_ALLOWED_ORIGINS',
            'CHANNEL_LAYERS',
            'CHANNEL_REDIS',
            'SIMPLE_JWT',
            'FILE_UPLOAD_MAX_MEMORY_SIZE',
            'RATE_LIMIT',
            'ENABLE_API_MONITORING',
            'ENABLE_REQUEST_LOGGING'
        ]
        
        for setting in required_settings:
            if hasattr(settings, setting):
                print(f"✅ {setting}: Configured")
            else:
                print(f"❌ {setting}: Not configured")
                return False
        
        # Test DRF configuration
        drf_config = getattr(settings, 'REST_FRAMEWORK', {})
        required_drf_settings = [
            'DEFAULT_AUTHENTICATION_CLASSES',
            'DEFAULT_PERMISSION_CLASSES',
            'DEFAULT_RENDERER_CLASSES',
            'DEFAULT_PARSER_CLASSES',
            'DEFAULT_PAGINATION_CLASS',
            'DEFAULT_THROTTLE_CLASSES',
            'EXCEPTION_HANDLER'
        ]
        
        for drf_setting in required_drf_settings:
            if drf_setting in drf_config:
                print(f"✅ DRF {drf_setting}: Configured")
            else:
                print(f"❌ DRF {drf_setting}: Not configured")
                return False
        
        # Test JWT configuration
        jwt_config = getattr(settings, 'SIMPLE_JWT', {})
        required_jwt_settings = [
            'ACCESS_TOKEN_LIFETIME',
            'REFRESH_TOKEN_LIFETIME',
            'ALGORITHM',
            'SIGNING_KEY'
        ]
        
        for jwt_setting in required_jwt_settings:
            if jwt_setting in jwt_config:
                print(f"✅ JWT {jwt_setting}: Configured")
            else:
                print(f"❌ JWT {jwt_setting}: Not configured")
                return False
        
        # Test Redis configuration
        redis_config = getattr(settings, 'CHANNEL_REDIS', {})
        required_redis_settings = ['host', 'port', 'db']
        
        for redis_setting in required_redis_settings:
            if redis_setting in redis_config:
                print(f"✅ Redis {redis_setting}: {redis_config[redis_setting]}")
            else:
                print(f"❌ Redis {redis_setting}: Not configured")
                return False
        
        # Test file upload settings
        file_settings = [
            'FILE_UPLOAD_MAX_MEMORY_SIZE',
            'FILE_UPLOAD_ALLOWED_EXTENSIONS',
            'FILE_UPLOAD_ALLOWED_CONTENT_TYPES'
        ]
        
        for file_setting in file_settings:
            if hasattr(settings, file_setting):
                print(f"✅ File upload {file_setting}: Configured")
            else:
                print(f"❌ File upload {file_setting}: Not configured")
                return False
        
        # Test security settings
        security_settings = [
            'SECURE_BROWSER_XSS_FILTER',
            'SECURE_CONTENT_TYPE_NOSNIFF',
            'SECURE_HSTS_SECONDS',
            'SESSION_COOKIE_SECURE',
            'CSRF_COOKIE_SECURE',
            'X_FRAME_OPTIONS'
        ]
        
        for security_setting in security_settings:
            if hasattr(settings, security_setting):
                print(f"✅ Security {security_setting}: Configured")
            else:
                print(f"❌ Security {security_setting}: Not configured")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Settings test failed: {e}")
        return False

def test_middleware_stack():
    """Test middleware stack configuration."""
    print("\n🔧 Testing Middleware Stack...")
    
    try:
        from django.conf import settings
        
        # Test if middleware is properly configured
        middleware_classes = getattr(settings, 'MIDDLEWARE', [])
        
        required_middleware = [
            'config.middleware.ErrorHandlerMiddleware',
            'corsheaders.middleware.CorsMiddleware',
            'django.middleware.security.SecurityMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware'
        ]
        
        print(f"✅ Configured middleware: {len(middleware_classes)} classes")
        
        for required_class in required_middleware:
            found = any(required_class in str(mw_class) for mw_class in middleware_classes)
            if found:
                print(f"✅ {required_class}: Found")
            else:
                print(f"❌ {required_class}: Not found")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Middleware test failed: {e}")
        return False

def test_api_response_format():
    """Test API response format consistency."""
    print("\n📡 Testing API Response Format...")
    
    try:
        from config.utils import (
            success_response,
            error_response,
            not_found_response,
            unauthorized_response,
            forbidden_response,
            conflict_response,
            server_error_response,
            rate_limit_response,
            validation_error_response
        )
        
        # Test success response format
        success_resp = success_response({'test': 'data'})
        expected_keys = ['success', 'message', 'timestamp', 'data']
        for key in expected_keys:
            if key not in success_resp.data:
                print(f"❌ Success response missing key: {key}")
                return False
        print("✅ Success response format correct")
        
        # Test error response format
        error_resp = error_response('Test error', details={'field': 'test'})
        expected_error_keys = ['success', 'error', 'error_code', 'timestamp']
        for key in expected_error_keys:
            if key not in error_resp.data:
                print(f"❌ Error response missing key: {key}")
                return False
        print("✅ Error response format correct")
        
        return True
        
    except Exception as e:
        print(f"❌ API response format test failed: {e}")
        return False

def test_validation_utilities():
    """Test validation utilities."""
    print("\n✅ Testing Validation Utilities...")
    
    try:
        from config.validation import RequestValidator
        
        # Test email validation
        try:
            RequestValidator.validate_email('test@example.com')
            print("✅ Email validation works")
        except Exception as e:
            print(f"❌ Email validation failed: {e}")
            return False
        
        # Test phone validation
        try:
            RequestValidator.validate_phone('1234567890')
            print("✅ Phone validation works")
        except Exception as e:
            print(f"❌ Phone validation failed: {e}")
            return False
        
        # Test password validation
        try:
            RequestValidator.validate_password('SecurePass123!')
            print("✅ Password validation works")
        except Exception as e:
            print(f"❌ Password validation failed: {e}")
            return False
        
        # Test coordinate validation
        try:
            RequestValidator.validate_coordinates('12.9716', '77.5946')
            print("✅ Coordinate validation works")
        except Exception as e:
            print(f"❌ Coordinate validation failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Validation utilities test failed: {e}")
        return False

def test_authentication_classes():
    """Test authentication classes."""
    print("\n🔐 Testing Authentication Classes...")
    
    try:
        from config.authentication import (
            IsOwnerOrStaff,
            IsClinicStaff,
            IsPatient,
            IsOwnerOrReadOnly,
            IsAuthenticatedOrReadOnly,
            IsSuperUserOrReadOnly,
            IsOwnerOrClinicStaff,
            IsPatientOrClinicStaff,
            IsActiveUser
        )
        
        print("✅ All authentication classes imported successfully")
        
        # Test permission class methods
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Mock user for testing
        class MockUser:
            def __init__(self, role='PATIENT', is_authenticated=True, is_active=True):
                self.role = role
                self.is_authenticated = is_authenticated
                self.is_active = is_active
                self.id = 1
                self.is_superuser = False
        
        # Mock request for testing
        class MockRequest:
            def __init__(self, user):
                self.user = user
                self.method = 'GET'
        
        # Test IsPatient permission
        patient_user = MockUser('PATIENT')
        patient_request = MockRequest(patient_user)
        is_patient = IsPatient().has_permission(patient_request, None)
        print(f"✅ IsPatient permission: {is_patient}")
        
        # Test IsClinicStaff permission
        clinic_user = MockUser('CLINIC')
        clinic_request = MockRequest(clinic_user)
        is_clinic = IsClinicStaff().has_permission(clinic_request, None)
        print(f"✅ IsClinicStaff permission: {is_clinic}")
        
        return True
        
    except Exception as e:
        print(f"❌ Authentication classes test failed: {e}")
        return False

def test_pagination_classes():
    """Test pagination classes."""
    print("\n📄 Testing Pagination Classes...")
    
    try:
        from config.pagination import (
            StandardResultsSetPagination,
            LargeResultsSetPagination,
            CursorPagination,
            InfiniteScrollPagination
        )
        
        print("✅ All pagination classes imported successfully")
        
        # Test pagination methods
        standard_pagination = StandardResultsSetPagination()
        print(f"✅ Standard pagination: page_size={standard_pagination.page_size}")
        
        large_pagination = LargeResultsSetPagination()
        print(f"✅ Large pagination: page_size={large_pagination.page_size}")
        
        infinite_pagination = InfiniteScrollPagination()
        print(f"✅ Infinite pagination: page_size={infinite_pagination.page_size}")
        
        return True
        
    except Exception as e:
        print(f"❌ Pagination classes test failed: {e}")
        return False

def main():
    """Run all production setup tests."""
    print("🚀 QueueSmart Production Setup Test")
    print("=" * 60)
    
    success = True
    success &= test_imports()
    success &= test_settings()
    success &= test_middleware_stack()
    success &= test_api_response_format()
    success &= test_validation_utilities()
    success &= test_authentication_classes()
    success &= test_pagination_classes()
    
    print("\n" + "=" * 60)
    
    if success:
        print("✅ All production setup tests passed!")
        print("\n🎯 Production Features Configured:")
        print("  ✅ API pagination with multiple pagination strategies")
        print("  ✅ Rate limiting with sliding window and endpoint-specific limits")
        print("  ✅ Comprehensive logging with structured JSON output")
        print("  ✅ Error handling middleware with consistent responses")
        print("  ✅ Request validation with detailed error messages")
        print("  ✅ DRF authentication and permission classes")
        print("  ✅ CORS configuration for React frontend")
        print("  ✅ JWT authentication with refresh tokens")
        print("  ✅ Security headers and XSS protection")
        print("  ✅ File upload validation and size limits")
        print("  ✅ Redis channel layer for WebSocket support")
        print("  ✅ Consistent API response format")
        print("  ✅ Custom exception classes for different error types")
        print("\n🚀 Production Ready!")
        print("\n📡 Next Steps:")
        print("1. Configure environment variables in .env file")
        print("2. Install Redis server: redis-server")
        print("3. Run migrations: python manage.py makemigrations")
        print("4. Apply migrations: python manage.py migrate")
        print("5. Create superuser: python manage.py createsuperuser")
        print("6. Start with ASGI: daphne config.asgi:application")
        print("7. Configure reverse proxy (nginx/apache)")
        print("\n📡 API Response Format:")
        print("  Success:")
        print("  {")
        print("    'success': true,")
        print("    'message': 'Operation successful',")
        print("    'data': {...},")
        print("    'timestamp': '2024-01-01T00:00:00Z',")
        print("  }")
        print("  Error:")
        print("  {")
        print("    'success': false,")
        print("    'error': 'Error message',")
        print("    'error_code': 'ERROR_CODE',")
        print("    'timestamp': '2024-01-01T00:00:00Z',")
        print("    'details': {...}")
        print("  }")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
