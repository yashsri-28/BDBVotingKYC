"""
Vote counting module (Vote_counting.docx, confirmed 2026-07-28).

Flow:
  1. Super Admin activates the election categories to be counted.
  2. Super Admin maintains the Candidate Master per category.
  3. Counting proceeds ONE category at a time -- while a category is
     in progress, the others stay disabled. The next category unlocks
     only after the current one is marked complete.
  4. A Counting user enters a Ballot No. and the serial numbers of the
     candidates that ballot voted for.

Vote rules (confirmed):
  - Exclusive ballots  -> exactly 1 vote per ballot
  - Category ballots   -> exactly 2 votes per ballot, to 2 DIFFERENT
                          candidates (never 2 votes to the same one)

Ballot numbers here are INDEPENDENT of the ballots issued at the
counters (confirmed 2026-07-28) -- the counting user may enter any
number. Uniqueness is enforced only within a category, to catch the
same physical ballot being entered twice.
"""
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class ElectionCategory(models.Model):
    """
    A category being contested. Category 1/2/3 map to the Category Trade
    Member tiers (I/II/III) from the electoral roll; Exclusive is counted
    separately with its own 1-vote-per-ballot rule.
    """

    class Kind(models.TextChoices):
        CATEGORY = "category", "Category Member"
        EXCLUSIVE = "exclusive", "Exclusive Member"

    class Status(models.TextChoices):
        INACTIVE = "inactive", "Inactive"
        ACTIVE = "active", "Active"
        IN_PROGRESS = "in_progress", "Counting In Progress"
        COMPLETED = "completed", "Counting Completed"

    name = models.CharField(max_length=100)  # "Category 1", "Category 2", "Exclusive"
    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.CATEGORY)
    election_year = models.CharField(max_length=20)  # e.g. "2026-27"
    sequence = models.PositiveIntegerField(
        default=1, help_text="Counting order. Lower numbers are counted first."
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.INACTIVE)
    activated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    activated_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["election_year", "sequence"]
        constraints = [
            models.UniqueConstraint(fields=["election_year", "name"], name="unique_category_per_year"),
        ]
        verbose_name_plural = "Election categories"

    def __str__(self):
        return f"{self.name} ({self.election_year})"

    @property
    def votes_per_ballot(self):
        """Exclusive ballots carry 1 vote; category ballots carry 2."""
        return 1 if self.kind == self.Kind.EXCLUSIVE else 2

    @property
    def is_open_for_counting(self):
        return self.status == self.Status.IN_PROGRESS


class Candidate(models.Model):
    """
    Candidate Master (Vote_counting.docx section 2). Serial numbers are
    what the counting user actually types, so they must be unique and
    stable within a category.
    """

    category = models.ForeignKey(ElectionCategory, on_delete=models.CASCADE, related_name="candidates")
    serial_no = models.PositiveIntegerField()
    candidate_name = models.CharField(max_length=255)
    member_name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    membership_no = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["category", "serial_no"]
        constraints = [
            models.UniqueConstraint(fields=["category", "serial_no"], name="unique_candidate_serial_per_category"),
        ]

    def __str__(self):
        return f"{self.serial_no}. {self.candidate_name} ({self.category.name})"


class Ballot(models.Model):
    """
    One counted ballot paper. Unique per category so the system can alert
    on a duplicate ballot number, per the validation requirement.
    """

    category = models.ForeignKey(ElectionCategory, on_delete=models.PROTECT, related_name="ballots")
    ballot_no = models.PositiveIntegerField()
    counted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="+")
    counted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "ballot_no"]
        constraints = [
            models.UniqueConstraint(fields=["category", "ballot_no"], name="unique_ballot_no_per_category"),
        ]
        indexes = [models.Index(fields=["category", "ballot_no"])]

    def __str__(self):
        return f"Ballot {self.ballot_no} — {self.category.name}"

    def clean(self):
        if self.category_id and not self.category.is_open_for_counting:
            raise ValidationError("Counting is not currently open for this category.")


class BallotVote(models.Model):
    """
    A single vote from one ballot to one candidate. A category ballot
    produces exactly 2 of these rows (two different candidates); an
    exclusive ballot produces exactly 1. The unique constraint below is
    what physically prevents both votes on a ballot going to the same
    candidate.
    """

    ballot = models.ForeignKey(Ballot, on_delete=models.CASCADE, related_name="votes")
    candidate = models.ForeignKey(Candidate, on_delete=models.PROTECT, related_name="votes")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["ballot", "candidate"], name="unique_vote_per_ballot_candidate"),
        ]
        indexes = [models.Index(fields=["candidate"])]

    def __str__(self):
        return f"{self.ballot} -> {self.candidate.serial_no}"
