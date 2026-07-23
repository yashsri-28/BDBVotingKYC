# BDB Voting — Election Verification Module (Backend)

Full Django REST backend, now wired to the REAL KYC Portal data (2026-07-23 update).

## Two databases, same server
- **BDB_Voting** (`default`) — this project's own tables: counter staff logins,
  counter mappings, verification records, record locks, audit log, and the
  `EntityVotingExtras` table (remark + ballot counts — the only two BRD
  fields that don't already exist anywhere in the KYC Portal DB).
- **Kyc_DB_new_3** (`kyc_db`) — the EXISTING KYC Portal DB. `apps/kyc_portal`
  models are `managed=False` wrappers around the real `users`,
  `members_master`, and `kyc_submissions` tables — Django never creates,
  alters, or migrates them. Routed automatically via `config/db_router.py`.
- No real foreign keys exist between the two DBs (SQL Server doesn't support
  that across databases the way Django expects) — every link between
  election data and KYC data is a soft reference via `customer_code`,
  resolved in application code (`apps/kyc_portal/services.py`).

## Confirmed real-data mapping (2026-07-23)
| BRD Field | Real column |
|---|---|
| Access Card Number | `users.access_code` |
| Authorized Representative Name | `users.name` |
| Entity Name | `members_master.member_name` |
| Membership Number | `members_master.membership_no` |
| Customer Code | `members_master.customer_code` (== `users.sap_code`) |
| Category / Member Group | `members_master.member_category` / `group_name` |
| Membership Status | `members_master.active_status` ("Y"/"N") |
| Annual Fee Status | `members_master.membership_fees_status` ("Paid"/"Unpaid") |
| KYC Status | latest `kyc_submissions.status` for that customer_code == "Approved" |
| Voting Eligibility | `users.elegible_user` (0/1) — **already exists, no new field needed** |
| Photograph | `users.profile_picture` — **already exists, no new field needed** |
| Voting Eligibility Remark | **new** — `EntityVotingExtras.voting_eligibility_remark` (BDB_Voting) |
| Total Ballot (Category/Exclusive) | **new** — `EntityVotingExtras` (BDB_Voting) |

**Confirmed real behavior:** one `access_code` can map to multiple `users` rows
(different `customer_code` each) — this is exactly Scenario B (multi-entity
representative). Verified with real duplicate example `GEM209202` → two
different entities under "ANOOP VRAJLAL MEHTA".

## Setup

```bash
pip install -r requirements.txt
```
ODBC Driver 17 (or 18) for SQL Server must be installed (SSMS usually installs it).
Windows Authentication — no DB username/password; run everything as the same
Windows account that connects via SSMS, and that account needs access to
BOTH `BDB_Voting` and `Kyc_DB_new_3` on `BDB-DC-SR-KYC3`.

```bash
python manage.py makemigrations
python manage.py migrate                  # only touches BDB_Voting — kyc_db is never migrated
python manage.py seed_demo_staff          # creates admin/supervisor1/counter1/counter2 logins
python manage.py runserver
```

Open **http://localhost:8000/swagger/** to test every endpoint.

No more `seed_kyc_mock_data` — entity/representative data now comes straight
from your real `Kyc_DB_new_3` tables. Test with real access codes from your
`users` table (e.g. any row with a non-null `access_code`).

## Demo logins (from seed_demo_staff)
| username | password | role |
|---|---|---|
| admin | admin12345 | admin |
| supervisor1 | super12345 | supervisor |
| counter1 | counter12345 | staff (Counter 1) |
| counter2 | counter12345 | staff (Counter 2) |

## Known gaps / next steps
- Real SiPass REST client (currently mocked in `apps/sipass_integration`)
- `active_status` has 2 legacy rows with value `"1"` instead of `"Y"/"N"` —
  currently treated as inactive; flag these 2 records for manual review
- Excel export of verification records
- Frontend (React) — not part of this backend package

