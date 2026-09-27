# Public, account and onboarding — implementation and browser audit

19 September 2026. Continuation of the project-wide Impeccable audit; [source findings](public-account-source-2026-09-19.md) are the starting evidence. Preserve the approved app identity and deliberate landing differences. No full-route closure is inferred from local samples.

## Current implementation boundary

Onboarding, account profile, pricing recovery and invitation access now expose actual presentation/controller seams with guarded local Page Lab adapters. Connected wrappers retain authentication, token/email checks, real upload/storage operations, notifications, entitlements and mutations. No fixture is permission to invoke those operations. Page Lab adds onboarding, profile, pricing, invitations and header samples.

The application shell now provides a shared skip-to-content link and focusable main target. Its scroll destination accounts for the actual header height; it does not animate or place main in the normal Tab sequence. Header navigation wraps at its global owner; the production navigation and stable switcher are exported for a safe specimen, rather than claiming the three-link development header covers the full signed-in view. Owner-only settings controls remain controlled by the connected permission adapter. Sample menu actions only update a labelled local status; ordinary route links still point to production routes.

Sign-in and sign-up share one application-owned AuthPageShell; Clerk still owns authentication. One provider appearance bridge maps colours, UI/display fonts and widths to existing live app tokens. The installed Clerk type contract was inspected; only supported appearance variables/elements are passed, without per-route overrides or changed login/checkout settings. Actual provider rendering, social/verification flows and account menus need separate browser evidence; type acceptance is not that evidence.

## First bounded browser inspection

The first inspection used the existing local server through the Codex in-app browser, with source/build/test activity stopped. It covered 390×844 and 1365×1000 viewports. Saved images live in `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/public-account-audit/`. A viewport screenshot proves only the region visible in that image; the observations below also use rendered DOM and actual controls.

| View | Observed evidence | Boundary |
| --- | --- | --- |
| Full header | All seven real navigation links fit at 390px; long stable name truncates in trigger and wraps in menu. Keyboard selection switched to the annex. Owner menu includes settings; member menu does not. Calendar is the selected page. No document overflow at 390px. Skip link focuses main. | Actual exported header/switcher with fictional stables and a labelled account placeholder; not a signed-in account-widget test. |
| Profile | Required-name message is linked; six-second pending disables fields/submit; failed save retains name/phone. Acknowledged save with failed continuation focuses truthful error, disables editing and exposes Retry continuing. Keyboard retry completes locally. Leaving during a later retry exercises unmount, but no persistence is claimed. | Actual form with local callbacks; file validation/duplicate-save assertions are DOM-test evidence, not browser-upload evidence. |
| Pricing | Disabled billing copy and unavailable-widget copy remain distinct. Keyboard Retry loading plans reaches the labelled placeholder and focuses Plan options. No overflow at 390px. | Actual error boundary, local widget. No real prices, provider recovery or checkout verified. |
| Invitation access | Long names wrap on mobile. Both decisions disable during pending. Failure says the choice was not confirmed; keyboard retry acknowledges local acceptance and focuses the surviving Invitation response region. Wrong email, missing verified email, expired, revoked, not-found and query-error states expose appropriate copy/actions. Query retry restores the ready state. | No live token, membership grant, decline, email, authentication switch or redirect was performed. |
| Owner onboarding | Overlong primary contact shows its error and keyboard submit focuses contactName. Operations save followed by progress failure retains the values and locks competing controls. Retry progresses to the real first-horse form. Added Sample Juniper with a year-only birth date, then a local invitation; review contains those values. A failed open after setup acknowledgement offers retry without claiming navigation succeeded; retry reaches sample completion. | Existing-stable wizard with real forms/local callbacks. No connected first-stable bootstrap, real creation, invitation delivery or navigation verified. |
| Member onboarding | Introduction proceeds to member-specific details. Deferral produces Done later and progresses to the horse step; skipping horse reaches review. | The member cancellation wording defect below was found here. |
| Review | Flat groups inspected in light and dark desktop layouts. Mixed-invitation sample lists only `pending@example.test`, excluding expired/accepted entries. Visible keyboard focus on edit actions. | Full contrast measurement, enlarged text and actual OS reduced-motion behavior remain open. |
| Sign-in/sign-up | Actual Clerk initial forms render on desktop dark and mobile light. DOM confirms native email/password labels and Alegreya Sans. No values entered or submitted. | Only initial provider rendering; no login, social auth, password reset, verification, signup agreement or account menu interaction. |

### Findings selected for the single correction batch

