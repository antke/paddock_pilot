---
target: src/routes/stables/_layout/$stableId/reminders.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-21T12-35-08Z
slug: src-routes-stables-layout-stableid-reminders-tsx
---
Method: dual-agent (A: care_design_assessment · B: care_detector_assessment)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Row mutations lacked pending and disabled feedback. |
| 2 | Match system / real world | 4 | Stable-wide, horse, care category, and due-date language fit yard work. |
| 3 | User control and freedom | 1 | Removal was immediate and irreversible. |
| 4 | Consistency and standards | 3 | Shared primitives were coherent, but inert rows looked interactive. |
| 5 | Error prevention | 1 | Adjacent status and removal actions had no destructive safeguard. |
| 6 | Recognition rather than recall | 3 | Users still had to calculate near-term urgency from dates. |
| 7 | Flexibility and efficiency | 3 | Search, filters, and multi-horse creation were useful. |
| 8 | Aesthetic and minimalist design | 3 | Calm hierarchy, but mobile urgency appeared after long notes. |
| 9 | Error recovery | 2 | Validation existed; failed mutations had limited contextual recovery. |
| 10 | Help and documentation | 2 | Form guidance was useful, but action consequences were underexplained. |
| **Total** | | **25/40** | **Acceptable pre-fix baseline** |

## Design Specificity Verdict

The warm paper palette, condensed noticeboard headings, horse names, care categories, and selective semantic rails feel authored for Paddock Pilot. The underlying search/filter/CRUD structure remains conventional, but the visual language is product-specific and coherent.

The deterministic scan was initially clean for the Care route and reminder components. Browser evidence confirmed semantic controls, no page-level horizontal overflow, working Escape dismissal, and strong light/dark contrast. Live overlay injection was unavailable because the browser inspection surface is read-only; screenshots, accessibility snapshots, and computed layout metrics were used instead.

## What Was Working

- Warm Ledger Paper and Wood Rail surfaces created clear, calm record separation.
- Search, filter, multi-horse creation, validation, and status language matched real yard tasks.
- Text contrast, native control semantics, and responsive foundations were strong.

## Priority Issues

1. **P1 — Destructive reminder removal had no confirmation.** Canonical owner: shared record removal action and `CareRemindersCard`.
2. **P1 — Row mutations exposed no busy state or duplicate-action guard.** Canonical owner: reminder row actions.
3. **P1 — Mobile urgency and action layout were weak.** Badges followed long notes and actions formed a clipped horizontal strip. Canonical owner: `DashboardItemRecordCard` action/badge layout.
4. **P2 — Inert reminder rows advertised row-level interaction.** Canonical owner: `CareRemindersCard` invocation of the shared record card.
5. **P2 — Long multi-horse creation pushed completion below the dialog fold.** Canonical owner: `FormSubmitActions` inside `CareReminderForm`.

## Persona Red Flags

- **Alex:** repeated actions had no busy feedback and no bulk status path.
- **Sam:** mobile action geometry and late urgency disclosure weakened accessible scanning.
- **Casey:** closely grouped actions and an off-screen form submission point increased accidental or abandoned work.

## Minor Observations

- Relative due labels would reduce date arithmetic.
- Routine upcoming reminders did not need a decorative Stable Green rail.
- The Page Lab developer launcher can overlap the mobile create FAB; this is a fixture-only artifact.

## Questions to Consider

- Should future reminder data include an accountable member when the domain model supports it?
- Should completed and dismissed reminders eventually move behind a history view rather than remain in the active ledger?
