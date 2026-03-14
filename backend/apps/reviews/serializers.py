from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Review

User = get_user_model()


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model."""
    patient_name = serializers.CharField(source='patient_name', read_only=True)
    patient_email = serializers.CharField(source='patient_email', read_only=True)
    clinic_name = serializers.CharField(source='clinic.name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'patient', 'patient_name', 'patient_email',
            'clinic', 'clinic_name', 'rating', 'comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews."""
    
    class Meta:
        model = Review
        fields = [
            'clinic', 'rating', 'comment'
        ]
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5."""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def validate_clinic(self, value):
        """Validate that user is not reviewing their own clinic."""
        user = self.context['request'].user
        
        # Check if user is clinic owner
        if hasattr(user, 'clinic_profile') and user.clinic_profile == value:
            raise serializers.ValidationError("You cannot review your own clinic.")
        
        return value
    
    def create(self, validated_data):
        """Create review with current user as patient."""
        user = self.context['request'].user
        
        # Only patients can create reviews
        if user.role != 'PATIENT':
            raise serializers.ValidationError("Only patients can create reviews.")
        
        # Get patient profile
        try:
            patient = user.patient_profile
        except:
            raise serializers.ValidationError("Patient profile not found.")
        
        # Check if patient already reviewed this clinic
        if Review.objects.filter(patient=patient, clinic=validated_data['clinic']).exists():
            raise serializers.ValidationError("You have already reviewed this clinic.")
        
        # Create review
        review = Review.objects.create(
            patient=patient,
            **validated_data
        )
        
        return review


class ClinicReviewSerializer(serializers.ModelSerializer):
    """Serializer for clinic reviews with patient details."""
    patient_name = serializers.CharField(source='patient_name', read_only=True)
    patient_initial = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'patient_name', 'patient_initial', 'rating', 'comment',
            'created_at', 'time_ago'
        ]
        read_only_fields = ['created_at']
    
    def get_patient_initial(self, obj):
        """Get patient's initial for privacy."""
        name = obj.patient_name
        if name and len(name) > 0:
            return name[0].upper()
        return "A"
    
    def get_time_ago(self, obj):
        """Get human readable time ago."""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=30):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        else:
            return obj.created_at.strftime("%B %d, %Y")


class ReviewStatsSerializer(serializers.Serializer):
    """Serializer for review statistics."""
    total_reviews = serializers.IntegerField()
    average_rating = serializers.FloatField()
    rating_distribution = serializers.DictField()
    
    def to_representation(self, instance):
        """Format the rating distribution."""
        data = super().to_representation(instance)
        
        # Format rating distribution with percentages
        total = data['total_reviews']
        if total > 0:
            distribution = {}
            for rating in range(1, 6):
                count = data['rating_distribution'].get(str(rating), 0)
                percentage = (count / total) * 100
                distribution[str(rating)] = {
                    'count': count,
                    'percentage': round(percentage, 1)
                }
            data['rating_distribution'] = distribution
        else:
            data['rating_distribution'] = {
                str(rating): {'count': 0, 'percentage': 0.0}
                for rating in range(1, 6)
            }
        
        return data
