# Reduced-motion source audit — 19 September 2026

Read-only, bounded Impeccable animate audit of the app-wide motion policy and its actual consumers. Operate mode: motion supports feedback and continuity; no new effects or focal sequence is proposed. Read the animate playbook, global CSS, shared controls, loading and completion owners, timeline, relevant forms, landing-specific CSS and Sonner's installed reduced-motion CSS. No application source edits, browser actions, builds or tests were run. This document is source evidence, not a claim of rendered motion/contrast certification.

## Main finding

`src/styles.css:472–480` applies `animation-duration: 0.01ms !important`, `animation-iteration-count: 1 !important` and `transition-duration: 0.01ms !important` to every element/pseudo-element under reduced motion. This indiscriminately suppresses short color/opacity feedback along with spatial motion, and makes app-wide behavior override individual component/third-party intent. It is a coarse safety net rather than an intentional alternative.

Do not claim this currently marks a task complete early or removes pending state: pending and completion are driven by acknowledged data/state, not animation duration. Most animation owners already have explicit reduced-motion paths. Static content, checked state, selected surfaces, busy button labels, disabled controls and acknowledged status remain. The issue is the blanket policy and a small number of uncovered owners, not a reason to rebuild interactions.

## Minimum bounded replacement

1. In the final global reduced-motion block, retain `scroll-behavior: auto !important` and remove the three blanket animation/transition declarations. Do not replace them with global `animation:none`, `transition:none`, or `transform:none`. Static transforms position dialogs, radio dots, timeline marks and geometric data symbols; removing them globally would break layout.
2. Before removing the safety net, add an explicit reduced-motion transition opt-out to the navigation-menu **positioner** at `ui/navigation-menu.tsx:115`. It animates top/left/right/bottom for 350 ms and is the concrete spatial transition owner missing its own alternative; content, popup and caret already have theirs. Normal popover position and keyboard behavior should remain unchanged.
3. Keep Spinner's existing reduced-motion static glyph; do not replace rotation with another looping effect. Add a visible `Loading…`/`Loading page…` label to `layout/RoutePending`, which currently passes no label to DashboardLoadingState. Its frozen glyph has an accessible Loading name, but sighted users lose its only changing signal. Other inspected asynchronous controls already expose visible busy wording. This single owner covers router suspense, authentication loading and onboarding loading.
4. Correct the button's reduced-motion active translation at its shared owner if this batch includes the existing no-movement intent: `ui/button.tsx:32` combines `active:translate-y-px` with `motion-reduce:transform-none`. Tailwind's independent translate property is not neutralized by `transform:none`. Make the active displacement motion-safe (or explicitly reset translate in reduced mode). Do not remove positional translations elsewhere.

This is a four-file maximum corrective batch: styles.css, ui/navigation-menu.tsx, layout/RoutePending.tsx and ui/button.tsx. No new keyframes, dependencies, color scheme or route-local patches. Existing 100–150 ms color/opacity feedback without an explicit opt-out may resume. Controls that already opt out entirely still retain immediate semantic state; removing those individual opt-outs solely to make the page more animated is unnecessary scope.

## Exact owner/consumer inventory

