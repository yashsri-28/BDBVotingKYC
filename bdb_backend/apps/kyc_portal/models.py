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
    credential_no = models.CharField(max_length=50, null=True, blank=True)

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



# class OnlinePayment(models.Model):
#     """
#     Maps to `online_payments` — the actual payment transaction log.
#     Used to derive Annual Fee Paid/Unpaid status per customer_code,
#     based on the LATEST payment record for that code (replaces
#     members_master.membership_fees_status as the source of truth).
#     """

#     fee_type = models.CharField(max_length=50, blank=True, null=True)
#     payment_year = models.CharField(max_length=20, blank=True, null=True)
#     amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
#     status = models.CharField(max_length=20, blank=True, null=True)  # "Paid" / "pending" / "Failed"
#     payment_date = models.DateTimeField(blank=True, null=True)
#     created_at = models.DateTimeField(blank=True, null=True)
#     customer_code = models.CharField(max_length=50, blank=True, null=True)

#     class Meta:
#         managed = False
#         db_table = "online_payments"

#     @classmethod
#     def latest_status_for(cls, customer_code):
#         latest = (
#             cls.objects.filter(customer_code=customer_code)
#             .order_by("-created_at", "-id")
#             .first()
#         )
#         return latest.status if latest else None

#     @classmethod
#     def is_fee_paid(cls, customer_code):
#         return cls.latest_status_for(customer_code) == "Paid"


class OnlinePayment(models.Model):
    """
    Maps to `payments` — the detailed fee payment ledger, one row per
    invoice/fee cycle, with an explicit from_date/to_date validity range
    per record (confirmed 2026-07-31, replacing the earlier simpler
    online_payments mapping). Used to derive Annual Fee Paid/Unpaid
    status per customer_code: a member is treated as "paid" only when
    they have a "Paid" record whose from_date/to_date window covers
    TODAY's date -- i.e. their payment is valid for the CURRENT
    financial year, not just paid at some point in the past.
    """

    fee_type = models.CharField(max_length=50, blank=True, null=True)
    from_date = models.DateField(blank=True, null=True)
    to_date = models.DateField(blank=True, null=True)
    invoice_doc_num = models.CharField(max_length=50, blank=True, null=True)
    invoice_doc_entry = models.CharField(max_length=50, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    penalty_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    payment_year = models.CharField(max_length=20, blank=True, null=True)
    payment_mode = models.CharField(max_length=50, blank=True, null=True)
    reference_no = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)  # "Paid" / "pending" / "Failed"
    payment_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    customer_code = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "payments"

    @classmethod
    def latest_status_for(cls, customer_code):
        latest = (
            cls.objects.filter(customer_code=customer_code)
            .order_by("-created_at", "-id")
            .first()
        )
        return latest.status if latest else None

    @classmethod
    def is_fee_paid(cls, customer_code):
        """
        True only if there's a "Paid" record for this customer whose
        from_date/to_date window includes today's date -- i.e. the
        payment is valid for the CURRENT financial year.
        """
        from django.utils import timezone
        today = timezone.now().date()
        return cls.objects.filter(
            customer_code=customer_code,
            status="Paid",
            from_date__lte=today,
            to_date__gte=today,
        ).exists()