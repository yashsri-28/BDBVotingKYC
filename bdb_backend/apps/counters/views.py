from rest_framework import viewsets, permissions
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from .models import CounterMapping
from .serializers import CounterMappingSerializer
from apps.accounts.permissions import IsSupervisorOrAdmin


@method_decorator(name="list", decorator=swagger_auto_schema(tags=["Counters"]))
@method_decorator(name="create", decorator=swagger_auto_schema(tags=["Counters"]))
@method_decorator(name="retrieve", decorator=swagger_auto_schema(tags=["Counters"]))
@method_decorator(name="update", decorator=swagger_auto_schema(tags=["Counters"]))
@method_decorator(name="partial_update", decorator=swagger_auto_schema(tags=["Counters"]))
@method_decorator(name="destroy", decorator=swagger_auto_schema(tags=["Counters"]))
class CounterMappingViewSet(viewsets.ModelViewSet):
    """Admin/Supervisor manage HID reader <-> counter staff mapping."""
    queryset = CounterMapping.objects.select_related("staff").all()
    serializer_class = CounterMappingSerializer

    def get_permissions(self):
        if self.action in ("list", "create", "update", "partial_update", "destroy"):
            return [IsSupervisorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = super().get_queryset()
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return qs.none()
        if self.request.user.is_supervisor_or_admin:
            return qs
        return qs.filter(staff=self.request.user)
