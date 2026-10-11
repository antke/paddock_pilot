# Dashboard: desktop refinement and mobile task flows

Status: implemented locally on 2026-10-09 after the user's approval. Not deployed. The original direction below records the decisions from October 8; the implementation and Impeccable assessment at the end record the resulting behaviour and remaining verification. This replaces the structural recommendation in the October 5 review, not its dated accessibility evidence.

## Decision

The first jobs are inspecting and adding events and training records. Finding a horse comes next. Preserve the desktop dashboard's recognisable sections and refine their composition. Give mobile its own navigation, overview and screen transitions while sharing the product's data, permissions, record identities and visual language.

The previous recommendation over-weighted operational triage and a combined agenda. The user's task priorities are stronger evidence than the provisional product-based assumption behind that recommendation. Training and events should remain distinct, immediately accessible domains. Care concerns remain discoverable without routinely displacing those core tasks.

## Current implementation evidence

- `command-center/BarnBoardGrid.tsx` already separates training and events in the main column, with health and care on the desktop side. Horses currently follow setup, updates and the mini-calendar: a mismatch with the newly confirmed priority.
- `TodayTrainingCard.tsx` places Record completed work and Training log together in its header. `TodayBriefingCard.tsx` provides Add event but calls the section Today. `HorseRosterCard.tsx` puts Add horse and View all horses together. These can be refined without replacing the sections.
- `DashboardSectionHeader.tsx` currently accommodates multiple actions through flexible wrapping; it does not distinguish a section's principal task from navigation to more content.
- `Header.tsx` and `AppShell.tsx` use a desktop-derived destination strip on small screens. The October 5 phone inspection also found a horizontally wide week preview and overly long stacked content. Those are reasons to change mobile composition and interaction.
- The current `/` route renders `PersonalHorses`, and navigation distinguishes personal and stable contexts. Personal horse ownership and appointments work without a stable. The new mobile shell must account for that; it must not assume every signed-in user is in a yard or invent a global training route.

This revision uses current source and the earlier live observations. It does not claim a fresh visual audit of the changed signed-in root or real-device usability testing.

## Desktop: preserve, then tidy

Keep the stable context, existing typography, palette, main/supporting columns and separate training/event previews. Keep both domains visible without a tab hiding one behind the other.

Recommended main order: **Today's training → Events → Horses → updates and optional setup**. Events contains today's records and a collapsed, clearly labelled Next 7 days disclosure. Keep health/care in the supporting column; show pending responses with a concise, discoverable notice. A setup problem that actually prevents a task belongs beside that task. Mandatory invitations and failures must not be hidden among optional announcements.

Make each section follow a predictable anatomy:

1. Content title on the left; one principal local task on the right when there is one.
2. Readable records immediately below, with consistent identity/status/metadata hierarchy.
3. A descriptive route to the full collection after the preview: Training log, All events, All horses. On a large roster, keep All horses near the title instead if that materially shortens access; do not duplicate it at both ends.

Rename Today to Events, with a Today/date subheading above the default records and Next 7 days underneath. Preserve Record completed work until a shorter label has been checked against planned-versus-completed training semantics. Add event and Record completed work serve equally important entry tasks here and may both use the established filled evergreen treatment. Their ownership by separate sections makes their purpose clear. Add horse is a less frequent management action and can remain outlined.

Move Horses immediately after the combined Events section and above conditional news. Preserve useful horse identity and care cues and direct profile access. For the product's normally small yards, use a readable list and an explicit route to the complete roster; do not grow a second horse-management surface inside the dashboard.

Next 7 days is a supporting planning aid within Events. Its always-visible disclosure names the period and gives an event count; a chevron indicates expansion. Expanding shows a compact date-grouped agenda from tomorrow through seven days ahead, with explicit dates, avoiding duplication of today's records. Today remains visible. Collapse is reversible, keyboard-operable and keeps focus on its trigger. A zero count still has a truthful empty state; loading/error must not appear as zero. A separate full-calendar route stays visible. The disclosure is closed on the initial visit; a local user choice may survive ordinary rerenders, but a stable change resets it. This replaces the standalone mini-calendar, reducing a heading, surface and competing action area.

