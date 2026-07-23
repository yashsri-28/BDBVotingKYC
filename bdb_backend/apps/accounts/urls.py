from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView as _TokenRefreshView
from drf_yasg.utils import swagger_auto_schema as _sw


class TokenRefreshView(_TokenRefreshView):
    @_sw(tags=["Auth"])
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
from .views import CounterStaffLoginView, MeView, LogoutView

urlpatterns = [
    path("auth/login/", CounterStaffLoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
]
