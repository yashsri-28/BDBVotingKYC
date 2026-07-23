"""
SiPass integration service layer. Routes to mock_client or a real REST
client based on settings.USE_MOCK_SIPASS, so callers never need to change.

Also implements the duplicate-card-tap debounce (BRD rule #12): a card
tapped again within CARD_TAP_DEBOUNCE_SECONDS is ignored.
"""
import time
from django.conf import settings
from django.core.cache import cache
from . import mock_client
from .exceptions import SiPassUnavailable

_DEBOUNCE_CACHE_PREFIX = "sipass_last_tap:"


def _is_debounced(card_number):
    key = f"{_DEBOUNCE_CACHE_PREFIX}{card_number}"
    last_seen = cache.get(key)
    now = time.time()
    if last_seen and (now - last_seen) < settings.CARD_TAP_DEBOUNCE_SECONDS:
        return True
    cache.set(key, now, timeout=settings.CARD_TAP_DEBOUNCE_SECONDS + 5)
    return False


def get_latest_taps(minutes=5):
    if settings.USE_MOCK_SIPASS:
        raw_taps = mock_client.get_latest_taps(minutes=minutes)
    else:
        # TODO: real SiPass REST client call goes here once sandbox creds exist.
        raise SiPassUnavailable()

    # de-duplicate rapid repeat taps of the same card in the response window
    seen = set()
    deduped = []
    for tap in sorted(raw_taps, key=lambda t: t["timestamp"], reverse=True):
        if tap["access_card_number"] in seen:
            continue
        seen.add(tap["access_card_number"])
        deduped.append(tap)
    return deduped


def register_tap(card_number, reader_name):
    """Called by the (mocked) reader feed. Returns None if debounced."""
    if _is_debounced(card_number):
        return None
    if settings.USE_MOCK_SIPASS:
        return mock_client.simulate_tap(card_number=card_number, reader_name=reader_name)
    raise SiPassUnavailable()
