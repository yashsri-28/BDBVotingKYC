# # """
# # Access-card allotment flow (Consolidated Requirements section 3,
# # confirmed 2026-07-28).

# # On search, every customer code under an access card is returned with:
# #   - its live eligibility, from the same Section 5 rules used at
# #     verification (membership active, fee paid, KYC done) -- only
# #     eligible codes may be selected
# #   - its allotment state: already allotted codes come back locked, so the
# #     UI can grey them out and flag them, and the save path refuses them
# #     even if a client tries anyway
# #   - its ballot entitlement, from the imported electoral roll

# # Codes are pre-selected by default when they are eligible and not yet
# # allotted; the counter unselects any that should stay pending.
# # """
# # from django.db import transaction

# # from apps.audit.models import AuditLog
# # from apps.kyc_portal.services import find_users_by_card, get_member_for_user, build_entity_view
# # from apps.verification.models import VerificationRecord
# # from apps.verification.validators import can_verify
# # from django.utils import timezone

# # from .models import CustomerCodeAllotment, ElectoralRoll, RollType
# # from .models import BallotPool, CounterBallotAllocation

# # from .models import VotingStatus


# # class AllotmentError(Exception):
# #     """Raised for allotment problems that carry a user-facing message."""


# # def _roll_entry_for(customer_code):
# #     return ElectoralRoll.objects.filter(customer_code=customer_code).first()


# # def search_access_card(access_card_number, actor):
# #     """
# #     Returns every customer code under this access card, annotated with
# #     eligibility, allotment state, and ballot entitlement.
# #     """
# #     kyc_users = find_users_by_card(access_card_number)
# #     if not kyc_users:
# #         raise AllotmentError("No authorised representative is mapped to that access card.")

# #     allotted = {
# #         a.customer_code: a
# #         for a in CustomerCodeAllotment.objects.filter(access_card_number=access_card_number)
# #     }

# #     codes = []
# #     representative_name = None
# #     for kyc_user in kyc_users:
# #         member = get_member_for_user(kyc_user)
# #         if member is None:
# #             continue

# #         view = build_entity_view(kyc_user, member)
# #         representative_name = representative_name or view["representative_name"]
# #         customer_code = view["customer_code"]

# #         existing_record = (
# #             VerificationRecord.objects.filter(customer_code=customer_code).order_by("-created_at").first()
# #         )
# #         is_eligible, block_reason = can_verify(view, existing_record=existing_record, requesting_user=actor)

# #         roll_entry = _roll_entry_for(customer_code)
# #         already = allotted.get(customer_code)

# #         # If member is not on electoral roll, override block_reason
# #         # to show a clear message instead of blank/None.
# #         if roll_entry is None and block_reason is None:
# #             block_reason = "Not on the Electoral Roll for this election — cannot allot a ballot."

# #         codes.append({
# #             **view,
# #             "on_electoral_roll": roll_entry is not None,
# #             "roll_type": roll_entry.roll_type if roll_entry else None,
# #             "ballot_entitlement": roll_entry.ballot_entitlement if roll_entry else 0,
# #             "is_eligible": is_eligible,
# #             "block_reason": block_reason,
# #             "already_allotted": already is not None,
# #             "allotted_at": already.allotted_at if already else None,
# #             "default_selected": is_eligible and already is None and roll_entry is not None,
# #             "selectable": is_eligible and already is None and roll_entry is not None,
# #         })

# #     if not codes:
# #         raise AllotmentError("That access card is not linked to any member record.")

# #     AuditLog.record(
# #         actor=actor, action="allotment_card_search",
# #         details={"access_card_number": access_card_number, "codes_found": len(codes)},
# #     )

# #     return {
# #         "access_card_number": access_card_number,
# #         "representative_name": representative_name,
# #         "customer_codes": codes,
# #         "pending_count": sum(1 for c in codes if c["selectable"]),
# #         "already_allotted_count": sum(1 for c in codes if c["already_allotted"]),
# #     }


# # @transaction.atomic
# # def allot_customer_codes(access_card_number, customer_codes, actor):
# #     """
# #     Records allotment for the selected codes. Every code is re-validated
# #     server-side -- a client that sends an already-allotted or ineligible
# #     code is rejected rather than trusted.
# #     """
# #     if not customer_codes:
# #         raise AllotmentError("Select at least one customer code to allot.")

# #     search = search_access_card(access_card_number, actor=actor)
# #     by_code = {c["customer_code"]: c for c in search["customer_codes"]}

