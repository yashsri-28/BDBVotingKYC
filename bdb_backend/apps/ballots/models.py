"""
Ballot management (Consolidated Requirements, confirmed 2026-07-28).

Role mapping onto CounterStaff.Role (3 roles, no separate role table):
  Role.ADMIN      -> Super Admin (sets base pools, allots to Counters,
                     creates every login)
  Role.SUPERVISOR -> Counter     (searches an access card, allots ballots
                     directly to the customer codes under it)
  Role.COUNTING   -> Counting    (read-only: All-Counter Matrix, Master Report)

Ballot allotment happens at the customer-code level (CustomerCodeAllotment)
-- there is no separate per-operator sub-entity layer; a Counter's own
distribution numbers are simply the sum of the CustomerCodeAllotment rows
they created.
"""
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class RollType(models.TextChoices):
    CATEGORY = "category", "Category"
    EXCLUSIVE = "exclusive", "Exclusive"


class ElectoralRoll(models.Model):
    """
    The applicable electorate for this election, imported from the
    Category Trade Member and Exclusive Member rolls. Being on this list
    means a member is IN SCOPE for voting -- it does NOT mean they are
    automatically eligible. Eligibility is still decided by the Section 5
    business rules (membership active, fee paid, KYC done) at the counter.

    Confirmed ballot logic (updated 2026-07-29):
      - Every entity (Category or Exclusive, any tier) gets exactly 1 ballot.
      - Tier (I/II/III) still matters for vote-marking CAPACITY during
        counting (apps.counting), not for ballot count at allotment time.
    """

    class CategoryTier(models.TextChoices):
        ONE = "I", "Category I"
        TWO = "II", "Category II"
        THREE = "III", "Category III"

    roll_type = models.CharField(max_length=10, choices=RollType.choices)
    membership_no = models.CharField(max_length=50)
    customer_code = models.CharField(max_length=50, null=True, blank=True)  # soft ref -> members_master
    entity_name = models.CharField(max_length=255)
    representative_name = models.CharField(max_length=255, blank=True)
    representative_email = models.CharField(max_length=255, blank=True)
    category_tier = models.CharField(max_length=3, choices=CategoryTier.choices, null=True, blank=True)
    ballot_entitlement = models.PositiveIntegerField(default=1)
    imported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["roll_type"]),
            models.Index(fields=["membership_no"]),
            models.Index(fields=["customer_code"]),
        ]
        constraints = [
            models.UniqueConstraint(fields=["roll_type", "membership_no"], name="unique_roll_membership"),
        ]

    def __str__(self):
        return f"{self.entity_name} ({self.membership_no}) — {self.get_roll_type_display()}"

    def save(self, *args, **kwargs):
        self.ballot_entitlement = 1
        super().save(*args, **kwargs)


class BallotPool(models.Model):
    """Super Admin's base pool per roll type (e.g. 100 Category + 100 Exclusive to start)."""

    roll_type = models.CharField(max_length=10, choices=RollType.choices, unique=True)
    total_ballots = models.PositiveIntegerField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_roll_type_display()} pool: {self.total_ballots}"

    @property
    def allocated_total(self):
        return self.allocations.aggregate(total=models.Sum("assigned_count"))["total"] or 0

    @property
    def unallocated(self):
        return self.total_ballots - self.allocated_total


class CounterBallotAllocation(models.Model):
    """
    Portion of a base pool assigned to one Counter -- "Distributed to
    Counter" in the reports. "Distributed to Member" / used_count is a
    live computed property, not a manually incremented counter, so it can
    never drift out of sync with the actual CustomerCodeAllotment rows.
    """

    pool = models.ForeignKey(BallotPool, on_delete=models.CASCADE, related_name="allocations")
    counter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ballot_allocations")
    assigned_count = models.PositiveIntegerField(default=0)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["pool", "counter"], name="unique_counter_pool_allocation"),
        ]

    def __str__(self):
        return f"{self.counter} — {self.pool.get_roll_type_display()}: {self.used_count}/{self.assigned_count}"

    @property
    def used_count(self):
        return CustomerCodeAllotment.objects.filter(
            allotted_by=self.counter, roll_type=self.pool.roll_type,
        ).aggregate(total=models.Sum("ballots_allotted"))["total"] or 0

    @property
    def remaining_count(self):
        return self.assigned_count - self.used_count

    def clean(self):
        if self.assigned_count > self.pool.total_ballots:
            raise ValidationError("Assigned count cannot exceed the base pool total.")


