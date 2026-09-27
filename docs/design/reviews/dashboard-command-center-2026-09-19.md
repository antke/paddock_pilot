# Dashboard command centre: occurrence and attention corrections

Scope: source and component/in-memory tests for the findings in [the dashboard and analysis source review](./dashboard-analysis-source-2026-09-18.md). This supplement does not claim browser, live-account, responsive, or full-family completion. Parent task owns the integrated Page Lab and browser review.

## Calendar contract and presentation

`createDashboardCommandData` now expands the seven-day window with `shared/events/eventOccurrences.ts`, the same recurrence and inclusive multiday overlap contract used by the calendar. A recurring event whose original date precedes today can appear today; a visit spanning several dates appears on each covered day. Recurrence end dates and occurrence limits remain authoritative.

Schedule projections retain the original event `_id` and carry a distinct optional `occurrenceKey`. This prevents colliding React keys for overlapping daily multiday occurrences while keeping links pointed at the real event page. `data.events` remains the original stable event collection; only the today/week projections carry occurrence dates. Inputs are not mutated.

The underlying status contract is `planned | completed | cancelled`, with legacy missing status normalized to planned. Status currently belongs to the event/series, not individual recurrence instances. The dashboard deliberately retains completed and cancelled calendar entries and shows their existing `EventRow` badges. It does not invent independent occurrence completion. Today/header/week counters say **calendar entries** or **entries**, avoiding the implication that all are pending work. Continuing rows say “Continues” and include their actual date range.

Changed views: `ActiveStableHeader`, `TodayBriefingCard`, `MiniCalendarCard`, and the shared `EventLinkCard` adapter in `src/components/dashboard/command-center`. All use existing global row, badge, section and typography treatments. There are no new component-local style sheets or decorative wrappers.

## Attention contract and access

The overview query already loads permission-filtered horse metrics before ranking them. Previously `.slice(0, 8)` could discard a horse with a high-severity issue when eight other horses had larger combined overdue/high-issue scores. The bounded backend change retains the first eight ranked horses **plus every horse with `highIssueCount > 0`**. It changes neither severity definitions nor access filtering, and adds no query or mutation. Deleted horses and inaccessible stables still cannot contribute targets or counts.

`PriorityQueueCard` now presents actual health targets independently of the short horse roster. Each health row links directly to that horse’s care page and reports its high-severity issue count. The initial five-target list can be expanded to all available health targets; the expanded list uses the global named, keyboard-focusable `ScrollableList`. Show all/Show fewer preserves button focus. A defensive incomplete-preview message preserves a higher summary count without pretending that a generic horse-list link identifies the omitted issues.

Reminders are a separate group and include the horse identity. The existing overview contract includes pending reminders due **within 14 days**, including overdue reminders. The section description and empty state now state that horizon accurately. The backend reminder preview remains capped at eight; the card initially shows five and uses the authoritative count to state the remaining number. “View reminders” remains the full-list destination. No-reminders text does not imply there are no health issues.

`getDashboardAttention` uses the active stable’s summary when provided, falling back to the supplied overview summary. It filters target rows to the active stable and separates the health and reminder totals. The broader production page still needs to supply its correctly scoped overview, as before.

The care route previously opened Care reminders even for health-target links. It now validates the optional `careView=health` search value; unsupported values fall back to the ordinary reminder view. `HorseDetail` controls the care subsection from that search and updates it when the user switches views. Health attention links include this search, so their destination opens Health issues. Standalone `HorseCareSection` fixtures retain local state when no controlled-tab props are supplied. This is a bounded destination correction, not a new navigation hierarchy.

## Evidence

- `dashboardData.test.ts`: original explicit-date/leap-year/stable-ordering regression; recurring series beginning before the window, end-date and count limits, completed/cancelled retention, inclusive multiday continuation, unmodified inputs and unique keys for overlapping daily occurrences.
- `dashboardAttention.test.tsx`: care links for horses entirely absent from the roster; expansion/collapse and retained trigger focus; named constrained list; active-stable totals; honest missing health/reminder remainder; cancelled continuing entry, date range and original event URL.
- `convex/userCareOverview.test.ts`: actual in-memory query with eight higher-ranked reminder horses, a ninth high-severity horse, a lower-priority extra horse, a deleted horse and an inaccessible private stable. Confirms all high-severity targets remain available, non-high extra preview stays capped, permissions/deleted filtering remain intact, the full reminder count remains 16 and its preview remains eight.
- `horseCareSearch.test.tsx`: supported/invalid query validation, real `HorseDetail`/`HorseCareSection` composition initially selecting Health issues with `careView=health`, switching both ways with URL state retained, and the standalone sample's default/local switching. Only backend-connected record cards are mocked; the actual selection/navigation composition is exercised.
- Final targeted run: **10 tests in 4 files passed**. Full `tsc --noEmit`, scoped ESLint for command-centre, overview, care route and selection wiring, and `git diff --check` passed after changes. These are this bounded pass’s checks, not a claim about a later aggregate suite/build.

## Browser fixture guidance and remaining limits

The parent owns the Page Lab adapter and fixtures. The duplicate lab builder can delegate to `createDashboardCommandData` with an explicit local `todayKey`; optional `occurrenceKey` preserves the existing structural lab interface. Useful integrated specimens are a recurring series starting before today, an ongoing multiday event, a cancelled future entry, completed today, empty calendar, long names, more than five high-severity horses, a high-severity horse outside the roster, and more than eight due reminders with the full count retained.

Browser confirmation still needs to cover actual layout, day selection/keyboard movement, narrow-screen overflow, expanded attention scrolling, and dark mode. No live data was written. No claims are made about backend deployment or browser navigation into authenticated horse records.
