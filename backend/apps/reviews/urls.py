from django.urls import path
from .views import (
    ReviewCreateView,
    clinic_reviews_view,
    my_reviews_view,
    review_stats_view,
    delete_review_view,
    clinic_summary_view
)

urlpatterns = [
    # Main review endpoints
    path('', ReviewCreateView.as_view(), name='review-create'),
    
    # Clinic review endpoints
    path('clinics/<int:clinic_id>/', clinic_reviews_view, name='clinic-reviews'),
    path('clinics/<int:clinic_id>/stats/', review_stats_view, name='clinic-review-stats'),
    path('clinics/<int:clinic_id>/summary/', clinic_summary_view, name='clinic-summary'),
    
    # Patient review endpoints
    path('my/', my_reviews_view, name='my-reviews'),
    
    # Review management
    path('<int:review_id>/delete/', delete_review_view, name='delete-review'),
]
