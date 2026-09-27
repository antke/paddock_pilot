# Stable welcome audit — 18 September 2026

Scope: owner/member `StableWelcomePage`, its production route, and a new local preview using those same renderers. Impeccable audit/craft-floor guidance applied in Operate mode. The approved typography, palette and shared dashboard primitives remain the visual owners.

## Findings and fixes

- **P1 — Individual completion was conveyed only by hidden icons.** The checklist now exposes a named list and individually named list items with “Complete” / “Not complete.” Existing check/circle shapes remain meaningful visual state cues. Aggregate progress remains named and measurable. The member details toggle now exposes its expanded state and controls the displayed form region.
- **P1 — Expired/revoked invitations incorrectly completed setup.** The route previously counted every historical invitation. It now counts only effectively pending, unexpired invitations using the existing `getEffectiveInvitationStatus` helper. Joined members complete the step separately. Email delivery does not affect this count: an active copied invitation link can still be used if email delivery failed. The action reads “Review invitations” when one is already active.
- **P2 — Repeated boxed checklist rows and a nested form panel weakened the flatter design.** Checklist and reference links now use global flat row variants; non-clickable checklist rows have no interactive styling. The inner `FieldPanel` around the member form was removed. Reference links retain clear labels without decorative icons.
- **Verification gap — Member preview would mount a live mutation hook.** `StableWelcomePage` accepts an optional details renderer. The fixture supplies the pure `StableMemberDetailsFormView` introduced by the shared-component audit; production retains the normal mutation adapter. Local member edits update checklist completion only after a simulated success, and a failure retains entries for retry.

## Evidence

- `StableWelcomePageLab` offers owner new/partial/complete and member new/complete states. It labels sample data and warns that navigation links lead to real routes rather than pretending fixture navigation is a production session.
- Two integration tests exercise actual router-backed welcome renderers: per-step accessible completion plus aggregate progress, and failed member save → preserved entries → successful local update. A mocked mutation hook throws if mounted; the sample never calls it.
- Four existing invitation-state tests pass alongside the two new integration tests. Whole-project TypeScript and scoped ESLint passed at handoff.
- Parent owns registration (`stable-welcome`) and the desktop/mobile browser screenshot pass. Source and DOM tests do not certify final visual behavior.

## Limits

No live invitation was sent or membership saved. Authenticated route navigation, real mutation success/failure, and backend permission enforcement still require separate verification. Screen-reader hardware/software was not exercised. The broader `FormGroup` heading-level API remains deferred to its shared owner; this task did not add local heading overrides.
