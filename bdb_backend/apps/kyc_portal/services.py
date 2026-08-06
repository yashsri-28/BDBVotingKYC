"""
KYC Portal read/query services — now backed by the REAL tables
(users, members_master, kyc_submissions) in Kyc_DB_new_3.

Confirmed real-world behavior (2026-07-23):
  - One access_code (SiPass card) can map to MULTIPLE `users` rows, each
    with a different sap_code/customer_code -> this is Scenario B
    (multi-entity representative).
"""
from django.db.models import Q
from .models import KycUser, MembersMaster, KycSubmission




def find_users_by_card(access_card_number):
    """
    ...

    Fallback (added for the card-reader scan flow): some members have no
    access_code assigned yet in the live KYC data, only a credential_no.
    For those, resolve_credential() in this file returns their sap_code
    (customer_code) instead of an access_code, so this function also
    tries matching directly on sap_code as a last resort.
    """
    direct_matches = list(KycUser.objects.filter(access_code=access_card_number))
    if direct_matches:
        return direct_matches

    from apps.ballots.models import AuthRepChange

    override = (
        AuthRepChange.objects.filter(new_access_card_number=access_card_number)
        .order_by("-changed_at")
        .first()
    )
    if override:
        return list(KycUser.objects.filter(sap_code=override.customer_code))

    # Last resort: treat the input as a customer_code (sap_code) directly —
    # covers members who have a credential_no but no access_code yet.
    customer_code_matches = list(KycUser.objects.filter(sap_code=access_card_number))
    if customer_code_matches:
        return customer_code_matches

    return []


def get_member_for_user(kyc_user):
    """A KycUser's sap_code matches members_master.customer_code directly."""
    if not kyc_user.sap_code:
        return None
    return MembersMaster.objects.filter(customer_code=kyc_user.sap_code).first()


def build_entity_view(kyc_user, member):
    """
    Combines KycUser + MembersMaster + derived KYC/payment status into the
    single flat structure the rest of the app (validators, serializers)
    expects. Not a Django model — just a plain dict, since the "Entity"
    concept here is assembled from multiple real tables + Voting DB.

    Checks apps.ballots.models.AuthRepChange first: if a Super Admin has
    changed the Authorized Representative for this customer code, that
    override wins over the live (read-only) KYC Portal data.

    Voting eligibility decision table (confirmed 2026-07-29):
      1. SuperAdmin override (VotingEligibility) exists -> that wins,
         whatever it says (Eligible or Not Eligible), with its remark.
      2. No override -> online payment (online_payments, latest record)
         must be "Paid" AND KYC (kyc_submissions, latest) must be
         "Approved" for the entity to be Eligible.
      3. Anything else -> Not Eligible.
    """
    from apps.ballots.models import AuthRepChange, VotingEligibility
    from .models import OnlinePayment
    from apps.ballots.models import VotingStatus

    kyc_approved = KycSubmission.is_kyc_approved(member.customer_code)
    kyc_status = "yes" if kyc_approved else "no"

    fee_paid = OnlinePayment.is_fee_paid(member.customer_code)
    annual_fee_status = "paid" if fee_paid else "unpaid"

    representative_name = kyc_user.name
    access_card_number = kyc_user.access_code
    photograph_path = kyc_user.profile_picture

    override = AuthRepChange.current_override_for(member.customer_code)
    if override:
        representative_name = override.new_representative_name
        access_card_number = override.new_access_card_number or access_card_number
        if override.new_photo:
            photograph_path = override.new_photo.name

    eligibility_override = VotingEligibility.objects.filter(customer_code=member.customer_code).first()
    voting_status = VotingStatus.objects.filter(customer_code=member.customer_code).first()
    voting_done = voting_status.voting_done if voting_status else False

    # if eligibility_override:
    #     # Rule 1: SuperAdmin's manual on-the-spot decision always wins.
    #     voting_eligibility = "eligible" if eligibility_override.is_eligible else "not_eligible"
    #     eligibility_source = "admin_override"
    #     eligibility_remark = eligibility_override.remarks
    # elif fee_paid and kyc_approved:
    #     # Rule 2: normal path -- online payment done AND KYC approved.
    #     voting_eligibility = "eligible"
    #     eligibility_source = "online_payment_kyc"
    #     eligibility_remark = ""
    # else:
    #     # Rule 3: everything else is Not Eligible until SuperAdmin overrides.
    #     voting_eligibility = "not_eligible"
    #     eligibility_source = "online_payment_kyc"
    #     eligibility_remark = ""
    # if eligibility_override:
    #     voting_eligibility = "eligible" if eligibility_override.is_eligible else "not_eligible"
    #     eligibility_source = "admin_override"
    #     eligibility_remark = eligibility_override.remarks
    #     eligibility_updated_by = eligibility_override.updated_by.username if eligibility_override.updated_by else None
    # elif fee_paid and kyc_approved:
    #     voting_eligibility = "eligible"
    #     eligibility_source = "online_payment_kyc"
    #     eligibility_remark = ""
    #     eligibility_updated_by = None
    # else:
    #     voting_eligibility = "not_eligible"
    #     eligibility_source = "online_payment_kyc"
    #     eligibility_remark = ""
    #     eligibility_updated_by = None
    if eligibility_override:
        voting_eligibility = "eligible" if eligibility_override.is_eligible else "not_eligible"
        eligibility_source = "admin_override"
        eligibility_remark = eligibility_override.remarks
        eligibility_updated_by = eligibility_override.updated_by.username if eligibility_override.updated_by else None
        ineligibility_reason = eligibility_remark if not eligibility_override.is_eligible else ""
    elif fee_paid and kyc_approved:
        voting_eligibility = "eligible"
        eligibility_source = "online_payment_kyc"
        eligibility_remark = ""
        eligibility_updated_by = None
        ineligibility_reason = ""
    else:
        voting_eligibility = "not_eligible"
        eligibility_source = "online_payment_kyc"
        eligibility_remark = ""
        eligibility_updated_by = None
        # Build a specific, dynamic reason instead of a generic message.
        missing = []
        if not fee_paid:
            missing.append("Annual payment not valid for the current financial year")
        if not kyc_approved:
            missing.append("KYC not approved")
        ineligibility_reason = "; ".join(missing)

    return {
        "customer_code": member.customer_code,
        "entity_name": member.member_name,
        "membership_number": member.membership_no,
        "category": member.member_category,
        "member_group": member.group_name,
        "membership_status": "active" if member.is_membership_active else "inactive",
        "kyc_status": kyc_status,
        "annual_fee_status": annual_fee_status,
        "voting_eligibility": voting_eligibility,
        "eligibility_source": eligibility_source,
        "eligibility_remark": eligibility_remark,
        "representative_name": representative_name,
        "access_card_number": access_card_number,
        "photograph_path": photograph_path,
        "eligibility_updated_by": eligibility_updated_by,
        "ineligibility_reason": ineligibility_reason,
        "voting_done": voting_done,

        "is_rep_changed": override is not None,
        "rep_changed_at": override.changed_at if override else None,
        "rep_changed_by": override.changed_by.username if override else None,
    }

