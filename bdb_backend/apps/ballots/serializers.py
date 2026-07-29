from rest_framework import serializers

from .models import (
    ElectoralRoll, BallotPool, CounterBallotAllocation, CustomerCodeAllotment, AuthRepChange,
    VotingEligibility,
)


class ElectoralRollSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElectoralRoll
        fields = [
            "id", "roll_type", "membership_no", "customer_code", "entity_name",
            "representative_name", "representative_email", "category_tier", "ballot_entitlement",
        ]


class BallotPoolSerializer(serializers.ModelSerializer):
    allocated_total = serializers.IntegerField(read_only=True)
    unallocated = serializers.IntegerField(read_only=True)

    class Meta:
        model = BallotPool
        fields = ["id", "roll_type", "total_ballots", "allocated_total", "unallocated", "updated_at"]


class SetPoolTotalSerializer(serializers.Serializer):
    roll_type = serializers.ChoiceField(choices=["category", "exclusive"])
    total_ballots = serializers.IntegerField(min_value=0)


class CounterBallotAllocationSerializer(serializers.ModelSerializer):
    counter_username = serializers.CharField(source="counter.username", read_only=True)
    counter_name = serializers.SerializerMethodField()
    roll_type = serializers.CharField(source="pool.roll_type", read_only=True)
    used_count = serializers.IntegerField(read_only=True)
    remaining_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = CounterBallotAllocation
        fields = ["id", "pool", "counter", "counter_username", "counter_name", "roll_type", "assigned_count", "used_count", "remaining_count"]

    def get_counter_name(self, obj):
        return obj.counter.get_full_name() or obj.counter.username


class AssignAllocationSerializer(serializers.Serializer):
    roll_type = serializers.ChoiceField(choices=["category", "exclusive"])
    counter = serializers.IntegerField()
    assigned_count = serializers.IntegerField(min_value=0)


class AllotmentCustomerCodeSerializer(serializers.Serializer):
    """One customer code row on the counter's allotment screen."""
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
    on_electoral_roll = serializers.BooleanField()
    roll_type = serializers.CharField(allow_null=True)
    ballot_entitlement = serializers.IntegerField()
    is_eligible = serializers.BooleanField()
    block_reason = serializers.CharField(allow_null=True)
    already_allotted = serializers.BooleanField()
    allotted_at = serializers.DateTimeField(allow_null=True)
    default_selected = serializers.BooleanField()
    selectable = serializers.BooleanField()
    eligibility_source = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    eligibility_remark = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    eligibility_updated_by = serializers.CharField(required=False, allow_null=True)


class AllotmentSearchResultSerializer(serializers.Serializer):
    access_card_number = serializers.CharField()
    representative_name = serializers.CharField(allow_null=True)
    representative_id = serializers.CharField(allow_null=True)
    customer_codes = AllotmentCustomerCodeSerializer(many=True)
    pending_count = serializers.IntegerField()
    already_allotted_count = serializers.IntegerField()


class AllotmentSearchRequestSerializer(serializers.Serializer):
    access_card_number = serializers.CharField(max_length=50)


class AllotCodesRequestSerializer(serializers.Serializer):
    access_card_number = serializers.CharField(max_length=50)
    customer_codes = serializers.ListField(child=serializers.CharField(max_length=50), allow_empty=False)


class CustomerCodeAllotmentSerializer(serializers.ModelSerializer):
    allotted_by_username = serializers.CharField(source="allotted_by.username", read_only=True, default=None)

    class Meta:
        model = CustomerCodeAllotment
        fields = [
            "id", "access_card_number", "customer_code", "entity_name",
            "roll_type", "ballots_allotted", "allotted_by_username", "allotted_at",
        ]


class AuthRepChangeSerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source="changed_by.username", read_only=True, default=None)

    class Meta:
        model = AuthRepChange
        fields = [
            "id", "customer_code", "old_representative_name", "old_access_card_number",
            "new_representative_name", "new_access_card_number", "new_photo", "attachment",
            "changed_by_username", "changed_at",
        ]
        read_only_fields = ["old_representative_name", "old_access_card_number", "changed_by_username", "changed_at"]




class SetVotingEligibilitySerializer(serializers.Serializer):
    customer_code = serializers.CharField()
    is_eligible = serializers.BooleanField()
    remark = serializers.CharField(required=False, allow_blank=True)


class VotingEligibilitySerializer(serializers.ModelSerializer):
    updated_by_username = serializers.CharField(source="updated_by.username", read_only=True, default=None)

    class Meta:
        model = VotingEligibility
        fields = ["id", "customer_code", "is_eligible", "remarks", "updated_by_username", "updated_at"]
