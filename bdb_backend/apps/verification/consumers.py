import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .notifications import GROUP_NAME


class LockNotificationConsumer(AsyncWebsocketConsumer):
    """
    ws://.../ws/verification/locks/
    Every connected counter UI joins this group and receives lock/unlock
    events instantly instead of polling every 3-5s.
    """

    async def connect(self):
        if not self.scope["user"] or not self.scope["user"].is_authenticated:
            await self.close(code=4401)
            return
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
