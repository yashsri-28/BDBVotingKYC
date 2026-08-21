from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .serializers import EntityViewSerializer
# from .services import manual_search
from .services import manual_search, resolve_credential ,get_all_members
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



class ResolveCredentialView(APIView):
    """
    GET /api/kyc/resolve-credential/?credential_no=87490 — called right
    after a card scan (see sipass_integration) to translate the raw
    reader number into the same Access Card Number that manual_search
    and the ballot allotment search already use.
    """

    @swagger_auto_schema(
        tags=["KYC Portal"],
        manual_parameters=[openapi.Parameter("credential_no", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=True)],
        responses={200: "access_card_number", 404: "Not found"},
    )
    def get(self, request):
        credential_no = request.query_params.get("credential_no", "").strip()
        if not credential_no:
            return Response({"detail": "Query parameter 'credential_no' is required."}, status=status.HTTP_400_BAD_REQUEST)

        access_code = resolve_credential(credential_no)
        if not access_code:
            return Response({"detail": "No member found for this credential."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"access_card_number": access_code})


class AllMembersView(APIView):
    """
    GET /api/kyc/all-members/?page=&search= — paginated listing of every
    member with full entity view data, for the Auth Rep Management screen.
    """

    @swagger_auto_schema(
        tags=["KYC Portal"],
        manual_parameters=[
            openapi.Parameter("page", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=1),
            openapi.Parameter("search", openapi.IN_QUERY, type=openapi.TYPE_STRING, required=False),
        ],
        responses={200: EntityViewSerializer(many=True)},
    )
    def get(self, request):
        page = int(request.query_params.get("page", 1))
        search = request.query_params.get("search", "").strip() or None

        data = get_all_members(search=search, page=page)
        return Response({
            "results": EntityViewSerializer(data["results"], many=True).data,
            "count": data["count"],
            "next": data["next"],
            "previous": data["previous"],
            "total_pages": data["total_pages"],
        })
