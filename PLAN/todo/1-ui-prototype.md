# Phase 1 — UI Prototype (mock data)

> The first-impression deliverable. The whole dashboard must look real and alive with
> **zero backend running**. Build on mock data; the UI code must be identical for mock vs. real.

**Goal:** a polished, responsive dashboard: header → KPI cards → trend chart (Day/Week) →
filter bar → mentions table with pagination → loading + empty states.

**Definition of done:**
- `npm run dev` → dashboard renders fully on mock data, no console errors.
- Filters auto-apply; table + chart + KPIs all react to filters.
- Day/Week chart toggle works.
- Pagination works (Prev/Next, "Showing X–Y of Z").
- Loading (skeleton) and empty states visible.
- Responsive: works on desktop and tablet widths.
- `npm run build` passes clean.

---

## Checklist

### A. Data layer (mock behind real signatures)
- [ ] `lib/mock.ts` — deterministic generator: ~500 records, Jan–Mar 2025, random
      model/sentiment/position/mentioned/date/citation. Fixed seed so it's stable across reloads.
- [ ] `lib/api.ts` — `fetchMentions(req: MentionsRequest): Promise<MentionsResponse>` and
      `fetchTrends(req: TrendsRequest): Promise<TrendsResponse>`.
      Mock impl: apply filters (model, sentiment, date_from/date_to via date part), sort
      `created_at` desc, paginate; trends aggregates by day or Monday-of-week; `total` = count,
      `mentioned` = count where mentioned.
- [ ] A single `USE_MOCK` flag (e.g. `const USE_MOCK = !process.env.NEXT_PUBLIC_API_URL`)
      so Phase 3 is a one-line swap. Real impl `fetch`es `${API_BASE}/mentions` / `/mentions/trends`.
- [ ] `API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"`.

### B. Components (`app/components/`)
- [ ] `Header.tsx` — app name ("Brand Mentions") + one-line subtitle.
- [ ] `KpiCards.tsx` — 3 cards, responsive grid (1 → 2 → 3): **Total Mentions**,
      **Brand Mentioned**, **Mention Rate %** (mentioned/total). Respect all filters.
- [ ] `TrendChart.tsx` — recharts: gray area = total, indigo line = mentioned; legend, tooltip,
      `ResponsiveContainer`. Day/Week toggle buttons. Empty → friendly message.
- [ ] `Filters.tsx` — Model select, Sentiment select, Date from/to inputs, Reset button.
      Controlled by parent; onChange lifts state up (auto-apply).
- [ ] `MentionsTable.tsx` — columns: Query, Model (color badge), Mentioned (✓/—), Position (#n),
      Sentiment (pill), Citation (link, "—" if null), Date. Skeleton rows while loading.
      Empty state row with a Reset-filters action. Pagination footer (Prev/Next + "Showing X–Y of Z").

### C. Page (`app/page.tsx`, "use client")
- [ ] State: `filters`, `page`, `mentions`, `trends`, `loading`, `error`.
- [ ] `useEffect` fetches mentions (page+filters) and trends (filters) on change;
      reset `page` to 1 when filters change.
- [ ] Derived `totalPages = ceil(total / per_page)`.
- [ ] Layout: container → Header → KpiCards → TrendChart → Filters → MentionsTable.
- [ ] Loading: skeleton for KPIs/chart/table. Error: simple banner (mock won't error, but handle it).

### D. Polish
- [ ] Apply design tokens from `PLAN/README.md` (colors, cards, badges, pills).
- [ ] Responsive pass: wrapping filters, `overflow-x-auto` table, `ResponsiveContainer` chart,
      KPI grid breakpoints.
- [ ] Consistent spacing/sizing; no stray default styles.

### E. Verify
- [ ] `npm run dev` → open in browser, exercise: change each filter, page through, toggle Day/Week,
      clear all → empty/loaded states.
- [ ] `npm run build` → clean.
- [ ] Screenshot/mental check: does it look like a real product in the first 30 seconds?

---

## Gotchas
- recharts + React 19 peer deps — if `npm install` complains, add `--legacy-peer-deps` and note it.
- Tailwind v4 via `@tailwindcss/postcss` (already configured). Colors are standard Tailwind.
- Keep table dates as display strings; don't over-format.
