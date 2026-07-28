from rest_framework import serializers

from .models import Ballot, BallotVote, Candidate, ElectionCategory


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = ["id", "category", "serial_no", "candidate_name", "member_name", "is_active"]

    def validate_serial_no(self, value):
        if value < 1:
            raise serializers.ValidationError("Candidate serial number must be 1 or greater.")
        return value


class ElectionCategorySerializer(serializers.ModelSerializer):
    votes_per_ballot = serializers.IntegerField(read_only=True)
    candidate_count = serializers.SerializerMethodField()
    ballots_counted = serializers.SerializerMethodField()

    class Meta:
        model = ElectionCategory
        fields = [
            "id", "name", "kind", "election_year", "sequence", "status",
            "votes_per_ballot", "candidate_count", "ballots_counted",
            "activated_at", "completed_at",
        ]
        read_only_fields = ["status", "activated_at", "completed_at"]

    def get_candidate_count(self, obj):
        return obj.candidates.filter(is_active=True).count()

    def get_ballots_counted(self, obj):
        return obj.ballots.count()


class RecordBallotSerializer(serializers.Serializer):
    """
    What the counting screen submits: the ballot number, and the serial
    numbers of the candidates that ballot voted for.
    """
    ballot_no = serializers.IntegerField(min_value=1)
    candidate_serials = serializers.ListField(
        child=serializers.IntegerField(min_value=1), allow_empty=False, max_length=10,
    )


class BallotSerializer(serializers.ModelSerializer):
    candidate_serials = serializers.SerializerMethodField()
    counted_by_username = serializers.CharField(source="counted_by.username", read_only=True, default=None)

    class Meta:
        model = Ballot
        fields = ["id", "category", "ballot_no", "candidate_serials", "counted_by_username", "counted_at"]

    def get_candidate_serials(self, obj):
        return sorted(v.candidate.serial_no for v in obj.votes.all())


class DeleteBallotSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True, max_length=255)
