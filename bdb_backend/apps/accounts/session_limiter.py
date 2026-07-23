"""
Enforces a single active session per Counter Staff login, so one login
can't be used simultaneously at two counters (BRD Section 1: authenticate
staff before access; implicit single-session-per-login expectation).
"""


def bind_session(user, session_key):
    user.active_session_key = session_key
    user.is_active_shift = True
    user.save(update_fields=["active_session_key", "is_active_shift"])


def clear_session(user):
    user.active_session_key = None
    user.is_active_shift = False
    user.save(update_fields=["active_session_key", "is_active_shift"])


def has_other_active_session(user, incoming_session_key):
    return bool(user.active_session_key) and user.active_session_key != incoming_session_key
