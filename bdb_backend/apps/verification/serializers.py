from rest_framework import serializers
from apps.kyc_portal.serializers import EntityViewSerializer
from .models import VerificationRecord, REJECTION_REASONS


class LookupByCardRequestSerializer(serializers.Serializer):
    access_card_number = serializers.CharField()


class VerifyActionRequestSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["verified", "not_eligible"])
    remark = serializers.CharField(required=False, allow_blank=True)
    rejection_reason = serializers.ChoiceField(choices=REJECTION_REASONS, required=False)


class VerificationRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRecord
        fields = [
            "id", "customer_code", "representative_name", "access_card_number",
            "verification_status", "rejection_reason", "verified_by",
            "verification_counter", "verified_at", "created_at",
        ]
