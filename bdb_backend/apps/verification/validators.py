"""
Section 5 business rules. `entity_view` is the dict produced by
apps.kyc_portal.services.build_entity_view() — a snapshot combining
users + members_master + derived KYC status (see that module's docstring
for exactly where each field comes from in the real KYC Portal DB).
"""
from .models import RecordLock, VerificationRecord


def can_verify(entity_view, existing_record=None, requesting_user=None):
    """
    Returns (True, None) or (False, reason).
    Order matters — first failing rule is the reason shown to the counter.
    """
    if entity_view["membership_status"] != "active":
        return False, "Membership Status is not Active"

    if entity_view["voting_eligibility"] != "eligible":
        return False, "Voting Eligibility is Not Eligible"

    if entity_view["annual_fee_status"] != "paid":
        return False, "Annual Membership Fee is Unpaid"

    if existing_record and existing_record.verification_status != VerificationRecord.Status.PENDING:
        return False, "Verification already completed for this entity"

    if not entity_view.get("access_card_number"):
        return False, "Access Card is invalid or Authorized Representative not mapped"

    customer_code = entity_view["customer_code"]
    lock = RecordLock.objects.filter(customer_code=customer_code).first()
    if lock and (requesting_user is None or lock.locked_by_id != requesting_user.id):
        return False, "Record is currently locked by another counter"

    return True, None


def show_eligibility_remark_checkbox(entity_view, remark=""):
    """Section 3: show checkbox only when KYC=No OR fee unpaid, and remark is substantive (>10 chars)."""
    condition = entity_view["kyc_status"] == "no" or entity_view["annual_fee_status"] == "unpaid"
    return condition and len(remark or "") > 10


def requires_supervisor_approval(entity_view):
    """Photograph unavailable -> flag for supervisor approval (error matrix)."""
    return not entity_view.get("photograph_path")
