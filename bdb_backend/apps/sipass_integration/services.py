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
from .models import CardTap

_DEBOUNCE_CACHE_PREFIX = "sipass_last_tap:"


def _is_debounced(card_number):
    key = f"{_DEBOUNCE_CACHE_PREFIX}{card_number}"
    last_seen = cache.get(key)
    now = time.time()
    if last_seen and (now - last_seen) < settings.CARD_TAP_DEBOUNCE_SECONDS:
        return True
    cache.set(key, now, timeout=settings.CARD_TAP_DEBOUNCE_SECONDS + 5)
    return False

# def get_latest_taps(minutes=5, device_id=None):
#     """Merge mock (demo) taps with real hardware taps, most recent first, de-duped by card.
#     If device_id is given, only taps from that specific reader/counter are returned."""
#     cutoff = time.time() - (minutes * 60)

#     raw_taps = []
#     if settings.USE_MOCK_SIPASS:
#         raw_taps.extend(mock_client.get_latest_taps(minutes=minutes))

#     real_taps = CardTap.objects.filter(tapped_at__gte=_epoch_to_datetime(cutoff))
#     if device_id:
#         real_taps = real_taps.filter(reader_name=device_id)
#     for tap in real_taps:
#         raw_taps.append({
#             "access_card_number": tap.access_card_number,
#             "reader_name": tap.reader_name,
#             "timestamp": tap.tapped_at.timestamp(),
#         })

#     seen = set()
#     deduped = []
#     for tap in sorted(raw_taps, key=lambda t: t["timestamp"], reverse=True):
#         if tap["access_card_number"] in seen:
#             continue
#         seen.add(tap["access_card_number"])
#         deduped.append(tap)
#     return deduped



def get_latest_taps(minutes=5, device_id=None):
    """Merge mock (demo) taps with real hardware taps, most recent first, de-duped by card.
    If device_id is given, only taps from that specific reader/counter are returned —
    mock/demo taps are skipped entirely in that case, since they have no real device
    association and would otherwise leak across every counter's polling."""
    cutoff = time.time() - (minutes * 60)

    raw_taps = []
    if settings.USE_MOCK_SIPASS and not device_id:
        raw_taps.extend(mock_client.get_latest_taps(minutes=minutes))

    real_taps = CardTap.objects.filter(tapped_at__gte=_epoch_to_datetime(cutoff))
    if device_id:
        real_taps = real_taps.filter(reader_name=device_id)
    for tap in real_taps:
        raw_taps.append({
            "access_card_number": tap.access_card_number,
            "reader_name": tap.reader_name,
            "timestamp": tap.tapped_at.timestamp(),
        })

    seen = set()
    deduped = []
    for tap in sorted(raw_taps, key=lambda t: t["timestamp"], reverse=True):
        if tap["access_card_number"] in seen:
            continue
        seen.add(tap["access_card_number"])
        deduped.append(tap)
    return deduped


def _epoch_to_datetime(epoch_seconds):
    from django.utils import timezone
    import datetime
    return datetime.datetime.fromtimestamp(epoch_seconds, tz=datetime.timezone.utc)


def register_tap(card_number, reader_name):
    """Called by the (mocked) reader feed / demo simulate-tap button. Returns None if debounced."""
    if _is_debounced(card_number):
        return None
    if settings.USE_MOCK_SIPASS:
        return mock_client.simulate_tap(card_number=card_number, reader_name=reader_name)
    raise SiPassUnavailable()


def register_real_tap(credential_no, device_id):
    """
    Called by the real hardware reader feed (.exe -> POST /sipass/scan/).
    Always persists to the database, independent of USE_MOCK_SIPASS,
    since this is genuine hardware data, not a simulation.
    Returns the created CardTap, or None if debounced.
    """
    if _is_debounced(credential_no):
        return None
    return CardTap.objects.create(access_card_number=credential_no, reader_name=device_id)