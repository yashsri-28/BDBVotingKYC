import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model

from .notifications import GROUP_NAME

CounterStaff = get_user_model()


@database_sync_to_async
def get_user_from_token(token_str):
    try:
        token = AccessToken(token_str)
        return CounterStaff.objects.get(id=token["user_id"])
    except (TokenError, CounterStaff.DoesNotExist, KeyError):
        return None


class LockNotificationConsumer(AsyncWebsocketConsumer):
    """
    ws://.../ws/verification/locks/?token=<JWT access token>

    Auth here is JWT-based (query param), NOT Django session cookies —
    the frontend is a JWT-only SPA with no session cookie to send.
    Every connected counter UI joins this group and receives lock/unlock
    events instantly instead of polling every 3-5s.
    """

    async def connect(self):
        query_string = self.scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]
        user = await get_user_from_token(token) if token else None

        if user is None:
            await self.close(code=4401)
            return

        self.scope["user"] = user
        await self.channel_layer.group_add(GROUP_NAME, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(GROUP_NAME, self.channel_name)

    async def lock_event(self, event):
        await self.send(text_data=json.dumps({
            "event": event["event"],
            "customer_code": event["customer_code"],
            "locked_by": event.get("locked_by"),
            "counter_number": event.get("counter_number"),
        }))
