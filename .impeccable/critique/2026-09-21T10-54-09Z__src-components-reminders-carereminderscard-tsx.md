---
target: Project-wide list separation, anchored on care reminders
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-09-21T10-54-09Z
slug: src-components-reminders-carereminderscard-tsx
---
Method: dual-agent (A: /root/list_design_review · B: /root/list_detector_review)

The flat stable-journal direction is appropriate. Warm ivory, evergreen actions, readable type and plain care language support everyday yard work. Missing row boundaries undermine that direction: whitespace and status rails leave users tracing between record titles and distant actions.

This is a focused pre-fix review of list grouping, supported by the supplied screenshot, source inspection and browser evidence. It is not a full application usability certification.

| Heuristic | Score | Evidence |
|---|---:|---|
| System status | 3/4 | Text badges and pending feedback exist. |
| Real-world language | 4/4 | Horse, care category and due date match yard tasks. |
| User control | 2/4 | Cancellation exists; status undo was not established. |
| Consistency | 2/4 | Semantic wrappers inadvertently remove shared separators. |
| Error prevention | 3/4 | Pending locks and named removal confirmations exist. |
| Recognition | 3/4 | Content is visible, but actions are weakly grouped. |
| Efficiency | 2/4 | Search/filter controls exist; no bulk workflow observed. |
| Minimalist design | 3/4 | Calm visual language; record boundaries are missing. |
| Error recovery | 3/4 | Inline retry guidance exists in source. |
| Help | 2/4 | Local guidance exists; broader help was not assessed. |
| Total | 27/40 | Acceptable; focused pre-fix assessment. |

Strengths: a coherent warm palette and type pairing; useful identity–metadata–description order; textual exceptional statuses with distinct destructive controls.

Priority findings:

1. **P1 — Every wrapped row loses its divider.** `DashboardItemCard` applies `last:border-b-0`, while reminder, document and filtered lists wrap each record separately. Every inner card is its wrapper's last child. Browser measurements confirmed 0px bottom borders on all four reminder specimens. Remove the unsafe suppression in the shared primitive. Suggested command: impeccable layout.
2. **P2 — Status rails substitute for item boundaries.** Some states have a left rail; ordinary pending items have none. Every flat record needs a neutral horizontal boundary independent of status. Use the solid existing border token; retain accents as subordinate information. Suggested command: impeccable polish.
3. **P2 — Actions feel detached from their record.** Right-aligned footer actions sit across a large open area. First extend each row's boundary underneath its entire content and footer. Reassess density separately after that correction; do not compress text or targets globally. Suggested command: impeccable layout.

Cognitive load is moderate: grouping and record-level hierarchy fail, while the three reminder actions do not constitute option overload. The calm page entry gives way to uncertainty when matching titles and actions. Reliable boundaries restore confidence at that point.

Persona concerns: a busy yard owner must trace to the correct Remove button; an occasional member may read the repeated rails as one continuous stream; a low-vision reader has weak grouping when whitespace is the main cue. No measured text-contrast failure is claimed.

The detector reported zero findings across five unique files: CareRemindersCard, DashboardItemCard, FilterableCareRemindersCard, DashboardMetaList and DashboardBadgeList. There were no false positives. Its clean result did not catch the runtime last-child interaction; native screenshots and computed styles supplied that evidence. Mutable browser injection was unavailable, so there is no detector overlay.

Implemented correction: flat shared records and open/link rows keep a full-width one-pixel neutral closing rule, including singleton and final rows. Timeline entries, medication summaries and table rows use the same solid border treatment. Existing contained variants and list semantics remain intact. DESIGN.md records the convention.

Verification: visible reminders at desktop and mobile widths in light and dark themes; document, event, horse-grid and timeline samples inspected; every observed affected row has a nonzero divider and none of those pages has horizontal overflow. Type checking, targeted lint and 19 existing tests across six files passed. Formatting corrected and checked. Tests cover reminder/document actions, filtered-source transitions, horse records/history and design conformance. These are local fixture checks, not live backend mutation checks.

Design question for future density work: does each action still feel attached to its record when the status rail and badge are absent?

Questions skipped: the user already specified and authorized the list correction; no further choice is needed.
