# Shared style ownership audit — 18 September 2026

## Scope and evidence

Read-only source review initially covered `src/components`, `src/routes`, `src/styles.css`, `DESIGN.md`, the separate landing design record, and `designSystemConformance.test.ts`. The parent subsequently authorized the four narrow shared corrections listed below. No route or feature layout was redesigned by this pass.

The source inventory contained 352 files under components/routes at inspection time. Searches covered literal colors, arbitrary typography/color utilities, font families, uppercase/tracking, inline styles, semantic token definitions, and shared component `className` consumers. Candidate matches were read in context; a class-name match alone is not a defect.

Impeccable's `audit` and `craft-floor` playbooks were used. The bundled detector was run once over `src/components src/routes`; its 46 results were all in the scoped landing styles (36 production landing, 10 country-study lab; 4 warnings and 42 advisory findings). The complete detector result is `/tmp/paddock-shared-style-detector.json`. These are **not evidence of application-system drift**: the production landing has an explicit Fraunces Country/Manrope design record, separate palette, scale and control geometry in `docs/design/landing/DESIGN.md`. Preserve that difference. The historical landing studies still require their own family review; this pass does not certify their behavior or accessibility.

## Verdict

Shared ownership is substantially established. There is no evidence for a blanket removal of `className` props or a wholesale replacement of feature markup. App route files have only shell/layout alignment classes; the dominant typography, controls, fields, records and surfaces already come from canonical components or semantic tokens. The measurable remaining problems are a few missing token/legacy typography definitions and some domain-owned style escapes that should be consolidated only when that family is inspected.

No whole-app audit score is asserted: this pass did not render all consumers, measure contrast, inspect responsive states, or profile performance. Theming and implementation integrity were assessed from source; keyboard, responsive, rendered dark-theme and backend claims remain outside this pass.

## Corrected at the shared owner

| Finding | Severity / impact | Correction | Exact consuming components and verification scope |
| --- | --- | --- | --- |
| Onboarding uses `bg-success`, `border-success`, and `text-success`, but the theme did not define `success`. | P2, theming: intended completion styling silently disappears because Tailwind cannot generate those semantic utilities. Text/check state still communicated completion. | `src/styles.css` now exposes `--color-success: var(--primary)`, so the role inherits the existing light/dark evergreen pair. No new hue or local patch. | `OnboardingStepper` completed row and marker; `OnboardingReviewStep` confirmation alert. Consumed by `OnboardingLayout`/`OnboardingPage` at `/onboarding`, plus the stepper specimen in `/style-lab`. Verify completed/current/deferred/upcoming together in both themes, including revisiting a completed step. |
| Breadcrumb list forces uppercase and letter spacing on every label, including horse/event names. | P2, typography: an old shared recipe overrides approved sentence-case labels and expands already long paths. | Removed `uppercase`; changed tracking to normal in `ui/breadcrumb.tsx`. | `layout/StableBreadcrumbs` is mounted by `routes/stables/_layout/$stableId.tsx`, so all descendant stable/horse/event/settings/etc. pages consume it. `page-lab/prototypes/EventDetailPageLab.tsx` also directly consumes it. Verify short and long paths at desktop/mobile; preview verification alone does not certify authenticated route navigation. |
| `FormStepHeader` forces uppercase even though the surrounding form sections use sentence case. | P3, typography consistency; no functional regression identified. | Removed the uppercase transform in `forms/FormLayout.tsx`; kept size, weight, numbering, grouping and labels. | `forms/event/EventFormFields.tsx` uses it for the treatment-plan and horse-specific-details substeps; production `/stables/$stableId/events/create`, `/stables/$stableId/events/$eventId/edit`, `/page-lab/forms`; `/style-lab` also renders a specimen. Inspect both conditional substeps, not only the first visible form screen. Other FormLayout exports are unchanged. |
| Provider initials use `font-mono` although ordinary identity text belongs to Alegreya Sans. | P3, typography consistency: introduces the technical face for human initials. | Changed the initials in `forms/event/ProviderAutocomplete.tsx` to `font-sans`. | The saved-provider suggestions in `EventFormFields`, on the same create/edit/forms routes. Open saved provider suggestions to verify; the closed field does not show the changed element. No global avatar was invented for one consumer. |

