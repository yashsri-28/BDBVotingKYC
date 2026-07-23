from django.urls import path
from .views import LookupByCardView, EntityLockView, VerifyEntityView

urlpatterns = [
    path("verification/lookup-by-card/", LookupByCardView.as_view(), name="verification-lookup-by-card"),
    path("verification/<str:customer_code>/lock/", EntityLockView.as_view(), name="verification-lock"),
    path("verification/<str:customer_code>/verify/", VerifyEntityView.as_view(), name="verification-verify"),
]
