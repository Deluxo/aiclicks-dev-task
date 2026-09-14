# Phase 3 — Wire-up (mock → real API)

> Swap the data source from mock to the real backend. Should be nearly zero UI change.

**Goal:** the same dashboard, now driven by the live FastAPI + SQLite backend.

**Definition of done:**
- `NEXT_PUBLIC_API_URL` set → `fetchMentions`/`fetchTrends` hit the real API.
- Full flow works end-to-end in browser: filters, pagination, Day/Week, empty states.
- Loading states show real network latency (skeleton visible).
- `npm run build` still clean.

---

## Checklist

- [ ] In `lib/api.ts`, flip `USE_MOCK` off when `NEXT_PUBLIC_API_URL` is set (already planned).
- [ ] Real impl: `fetch(`${API_BASE}/mentions`, { method: "POST", body: JSON.stringify(req) })`;
      same for `/mentions/trends`. Throw on non-2xx; parse JSON.
- [ ] Set `CORS_ORIGIN` on backend to the frontend origin (dev: `http://localhost:3000`).
- [ ] End-to-end in browser:
      - [ ] Initial load → KPIs, chart, table populate from real data.
      - [ ] Change each filter → all three update together.
      - [ ] Paginate through real pages.
      - [ ] Day/Week toggle.
      - [ ] Clear filters → full dataset.
      - [ ] A filter combo with no matches → empty state.
- [ ] Confirm no mock data leaking (numbers match the seeded DB, e.g. total ≈ 10000).
- [ ] `npm run build` clean.

---

## Gotchas
- CORS errors in browser console → check `CORS_ORIGIN` matches the exact origin (incl. port).
- Date format: backend returns ISO `created_at`; display as-is or slice to date. Keep consistent
  with what the mock produced so the UI doesn't shift.
