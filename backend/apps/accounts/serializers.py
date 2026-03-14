from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import User, PatientProfile, ClinicProfile

User = get_user_model()


class PatientSignupSerializer(serializers.ModelSerializer):
    """Serializer for patient registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'confirm_password', 'phone', 'date_of_birth')
        extra_kwargs = {'role': {'default': 'PATIENT'}}
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # Validate password strength
        validate_password(attrs['password'])
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        validated_data['role'] = 'PATIENT'
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create patient profile
        PatientProfile.objects.create(user=user)
        
        return user


class ClinicSignupSerializer(serializers.ModelSerializer):
    """Serializer for clinic registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    clinic_name = serializers.CharField(max_length=200)
    address = serializers.CharField()
    license_number = serializers.CharField(max_length=100, required=False)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'confirm_password', 'phone', 'clinic_name', 'address', 'license_number')
        extra_kwargs = {'role': {'default': 'CLINIC'}}
    
    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        
        # Validate password strength
        validate_password(attrs['password'])
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Extract clinic profile data
        clinic_name = validated_data.pop('clinic_name')
        address = validated_data.pop('address')
        license_number = validated_data.pop('license_number', '')
        
        validated_data['role'] = 'CLINIC'
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create clinic profile
        ClinicProfile.objects.create(
            user=user,
            clinic_name=clinic_name,
            address=address,
            license_number=license_number
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password.')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile display."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'role', 'phone', 'date_of_birth', 'is_verified', 'created_at')


class PatientProfileSerializer(serializers.ModelSerializer):
    """Serializer for patient profile."""
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = PatientProfile
        fields = '__all__'


class ClinicProfileSerializer(serializers.ModelSerializer):
    """Serializer for clinic profile."""
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = ClinicProfile
        fields = '__all__'