```text
Stable context / existing navigation

MAIN                                      SUPPORT
Today's training    [Record completed work] Health issues
Training records                           Care reminders
Training log →

Events                         [Add event]
Today · date / event records
▸ Next 7 days · 2 events
Full calendar →

Horses                         [Add horse]
Horse list
All horses →

Updates / optional setup
```

## Mobile: an application flow

Start with an active-stable workspace using five labelled bottom destinations: **Today, Events, Training, Horses, More**. They are persistent destinations with a clear selected state, not a horizontally scrolling desktop menu. More contains Care, stable utilities, contacts, updates and administration as permissions allow. Outstanding care or invitations also receive a compact, explicit entry on Today; they are not discoverable only through More.

Use a compact top bar with the current stable/context and access to switching context. Separate personal and stable scope visibly. Resolve the personal-workspace navigation against its actual horse and appointment routes before rolling this shell out globally; switching context must not silently widen the data scope or imply permissions.

Today is a short overview: the two frequent capture actions, compact training and event previews, then horse access. A quiet day compresses to truthful short messages while retaining both actions and horses. Busy previews expose counts and routes to the corresponding full lists. The full week calendar, setup cards and update feed do not become another long stack on this screen.

```text
Demo Yard ▾                         Account
Today · Thursday 8 October

[Record completed work]  [Add event]

Today's training                 See log ›
Horse · work type · recorded/planned status
Horse · work type · recorded/planned status

Today's events                  See events ›
Time · event · participating horses

Horses                          All horses ›
Horse row ›
Horse row ›

Care / pending responses, when present ›
───────────────────────────────────────────
Today    Events    Training    Horses    More
```

This schematic defines ownership and order, not literal spacing or a promise that every row fits above the fold. Wrap translated action labels instead of shrinking them.

The destinations should behave as a coherent mobile application:

- **Events:** agenda-first browse with date controls and a calendar alternative. Clear Add event action within thumb reach; retain full event capabilities.
- **Training:** readable log, useful date/horse filters and a labelled Record completed work action. Planning stays available and distinct from recording a result.
- **Horses:** searchable list and full-screen profiles. Details use focused subviews where necessary rather than every desktop panel expanded vertically.
- **Create/edit:** a full-screen route for substantial forms, with a clear title, cancellation/back and a reachable Save action. Short selectors can use accessible sheets. Keep draft/error behaviour, required fields and confirmation semantics.
- **Return:** restore the originating date, filters and scroll position after viewing a record or saving. Browser Back remains meaningful. Saving an event or training record gives visible feedback in its originating list.

Bottom navigation is for browsing. A form uses its own task controls in that space instead of stacking navigation, floating controls and a save bar. Account for browser chrome, the software keyboard and safe-area insets. Keep all controls available without hover or swipe-only gestures. The established fonts, evergreen actions, neutral selected states and semantic warnings remain the visual identity.

## Action policy

| Role                            | Desktop                                             | Mobile                                                         | Visual reason                                                                     |
| ------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Frequent training/event capture | Owning section header                               | Today shortcuts; owning full screen's reachable action         | Filled evergreen can be used for both; each starts an explicitly prioritised task |
| Browse all records              | Descriptive preview footer or justified header link | Bottom destination or labelled preview link                    | Navigation stays recognisable without looking like a submission                   |
| Open one record                 | Record link                                         | Large tappable row to detail                                   | Identity is the affordance; avoid repeated Open buttons                           |
| Complete/update existing work   | Beside the relevant record or in its detail         | Record detail, with a local row shortcut only when unambiguous | Context defines the operation and prevents accidental changes                     |
| Less frequent creation          | Owning section, e.g. Add horse                      | Owning destination or relevant first-use state                 | Outline/secondary emphasis reflects lower contextual priority                     |
| Save a form                     | Form's task controls                                | Reachable form controls, replacing browsing controls           | Filled commitment action; clear pending/success/error states                      |
| Optional setup and utilities    | Supporting/lower regions                            | More and contextual notices                                    | Progressive disclosure preserves access without competing with daily tasks        |

