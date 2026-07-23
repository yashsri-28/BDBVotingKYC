"""
Election-module-owned tables — live in BDB_Voting (the 'default' DB).

Entities/representatives live in Kyc_DB_new_3 (a different database on the
same server), so there are NO real foreign keys to them here — every link
is a soft reference via customer_code, resolved in application code
(apps/kyc_portal/services.py) rather than a SQL join.
"""
from django.conf import settings
from django.db import models


class EntityVotingExtras(models.Model):
    """
    The two BRD fields that genuinely don't exist anywhere in the KYC
    Portal DB yet — election-specific, so they live here instead:
      - Voting Eligibility Remark (free text)
      - Total Ballot to be issued (Category / Exclusive)
    Everything else (membership status, fee status, KYC status, voting
    eligibility itself, photograph) already exists in Kyc_DB_new_3.
    """
    customer_code = models.CharField(max_length=50, unique=True)
    voting_eligibility_remark = models.TextField(blank=True)
    total_ballot_category = models.PositiveIntegerField(default=0)
    total_ballot_exclusive = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Voting extras for {self.customer_code}"


class VerificationRecord(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        VERIFIED_SENT = "verified_sent", "Verified and Sent for Vote"
        NOT_ELIGIBLE = "not_eligible", "Not Eligible to Vote"

    customer_code = models.CharField(max_length=50)  # soft ref -> members_master.customer_code
    representative_name = models.CharField(max_length=255, blank=True)
    access_card_number = models.CharField(max_length=50, blank=True)
    verification_status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    rejection_reason = models.CharField(max_length=255, blank=True, null=True)
    verified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    verification_counter = models.CharField(max_length=20, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["customer_code"],
                condition=models.Q(verification_status="verified_sent"),
                name="unique_verified_sent_per_customer_code",
            )
        ]
        indexes = [models.Index(fields=["customer_code"])]

    def __str__(self):
        return f"{self.customer_code} — {self.verification_status}"


class RecordLock(models.Model):
    """Prevents two counters from verifying the same entity simultaneously (BRD rule #8)."""

    customer_code = models.CharField(max_length=50, unique=True)  # soft ref
    locked_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    locked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lock on {self.customer_code} by {self.locked_by}"


REJECTION_REASONS = [
    "Membership Status is not Active",
    "Voting Eligibility is Not Eligible",
    "Annual Membership Fee is Unpaid",
    "KYC Not Completed",
    "Photograph mismatch — Supervisor approval required",
    "Other",
]
