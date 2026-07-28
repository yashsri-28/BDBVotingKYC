from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from rest_framework import permissions, status, viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema

from apps.accounts.permissions import IsAdminOrCounting, IsSupervisorOrAdmin, IsSuperAdmin
from apps.audit.models import AuditLog
from apps.kyc_portal.services import get_entity_view_by_customer_code

from . import allotment_services, services
from .models import (
    AuthRepChange, BallotPool, CounterBallotAllocation, CustomerCodeAllotment, ElectoralRoll,
)
from .serializers import (
    AllotCodesRequestSerializer, AllotmentSearchRequestSerializer, AllotmentSearchResultSerializer,
    AssignAllocationSerializer, AuthRepChangeSerializer, BallotPoolSerializer,
    CounterBallotAllocationSerializer, CustomerCodeAllotmentSerializer,
    ElectoralRollSerializer, SetPoolTotalSerializer,
)

CounterStaff = get_user_model()
_tag = swagger_auto_schema(tags=["Ballots"])


def _tagged(*names):
    def decorate(cls):
        for name in names:
            cls = method_decorator(name=name, decorator=_tag)(cls)
        return cls
    return decorate


@_tagged("list", "retrieve")
class ElectoralRollViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/ballots/electoral-roll/?roll_type=category&search=... — the imported voter rolls."""
    queryset = ElectoralRoll.objects.all()
    serializer_class = ElectoralRollSerializer
    permission_classes = [IsSupervisorOrAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        roll_type = self.request.query_params.get("roll_type")
        search = self.request.query_params.get("search")
        if roll_type:
            qs = qs.filter(roll_type=roll_type)
        if search:
            qs = qs.filter(entity_name__icontains=search)
        return qs


@_tagged("list", "retrieve")
class BallotPoolViewSet(viewsets.ReadOnlyModelViewSet):
    """Everyone signed in can view base pools; only Super Admin can change them (see SetPoolTotalView)."""
    queryset = BallotPool.objects.all()
    serializer_class = BallotPoolSerializer
    permission_classes = [permissions.IsAuthenticated]


class SetPoolTotalView(APIView):
    """POST /api/ballots/pools/set-total/ — Super Admin only."""
    permission_classes = [IsSuperAdmin]

    @_tag
    def post(self, request):
        serializer = SetPoolTotalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pool = services.set_pool_total(**serializer.validated_data, actor=request.user)
        return Response(BallotPoolSerializer(pool).data)


@_tagged("list", "retrieve")
class CounterBallotAllocationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/ballots/allocations/ — Super Admin sees every counter
    (feeds the All-Counter Matrix); a Counter sees only their own row.
    """
    queryset = CounterBallotAllocation.objects.select_related("pool", "counter").all()
    serializer_class = CounterBallotAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, "swagger_fake_view", False):
            return qs.none()
        if self.request.user.role != CounterStaff.Role.ADMIN:
            qs = qs.filter(counter=self.request.user)
        return qs


class AssignAllocationView(APIView):
    """POST /api/ballots/allocations/assign/ — Super Admin allots a pool to a Counter."""
    permission_classes = [IsSuperAdmin]

    @_tag
    def post(self, request):
        serializer = AssignAllocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        pool = BallotPool.objects.filter(roll_type=data["roll_type"]).first()
        if pool is None:
            return Response({"detail": f"No base pool exists for '{data['roll_type']}' yet. Set its total first."}, status=status.HTTP_404_NOT_FOUND)
        counter = CounterStaff.objects.filter(pk=data["counter"], role=CounterStaff.Role.SUPERVISOR).first()
        if counter is None:
            return Response({"detail": "That Counter login could not be found."}, status=status.HTTP_404_NOT_FOUND)
        allocation = services.assign_to_counter(pool, counter, data["assigned_count"], actor=request.user)
        return Response(CounterBallotAllocationSerializer(allocation).data)


class DashboardSummaryView(APIView):
    """GET /api/ballots/dashboard/ — Super Admin (full) / Counting (read-only): the All-Counter Matrix."""
    permission_classes = [IsAdminOrCounting]

    @_tag
    def get(self, request):
        return Response(services.dashboard_summary())


