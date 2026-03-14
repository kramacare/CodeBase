from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from django.utils import timezone
from .models import Review
from .serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
    ClinicReviewSerializer,
    ReviewStatsSerializer
)


class ReviewCreateView(generics.CreateAPIView):
    """Create new review."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReviewCreateSerializer
    
    def perform_create(self, serializer):
        # Only patients can create reviews
        if self.request.user.role != 'PATIENT':
            raise permissions.PermissionDenied("Only patients can create reviews.")
        serializer.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def clinic_reviews_view(request, clinic_id):
    """Get all reviews for a specific clinic."""
    try:
        from apps.clinics.models import Clinic
        clinic = Clinic.objects.get(id=clinic_id)
    except Clinic.DoesNotExist:
        return Response(
            {'error': 'Clinic not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get query parameters
    rating_filter = request.GET.get('rating')
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 10))
    
    # Build queryset
    queryset = Review.objects.filter(clinic=clinic)
    
    if rating_filter:
        try:
            rating = int(rating_filter)
            if 1 <= rating <= 5:
                queryset = queryset.filter(rating=rating)
        except ValueError:
            pass
    
    # Order by most recent
    queryset = queryset.order_by('-created_at')
    
    # Pagination
    start = (page - 1) * page_size
    end = start + page_size
    reviews = queryset[start:end]
    
    # Serialize reviews
    serializer = ClinicReviewSerializer(reviews, many=True)
    
    # Calculate statistics
    stats = calculate_clinic_review_stats(clinic)
    stats_serializer = ReviewStatsSerializer(stats)
    
    return Response({
        'message': 'Clinic reviews retrieved successfully',
        'clinic': {
            'id': clinic.id,
            'name': clinic.name
        },
        'reviews': serializer.data,
        'stats': stats_serializer.data,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': queryset.count(),
            'has_next': end < queryset.count()
        }
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_reviews_view(request):
    """Get current user's reviews."""
    user = request.user
    if user.role != 'PATIENT':
        return Response(
            {'error': 'Only patients can access this endpoint'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        patient_profile = user.patient_profile
    except:
        return Response(
            {'error': 'Patient profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get query parameters
    clinic_filter = request.GET.get('clinic')
    rating_filter = request.GET.get('rating')
    
    # Build queryset
    queryset = Review.objects.filter(patient=patient_profile)
    
    if clinic_filter:
        queryset = queryset.filter(clinic_id=clinic_filter)
    
    if rating_filter:
        try:
            rating = int(rating_filter)
            if 1 <= rating <= 5:
                queryset = queryset.filter(rating=rating)
        except ValueError:
            pass
    
    # Order by most recent
    queryset = queryset.order_by('-created_at')
    
    # Serialize reviews
    serializer = ReviewSerializer(queryset, many=True)
    
    return Response({
        'message': 'Your reviews retrieved successfully',
        'reviews': serializer.data,
        'total': len(serializer.data)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def review_stats_view(request, clinic_id):
    """Get review statistics for a clinic."""
    try:
        from apps.clinics.models import Clinic
        clinic = Clinic.objects.get(id=clinic_id)
    except Clinic.DoesNotExist:
        return Response(
            {'error': 'Clinic not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate statistics
    stats = calculate_clinic_review_stats(clinic)
    serializer = ReviewStatsSerializer(stats)
    
    return Response({
        'message': 'Review statistics retrieved successfully',
        'clinic': {
            'id': clinic.id,
            'name': clinic.name
        },
        'stats': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_review_view(request, review_id):
    """Delete a review."""
    user = request.user
    
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response(
            {'error': 'Review not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check permissions - only the patient who wrote the review can delete it
    if user.role != 'PATIENT' or review.patient.user != user:
        return Response(
            {'error': 'You can only delete your own reviews'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Delete review
    review.delete()
    
    return Response({
        'message': 'Review deleted successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def clinic_summary_view(request, clinic_id):
    """Get clinic summary with rating information."""
    try:
        from apps.clinics.models import Clinic
        clinic = Clinic.objects.get(id=clinic_id)
    except Clinic.DoesNotExist:
        return Response(
            {'error': 'Clinic not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Calculate statistics
    stats = calculate_clinic_review_stats(clinic)
    
    # Get recent reviews (first 3)
    recent_reviews = Review.objects.filter(clinic=clinic).order_by('-created_at')[:3]
    recent_serializer = ClinicReviewSerializer(recent_reviews, many=True)
    
    return Response({
        'message': 'Clinic summary retrieved successfully',
        'clinic': {
            'id': clinic.id,
            'name': clinic.name,
            'address': clinic.address,
            'phone': clinic.phone
        },
        'rating_summary': {
            'average_rating': stats['average_rating'],
            'total_reviews': stats['total_reviews'],
            'rating_display': f"{stats['average_rating']:.1f}" if stats['average_rating'] > 0 else "No reviews"
        },
        'recent_reviews': recent_serializer.data
    }, status=status.HTTP_200_OK)


def calculate_clinic_review_stats(clinic):
    """Calculate review statistics for a clinic."""
    queryset = Review.objects.filter(clinic=clinic)
    
    # Total reviews
    total_reviews = queryset.count()
    
    # Average rating
    avg_rating = queryset.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    # Rating distribution
    rating_distribution = {}
    for rating in range(1, 6):
        count = queryset.filter(rating=rating).count()
        rating_distribution[str(rating)] = count
    
    return {
        'total_reviews': total_reviews,
        'average_rating': round(avg_rating, 2),
        'rating_distribution': rating_distribution
    }
