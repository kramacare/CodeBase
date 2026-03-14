from django.urls import path
from .views import (
    join_queue_view,
    get_queue_view,
    get_live_queue_view,
    call_next_view,
    skip_patient_view,
    update_token_view,
    my_queue_view
)

urlpatterns = [
    # Queue management endpoints
    path('join/', join_queue_view, name='join-queue'),
    path('live/<int:doctor_id>/', get_live_queue_view, name='live-queue'),
    path('call-next/', call_next_view, name='call-next'),
    path('skip/', skip_patient_view, name='skip-patient'),
    path('complete/', update_token_view, name='update-token'),
    
    # Queue viewing endpoints
    path('<int:clinic_id>/', get_queue_view, name='clinic-queue'),
    path('my/', my_queue_view, name='my-queue'),
]