There is no numerical quota of filled buttons. Use placement to establish ownership, then weight to express contextual importance. Links remain links and operations remain buttons. Do not hide an essential action in an overflow menu merely to make a header neat. Empty states should not duplicate an action already directly beside them.

## Delivery sequence

1. **Validate a mobile journey before broad restyling.** Prototype Today → Training → record work → return, Events → add event → return, and Horses → profile. Include quiet/busy states, a permission-limited user, personal-versus-stable context and keyboard behaviour. One review and one correction pass are sufficient for the first structural decision.
2. **Refine desktop locally.** Work through `BarnBoardGrid`, `TodayTrainingCard`, `TodayBriefingCard`, `HorseRosterCard`, `DashboardSectionHeader` and `DashboardActions`. Keep the existing column concept. Fix the separately identified shared focus and clipping defects when implementation begins.
3. **Introduce a shared mobile shell and navigation contract.** Extend the responsibilities of `Header`, `AppShell`, `ApplicationRouteShell` and `StableRouteLayoutView` intentionally. Reuse route identities and permission checks; do not introduce a competing routing model.
4. **Apply common mobile browse/detail/form patterns.** Reuse event/training/horse renderers and `FormLayout`, `RouteFormCard`, `FormSubmitActions`, `UnsavedChangesGuard` and existing mutation feedback. Extract new shell/action/sheet patterns only where their behaviour repeats.
5. **Verify boundedly.** Check representative phone, intermediate and desktop layouts together, including long Polish copy, dark mode, keyboard focus, an open software keyboard, errors and permissions. Inspect one batch, fix one batch, confirm once.

Share queries, business rules, permissions, tokens and appropriate record primitives. Separate desktop/mobile composition where it materially changes the interaction. Avoid mounting two complete hidden application trees or duplicating requests. Intermediate widths should adapt to available space and input needs; a narrow desktop window must remain keyboard-usable.

## Acceptance criteria

- Desktop remains recognisably the current dashboard. Training and events can each be inspected and their creation flow entered directly; neither is hidden behind a toggle.
- Horses immediately follow Events and precede optional announcements. The week is collapsed by default within Events and never needs a hunt through a menu.
- Mobile Events, Training and Horses each take one destination tap from the active stable overview. Full data remains accessible from bounded previews.
- A user can complete both capture journeys, receive feedback and return without losing context, filters or their place in the list.
- Bottom navigation, task controls, browser UI and the keyboard never cover content or the active input. Targets are at least 44×44 CSS pixels; focus is visible and labels remain readable at narrow widths and with translated copy.
- Quiet, busy, missing-data, loading and error states preserve the core actions and distinguish unavailable data from an empty day. Existing draft protection and permission boundaries survive.
- Personal horse owners can use the product without selecting a stable. A stable switch cannot leave actionable content scoped to the previous yard.
- Existing type, palette, record semantics, accessibility and capabilities are retained. Native application conventions guide mobile interactions; this does not require a native rewrite, installation flow or offline feature project.

## First interactive prototype

The October 8 conversation now includes a combined desktop Events specimen and a small mobile prototype. Both use fictional sample records and local-only interactions; they do not call application APIs or change production code. Mobile includes Today, Events, Training, Horses and a small More menu; simplified event/training forms, draft cancellation, sample saves, detail/back navigation and horse search. This is a malleable flow study, not a complete replacement for production forms or an implementation of every capability.

