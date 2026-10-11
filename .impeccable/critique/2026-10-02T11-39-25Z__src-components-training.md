---
target: "Mobile-first workflow audit: navigation, Home, training, care and contacts"
total_score: 24
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
timestamp: 2026-10-02T11-39-25Z
slug: src-components-training
---
Method: dual-agent (A: /root/mobile_design_review · B: /root/mobile_evidence_review)

# Mobile workflow audit — 2 October 2026

The app is responsive, but several important workflows still follow desktop page order. The biggest opportunity is to put today's work and recording actions ahead of navigation, reference information, filters and optional fields. Preserve the warm stable-journal identity and existing phone agendas.

Scope: authenticated localhost app, 390 × 844 Chrome viewport; Home, Training list/create/detail/record editor, Care queue, horse profile/care, Calendar; Stable contacts DOM and source. This was narrow desktop viewport testing, not a physical touch device. The demo contains 23 horses, above the intended fewer-than-ten-horse yard. Long horse selectors are therefore stress evidence; header size and training-form field order do not depend on herd size. No records were saved or application code changed. Keyboard, Polish rendering, ordinary-member session and actual interrupted-draft recovery still require focused validation.

## Design specificity and cognitive load

Warm paper surfaces, pine accents, serif headings and yard vocabulary feel authored for this product. The visual identity is coherent. The weakness is prioritization: shared components stack correctly but preserve desktop information order.

Cognitive-load failures: competing focus, hierarchy, progressive disclosure and too many simultaneous choices. Training shows six main destinations, period navigation, scope/horse chips, six activity labels and three filter fields before records. These counts are prompts for judgment, not arbitrary rules to cap all groups at four. Grouping, labels and readable language work well.

The emotional valley is the transition from a simple intent—record today's ride—to a long planning/reference page. A compact, clearly attributed completion with an obvious return to today's work should be the endpoint.

## Heuristic assessment

Scores are provisional design judgments, not usability-test results.

| Heuristic | Score / 4 | Main evidence |
|---|---:|---|
| Visibility of system status | 3 | Explicit active routes and training states; mutation feedback source-reviewed |
| Match to real-world tasks | 3 | Good yard language; phone order less natural |
| User control and freedom | 2 | Create guard works; inline recording protection differs |
| Consistency | 3 | Coherent components; save placement differs across workflows |
| Error prevention | 2 | Existing safeguards; record intent and interruption need attention |
| Recognition rather than recall | 3 | Labeled routes and records; nested horse navigation adds discovery cost |
| Flexibility and efficiency | 1 | Header, filters and optional fields delay common actions |
| Aesthetic and minimalist design | 2 | Calm appearance, excessive low-frequency structure before work |
| Error recovery | 3 | Failed-save draft retention and retry in source; not mutation-tested |
| Help and documentation | 2 | Useful field hints and setup guidance; task help dispersed |
| Total | 24 / 40 | Acceptable foundation; substantial phone workflow improvements needed |

## Priority issues

### P1 — Compact the shared phone shell

Observed sticky header: 205px at 390 × 844, roughly 24% of the viewport. Brand, stable/account/language/theme utilities and wrapping navigation consume four rows. The sticky header remains while working with forms.

Source: src/components/layout/AppShell.tsx:135, :177, :190, :236; src/components/Header.tsx.

Plan: compact stable/context bar, move low-frequency utilities into account/menu, and prototype a deliberate phone navigation layout. Keep Training and Calendar adjacent and directly reachable. Compare a compact header/menu with a labeled bottom bar; do not prematurely hide Horses behind More or squeeze six labels into undersized targets. Preserve active-state labels, skip link and existing sticky-header focus clearance.

### P1 — Give Home a phone-specific task order

Measured heading positions: Health issues y=410, Care reminders y=783, Today y=1237, Today's training y=1419. Training is present but still far down the phone page. The dataset has unusually many alerts, so these absolute positions are stress evidence; the ordering is fixed in source.

Source: src/components/dashboard/command-center/BarnBoardGrid.tsx:31–41.

Plan: immediately actionable urgent items first in a compact summary, followed by today's training and appointments, due care, future schedule and roster. Keep emergency access prominent. Do not hide critical care to promote training; bound the expanded warning inventory so it does not displace all daily coordination.

### P1 — Put the training agenda before optional controls

Measured first agenda date y=1394. Search/work/status occupy y=606–838 before horse chips and the full activity legend. Twenty-three horse chips exaggerate the height, but the three fixed filters already use the first screen. Add session itself remains visible around y=530.

Source: src/components/training/TrainingCalendar.tsx:202–323, :338–356.

Plan: compact period/date selector, current scope and Add/log action, then agenda. Reuse Care's existing collapsible Filters pattern with active-filter count and clear action. Move individual horse selection, work type and status behind it. Remove the always-visible legend because entries already label activities. Phone Week/Month both use agenda rendering; communicate period scope honestly. Provide a compact day selector if planning empty days is important. Preserve blank unallocated horse cells rather than restoring repeated “No training recorded” copy.

### P1 — Separate planning from recording completed work