class CustomerCodeAllotment(models.Model):
    """
    Ballot allotment at the individual customer-code level (Consolidated
    Requirements section 3, confirmed 2026-07-28).

    When a Counter searches an access card, every customer code linked to
    that card is listed and pre-selected by default. The Counter may
    unselect some before saving. Whatever was selected gets a row here
    and becomes permanently locked -- on a later search of the same card
    those codes appear greyed out and flagged "Already Allotted", while
    the ones left unselected stay actionable.

    This is also what a Counter's "Distributed to Member" figures are
    summed from (see CounterBallotAllocation.used_count).
    """

    access_card_number = models.CharField(max_length=50)
    customer_code = models.CharField(max_length=50)  # soft ref -> members_master.customer_code
    entity_name = models.CharField(max_length=255, blank=True)
    roll_type = models.CharField(max_length=10, choices=RollType.choices)
    ballots_allotted = models.PositiveIntegerField(default=1)
    allotted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="allotments"
    )
    allotted_at = models.DateTimeField(auto_now_add=True)
    membership_status_at_allotment = models.CharField(max_length=10, blank=True)
    fee_status_at_allotment = models.CharField(max_length=10, blank=True)
    voting_eligibility_source = models.CharField(max_length=20, blank=True)
    eligibility_remark_at_allotment = models.CharField(max_length=255, blank=True)

    # class Meta:
    #     constraints = [
    #         # One allotment per customer code, ever -- this is what makes
    #         # an already-allotted code impossible to re-mark.
    #         models.UniqueConstraint(fields=["customer_code"], name="unique_allotment_per_customer_code"),
    #     ]
    #     indexes = [
    #         models.Index(fields=["access_card_number"]),
    #         models.Index(fields=["allotted_at"]),
    #     ]
    #     ordering = ["-allotted_at"]
    class Meta:
        constraints = [
            # One allotment per customer code, ever -- this is what makes
            # an already-allotted code impossible to re-mark.
            models.UniqueConstraint(fields=["customer_code"], name="unique_allotment_per_customer_code"),
        ]
        # indexes = [
        #     models.Index(fields=["access_card_number"]),
        #     models.Index(fields=["allotted_at"]),
        #     models.Index(fields=["roll_type"]),
        #     models.Index(fields=["allotted_by", "roll_type"]),
        # ]
        indexes = [
            models.Index(fields=["access_card_number"]),
            models.Index(fields=["allotted_at"]),
            models.Index(fields=["roll_type"]),
            models.Index(fields=["allotted_by", "roll_type"]),
            models.Index(fields=["entity_name"]),
        ]
        ordering = ["-allotted_at"]

    def __str__(self):
        return f"{self.customer_code} — {self.ballots_allotted} ballot(s) [{self.roll_type}]"







class AuthRepChange(models.Model):
    """
    Audit trail for Authorized Representative changes (Consolidated
    Requirements section 4, Super Admin only). Since the representative's
    live data lives in the read-only KYC Portal DB, this table is an
    OVERRIDE layer: apps.kyc_portal.services checks here first and falls
    back to the KYC DB's own data when no override exists.
    """

    customer_code = models.CharField(max_length=50)
    old_representative_name = models.CharField(max_length=255, blank=True)
    old_access_card_number = models.CharField(max_length=50, blank=True)
    new_representative_name = models.CharField(max_length=255)
    new_access_card_number = models.CharField(max_length=50, blank=True)
    new_photo = models.ImageField(upload_to="auth_rep_photos/", null=True, blank=True)
    attachment = models.FileField(upload_to="auth_rep_documents/", null=True, blank=True)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at"]
        indexes = [models.Index(fields=["customer_code"])]

    def __str__(self):
        return f"{self.customer_code}: {self.old_representative_name} -> {self.new_representative_name}"

    @classmethod
    def current_override_for(cls, customer_code):
        """The most recent change for a customer code, if any."""
        return cls.objects.filter(customer_code=customer_code).order_by("-changed_at").first()



class VotingEligibility(models.Model):
    """
    Voting eligibility flag -- owned entirely by Voting DB.
    Default = True (entry na ho to eligible maana jayega).
    SuperAdmin hi is override ko create/change kar sakta hai.
    Jab is_eligible=True manually set ho aur original KYC eligibility
    fail thi, remark mandatory hai (enforced in service layer, Step 3).
    """

    customer_code = models.CharField(max_length=50, unique=True)
    is_eligible = models.BooleanField(default=True)
    remarks = models.CharField(max_length=255, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["customer_code"])]

    def __str__(self):
        return f"{self.customer_code}: {'Eligible' if self.is_eligible else 'Not Eligible'}"






class VotingStatus(models.Model):
    """
    Tracks whether an entity's ballot has actually been allotted/issued —
    a simple derived flag, automatically flipped from No -> Yes the
    moment a CustomerCodeAllotment is created for that customer_code.
    Not manually editable by anyone (including SuperAdmin); it exists so
    reports and the frontend have a single, explicit source of truth for
    "has this entity's voting/ballot process been completed" without
    everyone re-deriving it from CustomerCodeAllotment each time.
    """

    customer_code = models.CharField(max_length=50, unique=True)
    voting_done = models.BooleanField(default=False)
    marked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["customer_code"])]

    def __str__(self):
        return f"{self.customer_code}: {'Voted' if self.voting_done else 'Not Voted'}"