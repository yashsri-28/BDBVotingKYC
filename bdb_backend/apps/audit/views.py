# from rest_framework import viewsets, mixins
# from drf_yasg.utils import swagger_auto_schema
# from drf_yasg import openapi

# from .models import AuditLog
# from .serializers import AuditLogSerializer
# from apps.accounts.permissions import IsSuperAdmin


# class AuditLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
#     """GET /api/audit/logs/?customer_code=C00030 — read-only, supervisor/admin only."""
#     queryset = AuditLog.objects.select_related("actor").all()
#     serializer_class = AuditLogSerializer
#     permission_classes = [IsSuperAdmin]

#     @swagger_auto_schema(tags=["Audit"], manual_parameters=[openapi.Parameter("customer_code", openapi.IN_QUERY, type=openapi.TYPE_STRING)])
#     def list(self, request, *args, **kwargs):
#         return super().list(request, *args, **kwargs)

#     def get_queryset(self):
#         qs = super().get_queryset()
#         customer_code = self.request.query_params.get("customer_code")
#         return qs.filter(entity_customer_code=customer_code) if customer_code else qs




from rest_framework import viewsets, mixins
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.accounts.permissions import IsSuperAdmin


class AuditLogViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    GET /api/audit/logs/?customer_code=C00030 — read-only, super admin only.
    GET /api/audit/logs/?action=auth_rep_changed,voting_eligibility_set
        — filters to one or more specific action types (comma-separated),
        so the SuperAdmin Actions Report can ask the database for only
        the relevant rows instead of paging through the entire audit log.
    """
    queryset = AuditLog.objects.select_related("actor").all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsSuperAdmin]

    @swagger_auto_schema(
        tags=["Audit"],
        manual_parameters=[
            openapi.Parameter("customer_code", openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter("action", openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Comma-separated action names"),
        ],
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        qs = super().get_queryset()
        customer_code = self.request.query_params.get("customer_code")
        if customer_code:
            qs = qs.filter(entity_customer_code=customer_code)

        action = self.request.query_params.get("action")
        if action:
            action_list = [a.strip() for a in action.split(",") if a.strip()]
            if action_list:
                qs = qs.filter(action__in=action_list)

        return qs