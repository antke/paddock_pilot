# Stable form family audit — 18 September 2026

Scope: shared `StableFormFields`, production stable create/edit, the new `StableFormPageLab`, and the shared stable name/location schema. Impeccable audit and craft-floor guidance applied in Operate mode. Existing warm typography, color tokens, flat `FormGroup`/`FieldGrid` layout and shared route form controls retained. No per-route visual CSS introduced.

## Findings and fixes

- **P1 — International stable names and locations were rejected.** The shared frontend/backend schema allowed ASCII only, rejecting names such as “Stajnia Łąka” and locations such as “Łódź.” It now accepts Unicode letters, combining marks, numbers, and familiar existing punctuation, including typographic apostrophes/dashes. Existing 3–50 character limits and unsupported-character checks remain. Location errors now say “Location,” matching the field label rather than “Address.”
- **P1 — Inline errors were not associated with form controls.** Every stable input/textarea now describes its own visible validation error. Required stable name/location controls expose `aria-required`; the introductory instruction distinguishes those two required fields from the optional details.
- **P2 — Create reset immediately discarded edits and actions were distant on long forms.** Create now uses the shared sticky action treatment and dirty-reset confirmation, matching the existing edit safeguard. Action copy uses sentence case. Create/edit mutation failures name the failed save and explain that entries remain for retry; success still follows the awaited backend result.
- **Verification gap — No safe interactive create/edit preview.** Added a stable-keyed sample with edit and empty-create modes using the actual fields and schema. Explicit local-only outcomes demonstrate pending, failure with retained data, successful retry and clean reset. The sample invalidates interrupted requests when switching mode/stable, so a late result cannot affect the next form.

## Evidence

- `shared/stables/stableSchema.test.ts`: 14 cases covering Polish and other international text, combining marks, existing punctuation, trimming, accurate location error copy, length bounds and invalid controls/markup.
- `StableFormPageLab.test.tsx`: three interaction regressions covering empty required-field errors/focus, pending→failure→retry with preserved edits and truthful success, and interrupted sample requests.
- All 17 targeted tests pass. Scoped ESLint passes.
- The local changes have no TypeScript errors; the full TypeScript run at handoff is blocked by an unrelated unused `allEvents` parameter in the parent-owned `PageLabPage.tsx` work in progress. Parent will run the final aggregate check.
- Parent owns lab registration and desktop/mobile browser screenshots, including confirmation that actions, errors, long text and pending states render correctly.

## Remaining verification

Authenticated create/edit route navigation, actual stable creation/onboarding transition, backend failure/retry, and role restrictions have not been exercised through live writes. No live stable records were changed. The lab demonstrates local outcomes; it is not evidence of server persistence. Reset protection does not provide a navigation-away guard.
