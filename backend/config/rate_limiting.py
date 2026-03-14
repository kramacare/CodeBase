"""
Rate limiting middleware for API endpoints.
"""
import time
import json
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from rest_framework import status
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """Rate limiting middleware using Django cache."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        """Rate limiting logic."""
        # Get client IP
        ip_address = self.get_client_ip(request)
        
        # Get rate limit configuration
        rate_limit = getattr(settings, 'RATE_LIMIT', 100)  # requests per hour
        rate_limit_period = getattr(settings, 'RATE_LIMIT_PERIOD', 3600)  # 1 hour
        
        # Check if user is authenticated (higher limits for authenticated users)
        if request.user.is_authenticated:
            rate_limit = getattr(settings, 'RATE_LIMIT_AUTH', 1000)
            rate_limit_period = getattr(settings, 'RATE_LIMIT_PERIOD_AUTH', 3600)
        
        # Create cache key
        cache_key = f"rate_limit:{ip_address}:{request.user.id if request.user.is_authenticated else 'anonymous'}"
        
        # Get current request count
        current_requests = cache.get(cache_key, 0)
        
        # Check if rate limit exceeded
        if current_requests >= rate_limit:
            logger.warning(f"Rate limit exceeded for IP: {ip_address}")
            
            response = JsonResponse({
                'success': False,
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Maximum {rate_limit} requests per {rate_limit_period} seconds.',
                'retry_after': rate_limit_period,
                'current_requests': current_requests
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Add rate limit headers
            response['X-RateLimit-Limit'] = str(rate_limit)
            response['X-RateLimit-Remaining'] = '0'
            response['X-RateLimit-Reset'] = str(rate_limit_period)
            
            return response
        
        # Increment request count
        cache.set(cache_key, current_requests + 1, rate_limit_period)
        
        # Add rate limit headers to response
        response = self.get_response(request)
        response['X-RateLimit-Limit'] = str(rate_limit)
        response['X-RateLimit-Remaining'] = str(rate_limit - current_requests - 1)
        response['X-RateLimit-Reset'] = str(rate_limit_period)
        
        return response
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AdvancedRateLimitMiddleware(RateLimitMiddleware):
    """Advanced rate limiting with different limits per endpoint."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        
        # Rate limits per endpoint type
        self.rate_limits = {
            'auth': {'limit': 5, 'window': 300},      # 5 requests per 5 minutes
            'upload': {'limit': 3, 'window': 3600},     # 3 uploads per hour
            'search': {'limit': 30, 'window': 60},       # 30 searches per minute
            'default': {'limit': 100, 'window': 3600},   # 100 requests per hour
        }
    
    def __call__(self, request):
        """Advanced rate limiting with endpoint-specific limits."""
        ip_address = self.get_client_ip(request)
        path = request.path
        
        # Get rate limit for this endpoint
        rate_limit_config = self.get_rate_limit_for_path(path)
        
        if not rate_limit_config:
            return self.get_response(request)
        
        cache_key = f"rate_limit:{ip_address}:{path}"
        current_requests = cache.get(cache_key, 0)
        
        # Check if rate limit exceeded
        if current_requests >= rate_limit_config['limit']:
            logger.warning(f"Rate limit exceeded for IP: {ip_address}, Path: {path}")
            
            response = JsonResponse({
                'success': False,
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Maximum {rate_limit_config["limit"]} requests per {rate_limit_config["window"]} seconds.',
                'retry_after': rate_limit_config['window'],
                'limit_type': rate_limit_config.get('type', 'default'),
                'current_requests': current_requests
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Add rate limit headers
            response['X-RateLimit-Limit'] = str(rate_limit_config['limit'])
            response['X-RateLimit-Remaining'] = '0'
            response['X-RateLimit-Reset'] = str(rate_limit_config['window'])
            response['X-RateLimit-Type'] = rate_limit_config.get('type', 'default')
            
            return response
        
        # Increment request count
        cache.set(cache_key, current_requests + 1, rate_limit_config['window'])
        
        response = self.get_response(request)
        response['X-RateLimit-Limit'] = str(rate_limit_config['limit'])
        response['X-RateLimit-Remaining'] = str(rate_limit_config['limit'] - current_requests - 1)
        response['X-RateLimit-Reset'] = str(rate_limit_config['window'])
        response['X-RateLimit-Type'] = rate_limit_config.get('type', 'default')
        
        return response
    
    def get_rate_limit_for_path(self, path):
        """Get rate limit configuration for a specific path."""
        if '/auth/' in path:
            return self.rate_limits['auth']
        elif '/upload/' in path:
            return self.rate_limits['upload']
        elif '/search/' in path:
            return self.rate_limits['search']
        else:
            return self.rate_limits['default']


class SlidingWindowRateLimitMiddleware:
    """Sliding window rate limiting for more accurate control."""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.window_size = getattr(settings, 'RATE_WINDOW_SIZE', 60)  # requests in time window
        self.max_requests = getattr(settings, 'RATE_MAX_REQUESTS', 100)
    
    def __call__(self, request):
        """Sliding window rate limiting."""
        ip_address = self.get_client_ip(request)
        current_time = time.time()
        
        # Get request history from cache
        cache_key = f"rate_history:{ip_address}"
        request_history = cache.get(cache_key, [])
        
        # Remove old requests outside the window
        cutoff_time = current_time - self.window_size
        request_history = [req_time for req_time in request_history if req_time > cutoff_time]
        
        # Check if rate limit exceeded
        if len(request_history) >= self.max_requests:
            logger.warning(f"Sliding window rate limit exceeded for IP: {ip_address}")
            
            response = JsonResponse({
                'success': False,
                'error': 'Rate limit exceeded',
                'message': f'Too many requests. Maximum {self.max_requests} requests per {self.window_size} seconds.',
                'window_size': self.window_size,
                'current_requests': len(request_history)
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            return response
        
        # Add current request to history
        request_history.append(current_time)
        cache.set(cache_key, request_history, self.window_size)
        
        response = self.get_response(request)
        response['X-RateLimit-Limit'] = str(self.max_requests)
        response['X-RateLimit-Remaining'] = str(max(0, self.max_requests - len(request_history)))
        response['X-RateLimit-Window'] = str(self.window_size)
        
        return response