def get_entity_view_by_customer_code(customer_code):
    """Used by lock/verify endpoints, which operate on customer_code directly (not a fresh card tap)."""
    member = MembersMaster.objects.filter(customer_code=customer_code).first()
    if not member:
        return None
    user = KycUser.objects.filter(sap_code=customer_code).first()
    if not user:
        return None
    return build_entity_view(user, member)


def manual_search(query):
    """
    Manual search by Membership No. / Customer Code / Entity Name / Rep Name / Access Card.
    """
    members = MembersMaster.objects.filter(
        Q(membership_no__icontains=query)
        | Q(customer_code__icontains=query)
        | Q(member_name__icontains=query)
    )
    matching_codes = set(members.values_list("customer_code", flat=True))

    rep_matches = KycUser.objects.filter(
        Q(name__icontains=query) | Q(access_code__icontains=query)
    ).exclude(sap_code__isnull=True)
    matching_codes.update(rep_matches.values_list("sap_code", flat=True))

    results = []
    for code in matching_codes:
        member = MembersMaster.objects.filter(customer_code=code).first()
        if not member:
            continue
        user = KycUser.objects.filter(sap_code=code).first()
        if not user:
            continue
        results.append(build_entity_view(user, member))
    return results


def resolve_credential(credential_no):
    """
    Looks up which access_code (Access Card Number) a raw reader
    credential_no belongs to, so an automatic card-scan can be
    resolved into the same identifier manual_search already accepts.

    Fallback: if the matched member has no access_code assigned yet
    (common for members whose KYC data is incomplete), returns their
    sap_code (customer_code) instead -- find_users_by_card() has a
    matching fallback to accept either.

    Returns None if no member is linked to this credential at all.
    """
    user = KycUser.objects.filter(credential_no=credential_no).first()
    if not user:
        return None
    return user.access_code or user.sap_code