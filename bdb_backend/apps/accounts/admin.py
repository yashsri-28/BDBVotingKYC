from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CounterStaff


@admin.register(CounterStaff)
class CounterStaffAdmin(UserAdmin):
    list_display = ["username", "first_name", "last_name", "role", "is_active_shift", "is_staff"]
    fieldsets = UserAdmin.fieldsets + (
        ("Election Role", {"fields": ("role", "employee_code", "is_active_shift", "active_session_key")}),
    )
