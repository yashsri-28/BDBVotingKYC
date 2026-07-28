from django.contrib.auth.models import AbstractUser
from django.db import models


class CounterStaff(AbstractUser):
    """
    Election system login. Exactly 3 roles exist (confirmed 2026-07-28,
    collapsing the earlier 4-role model -- 'Operator' was merged into
    'Counter', since only Counter performs search + ballot allotment):

      ADMIN      "Super Admin" -- full authority: creates every login,
                 sets/allots ballot pools, changes Authorized Reps,
                 sees every report and the audit trail.
      SUPERVISOR "Counter"     -- normal operational user. Searches an
                 access card, sees KYC + Voting data, allots ballots to
                 members. Sees only their own distribution report.
      COUNTING   "Counting"    -- read-only auditor for the counting
                 stage. Sees the All-Counter Matrix and Master Report,
                 no action buttons, cannot search-and-issue.

    No self-signup anywhere -- every login here is created by a Super
    Admin (see apps.accounts.views.UserManagementViewSet).
    """

    class Role(models.TextChoices):
        SUPERVISOR = "supervisor", "Counter"
        COUNTING = "counting", "Counting"
        ADMIN = "admin", "Super Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SUPERVISOR)
    employee_code = models.CharField(max_length=50, blank=True)
    is_active_shift = models.BooleanField(default=False)

    # Single-active-session enforcement (session_limiter)
    active_session_key = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_super_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_supervisor_or_admin(self):
        # Name kept for backward compatibility with existing permission
        # classes -- "supervisor" here means the Counter role.
        return self.role in (self.Role.SUPERVISOR, self.Role.ADMIN)
