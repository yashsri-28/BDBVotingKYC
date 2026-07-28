from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    BallotDetailView, CandidateViewSet, CategoryBallotsView, CompleteCountingView,
    DetailedBallotReportView, ElectionCategoryViewSet, LiveTotalsView,
    RecordBallotView, StartCountingView,
)

router = DefaultRouter()
router.register("counting/categories", ElectionCategoryViewSet, basename="election-category")
router.register("counting/candidates", CandidateViewSet, basename="candidate")

urlpatterns = router.urls + [
    path("counting/categories/<int:pk>/start/", StartCountingView.as_view(), name="counting-start"),
    path("counting/categories/<int:pk>/complete/", CompleteCountingView.as_view(), name="counting-complete"),
    path("counting/categories/<int:pk>/ballots/", RecordBallotView.as_view(), name="counting-record-ballot"),
    path("counting/categories/<int:pk>/ballots/list/", CategoryBallotsView.as_view(), name="counting-ballot-list"),
    path("counting/categories/<int:pk>/live/", LiveTotalsView.as_view(), name="counting-live-totals"),
    path("counting/categories/<int:pk>/report/detailed/", DetailedBallotReportView.as_view(), name="counting-detailed-report"),
    path("counting/ballots/<int:pk>/", BallotDetailView.as_view(), name="counting-ballot-detail"),
]
