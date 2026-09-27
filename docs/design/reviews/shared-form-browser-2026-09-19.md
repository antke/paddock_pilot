# Shared stable and event forms — browser confirmation

19 September2026. Parent browser verification of actual production-owned `StableProfileForm` and `EventEditor`, mounted with local callbacks in `/page-lab/stable-form` and `/page-lab/forms`. These replace the earlier independently assembled field demonstrations. No stable/event mutation or authenticated navigation was performed.

## Stable form

- At390, pristine Edit disables Update stable and Discard changes. Editing the name enables the actions. Enter on Discard opens confirmation; Keep editing preserves the draft and returns focus. Confirming discard restores Cedar Ridge Barn.
- Save failure retains the edited values and focuses the inline error. Acknowledged save followed by failed opening locks the fields and offers Open stable. Enter reaches an explicit local terminal state; it does not resubmit a live stable.
- At320, Create with blank required values focuses Stable name and associates name/location validation without page overflow. With name/location filled and a three-second delay, repeated activation shows disabled Creating feedback. Restart returns to blank enabled fields, and they remain initial after the delayed request would have completed.
- At1280, the actual shared Edit composition was captured. This does not certify every optional-field combination or authenticated route gate.

## Event form

- At390, editing Title then opening Reset and choosing Keep editing retains the draft. Confirming reset restores Summer shoeing visit.
- With a three-second local delay, double activation of Update shows disabled Saving feedback. Failure focuses its error and preserves the draft. Acknowledged save with failed opening locks the fields and offers Open event; Enter completes the local continuation and leaves a disabled Event saved action.
- At320, blank Create validation opens the Event details and Horses sections, focuses Title, and produces no page overflow. Actual recurring edit defaults retain last Friday, every two months and six occurrences.
- Restart during a pending event request immediately remounts the initial sample. The browser did not wait for that old event result; late-result suppression is regression-test evidence, not a newly observed browser result.
- Desktop1280 actual Edit composition was captured.

## Screenshots and qualification

All eight are real parent-inspected viewport captures. `event-failure-390.jpg` was captured during scrolling before the alert entered view: it is **not visual proof of the alert**. Focused failure/retained entries were observed separately. The settled `event-acknowledged-390.jpg` shows the visible focused continuation error at approximately y518–617.

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/stable-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/stable-acknowledged-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/stable-create-validation-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/stable-edit-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/event-edit-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/event-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/event-acknowledged-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/shared-form-confirmation/event-create-validation-320.jpg`

## Source and validation scope

Owners: `src/components/stables/StableProfileForm.tsx`, `src/components/forms/event/EventEditor.tsx`, their shared fields/RouteFormCard/feedback, and the corresponding Page Lab adapters. The production stable create/edit and event create/edit routes now consume the actual shared views rather than relying on a separately assembled preview. The four earlier form-composition gaps can receive this bounded shared-view evidence; authenticated wrappers remain unverified.

Agent-reported focused checkpoints: stable12tests/3files and event18tests/3files, with TypeScript/scoped lint/format passing. These are separate scoped runs, not an invented combined full-suite total. Parent aggregate checks, if run later, must be recorded separately. No new full-suite result is asserted here.

Real persistence, permissions, route-derived identity, notifications, actual route destinations, server idempotency/lost-response recovery, idle dirty-route departure, assistive-technology speech, physical touch/software keyboard, enlarged text and OS reduced motion remain explicit boundaries. No sample acknowledgement claims backend success. Existing [stable](stable-forms-2026-09-18.md) and [event](event-forms-2026-09-18.md) field evidence is preserved.

## Subsequent frozen-composition checkpoint

The parent full-suite rerun passed592tests/119files after caching repeated timeline-test button lookups without weakening assertions. The initial run had590passes and two timeline-control timeouts. Full TypeScript, production Vite build,35-file scoped lint/format and detector with no findings passed. Logs use `/tmp/paddock-audit-composition-*`, with final tests at `/tmp/paddock-audit-composition-tests-final.log`. This checkpoint precedes the separate later tabs correction; it does not certify that correction or close live/backend boundaries.
