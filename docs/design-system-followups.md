# Design System Follow-Ups

This note captures the work intentionally deferred after the large warm-stable design-system migration. The current priority is to stabilize the production UI and keep the new style consistent, not keep expanding the cleanup indefinitely.

## Current Decision

Proceed with:

- Core UI primitive styling and token changes.
- Shared dashboard primitives that make cards, sections, headers, actions, badges, forms, filters, and detail blocks consistent.
- Production page migrations for horses, reminders, events, stables, documents, dashboard, forms, and list filtering.
- The style lab/guideline page as the implementation reference.

Frozen for now:

- Further page-lab/prototype-only refactors.
- Promotion of the large interactive analysis timeline chart into production; the production horse timeline now uses the shared chronological rail.
- New primitive expansion unless it is required to stabilize an already-touched production component.

Resolved during stabilization:

- Dashboard-lab module/prototype deletion is accepted because dashboard lab, page lab, and production dashboard now import the promoted `dashboard/command-center` implementation.
- `.pnpm-store/` is ignored and should not be committed.
- `public/design-moodboards/` is kept because the style guideline page references the generated field-office hero image.
- `.content-collections/generated/index.js` timestamp-only churn was removed.
- Light-mode sidebar theme tokens now use the warm stable palette instead of the old neutral/cyan defaults.
- Shared list/card/filter/form/table/menu primitives were tightened after the style-lab pass so common rows, filters, and controls render as solid warm card/elevated surfaces instead of translucent `bg-card/*`, `bg-muted/*`, or `bg-background/*` washes.

## Composition Modernization

The follow-up composition pass addresses the remaining box-heavy feeling without changing the established palette or workflows:

- `cards`, `soft`, `lines`, `open`, and `bare` now have distinct geometry and hierarchy instead of collapsing into the same framed panel treatment.
- `DashboardItemCard` variants expose semantic accent rails for primary, warning, danger, and muted records.
- `DashboardEntityHero` gives stable, horse, and event identity screens a shared editorial header composition.
- The style lab includes a surface-hierarchy specimen combining an open page, metric rail, ruled work list, framed attention module, chronological rail, progress, table, date markers, and planning timeline.
- Stable, horse, event, reminder, document, provider, member, and invitation lists use domain-appropriate line, media, agenda, or status-ledger treatments.
- Horse history uses a connected chronological rail with semantic markers instead of a stack of generic panels.
- Dense analysis keeps cards for true modules, progress for coverage, tables for comparison, and a soft reminder ledger for operational load.

Verification for this pass:

- Full ESLint passes.
- Four test files pass with 14 tests.
- Production client, SSR, and Nitro builds pass; only the existing third-party directive and chunk-size warnings remain.
- Hydrated desktop audit passes for 13 public, fixture, style-lab, and form routes with warm tokens, no runtime errors, and no document-level overflow.
- Mobile audit passes at 390px for 10 representative routes, including the command center, surface hierarchy, horse and event views, reminders, documents, analysis, and create form.

## Deferred Follow-Up Work

### 1. Page-Lab And Prototype Drift

The page-lab prototypes still contain repeated local recipes such as:

- `DashboardItemCard chrome="soft" className="grid gap-2"`
- `DashboardItemCard chrome="soft" className="grid gap-3"`
- Local grid recipes in analysis prototypes.

Potential next step:

- Add a small shared row/layout helper or scoped `DashboardItemCard` / `DashboardItemLinkCard` props to replace those local class strings, but only in a small, bounded pass.

### 2. Analysis And Timeline Visualization Helpers

The analysis prototypes and activity timeline still use local visual code for:

- Timeline signal dots.
- Legend markers.
- Chart blocks.
- Dynamic inline styles for calculated positions, colors, widths, and heights.

Some inline styles are legitimate because they represent chart math. Do not remove those blindly.

Potential next step:

- Extract only repeated marker/dot/legend styling into small helpers.
- Leave dynamic chart geometry in the visualization components.

### 3. Dashboard-Lab Cleanup Decision

Several old `dashboard-lab` modules/prototypes are deleted in the current migration:

- `src/components/dashboard-lab/modules/*`
- `src/components/dashboard-lab/prototypes/*`

Decision:

- Keep the deletion. `src/components/dashboard-lab/DashboardLabPage.tsx`, production dashboard, and page-lab dashboard specimens now import `src/components/dashboard/command-center/StableCommandCenter`.
- The review route remains useful, but it points at the promoted implementation instead of owning duplicate modules.

### 4. Untracked Assets And Generated Files

Decision:

