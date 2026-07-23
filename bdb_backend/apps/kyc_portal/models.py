"""
Read-only wrappers around the EXISTING KYC Portal DB tables (Kyc_DB_new_3).
managed=False everywhere: Django never creates/alters these tables — they
already exist and are owned by the KYC Portal system. Routed to the
'kyc_db' connection by config.db_router.KycPortalRouter.

Column mapping confirmed against real data (2026-07-23):
  - users.access_code       -> card tapped at the HID reader (SiPass)
  - users.sap_code          -> matches members_master.customer_code directly
  - users.elegible_user     -> Voting Eligibility (0/1) -- ALREADY EXISTS
  - users.profile_picture   -> Photograph path -- ALREADY EXISTS
  - members_master.active_status         -> "Y" / "N" (2 legacy "1" rows seen — treat as "N")
  - members_master.membership_fees_status -> "Paid" / "Unpaid"
  - kyc_submissions.status  -> "Approved" = KYC Yes, else No

CONFIRMED: same access_code CAN map to multiple `users` rows (multiple
customer_code / entities under one representative) -> this IS Scenario B
(multi-entity). See apps.verification.services.lookup_by_card.

NOT present anywhere in this DB (election-specific, stored in BDB_Voting
instead — see apps.verification.models.EntityVotingExtras):
  - Voting Eligibility Remark (free text)
  - Total Ballot to be issued (Category / Exclusive)
"""
from django.db import models


class KycUser(models.Model):
    """Maps to `users` — the Authorized Representative + their access card."""

    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    sap_code = models.CharField(max_length=50, blank=True, null=True)  # == members_master.customer_code
    name = models.CharField(max_length=255, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    mobile = models.CharField(max_length=20, blank=True, null=True)
    access_code = models.CharField(max_length=50, blank=True, null=True)  # SiPass access card number
    elegible_user = models.BooleanField(default=False)  # Voting Eligibility (real column, name as-is in DB)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)  # Photograph path
    role_id = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "users"

    def __str__(self):
        return f"{self.name} ({self.access_code or 'no card'})"


class MembersMaster(models.Model):
    """Maps to `members_master` — the Entity record."""

    membership_no = models.CharField(max_length=50, blank=True, null=True)
    customer_code = models.CharField(max_length=50, unique=True)
    member_name = models.CharField(max_length=255)
    group_name = models.CharField(max_length=100, blank=True, null=True)
    entity_type = models.CharField(max_length=100, blank=True, null=True)
    member_category = models.CharField(max_length=100, blank=True, null=True)
    membership_fees_status = models.CharField(max_length=20, blank=True, null=True)  # "Paid" / "Unpaid"
    pan_no = models.CharField(max_length=20, blank=True, null=True)
    tan_no = models.CharField(max_length=20, blank=True, null=True)
    dispute_status = models.CharField(max_length=50, blank=True, null=True)
    folio_no = models.CharField(max_length=50, blank=True, null=True)
    active_status = models.CharField(max_length=10, blank=True, null=True)  # "Y" / "N" (rare legacy "1")
    mobile = models.CharField(max_length=20, blank=True, null=True)
    email = models.CharField(max_length=254, blank=True, null=True)
    sub_category = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "members_master"

    def __str__(self):
        return f"{self.member_name} ({self.membership_no})"

    @property
    def is_membership_active(self):
        return self.active_status == "Y"

    @property
    def is_fee_paid(self):
        return self.membership_fees_status == "Paid"


class KycSubmission(models.Model):
    """Maps to `kyc_submissions` — used to derive KYC Status per customer_code."""

    kyc_id = models.CharField(max_length=50, blank=True, null=True)
    submission_type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)  # "Approved" / "Pending" / "Rejected" / "Initiated"
    submitted_at = models.DateTimeField(blank=True, null=True)
    customer_code = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "kyc_submissions"

    @classmethod
    def latest_status_for(cls, customer_code):
        latest = (
            cls.objects.filter(customer_code=customer_code)
            .order_by("-submitted_at", "-id")
            .first()
        )
        return latest.status if latest else None

    @classmethod
    def is_kyc_approved(cls, customer_code):
        return cls.latest_status_for(customer_code) == "Approved"
