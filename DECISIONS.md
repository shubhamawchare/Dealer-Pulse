# DECISIONS.md

## What I built

DealerPulse is a client-side Next.js dashboard with three views:

- **Network overview (`/`)** — KPI strip, branch comparison table (leads,
  conversion, unit/revenue attainment, stale leads), a bookings-vs-target
  trend chart, lead source and lost-reason breakdowns, an aggregate funnel,
  and an **insights panel** with concrete, ranked exceptions.
- **Branch drill-down (`/branch/[id]`)** — the same shape of analysis scoped
  to one branch, plus a rep leaderboard and a "leads going cold" table.
- **Rep drill-down (`/rep/[id]`)** — individual performance, funnel, lost
  reasons, and a full lead list for that rep.

A time-range filter (presets + custom from/to month) lives in the sidebar
and applies to every page. All data processing happens client-side in
`src/lib/metrics.ts` against the bundled JSON — no backend, since the
dataset is small (510 leads) and this keeps the whole thing deployable as
a static-friendly Next.js app with zero infra.

## Key product decisions

**"Booked" vs "delivered" as the target metric.** Monthly targets are
naturally about sales activity, not logistics. I define a unit as "booked"
the moment a lead's status history shows `order_placed`, and attribute it
to the month that transition happened in — not the month it's eventually
delivered. Delivery can lag booking by weeks (avg. 18.3 days in this
dataset, sometimes much longer), so tying target attainment to delivery
date would make November's numbers depend on December's logistics, which
isn't something a sales manager controls month-to-month. Revenue
attainment uses the same booking-month logic with `deal_value`.

**A distinct "as of" date for pace-based insights.** The dataset ends
December 31, 2025, so every month is technically "closed." To make the
assignment's own example insight — *"Highway branch is 40% behind target
with 10 days left"* — actually demonstrable, the insights engine anchors
its pace calculation to `DATA_AS_OF = 2025-12-20` (see `src/lib/data.ts`)
and treats December as the in-progress month, comparing actual bookings
so far against a linear expected pace. Everything else in the dashboard
(charts, tables) still reflects whatever time range the user selects —
only the pace insight uses this fixed anchor, since "days remaining in
the month" is meaningless for a month you're just browsing historically.
I called this out explicitly in code comments since it's the one place
the dashboard editorializes rather than just reporting.

**Rule-based insights, not ML-based.** With ~500 leads I didn't think
anomaly detection would outperform a handful of well-chosen thresholds a
domain expert would recognize immediately: branches behind pace, leads
gone cold 7+ days, reps with an outlier lost-rate (with a minimum sample
size so a rep with 3 leads doesn't trigger noise), the leading delivery
delay reason, and a positive signal (best-performing branch) so the panel
isn't purely bad news. Each insight links to the branch or rep it's
about — the point is to shorten the path from "noticing" to "acting."

**Design direction.** Automotive sales floors run on instrument-panel
thinking — targets, gauges, pace — so I avoided the generic
rounded-card-with-soft-shadow SaaS look in favor of flat panels, hairline
borders, a paper/ink palette (deep green for on-track, brick red for
critical, amber for watch), and tabular/mono numerals for data-dense
figures. It's meant to read as an ops console, not a marketing page.

**No backend, no auth, no database** — per the brief. Data is imported
directly as a typed JSON module; if this were headed to production with a
live CRM feed, `src/lib/data.ts` is the one file that would change (swap
the static import for an API call / DB query) — the metrics layer doesn't
care where the arrays came from.

## Tradeoffs

- **Mobile is "responsive," not "mobile-first."** The brief asked for
  desktop + tablet; I optimized the layout for those two and let phone
  widths degrade gracefully (stacked cards, horizontally scrollable
  tables) rather than designing a third dedicated mobile layout.
- **Client-side computation over a backend API.** Fine at this data size;
  would need pagination/aggregation on the server well before this scaled
  to a real multi-year, multi-thousand-lead dataset.
- **Fonts are system fonts, not a custom webfont.** Keeps the build
  fully offline-capable and avoids a flash-of-unstyled-text; a production
  build with reliable internet access could swap in a display face for
  headings without touching layout.
- **Insight thresholds are hardcoded**, not configurable per branch. A
  real CEO tool would let a branch set its own "stale lead" window or
  "behind pace" tolerance.

## What I'd build next with more time

- **Forecasting** — a simple linear or weighted-pipeline projection
  ("at current conversion rates, Branch X will land at ~85% of its
  January target") using the open pipeline by stage.
- **AI-generated narrative summaries** — feed the computed KPIs/insights
  for a branch into an LLM call to produce a one-paragraph "here's what
  happened and why" brief a CEO could skim before a Monday call.
- **Export** — a "share this view" button that serializes the current
  branch + time range into a URL, and a PDF/PNG export of the insights
  panel for circulating in a WhatsApp group (how these teams actually
  communicate, in my experience).
- **Rep-level lead aging alerts surfaced proactively** to the rep's own
  manager, not just visible on drill-down.
- **What-if scenarios** — a slider on test-drive→order conversion rate
  that recomputes projected revenue, per the brief's suggestion.

## Patterns I noticed in the data

- **56% of all leads are lost** — the funnel's biggest leak is upstream:
  more leads die before `test_drive`/`negotiation` than after. "Better
  offer elsewhere," "not ready to purchase," and "financing not approved"
  are the top three lost reasons, in that order, and are close enough in
  volume that no single fix would move the needle alone.
- **Average time from order to delivery is ~18 days**, but delay reasons
  are spread across the supply chain (customer date changes, factory
  allocation, logistics, RTO registration) rather than concentrated in
  one fixable bottleneck — worth knowing before promising a quick
  turnaround-time fix.
- **Glanza and Urban Cruiser Hyryder together account for well over
  40% of lead interest**, well ahead of the SUVs/MPVs — inventory and
  test-drive-slot planning is probably underweighted toward the models
  people actually walk in asking about.
