"""
Ballot pool / allocation orchestration. All ballot-count mutations go
through here so the assigned/remaining math is enforced in one place.
"""
from django.db import transaction
from django.db.models import Sum

from .models import BallotPool, CounterBallotAllocation
from .exceptions import ExceedsPoolTotal
from apps.audit.models import AuditLog



from django.core.exceptions import ValidationError
from .models import VotingEligibility


@transaction.atomic
def set_pool_total(roll_type, total_ballots, actor):
    """Super Admin only — enforced at the view/permission layer."""
    pool, _ = BallotPool.objects.get_or_create(roll_type=roll_type, defaults={"total_ballots": total_ballots, "created_by": actor})
    if pool.total_ballots != total_ballots:
        already_allocated = pool.allocated_total
        if total_ballots < already_allocated:
            raise ExceedsPoolTotal(f"Cannot set total below {already_allocated}, which is already allocated to counters.")
        pool.total_ballots = total_ballots
        pool.save(update_fields=["total_ballots"])
        AuditLog.record(actor=actor, action="ballot_pool_updated", details={"roll_type": roll_type, "total_ballots": total_ballots})
    return pool


@transaction.atomic
def assign_to_counter(pool, counter, assigned_count, actor):
    """Super Admin assigns/updates a counter's portion of a base pool."""
    allocation, created = CounterBallotAllocation.objects.select_for_update().get_or_create(
        pool=pool, counter=counter, defaults={"assigned_count": assigned_count, "assigned_by": actor},
    )
    if not created:
        if assigned_count < allocation.used_count:
            raise ExceedsPoolTotal(f"Cannot reduce assignment below {allocation.used_count} already distributed to members.")
        allocation.assigned_count = assigned_count
        allocation.assigned_by = actor
        allocation.save(update_fields=["assigned_count", "assigned_by"])

    other_total = pool.allocations.exclude(pk=allocation.pk).aggregate(total=Sum("assigned_count"))["total"] or 0
    if other_total + assigned_count > pool.total_ballots:
        raise ExceedsPoolTotal()

    AuditLog.record(
        actor=actor, action="ballot_allocation_set",
        details={"counter": counter.username, "roll_type": pool.roll_type, "assigned_count": assigned_count},
    )
    return allocation


def dashboard_summary():
    """Super Admin's All-Counter Matrix: totals across all counters, per roll type."""
    summary = []
    for pool in BallotPool.objects.all():
        allocations = list(pool.allocations.select_related("counter"))
        used_total = sum(a.used_count for a in allocations)
        summary.append({
            "roll_type": pool.roll_type,
            "total_ballots": pool.total_ballots,
            "allocated_total": pool.allocated_total,
            "unallocated": pool.unallocated,
            "used_total": used_total,
            "counters": [
                {
                    "counter": a.counter.username,
                    "counter_name": a.counter.get_full_name() or a.counter.username,
                    "assigned_count": a.assigned_count,
                    "used_count": a.used_count,
                    "remaining_count": a.remaining_count,
                }
                for a in allocations
            ],
        })
    return summary


def counter_own_summary(counter):
    """A single Counter's own consolidated Received/Distributed/Balance, per roll type."""
    rows = []
    for allocation in CounterBallotAllocation.objects.filter(counter=counter).select_related("pool"):
        rows.append({
            "roll_type": allocation.pool.roll_type,
            "received": allocation.assigned_count,
            "distributed": allocation.used_count,
            "balance": allocation.remaining_count,
        })
    return rows

@transaction.atomic
def set_voting_eligibility(customer_code, is_eligible, remark, actor):
    """
    Super Admin only — enforced at the view/permission layer.
    Remark is mandatory for every override (both eligible and not-eligible),
    so there is always a traceable reason in the audit trail.
    """
    if not (remark or "").strip():
        raise ValidationError("Remark is mandatory when setting voting eligibility.")

    obj, _created = VotingEligibility.objects.update_or_create(
        customer_code=customer_code,
        defaults={
            "is_eligible": is_eligible,
            "remarks": remark,
            "updated_by": actor,
        },
    )

    AuditLog.record(
        actor=actor, action="voting_eligibility_set",
        details={"customer_code": customer_code, "is_eligible": is_eligible, "remark": remark},
    )
    return obj
