from rest_framework import serializers


class TapSerializer(serializers.Serializer):
    access_card_number = serializers.CharField()
    reader_name = serializers.CharField()
    timestamp = serializers.FloatField()


class SimulateTapRequestSerializer(serializers.Serializer):
    access_card_number = serializers.CharField(required=False)
    reader_name = serializers.CharField(required=False, default="READER-C1")


class ScanSerializer(serializers.Serializer):
    device_id = serializers.CharField()
    credential_no = serializers.CharField()
