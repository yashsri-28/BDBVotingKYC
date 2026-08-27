# """
# Imports the Category Trade Member and Exclusive Member electoral rolls
# into ElectoralRoll (MoM: Voting Module Review, 2026-07-24).

# Ballot logic confirmed 2026-07-27:
#   - Category roll "Category" column: I -> 1 ballot, II -> 2, III -> 3
#     (asterisk suffixes on the Exclusive roll's Membership Number are
#     confirmed meaningless -- ignored on import)
#   - Exclusive roll: flat 1 ballot per member (no tier column exists)

# Being on either roll means a member is IN SCOPE for this election --
# it does NOT mean they are automatically eligible. Eligibility is still
# decided by the Section 5 business rules at the counter, same as before.

# Usage:
#     python manage.py import_electoral_rolls
#     python manage.py import_electoral_rolls --category-file path/to/file.xlsx --exclusive-file path/to/file.xlsx
# """
# import re
# import openpyxl
# from django.core.management.base import BaseCommand, CommandError
# from django.conf import settings

# from apps.ballots.models import ElectoralRoll, RollType
# from apps.kyc_portal.models import MembersMaster

# DEFAULT_CATEGORY_FILE = settings.BASE_DIR / "data" / "Electoral_Roll__Category_Trade_Member.xlsx"
# DEFAULT_EXCLUSIVE_FILE = settings.BASE_DIR / "data" / "Electoral_Rol_Exclusive.xlsx"

# ASTERISK_RE = re.compile(r"\*+$")


# class Command(BaseCommand):
#     help = "Import the Category Trade Member and Exclusive Member electoral rolls."

#     def add_arguments(self, parser):
#         parser.add_argument("--category-file", default=str(DEFAULT_CATEGORY_FILE))
#         parser.add_argument("--exclusive-file", default=str(DEFAULT_EXCLUSIVE_FILE))
#         parser.add_argument(
#             "--clear", action="store_true",
#             help="Delete all existing ElectoralRoll rows before importing. "
#                  "Recommended for re-imports, since membership numbers are "
#                  "cleaned (asterisks stripped) and won't match old dirty rows.",
#         )

#     def handle(self, *args, **options):
#         if options["clear"]:
#             deleted, _ = ElectoralRoll.objects.all().delete()
#             self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing electoral roll rows."))
#         self.import_category(options["category_file"])
#         self.import_exclusive(options["exclusive_file"])
#         self.stdout.write(self.style.SUCCESS("Electoral roll import complete."))

#     def _match_customer_code(self, membership_no):
#         """Best-effort match against the real KYC data so downstream
#         eligibility checks can join straight through. Import still
#         succeeds even with no match -- customer_code stays null and can
#         be reconciled later."""
#         member = MembersMaster.objects.filter(membership_no=membership_no).first()
#         return member.customer_code if member else None

#     def import_category(self, path):
#         try:
#             wb = openpyxl.load_workbook(path, data_only=True)
#         except FileNotFoundError:
#             raise CommandError(f"Category roll not found at {path}")
#         ws = wb["Sheet1"]

#         created, updated, unmatched = 0, 0, 0
#         for row in ws.iter_rows(min_row=2, values_only=True):
#             if not row[0]:
#                 continue
#             _, tm_no, name, category, _shares, auth_person, *_ = row
#             if not tm_no:
#                 continue
#             # Asterisk suffixes are confirmed meaningless -- strip them (same as the Exclusive roll).
#             tm_no = ASTERISK_RE.sub("", str(tm_no).strip())
#             tier = str(category).strip() if category else None
#             if tier not in ("I", "II", "III"):
#                 self.stdout.write(self.style.WARNING(f"Skipping {tm_no}: unrecognized category '{category}'"))
#                 continue

#             customer_code = self._match_customer_code(tm_no)
#             if not customer_code:
#                 unmatched += 1

#             _, was_created = ElectoralRoll.objects.update_or_create(
#                 roll_type=RollType.CATEGORY, membership_no=tm_no,
#                 defaults=dict(
#                     customer_code=customer_code,
#                     entity_name=str(name).strip() if name else "",
#                     representative_name=str(auth_person).strip() if auth_person else "",
#                     category_tier=tier,
#                 ),
#             )
#             created += was_created
#             updated += not was_created

#         self.stdout.write(self.style.SUCCESS(
#             f"Category roll: {created} created, {updated} updated, {unmatched} not matched to KYC data."
#         ))

#     def import_exclusive(self, path):
#         try:
#             wb = openpyxl.load_workbook(path, data_only=True)
#         except FileNotFoundError:
#             raise CommandError(f"Exclusive roll not found at {path}")
#         ws = wb["Sheet1"]

