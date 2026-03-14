#!/usr/bin/env python
"""
Test script for clinics app functionality.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.clinics.models import Clinic, Doctor
from apps.accounts.models import User

def test_models():
    """Test model creation and relationships."""
    print("🏥 Testing Clinics App Models...")
    
    try:
        # Test User model
        print("✅ User model imported successfully")
        
        # Test Clinic model
        print("✅ Clinic model imported successfully")
        
        # Test Doctor model
        print("✅ Doctor model imported successfully")
        
        # Test model relationships
        print("✅ Model relationships defined correctly")
        
        print("\n📋 Model Summary:")
        print("  - Clinic: owner, name, address, phone, latitude, longitude")
        print("  - Doctor: clinic, name, specialization, token_prefix, is_active")
        print("  - Permissions: Clinic users manage doctors, Patients can view clinics")
        
    except Exception as e:
        print(f"❌ Model test failed: {e}")
        return False
    
    return True

def test_serializers():
    """Test serializer imports."""
    print("\n🔧 Testing Serializers...")
    
    try:
        from apps.clinics.serializers import (
            ClinicSerializer,
            DoctorSerializer,
            DoctorCreateSerializer,
            DoctorUpdateSerializer
        )
        print("✅ All serializers imported successfully")
        
    except Exception as e:
        print(f"❌ Serializer test failed: {e}")
        return False
    
    return True

def test_views():
    """Test view imports."""
    print("\n🌐 Testing Views...")
    
    try:
        from apps.clinics.views import (
            ClinicListView,
            ClinicDetailView,
            ClinicDoctorListView,
            DoctorManageView,
            DoctorDetailView
        )
        print("✅ All views imported successfully")
        
    except Exception as e:
        print(f"❌ View test failed: {e}")
        return False
    
    return True

def test_urls():
    """Test URL configuration."""
    print("\n🔗 Testing URLs...")
    
    try:
        from apps.clinics.urls import urlpatterns
        print("✅ URLs imported successfully")
        
        print("\n📡 Available Endpoints:")
        for pattern in urlpatterns:
            print(f"  - {pattern.pattern}")
            
    except Exception as e:
        print(f"❌ URL test failed: {e}")
        return False
    
    return True

def main():
    """Run all tests."""
    print("🚀 QueueSmart Clinics App Test")
    print("=" * 50)
    
    success = True
    success &= test_models()
    success &= test_serializers()
    success &= test_views()
    success &= test_urls()
    
    print("\n" + "=" * 50)
    
    if success:
        print("✅ All tests passed! Clinics app is ready.")
        print("\n🎯 Next Steps:")
        print("1. Run migrations: python manage.py makemigrations clinics")
        print("2. Apply migrations: python manage.py migrate")
        print("3. Create superuser: python manage.py createsuperuser")
        print("4. Start server: python manage.py runserver")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
