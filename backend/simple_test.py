#!/usr/bin/env python
"""
Simple test for production setup.
"""
import os
import sys

# Setup environment
os.environ['PYTHONIOENCODING'] = 'utf-8'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

def test_basic_setup():
    """Test basic Django setup."""
    try:
        import django
        django.setup()
        print('✅ Django setup successful')
        return True
    except Exception as e:
        print(f'❌ Django setup failed: {e}')
        return False

def test_imports():
    """Test key imports."""
    print('🔧 Testing Key Imports...')
    
    try:
        # Test DRF
        from rest_framework import status
        print('✅ Django REST Framework imported')
        
        # Test JWT
        from rest_framework_simplejwt import AccessToken
        print('✅ JWT authentication imported')
        
        # Test our custom modules
        from config.exceptions import QueueSmartException
        print('✅ Custom exceptions imported')
        
        from config.pagination import StandardResultsSetPagination
        print('✅ Pagination classes imported')
        
        from config.utils import success_response
        print('✅ Utility functions imported')
        
        return True
    except Exception as e:
        print(f'❌ Import test failed: {e}')
        return False

def main():
    """Run simple tests."""
    print('🚀 QueueSmart Production Setup Test')
    print('=' * 50)
    
    success = True
    success &= test_basic_setup()
    success &= test_imports()
    
    print("\n" + "=" * 50)
    
    if success:
        print("✅ Basic production setup is working!")
        print("\n🎯 Features Ready:")
        print("  ✅ Django setup")
        print("  ✅ DRF configuration")
        print("  ✅ Custom exceptions")
        print("  ✅ Pagination classes")
        print("  ✅ Utility functions")
        print("\n🚀 Ready for Testing!")
    else:
        print("❌ Some issues found. Check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
