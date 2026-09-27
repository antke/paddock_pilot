# Public, account and access source audit — 19 September 2026

## Scope and limits

Read-only Impeccable audit of pricing, sign-in/sign-up, profile, invitation-token access, owner/member onboarding, and the root application shell. Read the current `DESIGN.md`, shared-style ownership review, completed onboarding-stepper review, representative global components and the relevant server contracts before judging consumers.

The approved application language remains Alegreya/Alegreya Sans, ivory/paper surfaces, evergreen actions, oat selections and flat information groups. The separate landing identity is outside this task. No UI, authentication, backend, fixture or configuration was changed. No browser, build, tests, detector or live mutations were run during this source-only pass. The earlier global detector review remains historical evidence, not a new result. No health score, contrast compliance, mobile certification or performance score is asserted from source alone.

## Implementation integrity

The application-owned surfaces largely consume the right global owners. The main defects are validation and asynchronous state ownership, not a missing redesign. Shared fields, buttons, page headings and sections should remain. The auth-provider widgets have no application appearance bridge, and the existing development header does not exercise the full production navigation. Those are coverage gaps rather than evidence that their rendered UI is unusable.

The previously reported stepper radius and `display: contents` focus defects are already corrected and verified in `onboarding-stepper-2026-09-18.md`; do not reopen those fixes.

## Prioritized findings

### P1 — Stable operations can reject submission without explaining any field error

**Source:** `src/components/onboarding/StableOperationsStep.tsx:34,75` and subsequent Controllers; `shared/stables/stableSchema.ts:25` onwards.

The form uses `stableOperationsFormSchema`, which limits contact names to 100 characters, phone values to 50 and notes/opening hours to 1,000. Every Controller renders only `field`; none renders `fieldState`, an error message or `aria-invalid`. An overlong pasted value causes the resolver to prevent `onSubmit`, while the page gives no explanation of what to fix. This is a concrete validation defect, independent of visual polish.

**Next change:** expose each resolver error through the shared Field/FieldError pattern, unique linked error IDs and correct refs. Preserve entered values and focus the invalid control. Test an overlong contact name and yard rules followed by correction and successful local acknowledgement. **Impeccable:** harden.

### P1 — Onboarding advances have no consistent pending/recovery owner

**Source:** `src/components/onboarding/OnboardingPage.tsx:229,246,349,355,476`; `StableBasicsStep.tsx:45`; `StableOperationsStep.tsx:45`; `FirstHorseStep.tsx` submit handler; `OnboardingReviewStep.tsx:181`; `InviteTeamStep.tsx` continue/defer actions.

`advance()` directly awaits `recordStep`. Introduction, skip/continue and finish controls invoke asynchronous transitions without a controller-owned busy or failure state. Member-details callbacks explicitly discard the advance promise with `void`, so a progress write failure has no local recovery. Back and step selection remain independent of a child form's active save.

Other forms catch the record mutation and the subsequent `onSaved`/advance/navigation in one block. If the record save succeeds but advancement fails, they announce that creation/save failed. Retrying the original operation can repeat a write; new-stable creation is particularly unsuitable for such a retry. This is a conditional source-visible failure path, not an observed duplicate production record.

**Next change:** make step transition state explicit, guard repeated operations synchronously, await callbacks, keep record acknowledgement separate from advancement, and retry only the failed phase. Decide navigation/dirty-state behavior at the wizard owner. Test save success followed by progress failure, transition rejection, repeated finish/skip, and attempted back/step change during a pending save. Never report completion before the server response. **Impeccable:** harden → onboard.

### P2 — Pricing's invitation return link accepts external protocol-relative destinations

**Source:** `src/routes/pricing.tsx:18,80`.

`returnTo` is accepted whenever it starts with `/`, then passed directly to a native anchor. `//example.com` passes this check and resolves to another host while the visible link promises “Return to invitation.” This is user-controlled navigation, not an automatic redirect.

**Next change:** allow only an explicitly valid application-relative invitation destination, or validate same-origin destinations with a well-defined path contract. Include protocol-relative and backslash forms in focused tests, alongside a legitimate invitation path. Do not change token authorization. **Impeccable:** harden.

### P2 — Billing unavailable is presented as billing disabled

**Source:** `src/routes/pricing.tsx:31,52,72,89`.

When billing is enabled but `PricingTable` throws, the boundary renders the same fallback as the disabled environment. That fallback states billing is not enabled and claims all current features can be used without choosing a plan. A widget failure establishes neither fact. The boundary also has no visible retry.

