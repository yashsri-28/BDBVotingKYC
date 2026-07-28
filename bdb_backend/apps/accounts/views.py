from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema

from .serializers import CounterStaffLoginSerializer, CounterStaffSerializer
from .session_limiter import clear_session


class CounterStaffLoginView(TokenObtainPairView):
    """POST /api/auth/login/  -> {access, refresh, user, counter}"""
    serializer_class = CounterStaffLoginSerializer

    @swagger_auto_schema(tags=["Auth"])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MeView(APIView):
    """GET /api/auth/me/  -> current logged-in counter staff profile."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Auth"])
    def get(self, request):
        return Response(CounterStaffSerializer(request.user).data)


class LogoutView(APIView):
    """POST /api/auth/logout/  -> releases the single-session lock."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Auth"], operation_description="Clears active session so the account can log in elsewhere.")
    def post(self, request):
        clear_session(request.user)
        return Response({"detail": "Logged out."})


from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action

from .permissions import IsSuperAdmin
from .serializers import (
    LoginListSerializer, CreateLoginSerializer, ResetPasswordResponseSerializer,
)
from .serializers import _generate_temp_password
from apps.audit.models import AuditLog

CounterStaff = get_user_model()


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Super Admin's User Management screen (Section 8.1). Creates Counter
    and Counting logins, activates/deactivates them, and resets
    passwords. No self-signup exists anywhere else in this system.
    """
    queryset = CounterStaff.objects.exclude(role=CounterStaff.Role.ADMIN).order_by("-date_joined")
    permission_classes = [IsSuperAdmin]

    def get_serializer_class(self):
        return CreateLoginSerializer if self.action == "create" else LoginListSerializer

    @swagger_auto_schema(tags=["User Management"])
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        AuditLog.record(
            actor=request.user, action="login_created",
            details={"username": user.username, "role": user.role},
        )
        response_data = LoginListSerializer(user).data
        response_data["temp_password"] = user._temp_password
        return Response(response_data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(tags=["User Management"])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="activate")
    @swagger_auto_schema(tags=["User Management"], request_body=None)
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save(update_fields=["is_active"])
        AuditLog.record(actor=request.user, action="login_activated", details={"username": user.username})
        return Response(LoginListSerializer(user).data)

    @action(detail=True, methods=["post"], url_path="deactivate")
    @swagger_auto_schema(tags=["User Management"], request_body=None)
    def deactivate(self, request, pk=None):
        user = self.get_object()
        user.is_active = False
        user.save(update_fields=["is_active"])
        AuditLog.record(actor=request.user, action="login_deactivated", details={"username": user.username})
        return Response(LoginListSerializer(user).data)

    @action(detail=True, methods=["post"], url_path="reset-password")
    @swagger_auto_schema(tags=["User Management"], request_body=None, responses={200: ResetPasswordResponseSerializer})
    def reset_password(self, request, pk=None):
        """Generates a new password and returns it once -- the Super Admin relays it to the user directly."""
        user = self.get_object()
        new_password = _generate_temp_password()
        user.set_password(new_password)
        user.save(update_fields=["password"])
        AuditLog.record(actor=request.user, action="password_reset", details={"username": user.username})
        return Response({"username": user.username, "new_password": new_password})
