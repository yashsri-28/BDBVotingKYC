from rest_framework import serializers
from .models import CounterMapping


class CounterMappingSerializer(serializers.ModelSerializer):
    staff_username = serializers.CharField(source="staff.username", read_only=True)

    class Meta:
        model = CounterMapping
        fields = ["id", "staff", "staff_username", "hid_reader_name", "counter_number", "is_active"]
