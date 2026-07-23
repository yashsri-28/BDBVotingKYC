from rest_framework import serializers


class EntityViewSerializer(serializers.Serializer):
    """
    Serializes the combined dict from services.build_entity_view() —
    not a ModelSerializer since this data is assembled from two real
    tables (users + members_master) plus a derived KYC status.
    """
    customer_code = serializers.CharField()
    entity_name = serializers.CharField()
    membership_number = serializers.CharField(allow_null=True)
    category = serializers.CharField(allow_null=True)
    member_group = serializers.CharField(allow_null=True)
    membership_status = serializers.CharField()
    kyc_status = serializers.CharField()
    annual_fee_status = serializers.CharField()
    voting_eligibility = serializers.CharField()
    representative_name = serializers.CharField(allow_null=True)
    access_card_number = serializers.CharField(allow_null=True)
    photograph_path = serializers.CharField(allow_null=True)