- **P1 — focused form error hidden by the sticky header.** At 390px, onboarding's focused error occupied y=0.1–74.9 while the header ended at y=117. `scrollIntoView(nearest)` alone does not account for the sticky overlay. Correct at the shared shell with measured scroll clearance, replacing the unrelated global fixed `[id]` margin instead of adding offsets to each form.
- **P2 — skip link introduced an extra grid track.** The button recipe's `relative` position defeated `sr-only` absolute positioning. DOM showed a 40px link occupying a 38px first grid track, making the intended three-row shell four rows and stretching the header on short desktop auth pages. Explicitly keep the hidden link out of layout and fixed when focused.
- **P2 — member deferral said Cancel.** In first-run member details, this action records deferral and advances. Forward the shared form's existing cancel-label option as Do this later in onboarding; keep Cancel when editing from review or elsewhere.
- **P3 — provider text-size drift.** The appearance bridge used a 16px literal while the approved base token is 17px. Use `var(--text-base)` alongside the existing font/colour tokens. Clerk documents CSS-variable appearance values in its [official variables reference](https://clerk.com/docs/js-frontend/guides/customizing-clerk/appearance-prop/variables).

One observation is not classified as a defect yet: the first pointer click after clearing a profile name displayed blur validation but left focus on submit. The existing DOM regression asserts focus after actual submit; source inspection found no refocusing handler. A second click/keyboard submit with the error already present will distinguish pointer reflow from a broken focus target in the confirmation pass.

## Checks before correction

All 406 tests in 85 files passed after updating the existing invitation route-test harness for its real QueryClient dependency; all six prior route cases were retained. Full TypeScript, production build and scoped parent lint passed. The static Impeccable detector reported only the provider font-size advisory above. Logs: `/tmp/paddock-public-account-{tests,types,build,lint}.log`, `/tmp/paddock-public-account-detector.json`.

## Single correction and confirmation complete

The shared shell owns measured header clearance through `--app-header-scroll-clearance`; a ResizeObserver and resize fallback update it. Static header specimens do not participate, multiple mounted headers retain the surviving measurement, and final cleanup restores the prior root value. `html` uses that value for scroll padding. The global fixed 8rem `[id]` margin was removed; country-landing-specific CSS was untouched. The skip link is explicitly absolute while hidden, fixed on focus, and uses the same clearance for its manual skip action. Member form cancellation text is forwarded through the global action component; only onboarding deferral supplies Do this later. Clerk's shared bridge now uses the existing base text-size token.

Confirmation observations:

- At 390px, the previously hidden focused onboarding error now starts at **y=133.1**, below the header ending at **y=117**, with a 16px gap. The retry is visible. Keyboard retry focuses the following Add your first horse region at y=132.8. Both messages and focused step are clear of the sticky header.
- At 1365px, the root clearance changes to 89px for the 73px header. The static full-header specimen does not add another clearance. Full navigation fits without horizontal overflow. At 390px the measured clearance is 133px for the 117px header.
- The actual mobile signup and desktop signin have three shell grid rows; the hidden skip link computes to `position:absolute`. The desktop header is 73px instead of the stretched pre-fix short-page header. Both real provider form inputs compute to 17px. No provider form was submitted.
- The member form exposes Do this later and Save details. Deferral still advances and displays Done later in the progress list. Review editing retains Cancel.
- Profile required-name validation focuses the name field when submitted from the keyboard and when clicking again with the error already displayed. This does not support a broken input-ref diagnosis. The original first-click blur/reflow observation remains a limited pointer observation, not a claimed fixed defect.
- The actual public root still renders the distinct country landing. After the application header unmounts, its CSS variable is empty and root scroll padding returns to 0px. This is a shell regression sanity check, not a full landing audit.
- Browser viewport override was reset and light theme restored. No further visual tuning was performed after confirmation.

### Final checks

**411 tests passed in 85 files**, full `tsc --noEmit`, production build, scoped ESLint and `git diff --check` passed. One existing member-directory test asserted focus before the post-commit restoration effect; its assertion now waits for the same required focus outcome. Production member-directory behavior was not changed to satisfy it. Final logs are `/tmp/paddock-public-account-final-{tests,types,build,diff}.log`, with owner and parent scoped lint logs.

The final static detector has no production-source findings. Its sole advisory is the shell test's explicit `20px` root font size, intentionally simulating a larger rem size to verify clearance arithmetic. This is test data, not an application typography override; it was not suppressed. Detector output: `/tmp/paddock-public-account-final-detector.json`.

### Screenshot evidence

Final corrected states:

- [Mobile onboarding error and retry](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/public-account-audit/onboarding-progress-failure-mobile-final.png)
- [Mobile signup](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/public-account-audit/signup-mobile-final.png)
- [Desktop signin](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/public-account-audit/signin-desktop-final.png)
- [Desktop full navigation specimen](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/public-account-audit/header-desktop-final.png)

First-inspection state evidence (before the global shell correction; not final shell certification): `header-owner-mobile.png`, `profile-continuation-mobile.png`, `pricing-recovery-mobile.png`, `invitation-failure-mobile.png`, `onboarding-review-desktop.png`, `onboarding-review-dark-desktop.png`, `signin-dark-desktop.png`. The files `onboarding-progress-failure-mobile.png` and `signup-mobile-before.png` record the diagnosed defects; use their final counterparts above for the corrected state.

## Scope assessment and remaining work

Provisional audit score for this inspected family: accessibility 3/4, performance 2/4, responsive 3/4, theming 3/4, implementation integrity 3/4 (**14/20**). This reflects useful fixes and consistent shared owners, while withholding credit for unaudited contrast, performance, text scaling, motion and authenticated integration. It is not an overall project score or a WCAG certification.

The local family pass is complete. Remaining integration evidence includes connected first-stable bootstrap/redirects; real profile upload and persistence; actual invitation token/email/account rules and delivery; provider login/social/password/verification/signup/account-menu flows; real billing widget/checkout; and signed-in full-header composition. Actual OS reduced motion, enlarged text, full contrast and performance measurement remain separate shared-audit work. The existing global 0.01ms motion policy has a [source audit](motion-source-2026-09-19.md), not a completed fix. The style-lab calendar's narrow overflow indicator and production calendar's keyboard-grid coverage remain open; the actual mobile route uses an agenda, so the specimen issue does not establish mobile data loss. No real account, invitation, stable, horse, image or billing change was submitted in this pass.
