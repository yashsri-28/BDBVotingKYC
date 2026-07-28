# BDB Voting & KYC Portal — Frontend

React + Vite + Tailwind CSS, rebuilt to match the working HTML/Alpine.js
demo pixel-for-pixel (2026-07-28), wired to the real Django backend.

## Setup
```bash
npm install
```

## Connect to the backend
Edit `.env`:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Run
```bash
npm run dev
```
Opens at http://localhost:5173.

## Roles (exactly 3 — no self-signup, Super Admin creates every login)

| Role | Backend value | Screens |
|---|---|---|
| Super Admin | `admin` | Everything — Counter Search, All-Counter Matrix, Master Report, User Management, Pool Allotment, Audit Trail, Vote Counting |
| Counter | `supervisor` | Counter Search & Issue, Master Report (own rows only), My Distribution Report, Live Results |
| Counting | `counting` | All-Counter Matrix (read-only), Master Report (read-only), Vote Counting, Live Results |

Signing in redirects each role to the screen they actually use — Counting
goes to the Matrix, everyone else to Counter Search.

## Screens

- **Counter Search** (`/search`) — search an access card, see KYC DB data
  (blue-tagged) and Voting DB data (purple-tagged) side by side, then
  select and issue ballot codes. Already-allotted codes show locked with
  a diagonal stripe pattern and "Already Allotted" flag; a "Verified
  User" checkbox bulk-selects everything still open.
- **All-Counter Matrix** (`/matrix`) — Super Admin (full) / Counting
  (read-only): every counter's Distributed-to-Counter / Distributed-to-
  Member / Balance, per pool type, with an efficiency progress bar.
- **Master Allotment Transaction Report** (`/master-report`) — every
  ballot allotment; a Counter sees only their own rows, Admin/Counting
  see everything.
- **My Counter Distribution Report** (`/my-report`, Counter only) — a
  personal Received/Distributed/Balance ledger, Category and Exclusive
  as parallel columns.
- **User Management** (`/users`, Admin only) — create Counter/Counting
  logins (password is generated and shown once), activate/deactivate,
  reset password.
- **Pool Allotment** (`/pool-allotment`, Admin only) — set base pool
  totals and assign portions to each Counter.
- **Audit Trail** (`/audit`, Admin only) — every action, timestamped.
- **Vote Counting** (`/counting`, Counting + Admin) — enter ballots
  during the counting stage.
- **Live Results** (`/results`, everyone) — the public results board.

## Design

Matches the demo's actual Tailwind config, which turned out to be
almost entirely Tailwind's own default palette:
- `navy` (custom, added in `src/index.css` under `@theme`): `#1e293b` /
  `#0f172a` / `#020617` — header and dark card headers
- Everything else — `blue-600` (primary actions), `emerald-*` (verified/
  paid/issued), `rose-*` (already-allotted/danger), `amber-*` (pending/
  balance), `purple-*` (anything from the Voting DB, vs. blue for KYC
  DB) — is Tailwind's default scale, unmodified
- Inter for UI text, JetBrains Mono for every card number, access code,
  ballot code, and timestamp

## Toast notifications

`src/context/ToastContext.jsx` — color-coded (success/warning/danger/
info), top-right, auto-dismiss after 4s, matching the demo.

## Error handling

All API errors are converted to plain, complete English sentences before
display (`src/api/client.js` → `getErrorMessage`) — no raw tracebacks or
status codes ever reach the screen.
