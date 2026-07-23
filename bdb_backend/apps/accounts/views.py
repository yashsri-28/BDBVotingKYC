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