#         created, updated, unmatched = 0, 0, 0
#         for row in ws.iter_rows(min_row=2, values_only=True):
#             if not row[0]:
#                 continue
#             _, membership_no, name, rep_name, email1, *_ = row
#             if not membership_no:
#                 continue
#             # Asterisk suffixes are confirmed meaningless -- strip them.
#             clean_no = ASTERISK_RE.sub("", str(membership_no).strip())

#             customer_code = self._match_customer_code(clean_no)
#             if not customer_code:
#                 unmatched += 1

#             _, was_created = ElectoralRoll.objects.update_or_create(
#                 roll_type=RollType.EXCLUSIVE, membership_no=clean_no,
#                 defaults=dict(
#                     customer_code=customer_code,
#                     entity_name=str(name).strip() if name else "",
#                     representative_name=str(rep_name).strip() if rep_name else "",
#                     representative_email=str(email1).strip() if email1 else "",
#                     category_tier=None,
#                 ),
#             )
#             created += was_created
#             updated += not was_created

#         self.stdout.write(self.style.SUCCESS(
#             f"Exclusive roll: {created} created, {updated} updated, {unmatched} not matched to KYC data."
#         ))



"""
Imports the Category Trade Member and Exclusive Member electoral rolls
into ElectoralRoll (MoM: Voting Module Review, 2026-07-24).

Ballot logic confirmed 2026-07-27:
  - Category roll "Category" column: I -> 1 ballot, II -> 2, III -> 3
    (asterisk suffixes on the Exclusive roll's Membership Number are
    confirmed meaningless -- ignored on import)
  - Exclusive roll: flat 1 ballot per member (no tier column exists)

Being on either roll means a member is IN SCOPE for this election --
it does NOT mean they are automatically eligible.

Eligibility flags (added 2026-08-24): the client now pre-calculates
fee/outstanding/eligibility status themselves and sends it as extra
columns in the SAME Excel files. This command reads those columns by
HEADER NAME (not fixed position), matching by prefix where the header
text includes a date that changes every election cycle (e.g.
"Membership Fees Paid upto 8th July 2026" -> next cycle a different
date). If those columns are absent (older-format file), the roll
import still succeeds -- eligibility flags are just left as None/
default, and a clear warning is printed so it's obvious data is
missing rather than silently wrong.

Usage:
    python manage.py import_electoral_rolls
    python manage.py import_electoral_rolls --category-file path/to/file.xlsx --exclusive-file path/to/file.xlsx
    python manage.py import_electoral_rolls --clear
"""
import re
import openpyxl
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from apps.ballots.models import ElectoralRoll, RollType
from apps.kyc_portal.models import MembersMaster

DEFAULT_CATEGORY_FILE = settings.BASE_DIR / "data" / "Electoral_Roll__Category_Trade_Member.xlsx"
DEFAULT_EXCLUSIVE_FILE = settings.BASE_DIR / "data" / "Electoral_Rol_Exclusive.xlsx"

ASTERISK_RE = re.compile(r"\*+$")

# Header prefixes to look for (case-insensitive, whitespace-trimmed).
# Using prefixes rather than exact matches because the fee-paid and
# outstanding-clear headers embed a date that changes every cycle
# (e.g. "...upto 8th July 2026" this time, something else next time).
FEES_PAID_HEADER_PREFIX = "membership fees paid"
OUTSTANDING_CLEAR_HEADER_PREFIX = "outstanding clear"
FINAL_ELIGIBILITY_HEADER = "final eligibility status"


def _parse_yes_no(value, field_label, row_label, warnings):
    """
    Parses an Excel cell expected to contain Yes/No into True/False/None.
    Never raises -- unrecognized or blank values are treated as unknown
    (None) and logged as a warning, so one messy cell never crashes the
    whole import. Downstream eligibility logic treats None the same as
    False (safe default: not eligible) -- see apps.kyc_portal.services.
    """
    if value is None:
        return None
    text = str(value).strip().lower()
    if text in ("yes", "y", "true", "1"):
        return True
    if text in ("no", "n", "false", "0", ""):
        return False if text else None
    warnings.append(
        f"{row_label}: unrecognized value '{value}' for '{field_label}' -- treated as unknown (not eligible)."
    )
    return None


def _find_header_column(header_row, prefix_or_exact, exact=False):
    """
    Returns the 0-based column index whose header matches, or None if
    not found. Case-insensitive, trims whitespace. Matches by prefix
    unless exact=True, since some headers embed a date that changes
    every election cycle.
    """
    needle = prefix_or_exact.strip().lower()
    for idx, header in enumerate(header_row):
        if not header:
            continue
        text = str(header).strip().lower()
        if exact:
            if text == needle:
                return idx
        else:
            if text.startswith(needle):
                return idx
    return None


