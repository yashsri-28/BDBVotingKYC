"""
Core verification workflow orchestration: lookup by card, lock/unlock,
verify/reject — all business rules routed through validators.can_verify().

Works against customer_code (soft reference into Kyc_DB_new_3) since the
entity/representative data lives in a different database than these
tables (BDB_Voting) — see config/db_router.py.
"""
from django.db import transaction
from django.utils import timezone

from apps.kyc_portal.services import find_users_by_card, get_member_for_user, build_entity_view
from apps.audit.models import AuditLog
from .models import RecordLock, VerificationRecord, EntityVotingExtras
from .validators import can_verify, show_eligibility_remark_checkbox
from .exceptions import RecordLocked, NotAuthorizedRepresentative
from .notifications import broadcast_lock_event


def _get_remark(customer_code):
    extras = EntityVotingExtras.objects.filter(customer_code=customer_code).first()
    return extras.voting_eligibility_remark if extras else ""


def lookup_by_card(access_card_number, actor):
    """
    Section 3/4: resolve card -> Scenario A or B payload.
    CONFIRMED: one access_code can map to multiple `users` rows (multiple
    customer_code/entities under one representative) -> Scenario B.
    """
    kyc_users = find_users_by_card(access_card_number)
    if not kyc_users:
        raise NotAuthorizedRepresentative()

    entity_views = []
    for u in kyc_users:
        member = get_member_for_user(u)
        if member is None:
            continue  # user row has no matching members_master — skip, can't build an entity view
        entity_views.append(build_entity_view(u, member))

    if not entity_views:
        raise NotAuthorizedRepresentative()

    AuditLog.record(
        actor=actor, action="card_lookup",
        details={"access_card_number": access_card_number, "matches": len(entity_views)},
    )

    if len(entity_views) == 1:
        view = entity_views[0]
        customer_code = view["customer_code"]
        remark = _get_remark(customer_code)
        existing = VerificationRecord.objects.filter(customer_code=customer_code).order_by("-created_at").first()
        ok, reason = can_verify(view, existing_record=existing, requesting_user=actor)
        return {
            "scenario": "single_entity",
            "representative_name": view["representative_name"],
            "access_card_number": access_card_number,
            "entity": view,
            "voting_eligibility_remark": remark,
            "can_verify": ok,
            "block_reason": reason,
            "show_remark_checkbox": show_eligibility_remark_checkbox(view, remark),
        }

    return {
        "scenario": "multiple_entities",
        "representative_name": entity_views[0]["representative_name"],
        "entities": entity_views,
    }


@transaction.atomic
def acquire_lock(customer_code, user):
    existing = RecordLock.objects.select_for_update().filter(customer_code=customer_code).first()
    if existing and existing.locked_by_id != user.id:
        raise RecordLocked()
    if existing:
        return existing  # same user re-acquiring — idempotent

    lock = RecordLock.objects.create(customer_code=customer_code, locked_by=user)
    counter_number = getattr(getattr(user, "counter_mapping", None), "counter_number", None)
    broadcast_lock_event("locked", customer_code, locked_by_username=user.username, counter_number=counter_number)
    AuditLog.record(actor=user, action="lock_acquired", entity_customer_code=customer_code)
    return lock


@transaction.atomic
def release_lock(customer_code, user):
    deleted, _ = RecordLock.objects.filter(customer_code=customer_code, locked_by=user).delete()
    if deleted:
        broadcast_lock_event("unlocked", customer_code)
        AuditLog.record(actor=user, action="lock_released", entity_customer_code=customer_code)
    return bool(deleted)


@transaction.atomic
def verify_entity(customer_code, entity_view, user, action, remark="", rejection_reason=None, counter_number=""):
    """
    action: "verified" -> Verified and Sent for Vote
            "not_eligible" -> Not Eligible to Vote (requires rejection_reason)
    entity_view: dict from kyc_portal.services.build_entity_view() for this customer_code.
    """
    existing = VerificationRecord.objects.select_for_update().filter(customer_code=customer_code).order_by("-created_at").first()

    if action == "verified":
        ok, reason = can_verify(entity_view, existing_record=existing, requesting_user=user)
        if not ok:
            return None, reason
        record = VerificationRecord.objects.create(
            customer_code=customer_code,
            representative_name=entity_view.get("representative_name", ""),
            access_card_number=entity_view.get("access_card_number") or "",
            verification_status=VerificationRecord.Status.VERIFIED_SENT,
            verified_by=user, verification_counter=counter_number, verified_at=timezone.now(),
        )
        if remark:
            EntityVotingExtras.objects.update_or_create(
                customer_code=customer_code, defaults={"voting_eligibility_remark": remark}
            )
        AuditLog.record(actor=user, action="verified_sent_for_vote", entity_customer_code=customer_code, details={"remark": remark})

    elif action == "not_eligible":
        if not rejection_reason:
            return None, "Rejection reason is required"
        record = VerificationRecord.objects.create(
            customer_code=customer_code,
            representative_name=entity_view.get("representative_name", ""),
            access_card_number=entity_view.get("access_card_number") or "",
            verification_status=VerificationRecord.Status.NOT_ELIGIBLE,
            rejection_reason=rejection_reason, verified_by=user,
            verification_counter=counter_number, verified_at=timezone.now(),
        )
        AuditLog.record(actor=user, action="marked_not_eligible", entity_customer_code=customer_code, details={"rejection_reason": rejection_reason})
    else:
        return None, "Invalid action"

    release_lock(customer_code, user)
    return record, None