**Next change:** separate configured testing/disabled content from widget-unavailable recovery. Preserve existing factual plan policy until the product owner changes it; do not invent prices or entitlements. Add an injected throwing specimen of the real boundary/fallback, not a live purchase flow. **Impeccable:** clarify → harden.

### P2 — Stable basics uses weaker validation than its actual save contract

**Source:** `src/components/onboarding/StableBasicsStep.tsx:20,45`; `shared/stables/stableSchema.ts:8`; `convex/stables.ts:110,196`.

The onboarding schema accepts any nonempty stable name/location. The production add/update operations require the shared 3–50-character, Unicode-aware constraints. A one-character or overlong input therefore passes the local form and fails as a generic mutation error. The catch also says “Could not create the stable” when editing an existing stable.

**Next change:** reuse the existing shared name/location schemas, preserving the recently fixed Polish names and valid punctuation. Link errors to their fields and use truthful create/edit failure copy. Test client/server boundary examples through the pure form. **Impeccable:** harden → clarify.

### P2 — Profile image validation occurs after upload, and acknowledged selection is retained

**Source:** `src/components/onboarding/AccountProfileForm.tsx:22,58,77,160`; `convex/onboarding.ts:124`; `src/routes/profile.tsx:47`.

The local schema accepts a FileList without file type or size refinements. The server rejects non-image metadata and files over 5 MB, but this check occurs after the browser has uploaded the file. `accept="image/*"` is only a picker hint. Failure produces a generic profile toast rather than an actionable file error.

After an acknowledged profile save the form never resets or clears the selected FileList. On the persistent profile page, saving a later name/phone change can upload the same previously saved file again. The shared FileUploadField already supports clearing controlled files; the missing lifecycle decision is in this form.

Preferred-name errors also lack an explicit `aria-describedby` association despite rendering FieldError. Use stable unique control/error IDs throughout this form; preserve native labels.

**Next change:** validate the actual image/5 MB contract before upload, describe the limit, clear only the acknowledged file selection after success, and preserve values/file on failure. Separate upload/profile success from subsequent onboarding navigation errors. Export a thin form view with injected save/upload behavior for safe local testing; the connected wrapper retains real authentication/storage operations. **Impeccable:** harden.

### P2 — Review labels every historical invitation as pending

**Source:** `src/components/onboarding/OnboardingReviewStep.tsx:165`; `src/components/onboarding/OnboardingPage.tsx:474`.

The “Pending invitations” field maps every invitation from stable settings, without checking effective status/expiry. Accepted, declined, revoked or expired records can appear as still pending. The welcome route already uses `getEffectiveInvitationStatus` for this distinction.

**Next change:** reuse the same effective-pending policy and show an accurate empty label. Do not require successful email delivery: a copied unexpired pending link can still be useful. Test mixed statuses and a pending record whose expiry is in the past. **Impeccable:** clarify → harden.

### P2 — Invitation access lacks a page-level heading and durable failure recovery

**Source:** `src/routes/invitations/$token.tsx:27,73,100,188,207`; `src/components/dashboard/DashboardSectionHeader.tsx:47`; `src/components/layout/RouteStatusAlert.tsx:82`; `src/router.tsx`.

The found invitation begins with a default section heading (`h2`), with no page `h1`; the not-found/status title is a div from AlertTitle. The route has no own query error boundary and the router/root currently provide no custom default error component. A query exception therefore leaves the application's normal recovery presentation.

Accept/decline correctly await the mutations before success toasts and disable both controls while pending. Failures, however, exist only as toast text; acceptance asks the user to refresh without an in-panel retry/refresh action. The source has no intentional focus destination when a reactive response replaces the pending actions. Focus loss is a browser verification target, not a claim of an observed defect.

**Next change:** use the existing page/section heading APIs, add retryable query/mutation feedback, and retain focus in a surviving region after an action disappears. Keep token/email checks on the server. The backend accept contract (`convex/stableInvitations.ts:351–436`) really does activate membership before returning: the current acknowledged success wording is valid and should not be weakened without cause. **Impeccable:** harden → polish.

### P2 — Root shell has no skip-to-content mechanism

**Source:** `src/components/Header.tsx:27`; `src/components/layout/AppShell.tsx:137`; `src/routes/__root.tsx`.

The shell has semantic navigation and main landmarks, but no skip link or main target. Keyboard users must cross the repeated global controls before reaching each page's content. Correct this once at the shell owner, using the established focus treatment and a main target that receives focus without entering the normal tab sequence. Verify both real signed-out and full signed-in navigation. **Impeccable:** harden.