In the desktop-computer preview, focusing a mobile text field shows a labelled simulated keyboard. The form's scroll area shrinks and Save remains above it; bottom browsing navigation is absent while editing. The visual check confirmed Notes inside the visible scroll area and Save outside it above the keyboard. Phone-width and quiet-day controls are available through the preview's design controls. The mock keyboard is skipped on coarse-pointer devices to avoid adding a fake keyboard beside the real one.

Verification: inspected the mobile overview and typing layout in Chrome. Local DOM integration checks passed training/event save-and-return, required-title validation, draft keep/discard, horse search/detail/back, future-event filtering, desktop disclosure and sample creation. Corrected local save dispatch for the conversation sandbox, which disallows native form submission; production form semantics are unaffected. Corrected one 4px mock-key radius to the established 6px control radius; no suppressions. Browser automation was intermittently blocked by an extension panel, so no full visual pass across all widths or real-device keyboard verification is claimed. Existing design-system metadata drift was left unchanged.

Implementation must use the actual visible viewport and preserve the active field when browser chrome or the keyboard changes the available space. An embedded preview cannot prove that behaviour: [MDN documents that an iframe's visual viewport is not distinct from its layout viewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport). Validate the future implementation on iPhone Safari and Android Chrome, including date/time pickers, numeric input, landscape, zoom, safe areas, focus after errors, draft preservation and returning to the prior list position. Native input types should remain available; see [MDN's input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input).

## Implementation and Impeccable assessment on October 9

The implementation follows the revised priority: inspect and add training or events, then find a horse. Desktop retains its typography, palette and main/supporting columns. Events now owns today's records and a collapsed Next 7 days disclosure; horses follow directly after Events. Mobile has a separate Today composition, stable navigation at the bottom, and focused event/training forms.

### Implemented behaviour

- Events shows today without an extra click. Next 7 days shows an occurrence count and opens in place. Its range is tomorrow through the seventh following day; an ongoing multi-day event stays in Today. Future multi-day entries count once, recurring occurrences retain distinct identities, and completed/cancelled events remain available in the full calendar.
- Mobile Today provides two explicit creation shortcuts, at most two training previews, two event previews and three horse shortcuts. High-severity health remains visible above the previews; care and optional updates/setup remain available below. Training previews show horse, activity, time and status, with the full record one tap away.
- Stable navigation contains Today, Events, Training log, Horses and More. Personal navigation contains My horses, Appointments, Stables and More, without requiring a stable. The workspace selector connects those contexts.
- Mobile event/training routes hide browsing navigation and keep Save/Reset reachable at the bottom. Cancel respects the existing draft guard and is disabled during a pending save. The viewport handler accounts for visual viewport height and offset, ignores pinch zoom, and scrolls a focused field above the action area. Inputs remain at least 16 CSS pixels.
- Create links capture their originating view. Successful mobile creation returns there. Date/filter state is retained in tab-local storage; existing history-based scroll restoration remains in use. Storage failures do not block interaction.
- Stable-level training creates stable records. Training from an individual horse keeps its existing personal-record context. Permissions and backend mutation contracts were not changed.

### Shared implementation patterns

`MobileNavigation`, `MobileActionBar`, `mobileTaskNavigation`, `useMobileViewport` and `useSmallScreen` own the mobile shell and task transitions. `RouteFormCard` owns form action positioning; `EventEditor` retains validation, acknowledgement, failed-save recovery and unsaved changes. `useSessionState` is extracted from the existing analysis persistence hook, which re-exports it for compatibility. Training, event calendars and list filters reuse it. `TrainingEntryLink` gains a compact summary variant for Today.

Action hierarchy is based on purpose: filled actions start the dashboard's two frequent tasks or save the current form; the roster's less frequent Add horse remains outlined; full-list destinations are links after previews; record rows navigate to records; More and workspace are buttons because they disclose a choice. Bottom navigation is selection, using the selection token and `aria-current`, rather than the creation-action colour. No numerical quota of filled buttons is imposed.

### Impeccable integrity verdict

