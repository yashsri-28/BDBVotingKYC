"""
Django settings for BDB Voting / Election Verification Module.
"""
import configparser
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------------------------------------------------------
# kycConf.ini — same file/convention you're already using
# ---------------------------------------------------------------------------
config = configparser.ConfigParser()
config.read(BASE_DIR / "kycConf.ini")

SECRET_KEY = "django-insecure-CHANGE-ME-in-production"
DEBUG = config.getboolean("settings", "DEBUG", fallback=True)
ALLOWED_HOSTS = ["*"]  # tighten before production

# ------------------------------------------------------------cl---------------
# Applications
# ---------------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third-party
    "rest_framework",
    "rest_framework_simplejwt",
    "drf_yasg",
    "channels",
    "corsheaders",

    # local apps
    "apps.accounts",
    "apps.counters",
    "apps.kyc_portal",
    "apps.sipass_integration",
    "apps.verification",
    "apps.audit",
    "apps.ballots",
    "apps.counting",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "apps.audit.middleware.AuditContextMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

CHANNEL_LAYERS = {
    "default": {
        # Dev: in-memory (single process only). Swap to channels_redis in prod
        # so lock-notifications fan out across multiple daphne/gunicorn workers.
        "BACKEND": "channels.layers.InMemoryChannelLayer",
    }
}

# ---------------------------------------------------------------------------
# Databases — TWO separate SQL Server databases, same server, Windows Auth
# ---------------------------------------------------------------------------
# 'default'  -> BDB_Voting     : election module's own tables (accounts,
#                                 counters, verification, audit, and any
#                                 election-only extensions like ballot counts)
# 'kyc_db'   -> Kyc_DB_new_3    : existing KYC Portal DB — READ ONLY from here.
#                                 apps.kyc_portal models are managed=False
#                                 and routed to this DB (see DATABASE_ROUTERS).
#
# NOTE: requires `pip install mssql-django pyodbc` and an installed
# "ODBC Driver 17/18 for SQL Server". Windows Authentication — no
# USER/PASSWORD; the account running `python manage.py ...` must have
# access to BOTH databases on this server.
DATABASES = {
    "default": {
        "ENGINE": "mssql",
        "NAME": config.get("VOTINGDB", "DB_NAME", fallback="BDB_Voting"),
        "HOST": config.get("VOTINGDB", "DB_HOST", fallback="BDB-DC-SR-KYC3"),
        "OPTIONS": {
            "driver": "ODBC Driver 17 for SQL Server",
            "trusted_connection": "yes",
            "extra_params": "Encrypt=yes;TrustServerCertificate=yes;",
        },
    },
    "kyc_db": {
        "ENGINE": "mssql",
        "NAME": config.get("KYCDB", "DB_NAME", fallback="Kyc_DB_new_3"),
        "HOST": config.get("KYCDB", "DB_HOST", fallback="BDB-DC-SR-KYC3"),
        "OPTIONS": {
            "driver": "ODBC Driver 17 for SQL Server",
            "trusted_connection": "yes",
            "extra_params": "Encrypt=yes;TrustServerCertificate=yes;",
        },
    },
}

DATABASE_ROUTERS = ["config.db_router.KycPortalRouter"]

AUTH_USER_MODEL = "accounts.CounterStaff"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "/media/"
KYC_MEDIA_ROOT = config.get(
    "settings", "KYC_MEDIA_ROOT",
    fallback=str(BASE_DIR / "media"),
)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# DRF + JWT
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "ROTATE_REFRESH_TOKENS": True,
}

# ---------------------------------------------------------------------------
# Swagger (drf-yasg)
# ---------------------------------------------------------------------------
SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT auth. Format: **Bearer &lt;access_token&gt;**",
        }
    },
    "USE_SESSION_AUTH": False,
}

# ---------------------------------------------------------------------------
# CORS (React dev server)
# ---------------------------------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# ---------------------------------------------------------------------------
# Email (KYCMail section) — used by apps/accounts/ms_mailer.py
# ---------------------------------------------------------------------------
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config.get("KYCMail", "EMAIL_HOST", fallback="")
EMAIL_PORT = config.getint("KYCMail", "EMAIL_PORT", fallback=587)
EMAIL_USE_TLS = config.getboolean("KYCMail", "EMAIL_USE_TLS", fallback=True)
EMAIL_HOST_USER = config.get("KYCMail", "EMAIL_HOST_USER", fallback="")
EMAIL_HOST_PASSWORD = config.get("KYCMail", "EMAIL_HOST_PASSWORD", fallback="")
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# ---------------------------------------------------------------------------
# Feature flags — per project decisions
# ---------------------------------------------------------------------------
USE_MOCK_KYC_DATA = config.getboolean("settings", "USE_MOCK_KYC_DATA", fallback=True)
USE_MOCK_SIPASS = config.getboolean("settings", "USE_MOCK_SIPASS", fallback=True)

# --- Verification email notifications ---
# While EMAIL_TEST_MODE=True, every verification/rejection email is sent
# to EMAIL_TEST_RECIPIENT instead of the real Authorized Representative's
# address, so testing never emails real members. Flip to False (and set a
# real recipient strategy) once ready to go live.
EMAIL_TEST_MODE = config.getboolean("settings", "EMAIL_TEST_MODE", fallback=True)
EMAIL_TEST_RECIPIENT = config.get("settings", "EMAIL_TEST_RECIPIENT", fallback="")

RECORD_LOCK_TIMEOUT_SECONDS = config.getint("settings", "RECORD_LOCK_TIMEOUT_SECONDS", fallback=120)
CARD_TAP_DEBOUNCE_SECONDS = config.getint("settings", "CARD_TAP_DEBOUNCE_SECONDS", fallback=5)
