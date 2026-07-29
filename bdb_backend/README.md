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
representative). Verified with real duplicate example `GEM0000` → two
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


## Ballots module (added 2026-07-27, per Voting Module Review MoM)

New app: `apps/ballots`. Role hierarchy remapped onto the existing
CounterStaff roles (same stored values, new display labels):
`admin` → **Super Admin**, `supervisor` → **Counter**, `staff` → **Operator**.

### Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py import_electoral_rolls --clear
```
This imports both electoral rolls bundled in `data/` (Category Trade
Member and Exclusive Member) into `ElectoralRoll`, matching each row to
real KYC data by membership number where possible.

**Confirmed ballot logic (2026-07-27):**
- Category roll: tier I → 1 ballot, II → 2, III → 3
- Exclusive roll: flat 1 ballot per member
- Asterisk suffixes on membership numbers in both rolls are meaningless — stripped on import
- Being on either roll means IN SCOPE for the election, not automatically eligible — Section 5 rules still decide eligibility at the counter

### New endpoints
| Endpoint | Purpose |
|---|---|
| `GET /api/ballots/electoral-roll/?roll_type=&search=` | Browse imported rolls |
| `GET /api/ballots/pools/` | View base pools |
| `POST /api/ballots/pools/set-total/` | Super Admin only — set base pool total |
| `GET /api/ballots/allocations/` | View counter allocations |
| `POST /api/ballots/allocations/assign/` | Super Admin only — assign portion to a Counter |
| `GET/POST /api/ballots/sub-entities/` | Manage a Counter's C01-C04 sub-units |
| `GET/POST /api/ballots/operators/` | Manage named Operators under a Counter |
| `GET /api/ballots/transactions/` | Read-only transaction log |
| `POST /api/ballots/transactions/record/` | Record an Operator's +/- ballot activity |
| `GET /api/ballots/dashboard/` | Super Admin's totals-across-counters overview |

### Still separate from Ballots
Ballot issuance is a distinct step AFTER verification (confirmed
2026-07-27) — `apps/verification` is unchanged; `apps/ballots` is called
next, separately, once a member has been verified.

## Vote Counting module (added 2026-07-28, per Vote_counting.docx)

New app: `apps/counting`, plus a new **Counting Login** role
(`role="counting"`) created by the Super Admin. Counting logins exist only
to enter counted ballots — they get no counter/verification screens.

### Flow
1. Super Admin creates the election categories and the Candidate Master.
2. Super Admin starts a category. **Only one category may be in progress
   at a time** — the others stay locked until it is completed, which is
   what enforces the sequential counting requirement.
3. The Counting user enters each ballot number and the serial numbers of
   the candidates that ballot voted for.
4. Super Admin completes the category, unlocking the next one.

### Vote rules (confirmed 2026-07-28)
| Ballot kind | Votes per ballot |
|---|---|
| Exclusive Member | exactly 1 |
| Category Member | exactly 2, to two **different** candidates |

### Validations, all enforced server-side
- Counting must be open for that category
- Duplicate ballot number within a category is rejected
- Vote count must match exactly (Save is also disabled client-side)
- The same candidate cannot receive both votes on one ballot
- Every candidate serial entered must exist in the Candidate Master

### Endpoints
| Endpoint | Purpose |
|---|---|
| `GET/POST /api/counting/categories/` | Election categories (Super Admin writes) |
| `POST /api/counting/categories/{id}/start/` | Open a category for counting |
| `POST /api/counting/categories/{id}/complete/` | Close it, unlocking the next |
| `GET/POST /api/counting/candidates/` | Candidate Master |
| `POST /api/counting/categories/{id}/ballots/` | Record one counted ballot |
| `GET /api/counting/categories/{id}/ballots/list/` | Recently entered ballots |
| `DELETE /api/counting/ballots/{id}/` | Correct a wrongly-entered ballot |
| `GET /api/counting/categories/{id}/live/` | Live totals, by serial and by leading vote |
| `GET /api/counting/categories/{id}/report/detailed/` | Ballot-by-ballot grid |

## Ballot allotment by customer code (added 2026-07-28)

`apps/ballots/allotment_services.py` implements the counter's allotment
screen (Consolidated Requirements section 3):

- Searching an access card returns **every** customer code linked to it
- Codes are **pre-selected by default** where they can be allotted
- Only codes that pass the Section 5 eligibility rules are selectable —
  an ineligible code shows its blocking reason and cannot be ticked
- Saving locks the selected codes permanently; on a later search of the
  same card they return flagged **Already Allotted** and greyed out,
  while codes left unselected stay actionable
- Every rule is re-checked server-side on save, so a client that sends an
  already-allotted or ineligible code is rejected rather than trusted

| Endpoint | Purpose |
|---|---|
| `POST /api/ballots/allotment/search/` | Search a card, get all its codes with state |
| `POST /api/ballots/allotment/allot/` | Allot the selected codes |
| `GET /api/ballots/allotments/` | Allotment history (counters see their own) |
