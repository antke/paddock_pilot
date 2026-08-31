---
score: 72
p0: 0
p1: 4
p2: 4
p3: 1
timestamp: 2026-08-21T14-55-39Z
slug: src-routes-stables-layout-stableid-events-tsx
---
# Events module critique

The Events module had a strong date-led list and a coherent identity hero, but the calendar remained a generic desktop month grid with critical responsive and interaction failures.

## Priority findings before implementation

- **P1:** The seven-column month grid compressed event chips to unusable widths on mobile and intermediate viewports. Canonical owners: `StableEventsCalendar`, `EventCalendar`, and `EventCalendarChrome`.
- **P1:** Calendar event chips combined link and popover-button semantics, so Enter did not navigate reliably. Canonical owners: `StableEventsCalendar` and `CalendarEventChipLink`.
- **P1:** Dense days hid the third and later events behind an inert count. Canonical owner: `StableEventsCalendar`.
- **P1:** Production Event detail was double-wrapped while the Page Lab maintained a parallel approximation. Canonical owners: `EventDetail`, its route, and `EventDetailPageLab`.
- **P2:** The calendar count occupied a redundant standalone card.
- **P2:** Event detail over-framed each fact and skipped from its H1 to H3 subsection headings.
- **P2:** Production detail lacked an empty-horse state.
- **P2:** Date and time helper copy did not explain inclusive end dates or the existing yard-local convention.

## Positive findings

Event list rows were already distinct, readable, responsive, token-driven, and restrained in badge use. Create/edit actions used the shared icon conventions, permission states were explicit, and light/dark theming was coherent.

## Direction

Preserve the list and identity hero. Replace narrow month grids with a date-led agenda, use direct event links, add an operable selected-day disclosure for dense desktop dates, consolidate Page Lab onto production detail components, simplify detail facts, and clarify existing date/time entry without changing stored semantics.
