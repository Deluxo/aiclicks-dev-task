# Brand Mentions Dashboard

Live: https://modest-determination-production.up.railway.app/

## What it is and what it's for

Analytics dashboard for tracking how often a brand is mentioned in AI model responses (ChatGPT, Claude, Gemini, Perplexity).

It lets you:

- Browse ~10,000 mention records in a paginated table (`query_text`, `model`, `mentioned`, `position`, `sentiment`, `citation_url`, `created_at`)
- Filter by model, sentiment, and date range
- See mentions over time as a daily / weekly trend chart
- See KPI totals: total rows, brand mentioned count, mention rate

Single page: KPI cards on top, trend chart in the middle, filter bar + mentions table below. Includes loading skeletons, empty states, and error retry.

## With what it's done

### Backend — `backend/`

- **FastAPI 0.115 + uvicorn** — `POST /mentions`, `POST /mentions/trends`, `GET /health`
- **aiosqlite 0.20** — async access to SQLite (`mentions.db` seeded from `seed_data.sql` via `seed_db.py`)
- **Pydantic v2** — request/response validation (`models.py`)
- **returns** — functional helpers for SQL building (`db/sql.py`)
- Managed with **uv** (`pyproject.toml`, `uv.lock`, `.python-version >=3.12`)

Run:

```bash
cd backend
uv sync
uv run python seed_db.py
uv run uvicorn main:app --reload  # :8000
```

Config via env: `CORS_ORIGIN` (default `http://localhost:3000,http://127.0.0.1:3000`).

### Frontend — `frontend/`

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS 4** for styling
- **Recharts 2.12** for the trend chart (`ComposedChart`: Area = total, Line = mentioned)
- **@synergyeffect/react-atom 1.0.4** for small UI primitives (`app/components/atoms.tsx`)
- No global store, plain `useState` + `fetch` in `app/page.tsx`, typed API client in `lib/api.ts` / `lib/types.ts`

Run:

```bash
cd frontend
npm install
npm run dev  # :3000
```

Config via env: `NEXT_PUBLIC_API_URL` (see `.env.local`, defaults to `http://localhost:8000`).

### Database

SQLite table `mentions(id, query_text, model, mentioned, position, sentiment, citation_url, created_at)` with indexes on `model`, `sentiment`, `created_at`, `mentioned`. Jan–Mar 2025 seed data.

### API contract

```json
// POST /mentions
{ "page": 1, "per_page": 25, "filters": { "model": "chatgpt", "sentiment": "positive", "date_from": "2025-01-01", "date_to": "2025-03-01" } }
// -> { "data": [...], "total": 487, "page": 1, "per_page": 25 }

// POST /mentions/trends
{ "date_from": "2025-01-01", "date_to": "2025-03-01", "group_by": "day" }
// -> { "data": [{ "date": "2025-01-01", "total": 12, "mentioned": 8 }] }
```

Project layout:

```text
backend/main.py                 # routes + lifespan + CORS
backend/models.py               # Pydantic contracts
backend/db/sql.py               # functional WHERE builder
backend/db/repository/mentions.py  # list + count queries
backend/db/repository/trends.py    # group-by-day/week query
frontend/app/page.tsx           # dashboard state + data fetching
frontend/app/components/        # Header, KpiCards, TrendChart, Filters, MentionsTable, Table/, atoms
frontend/lib/                   # api.ts, types.ts
```

## Technical decisions taken

### Backend

- **All aggregation in SQL, not Python.** `COUNT(*)` for totals, `COUNT(*) + SUM(mentioned)` with `GROUP BY date(created_at)` for trends. Python only maps rows to Pydantic models.
- **Composable WHERE-builder (`db/sql.py`).** Small curried operators (`op_eq/op_gte/op_lte/where_in`) + `to_sql_where_conditions_and_params` that skips empty / `None` filters. `mentions.py` and `trends.py` just declare an `op_map` (`model -> IN`, `date_from/date_to -> >= / <= on `created_at``). Avoids string-concatenated SQL and duplicated filter logic.
- **Single shared `aiosqlite` connection via `lifespan`.** Simple and sufficient for a read-heavy SQLite dashboard; no pool / ORM introduced.
- **Lenient filter input.** `MentionFilters.model` accepts `str | list` and coerces to list via `field_validator`, so both `{ "model": "chatgpt" }` and `{ "model": ["chatgpt","claude"] }` work. Invalid enums / dates fail with Pydantic 422 instead of manual checks.
- **Week buckets start Monday.** `TREND_GROUP_BY["week"] = date(created_at, '-' || ((strftime('%w', created_at) + 6) % 7) || ' days')`. Day mode uses `date(created_at)`.
- **Pagination as `LIMIT/OFFSET` + separate `COUNT(*)`** with `ORDER BY created_at DESC`. Predictable for 10k rows; no keyset pagination needed.

### Frontend

- **One client page with two parallel fetches.** `page.tsx` fires `fetchMentions` (page + filters) and `fetchTrends` (filters + `groupBy`) independently, each with its own `AbortController` and loading flag, so the chart doesn't block the table. Changing filters resets to page 1; a `refreshKey` powers the error-retry button.
- **KPIs derived client-side from trend data.** `totalMentions` comes from `/mentions.total`, `mentioned` / `rate` are summed from the trend points — no extra endpoint.
- **Generic `Table<T>` component.** Column definition is `Record<key, [headerFn, cellFn]>`, handles desktop `<table>` + mobile card list (`sm:hidden`), skeleton loading, empty state, and Prev/Next footer. `MentionsTable` only declares columns and pill colors.
- **Atoms via `react-atom`.** All shared styling (`Card`, `Pill`, `Button`, `Skeleton`, etc.) lives in `atoms.tsx` as pre-styled atoms instead of a component library, keeping the UI consistent with little code.
- **Recharts `ComposedChart`.** Gray Area for `total` volume + indigo Line for `mentioned`, with day/week segmented toggle that just switches `group_by` in the request.