| Owner | Present behavior and reduced-motion path | Recommendation |
| --- | --- | --- |
| styles.css `app-control`, `app-row` | 150 ms background/border/text/shadow transitions; currently flattened by global duration override. | Preserve short non-spatial feedback when blanket removed. |
| styles.css native picker indicator | 150 ms color/opacity/transform; own reduced `transition:none`. | Keep. The small active scale remains an instantaneous state; no new effect needed. |
| styles.css `app-height-collapse` | 200 ms grid rows/opacity; own `motion-reduce:transition-none`. | Keep state-driven open/closed classes. |
| ui/button.tsx | 150 ms control feedback; explicit reduced transition opt-out; active independent translate as noted above. | Fix only active displacement intent; preserve label/disabled/busy semantics. |
| ui/checkbox.tsx, toggle.tsx, tabs.tsx, badge.tsx, switch.tsx root | Color/border/shadow transitions, plus tabs' opacity underline; checked/active state is persistent. Switch thumb explicitly stops transform interpolation in reduced mode. | Keep. Do not remove check/dot/thumb position or selection color. |
| ui/navigation-menu.tsx | Content/caret/popup explicitly reduce spatial motion; positioner top/left/right/bottom currently relies on blanket. Indicator entrance uses explicit reduced animation opt-out. | Add positioner-specific reduced path. |
| ui/autocomplete.tsx, dropdown-menu.tsx, tooltip.tsx, dialog.tsx, alert-dialog.tsx | Shared entrance/exit fade/zoom/slide classes already use reduced animation/transition opt-outs. Autocomplete caret also opts out. | Preserve these policies and popup mount/focus lifecycle. Do not assume all overlays need a new fade. |
| ui/select.tsx; forms/FileUploadField.tsx | Small affordance transforms have explicit reduced transition opt-outs. File upload drag scale changes state immediately. | Keep; drag validation/selection must not depend on motion. |
| ui/spinner.tsx | Infinite rotate normally; `motion-reduce:animate-none`; role=status, accessible Loading label by default. | Keep static reduced glyph with contextual visible busy text. |
| ui/skeleton.tsx | Pulse normally; explicit reduced animation opt-out. | Keep static placeholder; no live production `<Skeleton>` consumers found in this scan. |
| ui/attachment.tsx | Color transition; title mentions `shimmer` for uploading/processing. No owned shimmer definition found in styles.css or inspected tw-animate CSS. | Do not invent an animation or treat an unverified class as a running effect. File upload preview uses explicit control states. |
| timeline/ActivityTimeline.tsx | Canvas width, body height and duration blocks have explicit reduced transition opt-outs. Period/overview hover changes are color-only. | Keep; chart selection and duration geometry are data state. |
| analysis/StableActivityTimelineChart.tsx | requestAnimationFrame coordinates initial/selected-period scroll measurement; direct scrollLeft updates, not decorative keyframes. | Do not remove RAF merely because its name contains animation. Existing pointer cleanup is a separate verified correction. |
| forms/FormLayout.tsx FormSection | 220 ms delayed invalid-field focus; selects immediate versus smooth scroll using prefers-reduced-motion. | Already has motion alternative. Optional later improvement: no collapse wait in reduced mode, but not required for minimum policy replacement. |
| forms/FormSubmissionError.tsx; pricing/PricingPageView.tsx | Focus then instant nearest-edge scrolling. | Keep immediate recovery, no smooth motion. |
| list-filtering/ListFilterChips.tsx | 200 ms entrance/scale/slide explicitly disabled in reduced mode; shared collapse explicitly disabled. Old chips retained for 200 ms but immediately aria-hidden/disabled while closed. | No functional wait or stale enabled chip found; do not rewrite the retention timer in this batch. |
| ui/sonner.tsx + installed sonner CSS | Shared Spinner for loading; installed Sonner has its own reduced-motion transition/animation:none policy. Success/error text and icons persist independently. | Leave vendor behavior intact; global-duration deletion should not replace it with app keyframes. |

Non-spatial transition consumers also inspected: ui/table.tsx, item.tsx, breadcrumb.tsx, attachment.tsx; dashboard/DashboardInlinePanel.tsx, DashboardInlineField.tsx, DashboardItemCard.tsx; events/EventRow.tsx; ProviderAutocomplete and HorseBreedAutocomplete selected-check opacity. These do not require a spatial opt-out. EventRow and the shared dashboard record link currently explicitly suppress transitions in reduced mode; their final visual states still remain legible.

### Pending/completion consumers that must remain truthful

