from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """Append-only audit trail (BRD rule #7: maintain audit logs for every action)."""

    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="audit_logs")
    action = models.CharField(max_length=100)
    # Soft reference, not a DB FK: the entity/member lives in Kyc_DB_new_3
    # (a different database on the same server) — see config/db_router.py.
    entity_customer_code = models.CharField(max_length=50, null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    # class Meta:
    #     ordering = ["-timestamp"]
    #     indexes = [models.Index(fields=["action", "timestamp"])]
    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["action", "timestamp"]),
            models.Index(fields=["entity_customer_code"]),
        ]

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M:%S}] {self.actor} — {self.action}"

    @classmethod
    def record(cls, *, actor, action, entity_customer_code=None, details=None, ip_address=None):
        return cls.objects.create(
            actor=actor, action=action, entity_customer_code=entity_customer_code,
            details=details or {}, ip_address=ip_address,
        )