class Command(BaseCommand):
    help = "Import the Category Trade Member and Exclusive Member electoral rolls, including eligibility flags."

    def add_arguments(self, parser):
        parser.add_argument("--category-file", default=str(DEFAULT_CATEGORY_FILE))
        parser.add_argument("--exclusive-file", default=str(DEFAULT_EXCLUSIVE_FILE))
        parser.add_argument(
            "--clear", action="store_true",
            help="Delete all existing ElectoralRoll rows before importing. "
                 "Recommended for re-imports, since membership numbers are "
                 "cleaned (asterisks stripped) and won't match old dirty rows.",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            deleted, _ = ElectoralRoll.objects.all().delete()
            self.stdout.write(self.style.WARNING(f"Cleared {deleted} existing electoral roll rows."))

        category_ok = self.import_category(options["category_file"])
        exclusive_ok = self.import_exclusive(options["exclusive_file"])

        if category_ok and exclusive_ok:
            self.stdout.write(self.style.SUCCESS("Electoral roll import complete."))
        else:
            # Non-zero exit so this is visible to any automation/CI running
            # the import, rather than looking like a clean success.
            raise CommandError("Electoral roll import completed with errors -- see warnings above.")

    def _match_customer_code(self, membership_no):
        """Best-effort match against the real KYC data so downstream
        eligibility checks can join straight through. Import still
        succeeds even with no match -- customer_code stays null and can
        be reconciled later."""
        member = MembersMaster.objects.filter(membership_no=membership_no).first()
        return member.customer_code if member else None

    # ------------------------------------------------------------------
    # Category Trade Member roll
    # ------------------------------------------------------------------
    def import_category(self, path):
        try:
            wb = openpyxl.load_workbook(path, data_only=True)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Category roll not found at {path}"))
            return False
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"Could not open Category roll file: {exc}"))
            return False

        if "Sheet1" not in wb.sheetnames:
            self.stdout.write(self.style.ERROR(
                f"Category roll: expected a sheet named 'Sheet1', found {wb.sheetnames}."
            ))
            return False
        ws = wb["Sheet1"]

        # Locate the eligibility columns by header name. If missing,
        # import still proceeds (older-format file) but flags stay None.
        header_row = next(ws.iter_rows(min_row=1, max_row=1, values_only=True), ())
        fees_col = _find_header_column(header_row, FEES_PAID_HEADER_PREFIX)
        outstanding_col = _find_header_column(header_row, OUTSTANDING_CLEAR_HEADER_PREFIX)
        final_col = _find_header_column(header_row, FINAL_ELIGIBILITY_HEADER, exact=True)

        if fees_col is None or outstanding_col is None or final_col is None:
            missing = [
                label for label, col in [
                    ("Membership Fees Paid...", fees_col),
                    ("Outstanding Clear...", outstanding_col),
                    ("Final Eligibility Status", final_col),
                ] if col is None
            ]
            self.stdout.write(self.style.WARNING(
                f"Category roll: could not find column(s) {missing} in the header row. "
                f"Eligibility flags will be left unset for this import -- everyone on "
                f"this roll will default to Not Eligible until re-imported with the "
                f"correct file. Check the header text hasn't changed unexpectedly."
            ))

        created, updated, unmatched, row_errors = 0, 0, 0, 0
        warnings = []

        for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not row or not row[0]:
                continue
            row_label = f"row {row_num}"
            try:
                _, tm_no, name, category, _shares, auth_person, *_ = row
                if not tm_no:
                    continue

                tm_no = ASTERISK_RE.sub("", str(tm_no).strip())
                tier = str(category).strip() if category else None
                if tier not in ("I", "II", "III"):
                    warnings.append(f"{row_label} ({tm_no}): unrecognized category '{category}' -- skipped.")
                    row_errors += 1
                    continue

                customer_code = self._match_customer_code(tm_no)
                if not customer_code:
                    unmatched += 1

                fees_paid = (
                    _parse_yes_no(row[fees_col], "Membership Fees Paid", f"{row_label} ({tm_no})", warnings)
                    if fees_col is not None else None
                )
                outstanding_clear = (
                    _parse_yes_no(row[outstanding_col], "Outstanding Clear", f"{row_label} ({tm_no})", warnings)
                    if outstanding_col is not None else None
                )
                final_eligible = (
                    _parse_yes_no(row[final_col], "Final Eligibility Status", f"{row_label} ({tm_no})", warnings)
                    if final_col is not None else None
                )
                # Safe default: unknown/missing -> treated as Not Eligible,
                # never silently treated as eligible.
                final_eligible = bool(final_eligible)

                _, was_created = ElectoralRoll.objects.update_or_create(
                    roll_type=RollType.CATEGORY, membership_no=tm_no,
                    defaults=dict(
                        customer_code=customer_code,
                        entity_name=str(name).strip() if name else "",
                        representative_name=str(auth_person).strip() if auth_person else "",
                        category_tier=tier,
                        membership_fees_paid=fees_paid,
                        outstanding_clear=outstanding_clear,
                        final_eligibility_status=final_eligible,
                    ),
                )
                created += was_created
                updated += not was_created

            except Exception as exc:
                # Never let one malformed row kill the entire import.
                row_errors += 1
                warnings.append(f"{row_label}: failed to import -- {exc}")
                continue

        for w in warnings:
            self.stdout.write(self.style.WARNING(w))

        self.stdout.write(self.style.SUCCESS(
            f"Category roll: {created} created, {updated} updated, "
            f"{unmatched} not matched to KYC data, {row_errors} row(s) skipped due to errors."
        ))
        return row_errors == 0

    # ------------------------------------------------------------------
    # Exclusive / Regular Trade Member roll
    # ------------------------------------------------------------------
    def import_exclusive(self, path):
        try:
            wb = openpyxl.load_workbook(path, data_only=True)
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f"Exclusive roll not found at {path}"))
            return False
        except Exception as exc:
            self.stdout.write(self.style.ERROR(f"Could not open Exclusive roll file: {exc}"))
            return False

        if "Sheet1" not in wb.sheetnames:
            self.stdout.write(self.style.ERROR(
                f"Exclusive roll: expected a sheet named 'Sheet1', found {wb.sheetnames}."
            ))
            return False
        ws = wb["Sheet1"]

        header_row = next(ws.iter_rows(min_row=1, max_row=1, values_only=True), ())
        fees_col = _find_header_column(header_row, FEES_PAID_HEADER_PREFIX)
        # Exclusive roll may or may not include a separate Final Eligibility
        # Status column -- if absent, Final Eligibility falls back to
        # simply mirroring Membership Fees Paid (per the confirmed logic:
        # Exclusive members have only the one condition).
        final_col = _find_header_column(header_row, FINAL_ELIGIBILITY_HEADER, exact=True)

        if fees_col is None:
            self.stdout.write(self.style.WARNING(
                f"Exclusive roll: could not find a 'Membership Fees Paid...' column in "
                f"the header row. Eligibility will be left unset for this import -- "
                f"everyone on this roll will default to Not Eligible until re-imported "
                f"with the correct file."
            ))

        created, updated, unmatched, row_errors = 0, 0, 0, 0
        warnings = []

        for row_num, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if not row or not row[0]:
                continue
            row_label = f"row {row_num}"
            try:
                _, membership_no, name, rep_name, email1, *_ = row
                if not membership_no:
                    continue

                clean_no = ASTERISK_RE.sub("", str(membership_no).strip())

                customer_code = self._match_customer_code(clean_no)
                if not customer_code:
                    unmatched += 1

                fees_paid = (
                    _parse_yes_no(row[fees_col], "Membership Fees Paid", f"{row_label} ({clean_no})", warnings)
                    if fees_col is not None else None
                )
                if final_col is not None:
                    final_eligible = _parse_yes_no(
                        row[final_col], "Final Eligibility Status", f"{row_label} ({clean_no})", warnings
                    )
                else:
                    # Exclusive roll rule: Final Eligibility == Membership Fees Paid.
                    final_eligible = fees_paid
                final_eligible = bool(final_eligible)

                _, was_created = ElectoralRoll.objects.update_or_create(
                    roll_type=RollType.EXCLUSIVE, membership_no=clean_no,
                    defaults=dict(
                        customer_code=customer_code,
                        entity_name=str(name).strip() if name else "",
                        representative_name=str(rep_name).strip() if rep_name else "",
                        representative_email=str(email1).strip() if email1 else "",
                        category_tier=None,
                        membership_fees_paid=fees_paid,
                        outstanding_clear=None,  # not applicable to Exclusive roll
                        final_eligibility_status=final_eligible,
                    ),
                )
                created += was_created
                updated += not was_created

            except Exception as exc:
                row_errors += 1
                warnings.append(f"{row_label}: failed to import -- {exc}")
                continue

        for w in warnings:
            self.stdout.write(self.style.WARNING(w))

        self.stdout.write(self.style.SUCCESS(
            f"Exclusive roll: {created} created, {updated} updated, "
            f"{unmatched} not matched to KYC data, {row_errors} row(s) skipped due to errors."
        ))
        return row_errors == 0