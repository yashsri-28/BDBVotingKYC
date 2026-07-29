# from django.contrib import admin
# from django.urls import path, re_path, include
# from django.conf import settings
# from django.conf.urls.static import static
# from rest_framework import permissions
# from drf_yasg.views import get_schema_view
# from drf_yasg import openapi

# schema_view = get_schema_view(
#     openapi.Info(
#         title="BDB Voting / Election Verification API",
#         default_version="v1",
#         description="Election Verification Module — counter staff auth, KYC lookup, SiPass integration, verification workflow, audit trail.",
#     ),
#     public=True,
#     permission_classes=[permissions.AllowAny],
# )

# urlpatterns = [
#     path("admin/", admin.site.urls),

#     path("api/", include("apps.accounts.urls")),
#     path("api/", include("apps.counters.urls")),
#     path("api/", include("apps.kyc_portal.urls")),
#     path("api/", include("apps.sipass_integration.urls")),
#     path("api/", include("apps.verification.urls")),
#     path("api/", include("apps.audit.urls")),
#     path("api/", include("apps.ballots.urls")),
#     path("api/", include("apps.counting.urls")),

#     re_path(r"^swagger(?P<format>\.json|\.yaml)$", schema_view.without_ui(cache_timeout=0), name="schema-json"),
#     path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
#     path("redoc/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
import os
from django.http import FileResponse, Http404
from django.views.decorators.http import require_GET

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.counters.urls")),
    path("api/", include("apps.kyc_portal.urls")),
    path("api/", include("apps.sipass_integration.urls")),
    path("api/", include("apps.verification.urls")),
    path("api/", include("apps.audit.urls")),
    path("api/", include("apps.ballots.urls")),
    path("api/", include("apps.counting.urls")),
]

# ---------------------------------------------------------------------------
# Media serving — handles the KYC portal's inconsistent profile/profile/
# nesting by trying both the expected and double-nested path.
# ---------------------------------------------------------------------------
@require_GET
def serve_kyc_media(request, path):
    candidates = [
        os.path.join(settings.KYC_MEDIA_ROOT, path),
    ]
    parts = path.rsplit("/", 1)
    if len(parts) == 2:
        folder, filename = parts
        last_segment = folder.rsplit("/", 1)[-1]
        candidates.append(os.path.join(settings.KYC_MEDIA_ROOT, folder, last_segment, filename))

    for candidate in candidates:
        if os.path.isfile(candidate):
            return FileResponse(open(candidate, "rb"))

    raise Http404(f"Media file not found: {path}")


urlpatterns += [
    re_path(r"^media/(?P<path>.*)$", serve_kyc_media),
]