**Pass for the implemented structure.** It expresses the two daily work domains and the horse roster using the established design system. The bundled detector returned no findings for the targeted shell, dashboard and form components; the final summary-row edit also passed the design hook. This is deterministic evidence, not a claim that every visual or accessibility condition is certified.

| Dimension                | Score     | Assessment                                                                                                                                                                                                                                                                                 |
| ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accessibility            | 3/4       | Named navigation, semantic disclosure, labelled horse selection, draft protection and focus restoration are covered. Shared button focus now uses an opaque outline. A complete screen-reader and contrast audit remains separate.                                                         |
| Performance              | 3/4       | A single dashboard composition is mounted at either width; viewport updates use animation-frame scheduling and clean up listeners. No new data subscriptions were added for the mobile shell. No device performance trace was taken.                                                       |
| Responsive design        | 3/4       | Desktop at 1440 px and mobile at 390 px were rendered with production components/styles. The form action footer remained visible at 500 px viewport height with no horizontal overflow in that observation. Real phone keyboards, 320 px and intermediate widths remain acceptance checks. |
| Theming                  | 3/4       | New UI uses existing typography, palette and semantic tokens. A fresh dark-mode visual check remains outstanding.                                                                                                                                                                          |
| Implementation integrity | 4/4       | Shared components retain product capabilities and permissions; targeted detector checks were clean.                                                                                                                                                                                        |
| **Total**                | **16/20** | **Good, with the verification limits above.**                                                                                                                                                                                                                                              |

### Ranked follow-up findings

No P0 or P1 defect was established in the completed checks. Two P2 issues remain:

1. **P2 — Context changes when a record opens.** `MobileNavigation.tsx` determines stable context from the URL. Canonical `/horses/...` and `/events/...` detail pages therefore use personal navigation even when opened from a stable. The Back affordance returns to the originating stable, but the switch can still interrupt orientation. Review a clearly labelled record-context treatment or validated origin context across these detail pages without inferring permissions from navigation. Category: interaction and structural integrity; no established WCAG failure. Suggested lens: `impeccable shape`.
2. **P2 — Mobile form headers still take substantial vertical space.** `RouteFormCard.tsx` retains the full page title/action layout and `EventFormFields.tsx` retains the existing section panels. At 390 px the long training title and Cancel occupy separate rows before the fields. The task works, but the top of the form can become more compact in a later form-specific pass. Preserve the reachable Save area and all advanced fields. Category: responsive layout; no established WCAG failure. Suggested lens: `impeccable adapt`, followed by `impeccable polish`.

The first rendered inspection also found training previews consuming too much of mobile Today; the final implementation changes them to concise summary rows. Subsequent browser control became unreliable, so the final shortening was checked in source and regression tests rather than claimed as a fully completed second visual inspection.

### Verification and release checks

- Full unit/integration suite: **905 tests across 186 files passed** with two workers. An earlier unrestricted parallel run hit worker/time-out failures; those cases passed in the bounded rerun.
- After the compact-row and form refinements, 51 relevant tests passed. A new viewport lifecycle test also passed, covering keyboard inset, focused-field scrolling, zoom exclusion and cleanup. Navigation, event-editor and draft tests cover the shared task-return behaviour.
- Type checking and production build passed. Anonymous production SSR smoke checks passed for home, sign-in, sign-up and pricing. Lint reported no errors and three pre-existing backend shadowing warnings.
- Browser review used the real dashboard components, then an isolated local harness with fictional records and the compiled production stylesheet. Authentication and backend writes were not exercised by that harness. No real records were created.
- Still required before calling the mobile experience fully verified: iOS Safari and Android Chrome keyboards, landscape, larger text, 320 px and intermediate widths, dark mode, and one authenticated create/save/return flow for each applicable permission role. Keyboard simulation and reduced desktop viewport height do not establish real-device behaviour.

Keep this first implementation malleable. Use the follow-up lenses for the two concrete issues above, then run `impeccable audit` after fixes. They can be addressed individually or together; another general cosmetic redesign is not warranted by the evidence.
