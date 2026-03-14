from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.conf import settings
import psutil


@api_view(['GET'])
@permission_classes([])
def health_check_view(request):
    """Health check endpoint for monitoring."""
    try:
        # Check database connection
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        # Check system resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_data = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0.0',
            'environment': settings.DEBUG and 'development' or 'production',
            'system': {
                'cpu_usage': f"{cpu_percent}%",
                'memory_usage': f"{memory.percent}%",
                'disk_usage': f"{disk.percent}%",
                'memory_available': f"{memory.available / (1024**3):.2f} GB",
                'disk_free': f"{disk.free / (1024**3):.2f} GB"
            },
            'database': {
                'status': 'connected',
                'connection': 'ok'
            },
            'services': {
                'api': 'running',
                'database': 'running',
                'cache': 'running' if 'redis' in settings.CACHES else 'disabled'
            }
        }
        
        return Response(health_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'unhealthy',
            'timestamp': timezone.now().isoformat(),
            'error': str(e)
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)


@api_view(['GET'])
@permission_classes([])
def api_info_view(request):
    """API information endpoint."""
    return Response({
        'name': 'QueueSmart API',
        'version': '1.0.0',
        'description': 'Healthcare Queue Management System API',
        'documentation': '/api/v1/docs/',
        'endpoints': {
            'authentication': '/api/v1/auth/',
            'clinics': '/api/v1/clinics/',
            'queue': '/api/v1/queue/',
            'appointments': '/api/v1/appointments/',
            'reviews': '/api/v1/reviews/',
            'reports': '/api/v1/reports/'
        },
        'status': 'operational'
    })
