from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from apps.counters.models import CounterMapping

CounterStaff = get_user_model()


class Command(BaseCommand):
    help = "Seed demo counter staff logins + HID reader mappings."

    def handle(self, *args, **options):
        demo = [
            dict(username="admin", password="admin12345", role="admin", is_staff=True, is_superuser=True,
                 first_name="Election", last_name="Admin", reader="READER-ADMIN", counter="ADMIN"),
            dict(username="supervisor1", password="super12345", role="supervisor",
                 first_name="Anita", last_name="Rao", reader="READER-SUP-01", counter="SUP-1"),
            dict(username="counter1", password="counter12345", role="staff",
                 first_name="Ravi", last_name="Kulkarni", reader="READER-C1", counter="1"),
            dict(username="counter2", password="counter12345", role="staff",
                 first_name="Sneha", last_name="Patil", reader="READER-C2", counter="2"),
        ]
        for u in demo:
            user, created = CounterStaff.objects.get_or_create(
                username=u["username"],
                defaults=dict(role=u["role"], first_name=u["first_name"], last_name=u["last_name"],
                              is_staff=u.get("is_staff", False), is_superuser=u.get("is_superuser", False)),
            )
            if created:
                user.set_password(u["password"])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Created '{u['username']}' / {u['password']}"))
            CounterMapping.objects.get_or_create(staff=user, defaults=dict(hid_reader_name=u["reader"], counter_number=u["counter"]))
        self.stdout.write(self.style.SUCCESS("Demo staff seeded."))
