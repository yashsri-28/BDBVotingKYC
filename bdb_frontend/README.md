# BDB Voting — Election Verification Portal (Frontend)

React + Vite + Tailwind CSS v4 frontend for the Election Verification Module,
built for Bharat Diamond Bourse.

## Setup

```bash
npm install
```

## Connect to the backend

Edit `.env` (already created, copy from `.env.example` if you need a fresh one):

```
VITE_API_BASE_URL=http://localhost:8000
```

That's the only variable needed — everything else is derived from it in code:
- **WebSocket URL** (for real-time record-lock notifications) — `http://`/`https://` is swapped for `ws://`/`wss://` automatically (see `src/api/client.js` → `WS_BASE_URL`)
- **Photo/media URL** — assumed to be the same backend under `/media` (see `src/api/client.js` → `MEDIA_BASE_URL`). If member photographs live on a different host, change that one line in `client.js`.

Change `VITE_API_BASE_URL` if the backend runs on a different host/port
(e.g. a server IP for a multi-counter setup).

Any time you change `.env`, restart `npm run dev` — Vite only reads it on startup.

## Run

```bash
npm run dev
```

Opens at http://localhost:5173. Log in with any Counter Staff login seeded on
the backend (e.g. `counter1` / `counter12345`).

## Build for production

```bash
npm run build
```

Output goes to `dist/` — serve it with any static file host (nginx, IIS, etc.)
pointed at the same `VITE_API_BASE_URL`.

## What's included

- **Login** — JWT auth against `/api/auth/login/`
- **Verify** (`/dashboard`) — the core counter workflow: enter/scan an access
  card, resolve Scenario A (single entity) or Scenario B (representative maps
  to multiple entities — pick one), lock the record, then Verify & Send for
  Vote or Mark Not Eligible with a reason
- **Search** (`/search`) — manual lookup by name, membership number, or
  customer code
- **Audit Log** (`/audit`, Supervisor/Admin only) — every action, timestamped
- **Counters** (`/counters`, Supervisor/Admin only) — view-only list of which
  HID reader each Counter Staff login is bound to

## Error handling

All API errors are converted to plain, complete English sentences before
being shown (see `src/api/client.js` → `getErrorMessage`) — no raw server
tracebacks, status codes, or field-name jargon ever reach the screen.

## Design

Palette and type system are defined in `src/index.css` under `@theme` (Tailwind
v4's CSS-based config) — navy/royal-blue/steel/gold, drawn from the Bharat
Diamond Bourse mark, with Cormorant Garamond for display headings and Inter
for UI text. Change tokens there to re-theme the whole app.