### Checks for these corrections

- Scoped ESLint passed for breadcrumb, FormLayout and ProviderAutocomplete.
- `tsc --noEmit` passed.
- Existing conformance and onboarding-stepper tests passed: 5 tests across 2 files.
- No new tests were added for pure typography substitutions. Existing tests do not prove rendered CSS or keyboard focus quality.
- Runtime CSS retrieval from `127.0.0.1:9090` failed to connect in this agent environment; no runtime-token or screenshot claim is made here. The parent is verifying the changed shared owners in the events/style-lab family passes.

## Remaining actionable ownership issues

### P2 — Onboarding still requests an undefined radius token

`OnboardingStepper.tsx:34` uses `rounded-card`. There is no `--radius-card` in the theme and no other definition in `src`. The intended outer rounding is absent. Replace that request at the owner with the existing `rounded-panel` role if the onboarding review confirms a contained stepper is still intended. Do not add a duplicate radius token solely to retain a stale class name.

Consumers are the stepper in `OnboardingLayout`/`OnboardingPage` and the `/style-lab` specimen. Verify narrow vertical and wide horizontal orientation, especially the clipping of corner cell backgrounds.

### P2 investigation — Stepper focus needs a rendered keyboard check

`OnboardingStepper.tsx:55-63` uses an interactive button with `className="contents disabled:pointer-events-none"`; there is no local `focus-visible` treatment and the global base rule only sets an outline color. A `display: contents` control has no own box on which to draw the normal outline. This source pattern is a credible focus gap, but it was not browser-confirmed in this agent pass. During onboarding review, tab to a completed/deferred navigable step. If there is no visible focus indicator, make the real button own the row geometry and the shared focus treatment; do not patch a route-level parent.

The existing 3 stepper tests cover labels/current-step/disabled behavior, not visible keyboard focus.

### P3 — Information alert presentation is duplicated instead of named

`OnboardingLayout.tsx:67` (`OnboardingLaterNote`) and `StableIntroductionStep.tsx:21` both pass `border-primary/20 bg-primary/5` into `Alert`. `OnboardingReviewStep.tsx:50` separately requests completion styling. These are legitimate message groups, but their styling should be expressed through shared `Alert` variants if their presentation is retained. `ui/alert.tsx` currently supports only `default` and `destructive`; the feature calls therefore become the owner of semantic feedback chrome.

Suggested bounded change during onboarding review: add the required info/success variants to `Alert` using the existing semantic tokens, migrate these three call sites, and keep the separate `RouteStatusAlert` wrapper for route width/actions. Confirm that informational content uses an appropriate announcement role; the base component currently sets `role="alert"` on all messages, including static optional-step guidance.

Exact downstream callers of `OnboardingLaterNote`: `FirstHorseStep`, `StableOperationsStep`, `InviteTeamStep`, and `OnboardingPage`. `StableIntroductionStep` and `OnboardingReviewStep` are also rendered by `OnboardingPage`.

### P3 — Compact-calendar surfaces are partly redefined at their consumer

`dashboard/command-center/MiniCalendarCard.tsx` repeatedly supplies `bg-card` to selected-day panels, column panels, event rows and empty states (around lines 160, 174, 199, 230, 242, 283, 293). `events/EventCalendarChrome.ts` already owns the named recipes for these elements, and the style-lab rule explicitly assigns day/selected-panel styling to that owner. These classes are token-based, so this is an ownership issue rather than a wrong-color claim.

