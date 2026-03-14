#!/usr/bin/env python
"""
Minimal test settings file.
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Basic Django settings
DEBUG = False
SECRET_KEY = 'django-insecure-test-key-for-production-only'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'test_db',
    'USER': 'test_user',
        'PASSWORD': 'test_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'apps.accounts',
    'apps.clinics',
    'apps.queue',
    'apps.appointments',
    'apps.reports',
]

# Test the setup
try:
    import django
    django.setup()
    print('✅ Minimal Django setup successful')
except Exception as e:
    print(f'❌ Django setup failed: {e}')

if __name__ == '__main__':
    print('✅ Minimal settings test complete')
