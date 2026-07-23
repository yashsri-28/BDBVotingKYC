from django.urls import path
from .views import LatestTapsView, SimulateTapView

urlpatterns = [
    path("sipass/latest-taps/", LatestTapsView.as_view(), name="sipass-latest-taps"),
    path("sipass/simulate-tap/", SimulateTapView.as_view(), name="sipass-simulate-tap"),
]
