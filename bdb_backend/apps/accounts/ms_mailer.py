"""
Thin wrapper around Django's email backend, configured from kycConf.ini
[KYCMail] (Office 365 SMTP).

TEST MODE: while settings.EMAIL_TEST_MODE is True, every email is sent to
settings.EMAIL_TEST_RECIPIENT instead of the real Authorized Representative
address, so nothing goes to a real member's inbox during testing. To go
live, set EMAIL_TEST_MODE = False in kycConf.ini — no code change needed,
the recipient resolution below switches automatically.
"""
from django.core.mail import send_mail
from django.conf import settings


def _resolve_recipient(entity_view):
    """Returns the test recipient while in test mode, otherwise the real
    Authorized Representative's email from the KYC Portal DB."""
    if settings.EMAIL_TEST_MODE:
        return settings.EMAIL_TEST_RECIPIENT
    return entity_view.get("representative_email")


def _send(subject, html_body, recipient):
    if not recipient:
        return False
    send_mail(
        subject=subject,
        message=html_body,  # plain-text fallback (same content, HTML tags visible — acceptable for now)
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        html_message=html_body,
        fail_silently=True,
    )
    return True


def send_verification_approved_email(entity_view, verification_counter=""):
    """Sent when an entity is marked 'Verified and Sent for Vote'."""
    recipient = _resolve_recipient(entity_view)
    subject = f"Voting Eligibility Verified — {entity_view['entity_name']}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background-color:#14264A; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Bharat Diamond Bourse</h2>
        <p style="color: #B7BFCB; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.05em;">
          ELECTION VERIFICATION NOTICE
        </p>
      </div>
      <div style="border: 1px solid #DCE1E9; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; color: #14264A;">Dear {entity_view['representative_name']},</p>
        <p style="font-size: 14px; color: #333333; line-height: 1.6;">
          This is to confirm that your voting eligibility on behalf of
          <strong>{entity_view['entity_name']}</strong> (Membership No.
          {entity_view['membership_number']}) has been <strong style="color:#1B7A43;">verified
          and cleared for voting</strong> at the election counter.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #8B94A3;">Customer Code</td>
            <td style="padding: 6px 0; color: #14264A; font-weight: 600;">{entity_view['customer_code']}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8B94A3;">Verified At Counter</td>
            <td style="padding: 6px 0; color: #14264A; font-weight: 600;">{verification_counter or 'N/A'}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #8B94A3;">
          If you did not expect this notice, please contact the Election Committee immediately.
        </p>
      </div>
    </div>
    """
    return _send(subject, html_body, recipient)


def send_verification_rejected_email(entity_view, rejection_reason, verification_counter=""):
    """Sent when an entity is marked 'Not Eligible to Vote'."""
    recipient = _resolve_recipient(entity_view)
    subject = f"Voting Eligibility Not Approved — {entity_view['entity_name']}"
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <div style="background-color:#14264A; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Bharat Diamond Bourse</h2>
        <p style="color: #B7BFCB; margin: 4px 0 0; font-size: 12px; letter-spacing: 0.05em;">
          ELECTION VERIFICATION NOTICE
        </p>
      </div>
      <div style="border: 1px solid #DCE1E9; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 15px; color: #14264A;">Dear {entity_view['representative_name']},</p>
        <p style="font-size: 14px; color: #333333; line-height: 1.6;">
          Your voting eligibility on behalf of <strong>{entity_view['entity_name']}</strong>
          (Membership No. {entity_view['membership_number']}) could
          <strong style="color:#A32E27;">not be approved</strong> at the election counter.
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #8B94A3;">Reason</td>
            <td style="padding: 6px 0; color: #A32E27; font-weight: 600;">{rejection_reason}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #8B94A3;">Customer Code</td>
            <td style="padding: 6px 0; color: #14264A; font-weight: 600;">{entity_view['customer_code']}</td>
          </tr>
        </table>
        <p style="font-size: 13px; color: #8B94A3;">
          If you believe this is an error, please contact the Election Committee for assistance.
        </p>
      </div>
    </div>
    """
    return _send(subject, html_body, recipient)