### P3 — Remaining onboarding information chrome is locally owned and over-grouped

**Source:** `src/components/onboarding/OnboardingLayout.tsx:65`; `StableIntroductionStep.tsx:21`; `OnboardingReviewStep.tsx:50` and ReviewSection; invitation `InvitationSummary` framed detail fields.

Optional/information messages repeat local `border-primary/20 bg-primary/5` Alert styling. The base Alert always announces `role="alert"`, including static “You can do this later” guidance. Introduction/review/invitation details also request framed fields inside larger groups, even where labels and spacing already separate the information. This is a bounded ownership/density issue, not grounds to replace all layout classes or flatten every form group.

**Next change:** use named global information/success treatments if those surfaces remain, separate static information semantics from urgent feedback, and remove only redundant inner surfaces during the rendered pass. Preserve information, headings and edit affordances. **Impeccable:** distill → polish.

## Coverage gaps requiring real previews

| Area | What source establishes | Safe next verification |
| --- | --- | --- |
| Full signed-in header | `Header.tsx:87` uses one non-wrapping row for seven active-stable links. Its development bypass displays only Home/Stables/Plans. | Render the actual full navigation with sample stable identity at 390 px and desktop, long names and larger text. Narrow overflow is a credible risk, not measured evidence in this pass. Add a pure navigation seam instead of changing authentication. |
| Clerk sign-in/sign-up | Sign-in has a centered wrapper, sign-up renders the widget directly. `integrations/clerk/provider.tsx:32` supplies no appearance mapping; no application Clerk appearance bridge was found. | Share the owned auth-page shell and map supported provider appearance to global typography/color roles. Actual widget light/dark, validation, social login and verification still require permitted provider test configuration. Do not copy the login fields or implement fake authentication. |
| Clerk pricing | The application owns the surrounding page and fallback; the provider owns its table and checkout. | Locally test disabled/unavailable states and boundary recovery. Inspect actual provider rendering separately; never issue a purchase to validate styling. |
| Profile bootstrap | `profile.tsx:40` returns null for missing profile, but AppUserStateProvider already blocks account preparation and provides sync retry. | Exercise a deliberate null-profile fixture before deciding a new status is required. Do not claim normal sign-in produces a blank page from this branch alone. |
| Invitation access | Signed-out, wrong-email, expired/revoked/declined, accepted and legacy activation branches exist; sign-in/up explicitly preserve the invitation return path. | Sample all discriminated states through the actual renderer with local callbacks. Verify pending, rejection/retry, repeated click and surviving focus. Local acceptance must say it changes sample state only. |
| Wizard | Shared controls and stepper are real; the multi-step mutation/redirect controller has no safe complete local counterpart. | Owner and member fixtures must reuse actual step forms and progression state, with local promise delay/failure. Include empty optional fields, persisted/deferred steps, review editing and completion. |

No source-visible animation/performance problem warrants a speculative optimization. Rendered contrast, motion alternatives, text scaling, native keyboard behavior and provider iframe/widget details remain unverified here.

## Proposed next safe implementation scope

1. **Onboarding correctness batch:** own OnboardingPage and the four onboarding form owners, shared-schema reuse, linked validation, phase-aware save/advance retry and review invitation filtering. Reuse the already exported pure member/invite form views. Extract thin actual-view seams; fixture adapters must never create a stable, horse, invite, upload or membership. Use the same development/auth-bypass gate as the other mutation samples. Parent registers the new fixture route.
2. **Public/account batch:** pricing return-path validation and honest boundary states; profile pure view/upload lifecycle; invitation pure state view with local async outcomes, headings and recovery. Do not change authentication policy, payments or server permissions.
3. **Shell/provider batch:** pure full-header specimen, shared skip link, common auth-page shell and documented provider appearance mapping. Test the production navigation composition, not only the development header. Provider-specific tests remain explicitly bounded by test-account/config availability.
4. Run meaningful focused regressions for the failure paths above, scoped lint and typecheck, then one batched actual-browser review on desktop/mobile with keyboard, interrupted actions and reduced motion. Finish with one bounded **Impeccable polish** pass. Do not claim a full auth/onboarding audit from static specimen screenshots.

## Preserve

Existing global control typography, colors and semantic selection/action roles are coherent. Profile already has an explicit query retry boundary. AuthStateSwitch handles Clerk loading, and AppUserStateProvider already owns bootstrap retry and onboarding/invitation redirects. Invitation acceptance waits for the real response and the server verifies token status, expiry and verified invited email. These are useful existing guarantees, not work to discard.

