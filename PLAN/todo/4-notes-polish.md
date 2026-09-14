# Phase 4 — NOTES.md + final polish

> Wrap-up: document trade-offs and do a last quality pass.

**Goal:** a credible `NOTES.md` (required deliverable) and a final polish pass so the app
feels finished and the code is clean.

**Definition of done:**
- `NOTES.md` exists with: trade-offs/shortcuts, what I'd improve with more time, time spent.
- Final polish pass done (see checklist).
- Full local run verified one last time (backend + frontend together).

---

## Checklist

### A. `NOTES.md` (repo root)
- [ ] **Trade-offs / shortcuts:**
      - Mock-first build; mock dataset is synthetic (not the real 10k) — UI verified on it.
      - Added optional `model`/`sentiment` to `/mentions/trends` (spec only had dates) so the
        chart respects all filters.
      - Omitted raw `id` column from the table (not user-meaningful).
      - `per_page` clamped to 100 rather than 422 (kinder UX).
      - System font stack instead of a custom font (avoids build-time fetch).
- [ ] **What I'd improve with more time:**
      - Server-side date-bucketing for week grouping already in SQL; could add a composite index
        `(model, sentiment, created_at)` for filter+sort perf.
      - Real auth/tenancy, caching, and a proper deployment (deferred per scope).
      - Unit tests for the SQL aggregation queries.
      - Accessibility pass (focus states, aria labels on controls).
- [ ] **Time spent:** fill in actual hours at the end.

### B. Final polish pass
- [ ] Responsive re-check at tablet + desktop widths.
- [ ] Empty/loading states still correct after wire-up.
- [ ] No console errors/warnings; no unused imports; types clean (`tsc`/`next build`).
- [ ] Consistent spacing, alignment, and color usage per design system.
- [ ] Table: sticky header optional; ensure horizontal scroll on narrow widths.
- [ ] Backend: parameterized queries only (no string-concatenated user input).

### C. Final verification
- [ ] Backend: `python seed_db.py && uvicorn main:app` → curl smoke test both endpoints.
- [ ] Frontend: `npm run dev` → full manual pass in browser.
- [ ] `npm run build` clean.

---

## Deferred (out of scope, noted for the reviewer)
- **Deployment** (frontend + backend, no-auth public URL) — deferred by user.
- **Public GitHub repo** — deferred by user (current remote is the employer's repo; `gh` not installed).
- Both kept deploy-ready: env-configured `NEXT_PUBLIC_API_URL` + `CORS_ORIGIN`, seed-on-startup.
