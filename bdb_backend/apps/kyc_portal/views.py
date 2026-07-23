from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import EntityViewSerializer
from .services import manual_search
from apps.audit.models import AuditLog


class ManualSearchView(APIView):
    """GET /api/kyc/manual-search/?q=... — BRD rule #11: every manual search is logged."""

    @swagger_auto_schema(
        tags=["KYC Portal"],
        manual_parameters=[openapi.Parameter("q", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True)],
        responses={200: EntityViewSerializer(many=True)},
    )
    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"detail": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

        results = manual_search(q)
        AuditLog.record(
            actor=request.user, action="manual_search",
            details={"query": q, "result_count": len(results)},
        )

        if not results:
            return Response({"detail": "Membership Not Found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(EntityViewSerializer(results, many=True).data)
