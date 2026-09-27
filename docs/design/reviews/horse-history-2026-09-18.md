# Horse timeline and care summary — 18 September 2026

Scope: production `HorseCareSummaryPage`, `HorseTimelinePage`, their actual reusable views and existing lab routes. The shared `ActivityTimelineListEntry` function was changed at its global owner with parent approval; other timeline/chart functions were left untouched. Impeccable craft-floor applied within the approved journal identity. This is source and DOM-test evidence; parent browser review and print-preview evidence remain pending.

## Findings and fixes

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | Printed care summary did not identify its horse. The parent HorseDetail identity hero is `print:hidden`, while the summary showed only “Care summary” and stable name. | The actual summary heading now contains the horse's name. Identification remains present when the parent hero is hidden for print. |
| P2 | A missing horse's timeline looked like a valid empty history | Real missing-entity alert now distinguishes an unavailable horse from a horse with no records. |
| P2 | Summary's section headings were peers of its own H2 and record titles were H3 | Production nesting is now H2 summary, H3 sections, H4 records. The lab supplies the external H1. |
| P2 | Prior labs were simplified substitute compositions; Print did nothing and most record types/states were absent | Labs now render `HorseCareSummaryView` and `HorseTimelineView`, the same views used by connected routes. Care summary covers every actual section; timeline covers all five record kinds. Print invokes the browser print boundary. |
| P2 | An 80-record local history has no search or type isolation in the former production view | Added the existing global list-filter controls: search provider/notes/record text and isolate one of five record types. Results remain newest-first, including after relevance filtering. No extra local filter styling introduced. |
| P2 | Timeline entries and summary record groups retained nested filled boxes | The shared timeline list-entry function now uses flat rows/dividers with its existing event markers. Summary record panels explicitly use the global flat variant. |
| P2 | Event cost share appeared as a raw number | Timeline now uses the app's shared currency formatter, consistent with event/service details. No currency policy change. |

## Fixtures and tests

- `/page-lab/timeline`: all kinds, empty, missing horse, 80 records with a long horse name. Search and type filtering use actual production code. No mutation callbacks or live writes.
- `/page-lab/care-summary`: full, sparse/empty, missing horse, long name/unbroken identifier/document filename/notes. The fixture label and scenario controls are hidden for print, but outer lab chrome is owned by PageLabPage and still needs print-preview inspection.
- Four DOM regressions pass: horse identity/heading hierarchy/print invocation; sparse versus missing summary; kind/search filtering with no-result recovery and chronological ordering; empty versus missing timeline.
- Scoped ESLint passes. Parent reports the latest aggregate TypeScript check passes after a concurrent unrelated fixture correction.

## Shared consumer checks

`ActivityTimelineListEntry` is consumed by HorseTimelinePage and StableDesignGuidelines; the old direct timeline-lab usage was replaced by the production view. The style-lab import remains compatible and receives the same flat treatment. Rendered style-lab verification is still required; source compatibility does not count as visual coverage.

## Remaining verification and limits

- Parent browser review: desktop/narrow composition, native keyboard filtering, long content, no-result recovery, dark/reduced-motion, and care-summary print preview. No screenshots were taken by this source subtask.
- Actual authenticated routes, permission/error/loading boundaries and backend data correctness remain unverified. These fixtures are illustrative, not evidence of persistence or live clinical records.
- Source-level backend limitation retained: `horseTimeline.listForHorse` takes up to 250 event-horse links before mapping events, while other record kinds are collected. This audit does not establish complete history beyond that limit or change the backend query.
- Care summary intentionally uses the backend's bounded recent event/weight/nutrition sets. Generated date means render time, not a promise that every data source was just independently refreshed.
- Print pagination and outer app/lab chrome must be assessed in an actual print preview; DOM assertions only prove identity and button wiring.