# #     unknown = [code for code in customer_codes if code not in by_code]
# #     if unknown:
# #         raise AllotmentError(
# #             f"These customer codes are not linked to this access card: {', '.join(unknown)}."
# #         )

# #     already = [code for code in customer_codes if by_code[code]["already_allotted"]]
# #     if already:
# #         raise AllotmentError(
# #             f"Ballots were already allotted for {', '.join(already)}. Refresh the search to see the current state."
# #         )

# #     blocked = [
# #         f"{code} ({by_code[code]['block_reason']})"
# #         for code in customer_codes
# #         if not by_code[code]["is_eligible"]
# #     ]
# #     if blocked:
# #         raise AllotmentError("These customer codes are not eligible to vote: " + "; ".join(blocked) + ".")

# #     off_roll = [code for code in customer_codes if not by_code[code]["on_electoral_roll"]]
# #     if off_roll:
# #         raise AllotmentError(
# #             f"These customer codes are not on the electoral roll for this election: {', '.join(off_roll)}."
# #         )

# #     # Check the Counter's remaining balance per roll type before allotting.
# #     requested_by_roll = {}
# #     for code in customer_codes:
# #         roll_type = by_code[code]["roll_type"]
# #         requested_by_roll[roll_type] = requested_by_roll.get(roll_type, 0) + by_code[code]["ballot_entitlement"]

# #     for roll_type, requested_count in requested_by_roll.items():
# #         pool = BallotPool.objects.filter(roll_type=roll_type).first()
# #         allocation = (
# #             CounterBallotAllocation.objects.filter(pool=pool, counter=actor).first()
# #             if pool else None
# #         )
# #         remaining = allocation.remaining_count if allocation else 0
# #         if requested_count > remaining:
# #             raise AllotmentError(
# #                 f"Not enough {roll_type} ballots remaining in your pool "
# #                 f"(you have {remaining} left, this allotment needs {requested_count}). "
# #                 f"Contact SuperAdmin to receive more ballots."
# #             )



# #     created = []
# #     for code in customer_codes:
# #         entry = by_code[code]
# #         created.append(CustomerCodeAllotment.objects.create(
# #             access_card_number=access_card_number,
# #             customer_code=code,
# #             entity_name=entry["entity_name"],
# #             roll_type=entry["roll_type"],
# #             ballots_allotted=entry["ballot_entitlement"],
# #             allotted_by=actor,
# #             membership_status_at_allotment=entry.get("membership_status", ""),
# #             fee_status_at_allotment=entry.get("annual_fee_status", ""),
# #             voting_eligibility_source=entry.get("eligibility_source", ""),
# #             eligibility_remark_at_allotment=entry.get("eligibility_remark", ""),
# #         ))
# #         VotingStatus.objects.update_or_create(
# #             customer_code=code,
# #             defaults={"voting_done": True, "marked_at": timezone.now()},
# #         )

# #     AuditLog.record(
# #         actor=actor, action="ballots_allotted",
# #         details={
# #             "access_card_number": access_card_number,
# #             "customer_codes": list(customer_codes),
# #             "total_ballots": sum(a.ballots_allotted for a in created),
# #         },
# #     )
# #     return created



# """
# Access-card allotment flow (Consolidated Requirements section 3,
# confirmed 2026-07-28).

# On search, every customer code under an access card is returned with:
#   - its live eligibility, from the same Section 5 rules used at
#     verification (membership active, fee paid, KYC done) -- only
#     eligible codes may be selected
#   - its allotment state: already allotted codes come back locked, so the
#     UI can grey them out and flag them, and the save path refuses them
#     even if a client tries anyway
#   - its ballot entitlement, from the imported electoral roll

# Codes are pre-selected by default when they are eligible and not yet
# allotted; the counter unselects any that should stay pending.

# Super Admin override note (confirmed 2026-08-07):
#   If a Super Admin has explicitly set VotingEligibility for a member
#   (eligibility_source == "admin_override"), the electoral roll check is
#   bypassed entirely -- the admin's word is final. The member can receive
#   a ballot even if they are not on the imported electoral roll.
#   roll_type defaults to "exclusive" (1 ballot) in this case since there
#   is no roll entry to derive it from -- Super Admin should be aware of
#   this when overriding for members not on any roll.
# """
# from django.db import transaction

# from apps.audit.models import AuditLog
# from apps.kyc_portal.services import find_users_by_card, get_member_for_user, build_entity_view
# from apps.verification.models import VerificationRecord
# from apps.verification.validators import can_verify
# from django.utils import timezone

