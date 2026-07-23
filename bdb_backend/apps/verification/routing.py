from django.urls import re_path
from .consumers import LockNotificationConsumer

websocket_urlpatterns = [
    re_path(r"ws/verification/locks/$", LockNotificationConsumer.as_asgi()),
]
