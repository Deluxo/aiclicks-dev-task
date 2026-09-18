# Brand Mentions Dashboard — Plan & Kanban

> **This file is the resume point.** Read it top-to-bottom at the start of every session.

- **Status:** BUILDING — Phase 4 (NOTES.md + final polish)
- **Angle:** UI-first (top-down). Mock phase skipped: backend was already built, so the
  frontend went straight to the real API (`NEXT_PUBLIC_API_URL` → `http://localhost:8001`).

---

## How to resume (next session)

1. Read this file top-to-bottom (design system, decisions, API contract, file map).
2. Open `PLAN/todo/` — the **first file** is the current phase.
3. Open that phase file and work its checklist top-to-bottom, ticking boxes as you go.
4. When a phase is done:
   - `mv PLAN/todo/<file> PLAN/done/<file>`
   - Update the **Phase board** table below (status → DONE).
   - Update **Current state** below.
5. Keep **Current state** accurate at all times — it is the live cursor.

---

## Phase board

| # | Phase | File | Status |
|---|-------|------|--------|
| 1 | UI prototype (mock data) | `done/1-ui-prototype.md` | DONE¹ |
| 2 | Backend (FastAPI + SQLite) | `todo/2-backend.md` | DONE² |
| 3 | Wire-up (mock → real API) | `todo/3-wireup.md` | SKIPPED³ |
| 4 | NOTES.md + final polish | `todo/4-notes-polish.md` | TODO |

¹ Mock phase skipped — UI built directly against the real API.
² Completed in a prior session (endpoints verified via curl); file not moved to `done/`.
³ Folded into Phase 1: no mock layer exists, so there was nothing to swap.

---

## Design system (single source of truth)

Clean modern neutral palette. No brand assets — we pick the look.

- **Accent:** `indigo-600` (`#4f46e5`) — buttons, active states, hero chart line.
- **Page bg:** `bg-gray-50`, min-h-screen.
- **Cards:** `bg-white border border-gray-200 rounded-xl shadow-sm`.
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Text:** headings `text-gray-900`, secondary `text-gray-500`.
- **Font:** system font stack (no build-time font fetch).
- **Model badges** (tinted bg + matching text):
  - chatgpt → `emerald`
  - claude → `amber`
  - gemini → `blue`
  - perplexity → `violet`
- **Sentiment pills:** positive → `emerald`, neutral → `slate`, negative → `rose`.
- **Chart:** "Total mentions" = subtle gray area; "Brand mentioned" = indigo line (hero metric).

---

## Key decisions (do not re-litigate)

- **Chart + KPI cards respect ALL filters** (model, sentiment, dates). The spec's trends
  request only has dates, but a chart ignoring model/sentiment is a UX bug. → We add
  optional `model`/`sentiment` to the trends endpoint (small change, note in NOTES.md).
- **Omit raw `id`** from the mentions table (not user-meaningful). Show all other fields.
- **Mock-first:** *(superseded — backend already existed, so the frontend went straight to
  the real API; no mock layer was built.)* `lib/api.ts` exposes `fetchMentions`/`fetchTrends`.
- **Deployment + public GitHub repo: DEFERRED** (user decision). Keep it deploy-ready:
  env-configured `NEXT_PUBLIC_API_URL` + CORS origin. Backend seeds `mentions.db` on startup
  if missing (works on ephemeral filesystems).

---

## API contract (from `frontend/lib/types.ts` + `backend/models.py`)

### `POST /mentions`
Request:
```json
{ "page": 1, "per_page": 25,
  "filters": { "model": "chatgpt", "sentiment": "positive",
               "date_from": "2025-01-01", "date_to": "2025-03-01" } }
```
All filters optional. Response:
```json
{ "data": [ { "id","query_text","model","mentioned","position","sentiment","citation_url","created_at" } ],
  "total": 487, "page": 1, "per_page": 25 }
```

### `POST /mentions/trends`
Request:
```json
{ "date_from": "2025-01-01", "date_to": "2025-03-01",
  "group_by": "day",            // "day" | "week"
  "model": "chatgpt",           // OPTIONAL (our addition)
  "sentiment": "positive" }     // OPTIONAL (our addition)
```
Response:
```json
{ "data": [ { "date": "2025-01-01", "total": 12, "mentioned": 8 } ] }
```

**Validation → 422:** bad model/sentiment enum, malformed dates, `page`/`per_page < 1`.
Cap `per_page` at 100. Empty result → 200 with `data: []`.

---

## Data facts (verified against `seed_data.sql`)

- ~10,000 rows, Jan–Mar 2025, models ∈ {chatgpt, claude, gemini, perplexity}.
- `created_at` stored as `'2025-03-13 12:06:08'` (no `T`/`Z`). Pydantic parses it; FastAPI
  returns ISO. For date filtering use `date(created_at)`.
- `mentioned` stored as `0`/`1` → `SUM(mentioned)` works in SQL.
- **Week-start (Monday) SQL formula** (tested):
  `date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days')`
- `position` is `NULL` when `mentioned = 0`.

---

## File map

### Backend (`backend/`)
- `main.py` — add `POST /mentions`, `POST /mentions/trends`; aiosqlite helper; seed-on-startup; CORS origin from env.
- `models.py` — add optional `model`/`sentiment` to `TrendsRequest`.
- `seed_db.py` — already fine (builds `mentions.db`).
- `requirements.txt` — fastapi, uvicorn, aiosqlite, pydantic (already fine).
- `mentions.db` — generated artifact (gitignored).

### Frontend (`frontend/`)
- `lib/api.ts` — `fetchMentions`/`fetchTrends`; POSTs to `${API_BASE}` (env-configured). No mock layer.
- `lib/types.ts` — matches API.
- `app/page.tsx` — dashboard (client component): filters/page/groupBy state, AbortController per fetch.
- `app/components/` — `Header`, `KpiCards`, `TrendChart`, `Filters`, `MentionsTable`.

---

## Verification

- **Backend:** `curl` each endpoint (filters, pagination, both `group_by`, invalid inputs, empty range).
- **Frontend:** `npm run dev` in browser (first-impression checkpoint) + clean `npm run build`.

---

## Current state

- **Phases 1–3 done.** Frontend is built and talking to the live backend on
  `http://localhost:8001` (via `frontend/.env.local`; gitignored).
  - `npm run build` clean; dev server verified (page 200, no compile errors); API contract
    curl-verified (filters, pagination, week buckets, empty range → `[]`).
  - KPI cards: Total Mentions from `/mentions.total` (all filters); Brand Mentioned / Rate
    from trend sums (date range only — backend trends endpoint takes dates only).
- **Phase 4 next:** write `NOTES.md`, final polish pass.
