"""
Mock SiPass REST client for local dev / demo (no real hardware/sandbox
credentials yet — USE_MOCK_SIPASS=True). Implements the same interface a
real client would (see services.py), so switching later is a one-file swap.
"""
import random
import time

_MOCK_CARD_POOL = ["AC-1001", "AC-1002", "AC-1003", "AC-1004", "AC-2001"]

# in-memory "recent taps" feed — simulates what SiPass would report
_recent_taps = []


def simulate_tap(card_number=None, reader_name="READER-C1"):
    """Test helper: call this (via an endpoint) to simulate a card tap."""
    card_number = card_number or random.choice(_MOCK_CARD_POOL)
    tap = {"access_card_number": card_number, "reader_name": reader_name, "timestamp": time.time()}
    _recent_taps.append(tap)
    return tap


def get_latest_taps(minutes=5):
    cutoff = time.time() - (minutes * 60)
    return [t for t in _recent_taps if t["timestamp"] >= cutoff]
