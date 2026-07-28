"""
Vote counting orchestration. Every rule from Vote_counting.docx is
enforced here rather than in the views, so the API, the admin, and any
future import path all behave identically.
"""
from django.db import transaction
from django.db.models import Count
from django.utils import timezone

from apps.audit.models import AuditLog
from .exceptions import (
    AnotherCategoryInProgress, CountingNotOpen, DuplicateBallotNumber,
    DuplicateCandidateOnBallot, InvalidVoteCount, UnknownCandidateSerial,
)
from .models import Ballot, BallotVote, Candidate, ElectionCategory


@transaction.atomic
def start_counting(category, actor):
    """
    Opens a category for counting. Only one category may be in progress
    at a time -- this is what disables the others in the UI.
    """
    blocking = (
        ElectionCategory.objects
        .filter(election_year=category.election_year, status=ElectionCategory.Status.IN_PROGRESS)
        .exclude(pk=category.pk)
        .first()
    )
    if blocking:
        raise AnotherCategoryInProgress(
            f"'{blocking.name}' is still being counted. Complete it before starting '{category.name}'."
        )

    if category.status == ElectionCategory.Status.COMPLETED:
        raise CountingNotOpen(f"Counting for '{category.name}' is already complete and cannot be reopened.")

    category.status = ElectionCategory.Status.IN_PROGRESS
    category.activated_by = actor
    category.activated_at = timezone.now()
    category.save(update_fields=["status", "activated_by", "activated_at"])

    AuditLog.record(actor=actor, action="counting_started", details={"category": category.name, "year": category.election_year})
    return category


@transaction.atomic
def complete_counting(category, actor):
    """Marks a category finished, which unlocks the next one in sequence."""
    if category.status != ElectionCategory.Status.IN_PROGRESS:
        raise CountingNotOpen(f"'{category.name}' is not currently being counted.")

    category.status = ElectionCategory.Status.COMPLETED
    category.completed_at = timezone.now()
    category.save(update_fields=["status", "completed_at"])

    AuditLog.record(actor=actor, action="counting_completed", details={
        "category": category.name, "year": category.election_year,
        "total_ballots": category.ballots.count(),
    })
    return category


def _resolve_candidates(category, serial_numbers):
    """
    Maps entered serial numbers to Candidate rows, failing loudly with
    the specific missing numbers rather than a generic error.
    """
    candidates = list(Candidate.objects.filter(category=category, serial_no__in=serial_numbers, is_active=True))
    found = {c.serial_no for c in candidates}
    missing = sorted(set(serial_numbers) - found)
    if missing:
        raise UnknownCandidateSerial(
            f"Candidate serial number(s) {', '.join(str(m) for m in missing)} do not exist in {category.name}."
        )
    return candidates


@transaction.atomic
def record_ballot(category, ballot_no, candidate_serials, actor):
    """
    Saves one counted ballot and its votes.

    Validations, in the order a counting user would hit them:
      - the category must actually be open for counting
      - the ballot number must not already exist in this category
      - the vote count must match exactly (1 for exclusive, 2 for category)
      - the same candidate cannot appear twice on one ballot
      - every serial number entered must exist in the candidate master
    """
    if not category.is_open_for_counting:
        raise CountingNotOpen(f"Counting is not open for {category.name}.")

    if Ballot.objects.filter(category=category, ballot_no=ballot_no).exists():
        raise DuplicateBallotNumber(
            f"Ballot number {ballot_no} has already been entered for {category.name}."
        )

    expected = category.votes_per_ballot
    if len(candidate_serials) != expected:
        entered = len(candidate_serials)
        raise InvalidVoteCount(
            f"{category.name} requires exactly {expected} vote{'' if expected == 1 else 's'} per ballot; "
            f"{entered} {'was' if entered == 1 else 'were'} entered."
        )

    if len(set(candidate_serials)) != len(candidate_serials):
        raise DuplicateCandidateOnBallot(
            "Each vote on a ballot must go to a different candidate."
        )

    candidates = _resolve_candidates(category, candidate_serials)

    ballot = Ballot.objects.create(category=category, ballot_no=ballot_no, counted_by=actor)
    BallotVote.objects.bulk_create([BallotVote(ballot=ballot, candidate=c) for c in candidates])

    AuditLog.record(actor=actor, action="ballot_counted", details={
        "category": category.name, "ballot_no": ballot_no,
        "candidate_serials": sorted(candidate_serials),
    })
    return ballot


@transaction.atomic
def delete_ballot(ballot, actor, reason=""):
    """
    Removes a wrongly-entered ballot. Kept deliberately explicit and
    audited, since it changes a counted result.
    """
    if not ballot.category.is_open_for_counting:
        raise CountingNotOpen("Ballots can only be corrected while the category is still being counted.")

    details = {
        "category": ballot.category.name, "ballot_no": ballot.ballot_no,
        "candidate_serials": sorted(ballot.votes.values_list("candidate__serial_no", flat=True)),
        "reason": reason,
    }
    ballot.delete()
    AuditLog.record(actor=actor, action="ballot_deleted", details=details)


def live_totals(category):
    """
    Powers both the counting screen's running totals and the public
    member display, which polls this and re-renders.
    """
    candidates = (
        Candidate.objects.filter(category=category)
        .annotate(vote_count=Count("votes"))
        .order_by("serial_no")
    )
    rows = [
        {
            "serial_no": c.serial_no,
            "candidate_name": c.candidate_name,
            "member_name": c.member_name,
            "votes": c.vote_count,
        }
        for c in candidates
    ]
    total_ballots = category.ballots.count()
    total_votes = sum(r["votes"] for r in rows)

    return {
        "category": category.name,
        "election_year": category.election_year,
        "status": category.status,
        "by_serial": rows,
        "by_leading": sorted(rows, key=lambda r: (-r["votes"], r["serial_no"])),
        "total_ballots": total_ballots,
        "total_votes": total_votes,
    }


def detailed_ballot_list(category):
    """
    Report 1: ballot-by-ballot grid. Each row is one ballot, with a tick
    against each candidate that ballot voted for -- matching the layout
    in Voting_Report.xlsx.
    """
    serials = list(
        Candidate.objects.filter(category=category).order_by("serial_no").values_list("serial_no", flat=True)
    )
    ballots = category.ballots.prefetch_related("votes__candidate").order_by("ballot_no")

    rows = []
    for idx, ballot in enumerate(ballots, start=1):
        voted_for = {v.candidate.serial_no for v in ballot.votes.all()}
        rows.append({
            "sr_no": idx,
            "ballot_no": ballot.ballot_no,
            "marks": {serial: (serial in voted_for) for serial in serials},
        })

    return {"candidate_serials": serials, "rows": rows, "total_ballots": len(rows)}
