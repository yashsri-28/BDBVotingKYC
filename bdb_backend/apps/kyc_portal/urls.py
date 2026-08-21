from django.urls import path
from .views import ManualSearchView ,ResolveCredentialView , AllMembersView


urlpatterns = [
    path("kyc/manual-search/", ManualSearchView.as_view(), name="kyc-manual-search"),
    path("kyc/resolve-credential/", ResolveCredentialView.as_view(), name="kyc-resolve-credential"),
    path("kyc/all-members/", AllMembersView.as_view(), name="kyc-all-members"),
]