Observed create form: first section is 1522px tall; date is y=1589 and collapsed Horses begins y=1921. Title, activities, format, rider, exercises and next focus precede horse/date review. These measurements do not depend on horse count. Sticky Create is a strength.

The recording editor repeats the training planning fields, defaults an unrecorded scheduled session to Scheduled, and places Save only after the fields. Opening a generic record editor is not necessarily a completion action; make that intent explicit rather than silently changing semantics.

Source: src/components/forms/event/EventFormFields.tsx:664, :732, :786, :885; src/components/training/TrainingRecordCard.tsx:140, :217, :241; src/components/training/TrainingFormFields.tsx.

Plan: planning starts with horse/date/work; put optional logistics and detailed notes behind disclosure. An explicit “Record completed work” flow inherits the plan and asks for actual duration and outcome, with change-details, skipped and cancelled alternatives. Use reachable save actions and shared dirty-state protection. Preserve per-horse accountability and recurrence-date context. TrainingRecordCard lacks the guard used by EventEditor; actual draft loss was not tested and should not be reported as observed.

### P2 — Compact horse working pages and prioritize care/contact actions

Observed horse care has about 580px of shell, breadcrumb, identity, Edit horse and section navigation before nested care navigation. Routine contacts precede reminders. Care already prioritizes Complete, but Remove appears beside it while Edit and Complete + next due are in overflow.

Source: src/components/horses/HorseDetail.tsx:95–172; HorseCareSection.tsx:70–134; src/components/reminders/CareRemindersCard.tsx:375–470; src/components/stables/StableProviderCard.tsx:36–48; StableProvidersCard.tsx:193–215.

Plan: compact horse identity on working subpages, show the current work first, preserve urgent instructions, and make provider rows easy to call while retaining readable numbers. Move Remove to administrative overflow; assess whether Complete + next due belongs alongside Complete. Preserve the stable Contacts destination and emergency shortcut established in earlier work.

## Smaller findings to validate

- Both independent reviewers encountered “Leave without saving” after inspecting an untouched new-training form. Reproduce and fix initialization/dirty-state handling if confirmed; do not remove the guard.
- Training duration/rider/focus fields lack the explicit aria-invalid and linked error IDs used by adjacent event title/date fields. Unify this wiring and verify invalid-duration focus/recovery; no invalid form was submitted in this audit.
- Mobile collapsed FormSection summaries are hidden, obscuring selected-horse context. Keep a short selection summary visible.
- Phone status is sometimes icon-only with fuller content in a hover tooltip. Review essential status/detail recognition on touch before changing it; full detail remains reachable.

## Preserve

1. Training and Calendar already use readable phone agendas instead of squeezing the desktop matrices. No horizontal overflow was measured on Home, Training, creation or Care.
2. Warm visual identity, text alongside activity colors, labeled navigation, large linked records, and honest empty states.
3. Care's outstanding default, filter disclosure, assignee visibility and direct completion. Creation's sticky submit, accordions, reset confirmation and navigation guard. Native telephone links.

Do not report all buttons as too small: viewport testing used pointer:fine. Shared button variants have 44px coarse-pointer overrides; a visual chip-removal glyph also has an expanded hit area. These require real touch validation, not blanket fixes.

## Persona risks

- Member after riding: excessive scrolling and re-entering plan context can discourage daily logging.
- Owner checking the yard: persistent alert inventories make every visit feel unresolved while obscuring today's coordination.
- Occasional helper: nested horse/care navigation and prominent administrative actions add learning cost to routine contribution.

## Proposed implementation plan

1. Prototype compact phone shell and Home hierarchy together. Keep Training beside Calendar and compare horse access cost before choosing navigation.
2. Simplify Training's control area and introduce focused planning/recording flows, sharing save and draft safeguards. Address error semantics and the untouched-form guard in this wave.
3. Compact horse/care/contact working screens; finish touch, focus, safe-area and long-label checks.

Acceptance: at 360/390/430 widths and on a real coarse-pointer phone, show meaningful daily work or a purposeful empty state early; make intended horse/date and Add/log action immediately clear; record a normal outcome without optional planning fields; preserve repeat-session and multi-horse behavior; complete due care and call the correct provider without unrelated scrolling. Exercise EN/PL, owner/member permissions, empty and 3–8-horse yards plus the 23-horse stress fixture, invalid input, failed saves, keyboard opening and interrupted drafts. No blanket redesign or new feature layer is needed.

## Detector synthesis

One source scan covered 130 files in bounded UI directories. It returned one advisory, design-system-font-size at AppShell.test.tsx:176: an intentional 20px root font size for a sticky-header test. Excluded as a test-only false positive; zero actionable detector findings. The command wrapper failed to capture the detector exit code because zsh reserves status, but the full detector JSON was produced. The scan does not measure task order; the useful findings came from independent live inspection and source tracing. No overlay was injected because browser evaluation is read-only.

## Decisions for the next pass

- Phone training default: Today by horse, or the current weekly agenda?
- Quick-add priority: Record completed work, Plan a session, or equally prominent choices?
