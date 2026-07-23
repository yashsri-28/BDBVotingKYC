"""
Broadcasts real-time lock state changes over WebSocket (Django Channels)
so every counter's UI updates instantly instead of polling.
"""
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

GROUP_NAME = "verification_locks"


def broadcast_lock_event(event_type, customer_code, locked_by_username=None, counter_number=None):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        GROUP_NAME,
        {
            "type": "lock.event",
            "event": event_type,  # "locked" | "unlocked"
            "customer_code": customer_code,
            "locked_by": locked_by_username,
            "counter_number": counter_number,
        },
    )
