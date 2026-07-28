from rest_framework.permissions import BasePermission


class IsSupervisorOrAdmin(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_supervisor_or_admin)


class IsCounterStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsSuperAdmin(BasePermission):
    """Only Super Admin (role=admin) — base ballot pool totals, per MoM 4.1."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == user.Role.ADMIN)


class IsCountingUser(BasePermission):
    """
    Counting-stage access: the dedicated Counting login, plus Super Admin.
    Counting logins are created by the Super Admin and exist only to
    enter counted ballots -- they do not get counter/verification screens.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return user.role in (user.Role.COUNTING, user.Role.ADMIN)


class IsAdminOrCounting(BasePermission):
    """
    Read access to consolidated reports (All-Counter Matrix, Master
    Report): Super Admin (full) and Counting (read-only) per the
    Role -> Screen matrix. Counter does NOT get this -- Counter only
    sees their own distribution, not everyone else's.
    """

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return user.role in (user.Role.COUNTING, user.Role.ADMIN)