# from .models import CustomerCodeAllotment, ElectoralRoll, RollType
# from .models import BallotPool, CounterBallotAllocation

# from .models import VotingStatus


# class AllotmentError(Exception):
#     """Raised for allotment problems that carry a user-facing message."""


# def _roll_entry_for(customer_code):
#     return ElectoralRoll.objects.filter(customer_code=customer_code).first()


# def search_access_card(access_card_number, actor):
#     """
#     Returns every customer code under this access card, annotated with
#     eligibility, allotment state, and ballot entitlement.
#     """
#     kyc_users = find_users_by_card(access_card_number)
#     if not kyc_users:
#         raise AllotmentError("No authorised representative is mapped to that access card.")

#     allotted = {
#         a.customer_code: a
#         for a in CustomerCodeAllotment.objects.filter(access_card_number=access_card_number)
#     }

#     codes = []
#     representative_name = None
#     for kyc_user in kyc_users:
#         member = get_member_for_user(kyc_user)
#         if member is None:
#             continue

#         view = build_entity_view(kyc_user, member)
#         representative_name = representative_name or view["representative_name"]
#         customer_code = view["customer_code"]

#         existing_record = (
#             VerificationRecord.objects.filter(customer_code=customer_code).order_by("-created_at").first()
#         )
#         is_eligible, block_reason = can_verify(view, existing_record=existing_record, requesting_user=actor)

#         roll_entry = _roll_entry_for(customer_code)
#         already = allotted.get(customer_code)

#         # Super Admin override bypasses the electoral roll check entirely.
#         admin_override = view.get("eligibility_source") == "admin_override" and is_eligible
#         on_roll_or_overridden = roll_entry is not None or admin_override

#         # If member is not on electoral roll AND no admin override,
#         # show a clear block reason instead of blank/None.
#         if roll_entry is None and block_reason is None and not admin_override:
#             block_reason = "Not on the Electoral Roll for this election — cannot allot a ballot."

#         # For admin-overridden members not on any roll, default roll_type
#         # to "exclusive" (1 ballot) since there is no roll entry to derive
#         # it from. Super Admin should be aware of this behaviour.
#         if admin_override and roll_entry is None:
#             effective_roll_type = RollType.EXCLUSIVE
#             effective_ballot_entitlement = 1
#         else:
#             effective_roll_type = roll_entry.roll_type if roll_entry else None
#             effective_ballot_entitlement = roll_entry.ballot_entitlement if roll_entry else 0

#         codes.append({
#             **view,
#             "on_electoral_roll": roll_entry is not None,
#             "roll_type": effective_roll_type,
#             "ballot_entitlement": effective_ballot_entitlement,
#             "is_eligible": is_eligible,
#             "block_reason": block_reason,
#             "already_allotted": already is not None,
#             "allotted_at": already.allotted_at if already else None,
#             # Pre-selected by default only when it can actually be allotted.
#             "default_selected": is_eligible and already is None and on_roll_or_overridden,
#             "selectable": is_eligible and already is None and on_roll_or_overridden,
#         })

#     if not codes:
#         raise AllotmentError("That access card is not linked to any member record.")

#     AuditLog.record(
#         actor=actor, action="allotment_card_search",
#         details={"access_card_number": access_card_number, "codes_found": len(codes)},
#     )

#     return {
#         "access_card_number": access_card_number,
#         "representative_name": representative_name,
#         "customer_codes": codes,
#         "pending_count": sum(1 for c in codes if c["selectable"]),
#         "already_allotted_count": sum(1 for c in codes if c["already_allotted"]),
#     }


# @transaction.atomic
# def allot_customer_codes(access_card_number, customer_codes, actor):
#     """
#     Records allotment for the selected codes. Every code is re-validated
#     server-side -- a client that sends an already-allotted or ineligible
#     code is rejected rather than trusted.
#     """
#     if not customer_codes:
#         raise AllotmentError("Select at least one customer code to allot.")

#     search = search_access_card(access_card_number, actor=actor)
#     by_code = {c["customer_code"]: c for c in search["customer_codes"]}

#     unknown = [code for code in customer_codes if code not in by_code]
#     if unknown:
#         raise AllotmentError(
#             f"These customer codes are not linked to this access card: {', '.join(unknown)}."
#         )

#     already = [code for code in customer_codes if by_code[code]["already_allotted"]]
#     if already:
#         raise AllotmentError(
#             f"Ballots were already allotted for {', '.join(already)}. Refresh the search to see the current state."
#         )

