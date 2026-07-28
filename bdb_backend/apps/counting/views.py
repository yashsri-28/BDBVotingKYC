from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsCountingUser, IsSuperAdmin

from . import services
from .models import Ballot, Candidate, ElectionCategory
from .serializers import (
    BallotSerializer, CandidateSerializer, DeleteBallotSerializer,
    ElectionCategorySerializer, RecordBallotSerializer,
)

_tag = swagger_auto_schema(tags=["Vote Counting"])


def _tagged(*names):
    """Applies the Vote Counting swagger tag to the given viewset actions."""
    def decorate(cls):
        for name in names:
            cls = method_decorator(name=name, decorator=_tag)(cls)
        return cls
    return decorate


@_tagged("list", "retrieve", "create", "update", "partial_update", "destroy")
class ElectionCategoryViewSet(viewsets.ModelViewSet):
    """
    The categories being contested. Super Admin creates and activates
    them; counting users only read them.
    """
    queryset = ElectionCategory.objects.all()
    serializer_class = ElectionCategorySerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        year = self.request.query_params.get("election_year")
        return qs.filter(election_year=year) if year else qs


@_tagged("list", "retrieve", "create", "update", "partial_update", "destroy")
class CandidateViewSet(viewsets.ModelViewSet):
    """Candidate Master. Super Admin maintains it; counting users read it."""
    queryset = Candidate.objects.select_related("category").all()
    serializer_class = CandidateSerializer

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get("category")
        return qs.filter(category_id=category_id) if category_id else qs


class StartCountingView(APIView):
    """POST /api/counting/categories/{pk}/start/ — Super Admin opens a category."""
    permission_classes = [IsSuperAdmin]

    @swagger_auto_schema(tags=["Vote Counting"], responses={200: ElectionCategorySerializer, 409: "Another category is still in progress"})
    def post(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()
        category = services.start_counting(category, actor=request.user)
        return Response(ElectionCategorySerializer(category).data)


class CompleteCountingView(APIView):
    """POST /api/counting/categories/{pk}/complete/ — closes a category, unlocking the next."""
    permission_classes = [IsSuperAdmin]

    @swagger_auto_schema(tags=["Vote Counting"], responses={200: ElectionCategorySerializer, 409: "Category is not currently being counted"})
    def post(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()
        category = services.complete_counting(category, actor=request.user)
        return Response(ElectionCategorySerializer(category).data)


class RecordBallotView(APIView):
    """
    POST /api/counting/categories/{pk}/ballots/ — the counting screen's
    save action. All ballot validations happen in services.record_ballot.
    """
    permission_classes = [IsCountingUser]

    @swagger_auto_schema(
        tags=["Vote Counting"], request_body=RecordBallotSerializer,
        responses={
            201: BallotSerializer, 400: "Vote count or candidate serials are invalid",
            409: "Duplicate ballot number, or counting is not open",
        },
    )
    def post(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()

        serializer = RecordBallotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ballot = services.record_ballot(
            category,
            ballot_no=serializer.validated_data["ballot_no"],
            candidate_serials=serializer.validated_data["candidate_serials"],
            actor=request.user,
        )
        return Response(BallotSerializer(ballot).data, status=status.HTTP_201_CREATED)


class BallotDetailView(APIView):
    """DELETE /api/counting/ballots/{pk}/ — correct a wrongly-entered ballot."""
    permission_classes = [IsCountingUser]

    @swagger_auto_schema(tags=["Vote Counting"], request_body=DeleteBallotSerializer, responses={204: "Deleted", 404: "Ballot not found"})
    def delete(self, request, pk):
        ballot = Ballot.objects.filter(pk=pk).select_related("category").first()
        if ballot is None:
            return Response({"detail": "That ballot could not be found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeleteBallotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.delete_ballot(ballot, actor=request.user, reason=serializer.validated_data.get("reason", ""))
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryBallotsView(APIView):
    """GET /api/counting/categories/{pk}/ballots/ — ballots entered so far."""
    permission_classes = [IsCountingUser]

    @swagger_auto_schema(tags=["Vote Counting"], responses={200: BallotSerializer(many=True)})
    def get(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()
        ballots = category.ballots.prefetch_related("votes__candidate").order_by("-ballot_no")[:200]
        return Response(BallotSerializer(ballots, many=True).data)


class LiveTotalsView(APIView):
    """
    GET /api/counting/categories/{pk}/live/ — running totals, both by
    serial number and by leading votes. The member display screen polls
    this and re-renders.
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Vote Counting"], responses={200: "Live totals for the category"})
    def get(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()
        return Response(services.live_totals(category))


class DetailedBallotReportView(APIView):
    """GET /api/counting/categories/{pk}/report/detailed/ — ballot-by-ballot grid."""
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(tags=["Vote Counting"], responses={200: "Detailed ballot list"})
    def get(self, request, pk):
        category = _get_category_or_404(pk)
        if category is None:
            return _category_not_found()
        return Response(services.detailed_ballot_list(category))


def _get_category_or_404(pk):
    return ElectionCategory.objects.filter(pk=pk).first()


def _category_not_found():
    return Response({"detail": "That election category could not be found."}, status=status.HTTP_404_NOT_FOUND)
