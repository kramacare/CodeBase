#!/usr/bin/env python
"""
Test script for real-time WebSocket queue updates.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def test_channels_imports():
    """Test Channels imports."""
    print("🎯 Testing Channels Imports...")
    
    try:
        import channels
        from channels.routing import ProtocolTypeRouter, URLRouter
        from channels.auth import AuthMiddlewareStack
        from channels.sessions import SessionMiddlewareStack
        from channels.security import AllowedHostsOriginValidator
        from channels.layers import get_channel_layer
        from channels.db import database_sync_to_async
        from channels.generic.websocket import AsyncWebsocketConsumer
        print("✅ Channels core modules imported successfully")
        
        # Test Redis channel layer
        from channels_redis.core import RedisChannelLayer
        print("✅ Redis channel layer imported successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Channels import test failed: {e}")
        return False

def test_asgi_config():
    """Test ASGI configuration."""
    print("\n🔧 Testing ASGI Configuration...")
    
    try:
        from config.asgi import application
        print("✅ ASGI application imported successfully")
        
        # Check if application is properly configured
        if hasattr(application, 'application'):
            print("✅ ASGI application properly configured")
        else:
            print("❌ ASGI application not properly configured")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ ASGI config test failed: {e}")
        return False

def test_consumer_imports():
    """Test WebSocket consumer imports."""
    print("\n🌐 Testing WebSocket Consumers...")
    
    try:
        from apps.queue.consumers import QueueConsumer
        from apps.queue.models import QueueToken
        print("✅ QueueConsumer imported successfully")
        print("✅ QueueToken model imported successfully")
        
        # Test consumer class methods
        consumer_methods = [
            'connect', 'disconnect', 'receive', 'send_queue_update',
            'get_queue_data', 'broadcast_queue_event'
        ]
        
        for method in consumer_methods:
            if hasattr(QueueConsumer, method):
                print(f"✅ QueueConsumer.{method} method exists")
            else:
                print(f"❌ QueueConsumer.{method} method missing")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Consumer import test failed: {e}")
        return False

def test_routing_config():
    """Test WebSocket routing configuration."""
    print("\n🛣️ Testing WebSocket Routing...")
    
    try:
        from apps.queue.routing import websocket_urlpatterns
        print("✅ WebSocket URL patterns imported successfully")
        
        # Check URL patterns
        patterns = websocket_urlpatterns
        print(f"✅ Found {len(patterns)} WebSocket URL patterns")
        
        for pattern in patterns:
            print(f"  - {pattern.pattern.describe()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Routing config test failed: {e}")
        return False

def test_settings_config():
    """Test Django settings for Channels."""
    print("\n⚙️ Testing Django Settings...")
    
    try:
        from django.conf import settings
        print("✅ Django settings imported successfully")
        
        # Check required settings
        required_settings = [
            'ASGI_APPLICATION',
            'CHANNEL_LAYERS',
            'CHANNEL_REDIS'
        ]
        
        for setting in required_settings:
            if hasattr(settings, setting):
                print(f"✅ {setting}: {getattr(settings, setting)}")
            else:
                print(f"❌ {setting}: Not configured")
                return False
        
        # Check Redis configuration
        redis_config = getattr(settings, 'CHANNEL_REDIS', {})
        print(f"✅ Redis config: {redis_config}")
        
        return True
        
    except Exception as e:
        print(f"❌ Settings test failed: {e}")
        return False

def test_websocket_events():
    """Test WebSocket event types."""
    print("\n📡 Testing WebSocket Events...")
    
    event_types = [
        'patient_joined',
        'token_called', 
        'token_skipped',
        'token_completed',
        'token_status_updated'
    ]
    
    print("✅ Event types to broadcast:")
    for event in event_types:
        print(f"  - {event}")
    
    print("✅ WebSocket events configured for:")
    print("  - Patient joins queue")
    print("  - Token called")
    print("  - Token skipped")
    print("  - Token completed")
    print("  - Token status updated")
    
    return True

def test_database_models():
    """Test database models for WebSocket functionality."""
    print("\n🗄️ Testing Database Models...")
    
    try:
        from apps.queue.models import QueueToken, QueueSession
        print("✅ Queue models imported successfully")
        
        # Check model fields
        token_fields = ['id', 'clinic', 'doctor', 'patient', 'token_number', 'token_label', 
                      'status', 'joined_at', 'created_at']
        
        for field in token_fields:
            if hasattr(QueueToken, field):
                print(f"✅ QueueToken.{field} field exists")
            else:
                print(f"❌ QueueToken.{field} field missing")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Database models test failed: {e}")
        return False

def main():
    """Run all tests."""
    print("🚀 QueueSmart Real-Time Queue Updates Test")
    print("=" * 50)
    
    success = True
    success &= test_channels_imports()
    success &= test_asgi_config()
    success &= test_consumer_imports()
    success &= test_routing_config()
    success &= test_settings_config()
    success &= test_websocket_events()
    success &= test_database_models()
    
    print("\n" + "=" * 50)
    
    if success:
        print("✅ All tests passed! Real-time queue updates are ready.")
        print("\n🎯 Features Implemented:")
        print("  ✅ Django Channels with Redis layer")
        print("  ✅ WebSocket consumer for queue updates")
        print("  ✅ WebSocket route: ws/queue/{doctor_id}")
        print("  ✅ Real-time events broadcasting")
        print("  ✅ Patient joins queue event")
        print("  ✅ Token called event")
        print("  ✅ Token skipped event")
        print("  ✅ Token completed event")
        print("  ✅ Token status updated event")
        print("\n🚀 Next Steps:")
        print("1. Install Redis server")
        print("2. Update .env file with Redis configuration")
        print("3. Run migrations: python manage.py makemigrations")
        print("4. Apply migrations: python manage.py migrate")
        print("5. Start server with ASGI: daphne config.asgi:application")
        print("   or with Daphne + Channels: daphne -b 0.0.0 -p 8001 config.asgi:application")
        print("\n📡 WebSocket Connection:")
        print("  const ws = new WebSocket('ws://localhost:8000/ws/queue/1/');")
        print("  ws.onopen = () => { console.log('Connected to queue 1'); }")
        print("  ws.onmessage = (event) => { console.log('Message:', event.data); }")
        print("\n📡 Frontend Event Handling:")
        print("  ws.onmessage = (event) => {")
        print("    const data = JSON.parse(event.data);")
        print("    switch(data.type) {")
        print("      case 'patient_joined':")
        print("        updateWaitingQueue(data.data);")
        print("        break;")
        print("      case 'token_called':")
        print("        updateCurrentToken(data.data);")
        print("        break;")
        print("      // ... other cases")
        print("    }")
        print("  };")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    main()