## Profile and pricing implementation supplement

Bounded implementation of the two profile findings and two pricing findings above. Onboarding progression, invitation access and shell/provider work are owned separately; this supplement does not claim they are complete. No live profile mutation, upload, notification, checkout or purchase was performed.

### Profile owner and acknowledgement contract

`AccountProfileForm` remains the connected owner of Convex upload/profile mutations. It delegates the actual UI to exported `AccountProfileFormView`. The view preserves existing initialValues/onSaved/submitLabel props and adds `onSave(values): Promise<void | boolean>` (void/true acknowledges profile save, false or rejection means failure) and optional `onPendingChange(boolean)`. `AccountProfileValues` is re-exported for safe adapters. The onboarding agent was given this contract before implementation and can own its progress-retry state without mounting live hooks in a sample.

The local schema validates the actual image MIME type and 5 MB maximum before invoking save/upload. The real server still authorizes storage claims and remains the ultimate enforcement owner. Fields use generated IDs and associated validation messages; the visible image control receives the registered validation-focus ref and states the image/size constraint before selection. A synchronous pending guard prevents duplicate submissions.

A failed save retains the name, phone and selected image. An acknowledged save resets the controlled file selection while keeping acknowledged text values, so a later text-only save does not upload the same image again. The subsequent onSaved callback is awaited separately. Its failure says the profile was saved, locks that acknowledged draft and exposes “Retry continuing”; retry invokes only onSaved. It never repeats the acknowledged profile save/upload. The shared FormSubmissionError reveals failure beside the retry action. This is acknowledgement separation, not a claim to make uncertain network responses idempotent.

`ProfilePageLab` is DEV plus dev-auth-bypass gated and renders the actual form with local acknowledgement/failure/continuation-failure and response-delay controls. File selection stays on the device; no upload adapter or mutation hook is used. The sample rejects late completion after unmount and does not present its placeholder avatar as an uploaded profile photo.

### Pricing owner, navigation and truthful recovery

The route validates returnTo through `pricing/invitationReturnPath.ts`, accepting only `/invitations/<ASCII token>` paths that match the application's token route. Protocol-relative, backslash, percent-encoded traversal, other paths, query/hash suffixes and non-string values are rejected. The same validator protects the pure view's native return anchor. Invitation authorization remains entirely unchanged.

`PricingPageView` owns the actual page and boundary. Billing-disabled retains the existing factual testing-access copy. Enabled-widget failure instead says plans could not load and provides a retry that remounts the injected widget; it makes no testing-access or entitlement promise. Enabled page introduction now describes reviewing plans without implying billing is disabled. A surviving named Plan options region receives focus after retry replaces its button. No prices, checkout behavior or Clerk policy were invented or altered.

`PricingPageLab` is DEV plus dev-auth-bypass gated. It exercises the real disabled state and real throwing boundary with local retry. Recovery renders an explicitly identified provider-placeholder area, never a fabricated pricing table or live purchase flow.

### Validation and exact ownership

Nine tests across four files passed: AccountProfileForm.test.tsx (3), PricingPageView.test.tsx (2), PublicAccountPageLabs.test.tsx (2), and designSystemConformance.test.ts (2). Tests establish linked errors/invalid focus, pre-save image validation, repeated-submit protection, retained rejected drafts, clearing only acknowledged files, text-only resave, continuation-only retry, safe local return validation, distinct billing states and boundary retry, surviving focus, real sample forms and no sample network/connected mutation hooks. Scoped ESLint passed. Whole-project TypeScript at freeze reported only a concurrent invitation-owner test's HTMLElement.disabled typing issue; none of this batch's files had type errors. Parent aggregate validation must establish the final whole-project result.

This batch touched 10 source/test files: existing onboarding/AccountProfileForm.tsx and routes/pricing.tsx; new onboarding/accountProfileSchema.ts and AccountProfileForm.test.tsx; new pricing/PricingPageView.tsx, invitationReturnPath.ts and PricingPageView.test.tsx; new prototypes/ProfilePageLab.tsx, PricingPageLab.tsx and PublicAccountPageLabs.test.tsx. Component inventory gains three non-test component files (PricingPageView, ProfilePageLab, PricingPageLab); helper schemas/validators are not components. Parent owns page-lab registration and the bounded browser pass. Real Clerk rendering, upload authorization, persistence, account-specific access and checkout remain explicitly unverified without controlled provider/backend evidence.
