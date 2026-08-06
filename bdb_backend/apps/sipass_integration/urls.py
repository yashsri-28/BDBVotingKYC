from django.urls import path
from .views import LatestTapsView, SimulateTapView, RegisterScanView

urlpatterns = [
    path("sipass/latest-taps/", LatestTapsView.as_view(), name="sipass-latest-taps"),
    path("sipass/simulate-tap/", SimulateTapView.as_view(), name="sipass-simulate-tap"),
    path("sipass/scan/", RegisterScanView.as_view(), name="sipass-scan"),
]