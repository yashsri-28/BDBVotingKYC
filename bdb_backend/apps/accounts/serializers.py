from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .session_limiter import has_other_active_session, bind_session
from .exceptions import AlreadyLoggedInElsewhere

CounterStaff = get_user_model()


class CounterStaffLoginSerializer(TokenObtainPairSerializer):
    """
    JWT login. Also enforces single-active-session and embeds role +
    counter mapping in the response so the frontend needs no second call.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        request = self.context.get("request")
        raw_session_key = request.META.get("HTTP_X_CLIENT_SESSION", "") if request else ""
        session_key = raw_session_key or f"session-{user.id}"

        if has_other_active_session(user, session_key):
            raise AlreadyLoggedInElsewhere()

        bind_session(user, session_key)

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "full_name": user.get_full_name(),
            "role": user.role,
        }
        mapping = getattr(user, "counter_mapping", None)
        data["counter"] = (
            {"hid_reader_name": mapping.hid_reader_name, "counter_number": mapping.counter_number}
            if mapping else None
        )
        return data


class CounterStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = CounterStaff
        fields = ["id", "username", "first_name", "last_name", "role", "employee_code", "is_active_shift"]
        read_only_fields = ["id"]
