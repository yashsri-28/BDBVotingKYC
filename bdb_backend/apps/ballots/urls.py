from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AllotCodesView, AllotmentSearchView, AssignAllocationView, AuthRepChangeHistoryViewSet,
    AuthRepChangeView, BallotPoolViewSet, CounterBallotAllocationViewSet, CounterOwnSummaryView,
    CustomerCodeAllotmentViewSet, DashboardSummaryView, ElectoralRollViewSet, SetPoolTotalView,
)

router = DefaultRouter()
router.register("ballots/electoral-roll", ElectoralRollViewSet, basename="electoral-roll")
router.register("ballots/pools", BallotPoolViewSet, basename="ballot-pool")
router.register("ballots/allocations", CounterBallotAllocationViewSet, basename="ballot-allocation")
router.register("ballots/allotments", CustomerCodeAllotmentViewSet, basename="code-allotment")
router.register("ballots/auth-rep-change/history", AuthRepChangeHistoryViewSet, basename="auth-rep-change-history")

urlpatterns = [
    path("ballots/pools/set-total/", SetPoolTotalView.as_view(), name="ballot-pool-set-total"),
    path("ballots/allocations/assign/", AssignAllocationView.as_view(), name="ballot-allocation-assign"),
    path("ballots/dashboard/", DashboardSummaryView.as_view(), name="ballot-dashboard"),
    path("ballots/my-summary/", CounterOwnSummaryView.as_view(), name="ballot-my-summary"),
    path("ballots/allotment/search/", AllotmentSearchView.as_view(), name="allotment-search"),
    path("ballots/allotment/allot/", AllotCodesView.as_view(), name="allotment-allot"),
    path("ballots/auth-rep-change/", AuthRepChangeView.as_view(), name="auth-rep-change"),
] + router.urls
