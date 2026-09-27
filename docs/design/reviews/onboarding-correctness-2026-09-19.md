# Onboarding correctness implementation — 19 September 2026

## Scope and ownership

Follow-up to `public-account-source-2026-09-19.md`, using Impeccable harden and craft-floor. Preserved the current typography, palette, global controls and owner/member sequence. No backend, authentication policy, application-wide styles or mutations were exercised. No browser or production build was run by this agent.

Changed owners: `OnboardingPage`, `OnboardingLayout`, `StableBasicsStep`, `StableOperationsStep`, `FirstHorseStep`, `InviteTeamStep`, `StableIntroductionStep`, `OnboardingReviewStep`; new onboarding-only `onboardingAsync.tsx`, focused `OnboardingFlow.test.tsx`, and `page-lab/prototypes/OnboardingPageLab.tsx`. AccountProfileForm's pure view and acknowledgement handling were implemented by the shared-style agent; this batch integrates that contract without editing its source.

## Implemented

- Stable basics reuses the shared Unicode-aware 3–50-character name/location schemas. Basics, operations and first-horse fields have unique control/error IDs and linked visible errors. The previously silent operations validation now focuses and explains invalid values. Birth-date parts retain independent labels inside a real fieldset/legend.
- Actual connected forms now delegate to exported `StableBasicsStepView`, `StableOperationsStepView` and `FirstHorseStepView`. Injected callbacks acknowledge the actual write; connected wrappers retain the original mutations.
- The onboarding save helper uses a synchronous operation guard, keeps failed drafts, and retains an acknowledged result when a continuation fails. The explicit continuation retry skips the write, protecting first-stable creation from a repeated mutation after a navigation rejection.
- `StableOnboardingView` owns loaded workflow data, review selection and injected form components/actions. Production still loads/authenticates through the original connected wrapper. All continue/defer/finish transitions use a guarded, caught promise with retryable error state. Save acknowledgements and failed progress updates are separate; retry invokes the progress operation only. Completing setup is retained across a failed open-stable navigation, so retry does not complete twice.
- `OnboardingLayout` disables Back, step selection and competing child controls during saves/transitions and while a transition recovery is unresolved. It exposes busy/status text and focuses the surviving named step section after progression. Shared `FormSubmissionError` provides error focus/reveal; retry uses global `DashboardActions`/Button. The profile/member/invite pure views report pending state through their existing optional callback contracts.
- Onboarding review lists only effective pending, unexpired invitations. Email delivery success is not required: a valid copied link remains useful. Intro details and review groups shed redundant inner panels; retained static guidance uses note semantics instead of urgent alert semantics. No global semantic feedback style was forked.

## Safe actual-view specimen

Export: `OnboardingPageLab({ data: DashboardLabData })` at `src/components/page-lab/prototypes/OnboardingPageLab.tsx`. Parent owns route registration.

The specimen is available only with `import.meta.env.DEV` and `useDevAuthBypassEnabled()`. Owner, member, profile and review scenarios render the real `StableOnboardingView` and pure production step forms. Save, advancement and open failures each occur once before a successful retry; a slow-response choice exposes pending guards. Owner horse creation and invitation controls update local arrays only. Profile image selection is validated but is never uploaded. Copy/resend/revoke are explicitly local and never call email, clipboard or server hooks. Changing/restarting the scenario unmounts its state, so a late local result cannot overwrite the new sample.

The sample does **not** reproduce the connected first-stable account/bootstrap/redirect composition. The actual empty StableBasicsStepView and duplicate-creation/continuation-retry path are covered by regression tests. A later visual pass must inspect first-stable route composition separately; the existing-stable wizard is not evidence for that screen.

## Verification

