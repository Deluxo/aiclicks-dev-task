# Phase 2 — Backend (FastAPI + SQLite)

> Trivial, per user. Aggregations MUST happen in SQL, not Python.

**Goal:** `POST /mentions` and `POST /mentions/trends` backed by the seeded SQLite DB,
with validation, pagination, and SQL-side aggregation.

**Definition of done:**
- `python seed_db.py` creates `mentions.db` (10k rows).
- `uvicorn main:app` → both endpoints work; verified with `curl`.
- Aggregations (`COUNT`, `SUM`, `GROUP BY`) in SQL.
- 422 on invalid inputs; empty range → 200 `[]`; `per_page` capped at 100.
- Seeds `mentions.db` on startup if missing (deploy-ready).

---

## Checklist

### A. DB helper
- [ ] aiosqlite connection helper (open per request or a shared connection; keep it simple).
- [ ] Startup event (`lifespan` or `on_event`): if `mentions.db` missing → run seed logic.
- [ ] CORS: allow origin from env `CORS_ORIGIN` (default `http://localhost:3000`).

### B. `POST /mentions`
- [ ] Build `WHERE` from optional filters:
      - `model` → `model = ?`
      - `sentiment` → `sentiment = ?`
      - `date_from` → `date(created_at) >= ?`
      - `date_to` → `date(created_at) <= ?`
- [ ] `total = SELECT COUNT(*) FROM mentions WHERE ...` (same WHERE).
- [ ] `data = SELECT ... WHERE ... ORDER BY created_at DESC LIMIT ? OFFSET ?`
      (`LIMIT per_page`, `OFFSET (page-1)*per_page`).
- [ ] Return `{ data, total, page, per_page }`.

### C. `POST /mentions/trends`
- [ ] `day` → `GROUP BY date(created_at)`; `week` → `GROUP BY`
      `date(created_at, '-' || ((strftime('%w',created_at)+6)%7) || ' days')`.
- [ ] `total = COUNT(*)`, `mentioned = SUM(mentioned)` per group.
- [ ] Optional `model`/`sentiment` in WHERE (our addition). Date range via `date(created_at)`.
- [ ] `ORDER BY` group date ASC. Return `{ data: [{date,total,mentioned}] }`.

### D. Validation
- [ ] `model` ∈ {chatgpt, claude, gemini, perplexity} else 422.
- [ ] `sentiment` ∈ {positive, neutral, negative} else 422.
- [ ] `date_from`/`date_to` valid `YYYY-MM-DD` else 422.
- [ ] `page`/`per_page` ≥ 1; cap `per_page` at 100 (clamp, don't 422 — kinder).
- [ ] `group_by` ∈ {day, week} else 422.

### E. Verify (curl)
- [ ] `POST /mentions` no filters → page 1, 25 rows, correct total.
- [ ] `POST /mentions` with model=sentiment=dates → filtered, correct total.
- [ ] Pagination: page 2 differs from page 1; last page short.
- [ ] `POST /mentions/trends` day vs week → different bucket counts; sums sane.
- [ ] Invalid model/sentiment/date → 422.
- [ ] Empty date range (e.g. 2030) → 200 `[]`.

---

## Notes
- `models.py`: add optional `model`/`sentiment` to `TrendsRequest` (fields already exist for the rest).
- Keep it simple — no ORM, no over-engineering. Plain aiosqlite + parameterized queries.