- `.pnpm-store/` should not be committed and is now ignored.
- `public/design-moodboards/stable-field-office-hero.png` should be committed with the guideline page because `StableDesignGuidelines` references it.
- `.content-collections/generated/index.js` should not be included for timestamp-only churn.

### 5. Visual Verification Pass

Before treating the migration as complete, visually inspect the main production screens:

- Stable dashboard.
- Horse list.
- Horse detail sections.
- Care reminders list and detail cards.
- Events list, calendar, and event detail.
- Documents pages.
- Stable settings and providers.
- Create/edit forms.
- Signed-out and invitation flows.

The acceptance bar is not pixel perfection. The bar is that all visible production surfaces feel like the same warm, modern stable product and no page visibly falls back to the older dark/plastic/corporate style.

Current verification:

- Style guideline page renders with the warm background and complete component inventory. Current computed light tokens include `--background: #e4d5be`, `--foreground: #15110d`, and `--sidebar-primary: #203f2d`.
- Public landing page renders with the warm design language and the same warm token set.
- Invitation page shell renders with the warm design language and signed-out invitation prompt.
- Pricing page renders a styled fallback when Clerk billing is disabled locally. Set `VITE_CLERK_BILLING_ENABLED=true` to render Clerk's billing table where billing is configured.
- Signed-out protected stable routes render the shared warm `SignedOutRoutePrompt` instead of a redirect loop or blank shell.
- Dashboard lab now imports the promoted command-center implementation.
- A static production-surface sweep for old dark/corporate utility residue found only acceptable shared primitive, print, overlay, and motion classes after the sidebar token cleanup.
- Authenticated component specimens can be visually checked without loading a Google account into the local browser by adding `?devAuthBypass=true` to the lab URLs. This dev-only path uses local fixture data in `src/components/dashboard-lab/dashboardLabFixtures.ts`, renders the authenticated lab branches, and labels the header as `Dev fixture`.
- Fixture-backed visual verification has passed for `/dashboard-lab/1?devAuthBypass=true` and the ready page-lab specimens: stable dashboard, stables list, horse list, horse detail, event list, event detail, reminders, documents, and analysis. All rendered with `--background: #e4d5be`, `--primary: #203f2d`, and no Clerk/Convex auth error.
- Final browser audit passed on desktop for the dashboard lab and all ready page-lab specimens. Each route rendered the `Dev fixture` header state, warm tokens, representative page content, and no auth/runtime error text.
- Mobile browser audit passed at 390px for the densest fixture pages: stable dashboard, horse detail, reminders, documents, and analysis. Analysis keeps its wide timeline inside an internal horizontal scroll area while the page shell prevents document-level horizontal scrolling.
- True live production data wiring still requires a real Clerk session because Convex correctly rejects unauthenticated live queries. Local design QA no longer requires loading a Google account into the in-app browser: localhost dev bypass renders fixture-backed shared surfaces for `/`, `/stables`, lab routes, and create/review routes.
- Follow-up primitive contrast audit passed for fixture stable dashboard, reminders, and event list. Representative `DashboardItemCard` rows now compute to solid `rgb(255, 246, 230)` over the warm `rgb(228, 213, 190)` page background, with no Clerk sign-in screen on bypassed lab URLs.
- Focused ESLint passes for the latest shared primitive pass: dashboard card/chrome, list filters, field/toggle/table/button/badge/item/navigation/toast/dialog primitives, timeline chrome, and analysis lab row cleanup.
- Follow-up wrapper audit removed remaining `bg-card/*`, `bg-background/*`, `bg-muted*`, and old muted hover/focus recipes from TSX component surfaces. Event date badges, horse avatars, route alerts, dropdown menu items, progress tracks, skeletons, and app-shell utility chrome now use solid shared tokens or primary accent states.
- Slot-level browser audit passed for `/page-lab/event-detail?devAuthBypass=true` and `/page-lab/analysis?devAuthBypass=true`: event date badges and horse avatars computed to solid `rgb(255, 246, 230)`, progress tracks computed to warm secondary material, and neither route rendered the sign-in screen.
- Calendar and small selection-control primitives were aligned after the wrapper pass. `EventCalendarChrome` no longer uses translucent muted/card fills for weekday rows, muted day cells, muted pills, or soft week-day buttons. `TabsTrigger`, `Switch`, `Checkbox`, and `RadioGroupItem` now use shared surface tokens instead of raw input/background fills.
- Static production-feature scans now show no feature-folder card-like hand-rolled surfaces outside shared owners, and a cross-component scan for `bg-card/*`, `bg-background/*`, `bg-muted*`, old muted hover/focus states, and raw `bg-input` states returns clean.
- Style lab now includes a rendered primitive-control specimen for tabs, checkbox, switch, radio group, and progress. Browser audit on `/style-lab?devAuthBypass=true` found the specimen, no sign-in/error state, and rendered counts for all those slots. Computed styles confirmed the controls use solid warm surfaces or primary checked states over the warm page background.
- Solid-material cleanup passed for the latest shared primitives and wrappers. Focused scans across `src/components` and `src/routes` now return clean for `bg-card/*`, `bg-background/*`, `bg-muted*`, raw `bg-input`, old muted hover/focus states, and alpha on base material tokens such as `bg-surface-*`, `bg-secondary`, `bg-card`, `bg-background`, `bg-muted`, and `bg-input`. Focused ESLint passes for `button`, `badge`, `table`, `progress`, `dashboardChrome`, `ActivityTimeline`, and `EventCalendarChrome`.
- Follow-up ownership scan found no raw `<div>` card surfaces and no raw native button/anchor controls in production feature folders (`analysis`, `documents`, `events`, `horses`, `reminders`, `stables`, `forms`, list filtering/layout, and routes). Remaining class-owner hits are shared wrappers such as `ListFilterBar`, `ListFilterPanel`, `FormLayout`, `RecordDialog`, `HorseAvatar`, `DocumentPreview`, and `EventDateBadge`. Spot checks confirm these delegate to shared primitives (`DashboardSectionCard`, `DashboardItemRecordCard`, `DashboardInlinePanel`, `Badge`, `Button`, `Field`, `Input`, `Select`, `Checkbox`, and `TabsContent`) or define domain wrappers that are intentionally reusable.
- Browser audit after the date-badge cleanup confirmed all three `EventDateBadge` style-lab variants, including `rail`, compute to solid `rgb(255, 246, 230)` with the shared border token instead of transparent/square rail styling.
- All page-lab fixture routes now pass a compact ownership browser audit with `?devAuthBypass=true`: stable dashboard, stables list, horse list, horse detail, event list, event detail, reminders, documents, analysis, settings placeholder, and forms placeholder. Each route renders the dev fixture state, no sign-in/error text, no document-level horizontal overflow, no card-like surfaces without a shared/domain slot, and no transparent visible box slots. Shared ownership slots now cover dashboard item cards, inline panels, empty states, filter bars and panels, button links, metrics, detail blocks, mini-calendar selected-day panels, and timeline primitives.
- Shared CSS utilities were tightened after the route audit: `app-control` disabled state, `app-panel-strong`, `app-row-hover`, and `app-segmented` no longer use old muted/card opacity recipes. Cross-file scans covering `src/styles.css`, `src/components`, and `src/routes` return clean for old `bg-card/*`, `bg-background/*`, `bg-muted`, raw `bg-input`, muted disabled/hover states, and alpha on base material tokens.
- Static production route ownership sweep passed after the slot cleanup. Route-local class usage is limited to simple pricing content layout grids inside `DashboardSectionCard`; route files otherwise compose shared page, section, form, status, auth, and button primitives instead of defining card/control chrome locally.
- Public and signed-out browser audit now passes for `/`, `/pricing`, `/stables`, `/invitations/not-a-real-token`, and `/sign-in`. Each route renders warm tokens, no app runtime error, no document-level horizontal overflow, and no app-owned card-like surface without a shared slot. The app shell header utility cluster and `DashboardSection` now expose shared slots so public landing and signed-out chrome are auditable alongside authenticated dashboard fixtures. Clerk-owned sign-in internals remain external UI, wrapped in the warm app shell.
- Header and hero ownership has been tightened after the latest fixture pass. `LabPageHeader`, `DashboardPageHeader`, and `DashboardHeroSection` now expose shared `data-slot` owners, covering lab controls, active stable hero panels, horse detail headers, and analysis hero panels.
- Latest fixture ownership audit passes for all page-lab screens with `?devAuthBypass=true`: stable dashboard, stables list, horse list, horse detail, event list, event detail, reminders, documents, analysis, settings, and forms. Each route rendered warm tokens (`--background: #e4d5be`, `--card: #fff6e6`, `--primary: #203f2d`, `--surface-elevated: #fff6e6`), no sign-in/error state, no document-level horizontal overflow, and zero card-like visible surfaces without a shared/domain slot.
- Latest dashboard-lab audit passes for `/dashboard-lab/1?devAuthBypass=true` with the same warm tokens, no sign-in/error state, no document-level horizontal overflow, and zero card-like visible surfaces without a shared/domain slot.
- Form, dialog, section-card, subsection, and table wrapper ownership has been tightened. `InlineForm`, `FormTabsContent`, selectable card form helpers, `RouteFormCard`, `FormSubmitActions`, `FileUploadField`, record-dialog wrappers, `DashboardSectionCard`, `DashboardSubsection`, and `DashboardTablePanel` now expose shared `data-slot` owners so production create/edit flows can be audited as shared surfaces instead of local chrome.
- `/stables/create?devAuthBypass=true` now passes a targeted production-form audit: warm tokens, no sign-in/error state, no document-level horizontal overflow, route form card and section card slots present, form tab content present, shared field/input/textarea/tab slots present, submit button wrapper present, and zero card-like visible surfaces without a shared/domain slot. Horse/event create routes still need real stable IDs/live auth for data-wiring QA and are not used as design fixture proof.
- Shared transient/state primitives now expose ownership slots: `DashboardLoadingState`, `RoutePending`, `ActionGroup`, `Spinner`, `Progress`, `ScrollableList`, `ChoiceButtonGroup`, and `Toaster`. Browser checks confirm the slots render on `/style-lab?devAuthBypass=true`, `/page-lab/analysis?devAuthBypass=true`, and `/page-lab/stable-dashboard?devAuthBypass=true` with warm tokens, no sign-in/error state, and no document-level horizontal overflow.
- Overlay and feedback primitives have been tightened after the latest style-lab pass. `DropdownMenu`, `Tooltip`, and `NavigationMenu` now expose portal/positioner/popup ownership slots where applicable, and the style-lab dropdown specimen now wraps its label/items in `DropdownMenuGroup` so Base UI menu context is valid. Browser verification on `/style-lab?devAuthBypass=true` confirms the dropdown opens without the previous `MenuGroupRootContext` runtime error and computes to the warm popover surface (`rgb(255, 246, 230)`) with shared border/radius treatment. The record-create dialog specimen opens through `CreateRecordDialog`/`RecordDialogContent` with the warm shared shell and form action slots.
- Calendar ownership has been tightened for both the full events calendar and dashboard mini-calendar. `CalendarShell`, weekday rows/cells, day cells, day headers/numbers, event lists, event chips, chip title/meta, muted pills, popover parts, mini-calendar week grids, day columns/buttons/labels/numbers/meta, day panels, and selected-day panels now expose calendar-specific `data-slot` owners. Browser verification on `/style-lab?devAuthBypass=true` and `/dashboard-lab/1?devAuthBypass=true` confirms the slots render with warm tokens, no error boundary, no document-level horizontal overflow, and visible calendar shells/chips/panels computing to the warm card/elevated surfaces.
- Shared material tokens and wrapper utilities have been consolidated again after the latest local-dev pass. Light-mode `--card` is now brighter (`#fff9ed`) while `--surface-elevated` is a distinct nested-row material (`#f6ead4`), so cards, filter panels, inline panels, item cards, date badges, field panels, horse avatars, and calendar shells no longer collapse into the same flat fill. `dashboardChrome`, `ListFilterPanel`, `FieldPanel`, `EventDateBadge`, `EventCalendarChrome`, `HorseAvatar`, and `DashboardItemCard` now delegate repeated row/panel styling to `app-panel` or `app-row`. Focused lint passes for the touched shared files, and the old-surface scan for `rounded-panel border border-border-subtle bg-card`, `rounded-row border border-border-subtle bg-surface-elevated`, `bg-card/*`, `bg-background/*`, `bg-muted*`, raw `bg-input`, muted disabled/hover states, and larger shadow utilities returns clean. Browser verification on `/style-lab#care-specimen`, `/dashboard-lab/1`, and `/stables/create` confirms warm tokens (`--background: #e4d5be`, `--card: #fff9ed`, `--surface: #f1dfc3`, `--surface-elevated: #f6ead4`), no sign-in/error state, no document-level horizontal overflow, and representative slots computing to the expected card/row/shell materials. The local DEV auth bypass now applies automatically on localhost so design QA no longer requires loading a Google account into the in-app browser.
- Calendar wrapper cleanup continued after the broad route audit. `calendarEventChipClassName`, `calendarMutedPillClassName`, `calendarWeekDayPanelClassName`, and `calendarWeekDayButtonClassName` now delegate material/radius/border ownership to `app-row` while preserving calendar-specific slots and selected/today accent states. `ListFilterBar` also dropped its redundant explicit `bg-card` override because `app-panel` owns that material.
- The localhost dev bypass no longer breaks live-query routes. `/` now renders the fixture-backed `StableCommandCenter` inside `DashboardPage` when bypassed, and `/stables` renders the fixture-backed stables list specimen instead of calling live Convex queries without Clerk auth. Production/live auth behavior is unchanged because those branches only run when `isDevAuthBypassEnabled()` is true.
- Broad desktop browser audit passes for 19 routes without the auth query string: `/`, `/pricing`, `/stables`, `/invitations/not-a-real-token`, `/sign-in`, `/style-lab`, `/dashboard-lab/1`, all page-lab fixtures (`stable-dashboard`, `stables-list`, `horse-list`, `horse-detail`, `event-list`, `event-detail`, `reminders`, `documents`, `analysis`, `settings`, `forms`), and `/stables/create`. Each route rendered warm tokens (`--background: #e4d5be`, `--card: #fff9ed`, `--surface: #f1dfc3`, `--surface-elevated: #f6ead4`, `--primary: #203f2d`), no app error boundary, no document-level horizontal overflow, and zero app-owned card-like surfaces without a shared/domain `data-slot`. Clerk sign-in internals remain external UI on `/sign-in`.
- Final completion audit passes. Static scans across `src/styles.css`, `src/components`, and `src/routes` return clean for old material residue (`bg-card/*`, `bg-background/*`, `bg-muted*`, raw `bg-input`, muted disabled/hover states, large shadow utilities, and old literal panel/row recipes). Production feature folders have no raw native button/anchor controls or feature-owned card chrome outside layout-only wrappers and documented shared/domain wrappers. Full `pnpm lint` passes. Full `pnpm test` passes with 14 tests across list filtering, document filters, horse detail filters, and care reminder filters. Desktop browser audit passes for the 19-route public/fixture/design-QA surface, and mobile 390px audit passes for `/`, `/style-lab#care-specimen`, stable dashboard, horse detail, reminders, documents, analysis, and `/stables/create`.