- 15 tests passed across `OnboardingFlow.test.tsx`, `OnboardingStepper.test.tsx` and `onboardingSteps.test.ts` (8 new workflow/form cases and 7 existing stepper/definition cases).
- New coverage: shared Unicode stable validation; formerly silent operations errors/focus; repeated create guard and continuation-only retry; pending Back/step guards; failed progress retry; member defer/finish with failed navigation and no repeated completion; owner horse/invite flow through actual pure forms; interrupted sample isolation; effective pending invitation review; fixture gate. The sample tests make live Convex hooks throw, so connected mutations/queries cannot accidentally run.
- Scoped ESLint passed for all files owned by this batch. Full `tsc --noEmit` passed. `git diff --check` passed for modified tracked owners.
- The configured pnpm launcher could not fetch/verify its configured release in the restricted environment. Checks used the already installed `node_modules/.bin` executables; no version bypass or dependency change was made.

## Remaining limits

No browser screenshots or visual certification are claimed. Parent should inspect owner/member flow at desktop/mobile, long error wrapping, the new step focus target, reduced motion and keyboard-only retries. Native form validation/focus in JSDOM is not a screen-reader or real-browser proof. The connected Clerk/bootstrap, real upload, invitation delivery, real permissions and first-stable redirect flow remain outside this safe sample pass. Unsaved navigation after an idle edit retains the existing product behavior; this batch guards in-flight operations, not a new global dirty-navigation policy. Invitation-list resend/revoke retain their existing per-row guards rather than exposing a new whole-wizard lock for those independent operations.

## First account and first stable composition — local specimen increment

The prior onboarding fixture exercised the persisted stable workflow but did not render `FirstStableOnboarding`'s account → stable-basics composition or already-connected branch. This increment extracts `FirstStableOnboardingView` in the existing `OnboardingPage.tsx`, retaining its step calculation, copy, layout and default connected-account links. Its inputs are profile, minimal stable identities, existing Profile/Basics form adapters, and `onStableCreated`. The connected owner still owns all queries, loading/null handling, incomplete-stable redirect and actual navigation. An optional `connectedActions` slot permits local-only specimen buttons without duplicating the alert composition or changing production destinations.

The existing `/page-lab/onboarding` **Sample workflow** (`#onboarding-sample-role`) now includes:

- **First account → first stable** (`first`): actual AccountProfileFormView, then actual StableBasicsStepView with blank creation fields. Profile and stable saves may each use **Next sample response → Save fails once**. Entries remain on rejection. Select **Step advancement fails once** before creating a valid stable to inspect acknowledged creation followed by continuation failure; fields lock and **Continue without saving again** retries only continuation. The terminal state says “Sample stable created” and explains that the real app would continue to stable operations; it does not claim full onboarding is complete.
- **Account already connected** (`connected`): the actual connected-account alert and three correctly labeled actions. The sample action callbacks announce the intended local destination (stable overview, profile, create stable), without navigation or mutation. Irrelevant save/delay controls are omitted for this branch. Production retains its original real links.

Existing owner/member/profile/review workflows and sample guard remain intact. The first-account profile adapter deliberately leaves the incoming completion flag unchanged until the view's own successful continuation advances the composition; it cannot skip the account form merely because a local save updated its data. Sample delay promises are canceled on restart, scenario replacement and unmount, preventing stale local continuation after the fixture is discarded. No backend, upload, invitation, account or stable operation is connected.

Two meaningful regressions were added to `OnboardingFlow.test.tsx`: first-account save failure/retry, blank stable creation, stable rejection with preserved draft, then acknowledged creation/failed continuation with a later save failure remaining unconsumed; and restart during pending profile save plus the already-connected local actions. Existing query/mutation hooks are configured to throw if a sample accidentally mounts them. Together with existing onboarding flow/profile/steps/stepper coverage, **20 tests pass across 4 files**. Scoped formatting/ESLint, full TypeScript and whitespace checks pass.

This remains source/DOM evidence. Parent browser verification of the newly available composition is pending; real authentication, incomplete-stable redirect, reactive backend updates and physical assistive technology are not certified by the sample. No coverage ledger or separate page-lab registration was changed.
