import secrets
import string

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .session_limiter import bind_session, has_other_active_session
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

        if not user.is_active:
            raise serializers.ValidationError("This login has been deactivated. Contact your Super Admin.")

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


class LoginListSerializer(serializers.ModelSerializer):
    """One row on the Super Admin's User Management screen."""
    role_label = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = CounterStaff
        fields = [
            "id", "username", "first_name", "last_name", "role", "role_label",
            "is_active", "date_joined", "last_login",
        ]


def _generate_temp_password(length=12):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


class CreateLoginSerializer(serializers.ModelSerializer):
    """
    Super Admin creates a Counter or Counting login. Password is always
    generated server-side and returned once in the response -- there is
    no self-signup and no email flow (confirmed 2026-07-28).
    """

    class Meta:
        model = CounterStaff
        fields = ["id", "username", "first_name", "last_name", "role"]

    def validate_role(self, value):
        if value not in (CounterStaff.Role.SUPERVISOR, CounterStaff.Role.COUNTING):
            raise serializers.ValidationError("Only Counter or Counting logins can be created here.")
        return value

    def create(self, validated_data):
        temp_password = _generate_temp_password()
        user = CounterStaff.objects.create_user(password=temp_password, **validated_data)
        user._temp_password = temp_password  # surfaced once by the view, never stored in plain text
        return user


class ResetPasswordResponseSerializer(serializers.Serializer):
    username = serializers.CharField()
    new_password = serializers.CharField()
