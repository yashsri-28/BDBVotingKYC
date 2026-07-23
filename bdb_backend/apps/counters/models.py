from django.conf import settings
from django.db import models


class CounterMapping(models.Model):
    """Maps a Counter Staff login to the physical HID reader/counter they operate."""
    staff = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="counter_mapping")
    hid_reader_name = models.CharField(max_length=100, unique=True)
    counter_number = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Counter {self.counter_number} ({self.hid_reader_name}) — {self.staff}"
