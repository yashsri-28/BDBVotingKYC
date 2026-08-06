from django.db import models


class CardTap(models.Model):
    """
    A single real card/credential scan event, coming from the physical
    reader feed (.exe -> POST /sipass/scan/). Persisted in the DB so
    taps survive a server restart -- unlike mock_client's in-memory
    list, which only exists for the dev/demo simulate-tap flow.
    """

    access_card_number = models.CharField(max_length=50, db_index=True)  # raw credential_no from the reader
    reader_name = models.CharField(max_length=100, blank=True)  # device_id from the .exe config
    tapped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-tapped_at"]
        indexes = [
            models.Index(fields=["access_card_number"]),
            models.Index(fields=["tapped_at"]),
        ]

    def __str__(self):
        return f"{self.access_card_number} @ {self.tapped_at}"