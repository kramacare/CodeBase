"""URL configuration for krama project."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/clinics/', include('apps.clinics.urls')),
    path('api/v1/queue/', include('apps.queue.urls')),
    path('api/v1/appointments/', include('apps.appointments.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    
    # Health check
    path('health/', include('apps.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
