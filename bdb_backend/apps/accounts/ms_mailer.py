"""
Thin wrapper around Django's email backend, configured from kycConf.ini
[KYCMail] (Office 365 SMTP). Used for things like supervisor-approval
notifications (photo mismatch / placeholder cases — BRD error matrix).
"""
from django.core.mail import send_mail
from django.conf import settings


def send_notification(subject, message, recipient_list):
    if not settings.EMAIL_HOST_USER:
        return False  # mail not configured — fail silently in dev
    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=True,
    )
    return True


def notify_supervisor_approval_needed(entity_name, reason, recipient_list):
    return send_notification(
        subject=f"Supervisor approval needed — {entity_name}",
        message=f"Entity '{entity_name}' requires supervisor approval: {reason}",
        recipient_list=recipient_list,
    )
