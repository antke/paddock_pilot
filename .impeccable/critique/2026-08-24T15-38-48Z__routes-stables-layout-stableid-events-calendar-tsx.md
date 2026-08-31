---
target: src/routes/stables/_layout/$stableId/events/calendar.tsx
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-24T15-38-48Z
slug: routes-stables-layout-stableid-events-calendar-tsx
---
# Calendar critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Month and selection changes are visible but not announced. |
| 2 | Match with the real world | 3 | The calendar language is natural, but recurring and cross-month events are omitted. |
| 3 | User control and freedom | 3 | Navigation is clear; dense-day results are spatially distant from their trigger. |
| 4 | Consistency and standards | 4 | Production and Page Lab share the same canonical Calendar components. |
| 5 | Error prevention | 2 | A polished view can confidently show an incomplete schedule. |
| 6 | Recognition rather than recall | 3 | Direct links help scanning, but dense days duplicate selection choices. |
| 7 | Flexibility and efficiency | 2 | Responsive modes are strong; dense keyboard review needs a clearer path. |
| 8 | Aesthetic and minimalist design | 3 | The warm hierarchy works; dense-day controls add avoidable noise. |
| 9 | Error recovery | 3 | Empty and reset states are clear; component-level recovery is limited. |
| 10 | Help and documentation | 2 | Dense-day disclosure is not programmatically related to its result. |
| **Total** | | **28/40** | **Good** |

## Design specificity verdict

The Calendar is strongly authored for Paddock Pilot. The warm paper hierarchy, date-led records, restrained selection treatment, and responsive month-to-agenda adaptation belong to the Tack Room Noticeboard system. The serious gap is operational truth rather than visual identity: recurrence and multi-day ranges are lost before the polished interface renders them.

## What is working

- Below the medium breakpoint, the production Calendar correctly becomes a readable agenda instead of compressing seven columns.
- Desktop cells cap visible records and preserve direct event links.
- Route, Page Lab, rows, calendar primitives, and chrome follow disciplined canonical ownership.

## Priority issues

1. **P1 — Recurring and cross-month events can disappear.** The Calendar groups raw event start dates instead of expanding occurrences and inclusive date ranges. Canonical owner: Calendar projection in `StableEventsCalendar` using `shared/events/eventOccurrences.ts`.
2. **P1 — Dense-day disclosure is distant and weakly announced.** The result appears after the whole grid without `aria-expanded`, `aria-controls`, focus movement, or a live status. Canonical owner: `StableEventsCalendar`.
3. **P2 — Dense-day controls duplicate or disguise the action.** Ordinary populated days have both a count toggle and direct links, while `+N more` looks like a passive notice. Canonical owners: `StableEventsCalendar`, `EventCalendar`, and `EventCalendarChrome`.
4. **P2 — Page Lab covers only the happy path.** It has no empty, dense, recurring, multi-day, or long-content Calendar scenario. Canonical owner: `CalendarPageLab` fixture scenarios.
5. **P3 — Selected-day order is not locally deterministic.** The expanded list depends on incoming API order. Canonical owner: Calendar projection utilities.

## Persona red flags

- **Sam, keyboard or screen-reader user:** selected-day disclosure is not announced or directly related to its trigger.
- **Casey, distracted mobile user:** the agenda is much improved, but an extreme month can become a long repeated-date scroll.
- **Small-yard owner or member:** recurrence and date-range omissions make an otherwise dependable view operationally unsafe.

## Questions to consider

- Can the Calendar remain visually unchanged while its projection becomes a complete operational truth?
- Can dense-day disclosure behave like one clear action rather than a count control plus a separate notice?
- Which edge states should remain permanently available in Page Lab so future component work cannot regress them?

Questions skipped: the user already specified the priority, conservative visual direction, full implementation scope, and required stress states in the same request.
