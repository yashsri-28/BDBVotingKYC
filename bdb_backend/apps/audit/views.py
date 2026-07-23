from rest_framework import viewsets, mixins
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsSupervisorOrAdmin


class AuditLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """GET /api/audit/logs/?customer_code=C00030 — read-only, supervisor/admin only."""
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsSupervisorOrAdmin]

    @swagger_auto_schema(tags=["Audit"], manual_parameters=[openapi.Parameter("customer_code", openapi.IN_QUERY, type=openapi.TYPE_STRING)])
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        customer_code = self.request.query_params.get("customer_code")
        return qs.filter(entity_customer_code=customer_code) if customer_code else qs
