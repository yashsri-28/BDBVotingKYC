"""
ASGI config for the Election Verification Module.
Routes WebSocket connections to the verification app's lock-notification
consumer (real-time "locked by another counter" updates), HTTP as normal.
"""
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from apps.verification.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