#     blocked = [
#         f"{code} ({by_code[code]['block_reason']})"
#         for code in customer_codes
#         if not by_code[code]["is_eligible"]
#     ]
#     if blocked:
#         raise AllotmentError("These customer codes are not eligible to vote: " + "; ".join(blocked) + ".")

#     # Electoral roll check is bypassed if Super Admin has explicitly
#     # overridden eligibility for this member — admin's word is final.
#     off_roll = [
#         code for code in customer_codes
#         if not by_code[code]["on_electoral_roll"]
#         and not (by_code[code].get("eligibility_source") == "admin_override" and by_code[code]["is_eligible"])
#     ]
#     if off_roll:
#         raise AllotmentError(
#             f"These customer codes are not on the electoral roll for this election: {', '.join(off_roll)}."
#         )

#     # Check the Counter's remaining balance per roll type before allotting.
#     requested_by_roll = {}
#     for code in customer_codes:
#         roll_type = by_code[code]["roll_type"]
#         requested_by_roll[roll_type] = requested_by_roll.get(roll_type, 0) + by_code[code]["ballot_entitlement"]

#     for roll_type, requested_count in requested_by_roll.items():
#         pool = BallotPool.objects.filter(roll_type=roll_type).first()
#         allocation = (
#             CounterBallotAllocation.objects.filter(pool=pool, counter=actor).first()
#             if pool else None
#         )
#         remaining = allocation.remaining_count if allocation else 0
#         if requested_count > remaining:
#             raise AllotmentError(
#                 f"Not enough {roll_type} ballots remaining in your pool "
#                 f"(you have {remaining} left, this allotment needs {requested_count}). "
#                 f"Contact SuperAdmin to receive more ballots."
#             )

#     created = []
#     for code in customer_codes:
#         entry = by_code[code]
#         created.append(CustomerCodeAllotment.objects.create(
#             access_card_number=access_card_number,
#             customer_code=code,
#             entity_name=entry["entity_name"],
#             roll_type=entry["roll_type"],
#             ballots_allotted=entry["ballot_entitlement"],
#             allotted_by=actor,
#             membership_status_at_allotment=entry.get("membership_status", ""),
#             fee_status_at_allotment=entry.get("annual_fee_status", ""),
#             voting_eligibility_source=entry.get("eligibility_source", ""),
#             eligibility_remark_at_allotment=entry.get("eligibility_remark", ""),
#         ))
#         VotingStatus.objects.update_or_create(
#             customer_code=code,
#             defaults={"voting_done": True, "marked_at": timezone.now()},
#         )

#     AuditLog.record(
#         actor=actor, action="ballots_allotted",
#         details={
#             "access_card_number": access_card_number,
#             "customer_codes": list(customer_codes),
#             "total_ballots": sum(a.ballots_allotted for a in created),
#         },
#     )
#     return created




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

Super Admin override note (confirmed 2026-08-07):
  If a Super Admin has explicitly set VotingEligibility for a member
  (eligibility_source == "admin_override"), the electoral roll check is
  bypassed entirely -- the admin's word is final. The member can receive
  a ballot even if they are not on the imported electoral roll.
  roll_type defaults to "exclusive" (1 ballot) in this case since there
  is no roll entry to derive it from.

Card reader scan note (confirmed 2026-08-11):
  When a physical card is scanned, the raw credential_no is passed
  directly to search_access_card() via the credential_no parameter.
  In this path, find_users_by_credential() is used instead of
  find_users_by_card(), so ALL customer codes linked to that physical
  card are returned -- regardless of access_code. Manual search
  (Counter typing an access card number) is completely unchanged.
