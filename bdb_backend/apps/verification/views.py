from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema

from apps.kyc_portal.services import get_entity_view_by_customer_code
from apps.kyc_portal.serializers import EntityViewSerializer
from .serializers import (
    LookupByCardRequestSerializer, VerifyActionRequestSerializer, VerificationRecordSerializer,
)
from . import services
from .exceptions import RecordLocked, NotAuthorizedRepresentative


class LookupByCardView(APIView):
    """POST /api/verification/lookup-by-card/ — Scenario A/B resolution."""

    @swagger_auto_schema(
        tags=["Verification"], request_body=LookupByCardRequestSerializer,
        responses={200: "Scenario A or B payload", 404: "Not an Authorized Representative"},
    )
    def post(self, request):
        serializer = LookupByCardRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.lookup_by_card(serializer.validated_data["access_card_number"], actor=request.user)
        return Response(result)


class EntityLockView(APIView):
    """POST/DELETE /api/verification/{customer_code}/lock/ — acquire/release lock before verify screen."""

    @swagger_auto_schema(tags=["Verification"], responses={200: "Lock acquired", 404: "Entity not found", 409: "Already locked by another counter"})
    def post(self, request, customer_code):
        if get_entity_view_by_customer_code(customer_code) is None:
            return Response({"detail": "Entity not found."}, status=status.HTTP_404_NOT_FOUND)
        try:
            services.acquire_lock(customer_code, request.user)
        except RecordLocked as e:
            return Response({"detail": str(e)}, status=status.HTTP_409_CONFLICT)
        return Response({"detail": "Lock acquired."})

    @swagger_auto_schema(tags=["Verification"])
    def delete(self, request, customer_code):
        services.release_lock(customer_code, request.user)
        return Response({"detail": "Lock released."})


class VerifyEntityView(APIView):
    """POST /api/verification/{customer_code}/verify/ — final decision: verified | not_eligible."""

    @swagger_auto_schema(tags=["Verification"], request_body=VerifyActionRequestSerializer, responses={200: VerificationRecordSerializer, 400: "Validation error", 404: "Entity not found"})
    def post(self, request, customer_code):
        entity_view = get_entity_view_by_customer_code(customer_code)
        if entity_view is None:
            return Response({"detail": "Entity not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VerifyActionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        counter_number = getattr(getattr(request.user, "counter_mapping", None), "counter_number", "")
        record, error = services.verify_entity(
            customer_code, entity_view, request.user,
            action=data["action"], remark=data.get("remark", ""),
            rejection_reason=data.get("rejection_reason"), counter_number=counter_number,
        )
        if error:
            return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)
        return Response(VerificationRecordSerializer(record).data)
