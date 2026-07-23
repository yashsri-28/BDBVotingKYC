from rest_framework.routers import DefaultRouter
from .views import CounterMappingViewSet

router = DefaultRouter()
router.register("counter-mappings", CounterMappingViewSet, basename="counter-mapping")
urlpatterns = router.urls
