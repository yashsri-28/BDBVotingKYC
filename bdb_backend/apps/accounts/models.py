from django.contrib.auth.models import AbstractUser
from django.db import models


class CounterStaff(AbstractUser):
    """Election Counter Staff / Supervisor / Admin (BRD: 'Authenticate Counter Staff before access')."""

    class Role(models.TextChoices):
        STAFF = "staff", "Counter Staff"
        SUPERVISOR = "supervisor", "Supervisor"
        ADMIN = "admin", "Admin"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STAFF)
    employee_code = models.CharField(max_length=50, blank=True)
    is_active_shift = models.BooleanField(default=False)

    # Single-active-session enforcement (session_limiter)
    active_session_key = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_supervisor_or_admin(self):
        return self.role in (self.Role.SUPERVISOR, self.Role.ADMIN)
