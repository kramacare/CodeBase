from django.urls import path
from .views import send_report_view

urlpatterns = [
    # Report sending endpoint
    path('send/', send_report_view, name='send-report'),
]
