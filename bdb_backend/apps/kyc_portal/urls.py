from django.urls import path
from .views import ManualSearchView

urlpatterns = [
    path("kyc/manual-search/", ManualSearchView.as_view(), name="kyc-manual-search"),
]
