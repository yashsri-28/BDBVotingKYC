"""
Access-card allotment flow (Consolidated Requirements section 3,
confirmed 2026-07-28).

On search, every customer code under an access card is returned with:
  - its live eligibility, from the same Section 5 rules used at
    verification (membership active, fee paid, KYC done) -- only
    eligible codes may be selected
  - its allotment state: already allotted codes come back locked, so the
    UI can grey them out and flag them, and the save path refuses them
    even if a client tries anyway
  - its ballot entitlement, from the imported electoral roll

Codes are pre-selected by default when they are eligible and not yet
allotted; the counter unselects any that should stay pending.
"""
from django.db import transaction

from apps.audit.models import AuditLog
from apps.kyc_portal.services import find_users_by_card, get_member_for_user, build_entity_view
from apps.verification.models import VerificationRecord
from apps.verification.validators import can_verify

from .models import CustomerCodeAllotment, ElectoralRoll, RollType
from .models import BallotPool, CounterBallotAllocation


class AllotmentError(Exception):
    """Raised for allotment problems that carry a user-facing message."""


def _roll_entry_for(customer_code):
    return ElectoralRoll.objects.filter(customer_code=customer_code).first()


def search_access_card(access_card_number, actor):
    """
    Returns every customer code under this access card, annotated with
    eligibility, allotment state, and ballot entitlement.
    """
    kyc_users = find_users_by_card(access_card_number)
    if not kyc_users:
        raise AllotmentError("No authorised representative is mapped to that access card.")

    allotted = {
        a.customer_code: a
        for a in CustomerCodeAllotment.objects.filter(access_card_number=access_card_number)
    }

    codes = []
    representative_name = None
    for kyc_user in kyc_users:
        member = get_member_for_user(kyc_user)
        if member is None:
            continue

        view = build_entity_view(kyc_user, member)
        representative_name = representative_name or view["representative_name"]
        customer_code = view["customer_code"]

        existing_record = (
            VerificationRecord.objects.filter(customer_code=customer_code).order_by("-created_at").first()
        )
        is_eligible, block_reason = can_verify(view, existing_record=existing_record, requesting_user=actor)

        roll_entry = _roll_entry_for(customer_code)
        already = allotted.get(customer_code)

        codes.append({
            **view,
            "on_electoral_roll": roll_entry is not None,
            "roll_type": roll_entry.roll_type if roll_entry else None,
            "ballot_entitlement": roll_entry.ballot_entitlement if roll_entry else 0,
            "is_eligible": is_eligible,
            "block_reason": block_reason,
            "already_allotted": already is not None,
            "allotted_at": already.allotted_at if already else None,
            # Pre-selected by default only when it can actually be allotted.
            "default_selected": is_eligible and already is None and roll_entry is not None,
            "selectable": is_eligible and already is None and roll_entry is not None,
        })

    if not codes:
        raise AllotmentError("That access card is not linked to any member record.")

    AuditLog.record(
        actor=actor, action="allotment_card_search",
        details={"access_card_number": access_card_number, "codes_found": len(codes)},
    )

    return {
        "access_card_number": access_card_number,
        "representative_name": representative_name,
        "customer_codes": codes,
        "pending_count": sum(1 for c in codes if c["selectable"]),
        "already_allotted_count": sum(1 for c in codes if c["already_allotted"]),
    }


@transaction.atomic
def allot_customer_codes(access_card_number, customer_codes, actor):
    """
    Records allotment for the selected codes. Every code is re-validated
    server-side -- a client that sends an already-allotted or ineligible
    code is rejected rather than trusted.
    """
    if not customer_codes:
        raise AllotmentError("Select at least one customer code to allot.")

    search = search_access_card(access_card_number, actor=actor)
    by_code = {c["customer_code"]: c for c in search["customer_codes"]}

    unknown = [code for code in customer_codes if code not in by_code]
    if unknown:
        raise AllotmentError(
            f"These customer codes are not linked to this access card: {', '.join(unknown)}."
        )

    already = [code for code in customer_codes if by_code[code]["already_allotted"]]
    if already:
        raise AllotmentError(
            f"Ballots were already allotted for {', '.join(already)}. Refresh the search to see the current state."
        )

    blocked = [
        f"{code} ({by_code[code]['block_reason']})"
        for code in customer_codes
        if not by_code[code]["is_eligible"]
    ]
    if blocked:
        raise AllotmentError("These customer codes are not eligible to vote: " + "; ".join(blocked) + ".")

    off_roll = [code for code in customer_codes if not by_code[code]["on_electoral_roll"]]
    if off_roll:
        raise AllotmentError(
            f"These customer codes are not on the electoral roll for this election: {', '.join(off_roll)}."
        )

    # Check the Counter's remaining balance per roll type before allotting.
    requested_by_roll = {}
    for code in customer_codes:
        roll_type = by_code[code]["roll_type"]
        requested_by_roll[roll_type] = requested_by_roll.get(roll_type, 0) + by_code[code]["ballot_entitlement"]

    for roll_type, requested_count in requested_by_roll.items():
        pool = BallotPool.objects.filter(roll_type=roll_type).first()
        allocation = (
            CounterBallotAllocation.objects.filter(pool=pool, counter=actor).first()
            if pool else None
        )
        remaining = allocation.remaining_count if allocation else 0
        if requested_count > remaining:
            raise AllotmentError(
                f"Not enough {roll_type} ballots remaining in your pool "
                f"(you have {remaining} left, this allotment needs {requested_count}). "
                f"Contact SuperAdmin to receive more ballots."
            )

    created = []
    for code in customer_codes:
        entry = by_code[code]
        created.append(CustomerCodeAllotment.objects.create(
            access_card_number=access_card_number,
            customer_code=code,
            entity_name=entry["entity_name"],
            roll_type=entry["roll_type"],
            ballots_allotted=entry["ballot_entitlement"],
            allotted_by=actor,
        ))

    AuditLog.record(
        actor=actor, action="ballots_allotted",
        details={
            "access_card_number": access_card_number,
            "customer_codes": list(customer_codes),
            "total_ballots": sum(a.ballots_allotted for a in created),
        },
    )
    return created
