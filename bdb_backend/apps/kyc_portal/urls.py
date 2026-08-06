from django.urls import path
from .views import ManualSearchView ,ResolveCredentialView


urlpatterns = [
    path("kyc/manual-search/", ManualSearchView.as_view(), name="kyc-manual-search"),
    path("kyc/resolve-credential/", ResolveCredentialView.as_view(), name="kyc-resolve-credential"),
]
