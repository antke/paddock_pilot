# First-stable composition — local browser confirmation

This extends the [onboarding source audit](onboarding-correctness-2026-09-19.md). It verifies the actual `FirstStableOnboardingView`, `AccountProfileFormView` and `StableBasicsStepView` through `/page-lab/onboarding`, with development-only local adapters. No account, stable, upload or invitation was created. Connected query/bootstrap/redirect behavior remains outside this specimen.

## Observed behavior

- At390×844, **First account → first stable** begins with the account profile. Saving advances to blank stable creation fields and focuses the Stable region.
- Submitting blank stable basics shows both required-field errors and focuses Stable name. A valid sample draft followed by **Save fails once** keeps both values editable and focuses the error. Keyboard retry reaches **Sample stable created**, with explicit local-only acknowledgement and a statement that the real app would continue to operations.
- **Step advancement fails once** after valid creation shows “Your changes were saved, but we could not continue.” Both fields become disabled and the action becomes **Continue without saving again**. Keyboard activation was exercised; the exact no-duplicate-save contract is regression-test evidence, not a browser callback counter.
- With the slow sample response, repeated profile submission shows disabled fields and a disabled **Saving...** action. Restart during a pending profile save returns to the initial profile. A later observation beyond the original delay still shows that profile; there is no stale advancement.
- At320×720, **Account already connected** displays the actual shared alert, with three wrapping actions. Keyboard activation of each announces its intended local destination (stable overview, account profile, create stable). Focus remains on the activated button. Document scrollWidth equals320; no horizontal page overflow was observed.
- At1280×720, the profile renders its six-step progress row, open form composition, shared inputs and image chooser. This was a layout/focus inspection, not an upload test. The sample was restarted before leaving.

## Screenshots

Files below are real viewport captures, inspected after capture. Their scope is the shown region, not a full-page or all-state certification.

- [Acknowledged creation / failed continuation at390](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/first-stable-confirmation/continuation-failure-390.jpg)
- [Already-connected actions at320](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/first-stable-confirmation/connected-320.jpg)
- [Account profile at1280](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/first-stable-confirmation/profile-1280.jpg)

## Result and boundaries

The missing first-account/first-stable composition now has bounded browser evidence. No additional visual correction was warranted in this confirmation pass. The extracted view retains the global form, feedback and onboarding recipes; the lab injects callbacks rather than duplicating production markup.

Real authentication, incomplete-stable redirects, persistence, server idempotency/lost-response recovery, storage, native assistive technology, software keyboard and OS reduced motion are not verified here. The connected specimen uses the standard sample stable name; extreme names are not credited. Idle dirty-route departure remains a separate unresolved shared behavior. Existing owner/member/review evidence is not replaced by this narrower check.

Current combined check results are recorded in project-coverage's dated onboarding/landing increment. Historical full-suite results must not be presented as a rerun for this change.