- `forms/FormSubmitActions.tsx`: visible submittingLabel, aria-busy, disabled submit and decorative Spinner.
- `list-layout/RecordRemoveAction.tsx`: Removing wording, aria-busy, disabled action and acknowledged removal/focus recovery.
- `reminders/CareRemindersCard.tsx`: Completing/Dismissing wording, row-local pending guards, acknowledged status badges and retained failure feedback. No success animation is used as proof of save.
- `dashboard/PendingHorseInvitationList.tsx`: approving/declining wording and independent row pending/acknowledgement.
- `documents/DocumentDownloadAction.tsx`: download busy state and failure feedback; the spinner is decorative beside action text.
- `list-filtering/ListLoadMoreFooter.tsx`: loadingLabel persists while pagination is pending; Spinner is decorative.
- `dashboard/DashboardLoadingState.tsx`: label is optional. Explicit labels are supplied by CareRemindersCard and the style-lab loading specimen. RoutePending is the inspected unlabeled production consumer.
- `ui/sonner.tsx`: loading/success/error toast glyphs accompany toast content, with vendor-owned reduced-motion behavior.

RoutePending consumers: router.tsx defaultPendingComponent; routes/index.tsx, onboarding.tsx, stables/_layout.tsx and invitations/$token.tsx; layout/AuthStateSwitch.tsx, AppUserStateProvider.tsx; onboarding/OnboardingPage.tsx; lab/LabChrome.tsx. A change at RoutePending is preferable to repeating labels across those branches.

## Landing boundary

The deliberate country landing is a separate identity. LandingAppPreview, LandingProductProof and LandingPrimitives guard entrances with motion-safe and motion-reduce classes. `landing/countryLanding.css:580` has its own scoped reduced transitions/scroll policy. `landing-lab/landingLabOverdrive.css:354` has a separate scoped 0.01 ms policy plus explicit final visual states for route drawings/gates. That lab's scroll-driven experiments merit a dedicated audit if revisited; do not silently rewrite them as part of this application-policy correction. Removing the global blanket should leave these scoped rules in force and leave the approved landing composition unchanged.

## Bounded verification after implementation

Verify once with normal and reduced motion: a delayed actual form submit/failure/retry; reminder completion before/after acknowledgement; RoutePending loading text; opening/closing dialog and navigation popup; switch/check selection; timeline scale change and pointer/keyboard navigation; a landing sanity check. Assert pending text/disabled state remains before acknowledgement and success never appears early. Inspect computed navigation-positioner movement and retained color feedback, not screenshots alone. Check shared button independent translate under reduced motion. Add focused tests only for changed semantics/loading label and preserve existing interaction regressions; do not add tests that merely mirror arbitrary class strings.

Actual Clerk widget motion remains controlled-provider evidence, not established by this source scan. No performance timing, offscreen-loop measurements or screenshots are claimed.

## Implementation supplement — 19 September 2026

The four-owner corrective batch is now implemented. The final global reduced-motion rule retains instant scrolling and no longer overrides all animation durations, iteration counts or transition durations. NavigationMenu's positioner explicitly disables its spatial transition under reduced motion. The shared Button limits active displacement to motion-safe mode instead of relying on transform:none to reset independent translate. RoutePending now passes visible “Loading page…” copy to the shared loading state. The distinct country and comparison-lab CSS were not changed.

One new semantic RoutePending test and three existing reminder specimen tests passed together (four tests). The latter retain acknowledgement, pending/duplicate/failure and interrupted local-action coverage; they do not emulate motion or prove computed CSS. Full TypeScript, scoped lint, formatting and whitespace checks passed at this source checkpoint. Logs: /tmp/paddock-motion-focused-tests.log and /tmp/paddock-motion-types.log.

Browser verification remains open: the existing tab7 still timed out on DOM inspection, and a subsequent diagnostic read also timed out and reset the browser-control session. This is the same unresolved browser availability problem as the preceding landing pass. It is not evidence that motion or landing code is broken. No new screenshots, OS reduced-motion result, computed transition/translate measurement or performance result is claimed. The earlier pending browser matrix still applies.