"""
from django.db import transaction

from apps.audit.models import AuditLog
from apps.kyc_portal.services import find_users_by_card, find_users_by_credential, get_member_for_user, build_entity_view
from apps.verification.models import VerificationRecord
from apps.verification.validators import can_verify
from django.utils import timezone

from .models import CustomerCodeAllotment, ElectoralRoll, RollType
from .models import BallotPool, CounterBallotAllocation
from .models import VotingStatus


class AllotmentError(Exception):
    """Raised for allotment problems that carry a user-facing message."""


def _roll_entry_for(customer_code):
    return ElectoralRoll.objects.filter(customer_code=customer_code).first()


def search_access_card(access_card_number, actor, credential_no=None):
    """
    Returns every customer code under this access card / credential_no.

    credential_no path (card reader scan):
      - Finds ALL KycUser rows with this credential_no directly.
      - No access_code involved at all.
      - access_card_number is derived from the first matched user's
        access_code for display purposes only (or falls back to the
        raw credential_no if access_code is not set).

    access_card_number path (manual search):
      - Unchanged from before -- finds users by access_code.
    """
    if credential_no:
        kyc_users = find_users_by_credential(credential_no)
        if not kyc_users:
            raise AllotmentError("No member found for this card's credential number.")
        # Derive a display-friendly access_card_number from the first
        # matched user, falling back to the raw credential_no.
        if not access_card_number:
            access_card_number = kyc_users[0].access_code or credential_no
    else:
        kyc_users = find_users_by_card(access_card_number)
        if not kyc_users:
            raise AllotmentError("No authorised representative is mapped to that access card.")

    # allotted = {
    #     a.customer_code: a
    #     for a in CustomerCodeAllotment.objects.filter(access_card_number=access_card_number)
    # }
    all_customer_codes = [
        kyc_user.sap_code for kyc_user in kyc_users if kyc_user.sap_code
    ]
    allotted = {
        a.customer_code: a
        for a in CustomerCodeAllotment.objects.filter(
            customer_code__in=all_customer_codes
        )
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

        # Super Admin override bypasses the electoral roll check entirely.
        admin_override = view.get("eligibility_source") == "admin_override" and is_eligible
        on_roll_or_overridden = roll_entry is not None or admin_override

        # If member is not on electoral roll AND no admin override,
        # show a clear block reason instead of blank/None.
        if roll_entry is None and block_reason is None and not admin_override:
            block_reason = "Not on the Electoral Roll for this election — cannot allot a ballot."

        # For admin-overridden members not on any roll, default roll_type
        # to "exclusive" (1 ballot) since there is no roll entry to derive
        # it from. Super Admin should be aware of this behaviour.
        if admin_override and roll_entry is None:
            effective_roll_type = RollType.EXCLUSIVE
            effective_ballot_entitlement = 1
        else:
            effective_roll_type = roll_entry.roll_type if roll_entry else None
            effective_ballot_entitlement = roll_entry.ballot_entitlement if roll_entry else 0

        codes.append({
            **view,
            "on_electoral_roll": roll_entry is not None,
            "roll_type": effective_roll_type,
            "ballot_entitlement": effective_ballot_entitlement,
            "is_eligible": is_eligible,
            "block_reason": block_reason,
            "already_allotted": already is not None,
            "allotted_at": already.allotted_at if already else None,
            "default_selected": is_eligible and already is None and on_roll_or_overridden,
            "selectable": is_eligible and already is None and on_roll_or_overridden,
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
# def allot_customer_codes(access_card_number, customer_codes, actor):
def allot_customer_codes(access_card_number, customer_codes, actor, credential_no=None):
    """
    Records allotment for the selected codes. Every code is re-validated
    server-side -- a client that sends an already-allotted or ineligible
    code is rejected rather than trusted.
    """
    if not customer_codes:
        raise AllotmentError("Select at least one customer code to allot.")

    # search = search_access_card(access_card_number, actor=actor)
    search = search_access_card(
        access_card_number,
        actor=actor,
        credential_no=credential_no,
    )
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

    # Electoral roll check is bypassed if Super Admin has explicitly
    # overridden eligibility for this member — admin's word is final.
    off_roll = [
        code for code in customer_codes
        if not by_code[code]["on_electoral_roll"]
        and not (by_code[code].get("eligibility_source") == "admin_override" and by_code[code]["is_eligible"])
    ]
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
            membership_number=entry.get("membership_number", ""),
            roll_type=entry["roll_type"],
            ballots_allotted=entry["ballot_entitlement"],
            allotted_by=actor,
            membership_status_at_allotment=entry.get("membership_status", ""),
            fee_status_at_allotment=entry.get("annual_fee_status", ""),
            voting_eligibility_source=entry.get("eligibility_source", ""),
            eligibility_remark_at_allotment=entry.get("eligibility_remark", ""),
        ))
        VotingStatus.objects.update_or_create(
            customer_code=code,
            defaults={"voting_done": True, "marked_at": timezone.now()},
        )

    AuditLog.record(
        actor=actor, action="ballots_allotted",
        details={
            "access_card_number": access_card_number,
            "customer_codes": list(customer_codes),
            "total_ballots": sum(a.ballots_allotted for a in created),
        },
    )
    return created