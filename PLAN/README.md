# Brand Mentions Dashboard — Plan & Kanban

> **This file is the resume point.** Read it top-to-bottom at the start of every session.

- **Status:** BUILDING — Phase 1 (UI prototype)
- **Angle:** UI-first (top-down). Reviewer's first impression is UX, so we prototype the
  full dashboard on mock data before touching the (trivial) backend.

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
| 1 | UI prototype (mock data) | `todo/1-ui-prototype.md` | IN PROGRESS |
| 2 | Backend (FastAPI + SQLite) | `todo/2-backend.md` | TODO |
| 3 | Wire-up (mock → real API) | `todo/3-wireup.md` | TODO |
| 4 | NOTES.md + final polish | `todo/4-notes-polish.md` | TODO |

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
- **Mock-first:** UI is fully reviewable before the backend exists. `lib/api.ts` exposes
  `fetchMentions`/`fetchTrends`; a mock implementation behind the same signatures lets the
  UI code be identical for mock vs. real.
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
- `lib/api.ts` — **new.** `fetchMentions`/`fetchTrends` + mock impl.
- `lib/mock.ts` — **new.** deterministic mock dataset generator.
- `lib/types.ts` — already matches API.
- `app/page.tsx` — dashboard (client component).
- `app/components/` — **new.** `Header`, `KpiCards`, `TrendChart`, `Filters`, `MentionsTable`.

---

## Verification

- **Backend:** `curl` each endpoint (filters, pagination, both `group_by`, invalid inputs, empty range).
- **Frontend:** `npm run dev` in browser (first-impression checkpoint) + clean `npm run build`.

---

## Current state

- **Phase 1 (UI prototype) in progress.** Nothing built yet in code — plan is written.
- Next concrete action: build `lib/mock.ts` + `lib/api.ts`, then the components, then `page.tsx`,
  then verify in browser.