## Stabilization Checklist

- Stop broad exploratory refactors.
- Finish or leave any already-added primitive props in a lint-clean state.
- Run focused lint on touched primitives and production routes.
- Run the production build.
- Do a visual pass in the browser.
- Dashboard-lab deletion and untracked asset decisions are resolved above.

## Current Handoff Status

Completed locally:

- The migration scope has been narrowed to stabilization instead of continued exploration.
- The production build passes.
- Generated timestamp-only churn in `.content-collections/generated/index.js` has been cleaned back out after build verification.
- Public/signed-out visual surfaces checked so far render in the warm stable design language.
- The pricing route now has a design-system fallback when Clerk billing is not enabled locally.
- Focused ESLint passes for the touched pricing and protected stable layout routes.
- Production build passes after the warm sidebar token cleanup.
- A dev-only visual auth bypass and local fixture data now allow authenticated lab/specimen review without signing into Google in the local browser.
- Focused ESLint passes for the bypass and fixture lab files.
- Production build passes after the fixture bypass change. Expected warnings remain Vite chunk-size warnings and Base UI `"use client"` directive warnings.
- Production build passes after the latest shared header/hero slot cleanup. Expected warnings remain Vite chunk-size warnings and Base UI `"use client"` directive warnings.
- Production build passes after the form/dialog/section-card/table ownership slot cleanup. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack `"use client"` directive warnings.
- Production build passes after the transient/state primitive ownership slot cleanup. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack/Sonner `"use client"` directive warnings.
- Production build passes after the overlay/menu specimen cleanup and portal ownership slots. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack/Sonner `"use client"` directive warnings.
- Production build passes after the full-calendar and mini-calendar ownership slot cleanup. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack/Sonner `"use client"` directive warnings.
- Production build passes after the latest shared material token and wrapper utility consolidation. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack/Sonner `"use client"` directive warnings.
- Production build passes after the latest route fixture and calendar wrapper cleanup. Expected warnings remain Vite chunk-size warnings and Base UI/TanStack/Sonner `"use client"` directive warnings.
- Final desktop and mobile fixture visual audits pass. The only remaining live-auth work is optional data-wiring QA, not required for design-system stabilization.

Completion audit result:

- Complete for the design-system migration goal. Every audited visible card, button, filter, calendar/timeline item, form control, table row, dialog/menu/tooltip shell, badge, empty/loading/error state, page shell, and dashboard surface now comes from shared primitive owners or an explicitly reusable domain wrapper.
- Live signed-in QA remains useful only for validating real data wiring with Clerk/Convex, not for proving the design-system migration.