class CounterOwnSummaryView(APIView):
    """GET /api/ballots/my-summary/ — a Counter's own Received/Distributed/Balance."""
    permission_classes = [permissions.IsAuthenticated]

    @_tag
    def get(self, request):
        return Response(services.counter_own_summary(request.user))


class AllotmentSearchView(APIView):
    """
    POST /api/ballots/allotment/search/ — the Counter's search screen.
    Returns every customer code under an access card, pre-selected where
    it can be allotted, flagged where it already has been.
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        tags=["Ballots"], request_body=AllotmentSearchRequestSerializer,
        responses={200: AllotmentSearchResultSerializer, 404: "No representative mapped to that card"},
    )
    def post(self, request):
        serializer = AllotmentSearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = allotment_services.search_access_card(
                serializer.validated_data["access_card_number"], actor=request.user
            )
        except allotment_services.AllotmentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(AllotmentSearchResultSerializer(result).data)


class AllotCodesView(APIView):
    """POST /api/ballots/allotment/allot/ — saves the selected customer codes."""
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        tags=["Ballots"], request_body=AllotCodesRequestSerializer,
        responses={201: CustomerCodeAllotmentSerializer(many=True), 400: "Selection could not be allotted"},
    )
    def post(self, request):
        serializer = AllotCodesRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            created = allotment_services.allot_customer_codes(
                serializer.validated_data["access_card_number"],
                serializer.validated_data["customer_codes"],
                actor=request.user,
            )
        except allotment_services.AllotmentError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CustomerCodeAllotmentSerializer(created, many=True).data, status=status.HTTP_201_CREATED)


@_tagged("list", "retrieve")
class CustomerCodeAllotmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/ballots/allotments/ — the Master Allotment Transaction
    Report. Super Admin/Counting see everything; a Counter sees only
    what they personally allotted.
    """
    queryset = CustomerCodeAllotment.objects.select_related("allotted_by").all()
    serializer_class = CustomerCodeAllotmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, "swagger_fake_view", False):
            return qs.none()
        card = self.request.query_params.get("access_card_number")
        roll_type = self.request.query_params.get("roll_type")
        if card:
            qs = qs.filter(access_card_number=card)
        if roll_type:
            qs = qs.filter(roll_type=roll_type)
        if self.request.user.role == CounterStaff.Role.SUPERVISOR:
            qs = qs.filter(allotted_by=self.request.user)
        return qs


class AuthRepChangeView(APIView):
    """
    POST /api/ballots/auth-rep-change/ — Super Admin changes an
    Authorized Representative. Everything is logged, including the
    resolved OLD values, so the audit trail always shows old -> new.
    """
    permission_classes = [IsSuperAdmin]
    parser_classes = [MultiPartParser, FormParser]

    @swagger_auto_schema(tags=["Ballots"], request_body=AuthRepChangeSerializer, responses={201: AuthRepChangeSerializer, 404: "Customer code not found"})
    def post(self, request):
        customer_code = request.data.get("customer_code")
        current = get_entity_view_by_customer_code(customer_code) if customer_code else None
        if current is None:
            return Response({"detail": "That customer code could not be found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AuthRepChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        change = serializer.save(
            old_representative_name=current["representative_name"] or "",
            old_access_card_number=current["access_card_number"] or "",
            changed_by=request.user,
        )

        AuditLog.record(
            actor=request.user, action="auth_rep_changed", entity_customer_code=customer_code,
            details={
                "old_representative_name": change.old_representative_name,
                "new_representative_name": change.new_representative_name,
                "old_access_card_number": change.old_access_card_number,
                "new_access_card_number": change.new_access_card_number,
            },
        )
        return Response(AuthRepChangeSerializer(change).data, status=status.HTTP_201_CREATED)


@_tagged("list", "retrieve")
class AuthRepChangeHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/ballots/auth-rep-change/history/?customer_code=... — Super Admin only."""
    queryset = AuthRepChange.objects.select_related("changed_by").all()
    serializer_class = AuthRepChangeSerializer
    permission_classes = [IsSuperAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        code = self.request.query_params.get("customer_code")
        return qs.filter(customer_code=code) if code else qs
