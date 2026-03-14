"""
ASGI config for krama project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security import AllowedHostsOriginValidator
from channels.sessions import SessionMiddlewareStack
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import apps.queue.routing

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        SessionMiddlewareStack(
            URLRouter(
                apps.queue.routing.websocket_urlpatterns
            )
        ),
    ),
})

# HTTP requests go through Django
application = get_asgi_application()
