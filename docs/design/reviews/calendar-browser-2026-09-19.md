# Calendar — implementation and browser audit

19 September 2026. Continues the [source audit](calendar-source-2026-09-19.md) and [earlier event pass](event-family-2026-09-18.md). Local samples only; no real event mutations or permission changes.

## Result and shared ownership

Four P2 source findings addressed: truthful table semantics, focus recovery after reactive/responsive changes, a real responsive style-lab specimen, and fixtures isolated from connected data. The calendar retains the approved application typography, neutral selection, evergreen actions and flat event rows. `EventCalendar` / `EventCalendarChrome` continue to own calendar geometry; no feature-local visual recipes were introduced. `EventRow` remains the shared agenda owner. No visual correction was needed after the single batched browser inspection; this closes the bounded polish pass, not authenticated route coverage.

The month schedule is a read-only table containing native links and disclosure buttons. The distinction follows WAI's [table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) and [grid pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/). Empty weekday positions remain accessible cells. No date-picker arrow-key behavior is advertised or claimed.

`StableEventsCalendar` owns a persistent named focus fallback. It only recovers focus when affected calendar content is removed or hidden, and returns to the original disclosure trigger when that trigger survives. Its local scroll offset was removed in favor of shared header clearance. The optional initial month is consumed once, with normal production default unchanged.

`CalendarSample` composes that actual owner with explicit fictional records. Sparse/dense/empty and boundary-month choices work without incoming events. Delayed six → two → zero updates retain calendar identity and allow focus recovery to be inspected. Reset/cancel/month/scenario/unmount cancel pending timers. Sample destinations are visibly identified as fictional. Page Lab's connected branch uses only the supplied stable's real events and retains the real Add event link.

## Browser evidence

Actual component in `/page-lab/calendar`, then actual style-lab consumer at `/style-lab#timeline`; IAB viewport checks. All production/test/build source activity was stopped before interactions.

| Case | Observed result |
| --- | --- |
| Desktop 1365px semantics | Accessibility snapshot exposes named table, weekday headers, row groups and seven cells in every week, including blank positions. September current date retained. Full accessible event names and direct IDs visible. |
| Keyboard/repetition | Enter and Space disclose day 18's six records; focus enters its named agenda. Tab moves to Close. Escape removes agenda and restores original disclosure. Switching to day 21 exposes its three records; Close works. |
| Six → two | Focus remains in the surviving day agenda, now with two links. The old +4 trigger disappears; Close focuses the named calendar instead of a detached node. |
| Two → zero | While Close has focus, local records are cleared; agenda disappears and focus lands on the visible September calendar, not BODY. |
| Unrelated focus | With Sample month focused outside the calendar, delayed record update completes without taking focus. |
| Responsive focus | With desktop day agenda focused, changing to 390px moves focus to the visible calendar region. The table is hidden and the full month agenda is shown. |
| Date boundaries | February 2024 includes 29 days. February 2026 begins after six blank cells (Sunday); June 2026 begins in first column (Monday). December Next announces January 2027 and preserves Next focus; Today returns September 2026. |
| Real metadata | Mobile dense sample has all 12 month occurrences, two weekly occurrences linking to the same source ID, actual cross-month start/end range, completed farrier and cancelled massage states. Continuing clinic appears before same-day scheduled times in the selected-day agenda. |
| Narrow 390 / 320px | No document horizontal overflow. Sparse sample keeps long location readable; titles retain the shared two-line visual clamp and full accessible link name. Empty month exposes honest no-events text. |
| Intermediate 820px | No page overflow; seven columns retained. Measured dense cell width 105.43px, chip 84.43×49.58px. Many chip titles truncate at this density; full accessible names and disclosures remain available. This is a density tradeoff, not a claim of ideal tablet browsing or verified coarse-pointer behavior. |
| Dark representative | Agenda, statuses, dividers and focus outline remain visible in inspected dark sample. No full contrast certification. Theme restored to light afterward. |
| Style-lab consumer | At 390px, the actual sparse calendar renders a full agenda and zero visible month tables, without horizontal overflow. The old compressed static +N specimen is gone. |

Screenshots (viewport captures; no unreliable stitched full-page output):

- [Desktop agenda](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/desktop-agenda.png)
- [Mobile agenda](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/mobile-agenda.png)
- [320px long title](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/narrow-long-title.png)
- [820px month](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/intermediate-month.png)
- [Dark agenda](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/dark-agenda.png)
- [Style-lab mobile](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/calendar-audit/style-lab-mobile.png)

The floating palm mark is the development-tool launcher, not a new application ornament. Some captures show a scrolled agenda beneath the sticky header; they do not claim the entire calendar is visible at once.

## Checks and limits

Full suite: **425 tests / 88 files passed**. Full TypeScript, production Vite build, scoped ESLint and `git diff --check` passed. Logs: `/tmp/paddock-calendar-tests.log`, `/tmp/paddock-calendar-types.log`, `/tmp/paddock-calendar-build.log`, `/tmp/paddock-calendar-parent-lint.log`. Focused additions: seven calendar interaction cases, five existing projection cases; seven fixture/sample cases across two files. Detector for targeted production calendar/sample files returned no findings; visual/semantic evidence is independent of that result.

Coverage remains partial: authenticated calendar query/role composition and real event destinations; backend update timing; screen-reader announcements/table navigation; actual OS reduced motion; coarse-pointer hardware; enlarged text/browser zoom; comprehensive contrast, performance and high-volume calendar behavior. The viewport tool supports width/height only, so narrower width is not proof of touch or reduced-motion coverage. No sample link was treated as an authenticated event page. No existing recurrence/status algorithm or query access rule changed.

Provisional technical assessment for inspected scope: accessibility 3/4, performance 2/4 (not profiled), responsive 3/4, theming 3/4, implementation integrity 4/4 = **15/20**. This measures the bounded evidence, not WCAG certification or project completion. No new P0/P1 defect was observed; remaining verification is tracked in the project inventory.