**Subsequently resolved, 19 September:** the seven paper decisions now belong to `calendarWeekPaperClassName` and the existing panel recipes in EventCalendarChrome. Current production callers use flat/selectable mode; dormant inline/cards/soft behavior is preserved rather than redesigned. See the [calendar source follow-up](calendar-source-2026-09-19.md#weekly-calendar-paper-ownership--bounded-follow-up) for exact consumer reachability, checks and remaining rendered limits.

When the dashboard/calendar family is rendered, decide which regions truly need paper fill. Put the repeated surface decision in the named calendar recipe or a named calendar variant; leave local responsive placement (`lg:col-span-7`, hidden/visible panel positioning) in the composition. Do not globally give every `DashboardEmptyState` or `EventRow` a paper background.

Consumer chain: `MiniCalendarCard` → `BarnBoardGrid` → command-center dashboard variants, the stable dashboard and related dashboard/page labs. Inspect selected/unselected/today, empty/populated, and cards/soft/flat modes where supported. This is not a justification to flatten all calendars blindly.

## Intentional or insufficiently evidenced overrides — preserve for now

- `DashboardNavigation` applies the section navigation typography to its lower-level navigation primitives. It is the shared domain owner, so these are valid shared variants, not route patches.
- `EventCalendarChrome` owns calendar cell/chip dimensions, seven-column geometry, mobile strip layout and selected-day styling. Small calendar type is a density decision to verify in the calendar family, not proof of arbitrary feature typography.
- `AnalysisCentre` and `AnalysisHorseTab` use inline CSS values for chart signal positions/colors derived from token-backed models. Specialized chart geometry should remain domain-owned. The `chrome="soft"` analysis groups are explicit choices; evaluate nesting from rendered data before changing them.
- `ActivityTimeline` uses absolute positioning and local type for spatial timeline marks; its uppercase item at line 162 is a time-axis label, not a display heading. Review legibility in the timeline family.
- `HorseCareSection` wraps care contacts with `chrome="soft"`, `tone="reference"`, `className="rounded-row border"`. This is a deliberate contained reference group, but it should eventually use a canonical contained reference variant if the same pattern repeats. One use alone does not justify a new abstraction or forced removal.
- `DocumentsCard` explicitly chooses contained media rows and strengthens their boundary with `border-border`. Document thumbnails, unavailable states, downloads and filenames are a valid specialized grouping; do not remove the boundary solely because flat is the default elsewhere. A semantic border-strength prop would only be justified if this need recurs.
- `DashboardInlinePanel` still defaults to soft. This is accurately documented in DESIGN.md; changing its default would affect many established consumers. Set chrome explicitly in new compositions and assess existing call sites in their family.
- `PrintSummary` uses black print text/borders, an intentional output-mode exception.
- Technical token/reference specimens in the style lab use mono intentionally.
- Landing and historical landing studies have separate visual authority. The detector's app-palette comparisons are not permission to restyle them.

## Guardrail gap

`designSystemConformance.test.ts` tests raw control ownership and low-level surface imports. It does **not** test undefined theme utilities, forbid local font/color recipes on shared primitives, or prove all consumers migrated. Its current green result is meaningful within those two boundaries only.

A useful next guardrail is a small explicit list of semantic token names/classes that the project owns and validates, plus targeted ownership checks for the specific duplicated recipes removed during this audit. Avoid a broad regex banning all `className` use: layout, responsive placement, accessible wrapping, geometry and scoped landing styles need legitimate escape hatches.

## Next sequence

1. During onboarding: verify focus, fix the undefined radius at its owner, and consolidate the retained alert roles.
2. During dashboard/calendar: review the repeated paper surfaces and move only the repeated domain-owned decisions to calendar recipes.
3. Verify the corrected breadcrumb/form/provider consumers in their family pages; include dark, narrow and conditional states.
4. Finish each bounded family pass with Impeccable polish. Do not infer every page is correct from this source-level report or from conformance tests alone.

## Stepper follow-up

The undefined radius and focus investigation above were addressed in the shared stepper owner later in this audit. See `onboarding-stepper-2026-09-18.md` for the corrected implementation, native Tab/Space/Enter evidence, screenshot and remaining consumer verification. The original findings above record what was observed before the follow-up.
