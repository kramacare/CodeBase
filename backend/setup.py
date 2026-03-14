#!/usr/bin/env python
"""
Setup script for QueueSmart Django backend.
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

def main():
    """Run setup commands."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    try:
        # Run migrations
        print("🔄 Running database migrations...")
        execute_from_command_line(sys.argv, ['django', 'migrate'])
        
        # Create superuser (optional)
        print("\n📝 To create a superuser, run:")
        print("python manage.py createsuperuser")
        
        # Collect static files
        print("\n📦 Collecting static files...")
        execute_from_command_line(sys.argv, ['django', 'collectstatic', '--noinput'])
        
        print("\n✅ Setup completed successfully!")
        print("\n🚀 Start the server with:")
        print("python manage.py runserver")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
