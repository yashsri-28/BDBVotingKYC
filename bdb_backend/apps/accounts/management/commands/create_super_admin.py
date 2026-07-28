"""
Bootstraps the one Super Admin account this system needs to get started.
Every other login (Counter, Counting) is created BY that Super Admin
through the User Management screen -- there is no other seed command,
per the "no self-signup" requirement (confirmed 2026-07-28).
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import IntegrityError

CounterStaff = get_user_model()


class Command(BaseCommand):
    help = "Create the initial Super Admin login."

    def add_arguments(self, parser):
        parser.add_argument("--username", required=True)
        parser.add_argument("--password", required=True)
        parser.add_argument("--first-name", default="")
        parser.add_argument("--last-name", default="")

    def handle(self, *args, **options):
        if CounterStaff.objects.filter(username=options["username"]).exists():
            raise CommandError(f"A user named '{options['username']}' already exists.")

        try:
            user = CounterStaff.objects.create_user(
                username=options["username"],
                password=options["password"],
                role=CounterStaff.Role.ADMIN,
                first_name=options["first_name"],
                last_name=options["last_name"],
                is_staff=True,
                is_superuser=True,
            )
        except IntegrityError as exc:
            raise CommandError(f"Could not create that user: {exc}")

        self.stdout.write(self.style.SUCCESS(f"Super Admin '{user.username}' created."))
