from django.urls import path
from .views import health_check_view, api_info_view

urlpatterns = [
    path('', health_check_view, name='health-check'),
    path('info/', api_info_view, name='api-info'),
]
