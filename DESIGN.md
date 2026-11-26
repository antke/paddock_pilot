---
name: Paddock Pilot — Stable journal
description: A warm, readable app system for everyday stable coordination.
colors:
  off-white: '#eeece8'
  ink: '#30372f'
  paper: '#fcfbf8'
  evergreen: '#285b43'
  selection: '#30372f'
  selection-ink: '#f8fbf9'
  pale-stone: '#e4e6dc'
  burgundy: '#962f43'
  destructive-ink: '#fff8f9'
  secondary: '#e4e6dc'
  muted-ink: '#52594f'
  divider: '#bec8c2'
  input-border: '#7d8b83'
  surface: 'color-mix(in srgb, #fcfbf8 70%, #eeece8)'
  surface-muted: '#eeece8'
  quiet-green: '#306c53'
  quiet-green-ink: '#f7fbf8'
  quiet-green-muted-ink: '#dfede4'
  warning: '#87571f'
  warning-surface: '#f1e2c8'
  information: '#2f5a7a'
  information-surface: '#e2ecf4'
  night-canvas: '#1b1817'
  night-paper: '#2f2c2b'
  night-raised: '#393635'
  night-row: '#353231'
  night-sidebar: '#201e1c'
  night-ink: '#f2ece3'
  night-muted-ink: '#c9c3ba'
  night-primary: '#7fd1aa'
  night-action: '#1d7352'
  night-action-ink: '#f2fbf6'
  night-primary-ink: '#0f2a1e'
  night-selection: '#e8e0d3'
  night-selection-surface: '#494543'
  night-divider: '#66625f'
  night-input-border: '#9c9795'
  night-destructive: '#f2a8b7'
  night-destructive-ink: '#321c22'
  night-warning: '#f4d2a2'
  night-warning-surface: '#57442c'
  night-information: '#b0c9e0'
  night-information-surface: '#293b4b'
  night-quiet-green: '#173c30'
  night-quiet-green-ink: '#f0f6f2'
  night-quiet-green-muted-ink: '#c3e4d3'
  night-quiet-green-border: '#4f9677'
typography:
  display:
    fontFamily: 'Alegreya, Georgia, serif'
    fontSize: '2.25rem'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.015em'
  headline:
    fontFamily: 'Alegreya, Georgia, serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Alegreya, Georgia, serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'Alegreya Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.5
  record-body:
    fontFamily: 'Alegreya Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 400
    lineHeight: '24px'
  control:
    fontFamily: 'Alegreya Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 500
  action:
    fontFamily: 'Alegreya Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 600
  label:
    fontFamily: 'Alegreya Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    letterSpacing: 'normal'
  wordmark:
    fontFamily: 'Alegreya, Georgia, Times New Roman, serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.25
  mono:
    fontFamily: 'Geist Mono Variable, monospace'
    fontSize: '0.875rem'
rounded:
  control: '6px'
  row: '8px'
  panel: '12px'
spacing:
  tight: '8px'
  compact: '12px'
  standard: '16px'
  roomy: '20px'
  comfortable: '24px'
  loose: '32px'
components:
  button-primary:
    backgroundColor: '{colors.evergreen}'
    textColor: '{colors.paper}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
  button-outline:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.ink}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '8px 16px'
  input:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '0 12px'
    height: '40px'
  badge-warning:
    backgroundColor: '{colors.warning-surface}'
    textColor: '{colors.warning}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '2px 10px'
  selected-control:
    backgroundColor: '{colors.pale-stone}'
    textColor: '{colors.selection}'
    rounded: '{rounded.control}'
  record-row:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.row}'
    padding: '14px 12px'
  panel:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.panel}'
    padding: '20px'
---

# Design System: Paddock Pilot — Stable journal

## Overview

**Creative North Star: "Stable journal"**

A warm, readable working journal for stable plans, horse records and everyday care. Alegreya headings and Alegreya Sans body text give the app its character. A soft stone canvas, paper working sections and gently alternating rows keep real records easy to scan. Evergreen actions, pale stone selection and burgundy destructive states have distinct jobs.

This is the canonical shared **application** system, grounded in [src/styles.css](src/styles.css), [dashboard primitives](src/components/dashboard), [UI primitives](src/components/ui) and the [design lab](src/components/design/StableDesignGuidelines.tsx). The public landing has its own [scoped design record](docs/design/landing/DESIGN.md).

The shared foundation is implemented. Some specialized components and route-local overrides still need review by page family; this document does not certify every app screen as fully migrated. The lab demonstrates sample day selection and local care completion with undo. Confirmed care completion now uses the shared journal-check sequence; cross-route horse photo morphing remains an intentional exception.

**Key Characteristics:**

- Sentence-case serif headings and readable sans-serif records.
- Soft paper sections on a soft stone canvas, with open record rows separated by space.
- Distinct action, selection and destructive colors in both themes.
- Useful interaction feedback without decorative headings, patterns or imagery.

## Colors

Pine & paper is the approved app palette: warm stone, soft paper and a rich pine accent. The frontmatter records the implemented light palette and key dark counterparts. CSS semantic variables remain the implementation source, including additional status, chart and sidebar roles.

- **Evergreen** (`--primary`) identifies primary actions and focus. Primary text uses `--primary-foreground`.
- **Deep neutral ink** (`--selection`) and **pale stone** (`--selection-surface`) identify selected controls, navigation and rows. Solid selection fills use `--selection-foreground`; pale stone fills use deep neutral ink or the normal readable foreground according to the primitive. The chosen option in a selector (segmented views, choice chips, toggles, pill tabs) is a solid `--selection` fill in both themes, because pale stone alone is too close to the surrounding surface to read as selected. In dark mode `--selection` is ivory (`#e8e0d3`), the brightest fill on screen apart from text, so a selected chip reads as chosen by brightness rather than hue while staying neutral, never pine. The same ivory draws the dark focus ring, and the selected navigation row uses a slightly warmer stone (`--sidebar-accent`) than picker rows. Selectable rows (horse and people pickers) are open, borderless rows: a hover band when unselected, and pale stone plus a checked tick box at the row end when selected, with no outline; multi-select rows show a tick, and every selected choice chip, single or multi select, shows the same bold leading tick (`ToggleGroupItemMark`); the tick hangs just before the label, at the same small gap on narrow and wide chips, in room reserved by start padding mirrored at the end, so the label stays centred and selecting never resizes a chip or reflows its row; the tick draws in like the journal check, and a chip with a dot swaps the dot for it in the same slot. Choice chips in one group share one width: compact groups (`ChoiceButtonGroup`) form equal columns sized to the longest label that fill the container and wrap, and segmented controls size every option to the longest label.
- **Burgundy** (`--destructive`) identifies destructive actions and errors. It is separate from selection.
- **Off-white**, **paper**, **surface** and **surface-muted** provide the canvas, contained content, quiet regions and grouped controls. The application main canvas uses surface-muted; working sections use paper.
- **Ink** and **muted ink** provide reading hierarchy; dividers use `--border` or its subtle mixed counterpart. Inputs use `--input` for a clearer boundary.
- **Quiet green** retains its own inverse foreground pair. Warning and information badges use their dedicated foreground/surface tokens rather than arbitrary chart colors.

**Ivory & emerald** is the approved dark palette (selected 16 November 2026, replacing Charcoal & pine). Surfaces are Ash: warm grey at near-zero chroma leaning red-brown, because a yellow tint reads olive beside green and a neutral grey reads blue and technical. The canvas sits a clear step below the working panels (1.27:1) and raised controls. Warmth lives in light elements rather than surfaces: cream text, ivory selection and focus. Emerald identifies actions; a dusty mid-pine fill read as military and is not used. Pink destructive feedback, amber warnings and blue information states remain distinct.

Dark mode maps the same roles through `.dark`; use semantic utilities rather than copying light hex values into components. Text selection uses the selection surface, the caret uses primary, and the scrollbar is tinted from primary and the neutral border. The dark-mode lab retains alternate studies; `src/styles.css` owns the adopted application tokens.

**The Separate States Rule.** Evergreen means action, pale stone with deep neutral ink means selection, and burgundy means destructive feedback. Keep these roles distinct when adding a new control.

## Typography

**Headings and wordmark:** Alegreya, with Georgia/serif fallbacks. **Body and controls:** Alegreya Sans, with system sans-serif fallbacks. **Technical references:** Geist Mono Variable.

The self-hosted [Alegreya](public/fonts/alegreya/README.md) WOFF2 files expose weights 600 and 700 from shared variable assets. [Alegreya Sans](public/fonts/alegreya-sans/README.md) supplies 400, 500 and 700. Both include Latin and Latin-ext subsets with CSS unicode ranges and `font-display: swap`. The asset READMEs record Google Fonts acquisition on 2026-09-18 and credit Juan Pablo del Peral / Huerta Tipográfica; each directory includes its SIL Open Font License. Preserve these files and attribution.

- **Hero:** 36px, increasing to 48px at 640px.
- **Page:** 30px, increasing to 36px at 640px.
- **Section:** 24px, increasing to 30px at 640px.
- **Panel:** 24px.
- All four shared display roles use Alegreya 600, 1.15 line height, balanced sentence case and −0.015em tracking. The wordmark uses 24px/1.25 at 600.
- **Nested headings:** Alegreya Sans 18px semibold, snug line height, ink colour. A page's panels (`DashboardSectionCard` titles) use the serif panel title; groups inside one panel (`DashboardSubsection`, `DetailReferenceGroup`, horse profile groups) use the nested heading, never the display face. A panel's first heading is always its serif panel title (a `DashboardSectionCard` title, or `DetailReferenceGroup titleStyle="panel"` for the group that opens a panel); when a panel opens with ungrouped facts they sit directly under that title (event detail: “Overview”; horse profile: “Horse details”; horse care: “Care contacts”, with “Emergency notes” nested), and the panel title row carries the first group's pencil.
- **Body scale:** `text-xs` is 14px, `text-sm` is 15px and `text-base` is 17px. Record descriptions commonly use 15px/24px. Prominent copy commonly uses 17px/28px.
- Body weights are 400, 500 and 700. Existing sans `font-semibold` utilities request 600 and resolve to the loaded 700 face. The action token records that existing utility request; it does not imply a separate 600 font file.
- Labels, tabs and actions use sentence case and normal tracking. Mono is for code, identifiers and token references; ordinary dates and step numbers use tabular numerals in Alegreya Sans, never monospace.

**The Shared Type Rule.** Use `DashboardDisplayHeading`, section/page headers, `DashboardInlineHeader`, `TextLabel` and record/detail primitives before adding local heading recipes.

## Layout

The full-height shell retains header, main and footer. `.page-wrap` caps content at 90rem with at least 1rem gutters. Shared layout helpers provide equal, split, sidebar and command-center grids; use their responsive behavior and named gap props rather than repeating route-local grids. Common stack gaps are 16px, a token-controlled 20px, and 32px. Grid layouts collapse before text is made smaller.

`DashboardSection` defaults to `chrome="soft"`: one paper surface per working group. `DashboardSectionCard` defaults to `surface="panel"` and uses the same inset, gap and surface tokens. Keep page/entity headers open on the canvas.

**The Canvas List Rule.** When a page's main content is one list owned by the page title (Horses, Care reminders, Documents, My care contacts, Deleted horses), the list sits directly on the canvas through `DashboardSectionCard surface="canvas"`: no section card around search, filters and rows. Search, Filters and any view toggle share one toolbar row (`ListFilterBar toolbarEnd`) under the title and wrap on phones. Rows keep the record inset, so their text aligns with the page title, and use a paper hover band. When a tabbed view is a page's main content (horse Care, Nutrition, Activity), `DashboardTabbedCard surface="canvas"` puts the tab row, its Add and the list on the canvas; no per-tab description restates the tab. Dashboards and pages with several working groups keep their section cards. The Stables list is a grid of stable tiles instead (`StableGatewayCard` in `DashboardLayoutGrid variant="tiles"`: one column on phones, two from 768px, three from 1280px), because each stable is a destination rather than a record: the serif stable name is the tile's title and opens the overview from anywhere on the tile, the location sits under it, and Horses, Care and “…” are outlined buttons at the tile's foot, so they never drift away from the name on wide screens.
 Use `chrome="flat"` / `surface="flat"` for subgroups already inside a section, without additional borders or inset. Detail facts stay open inside their owning section.

The tuning controls live together in `src/styles.css`: `--app-canvas`, `--app-section-surface`, `--app-section-border`, `--app-section-inset`, `--app-section-gap`, `--app-section-content-gap`, and the `--app-record-*` tokens. Section inset and gap are 20px on desktop and 16px below 640px; content gap is 16px. The default section boundary is surface contrast, with a transparent border slot that can be tuned centrally. Do not duplicate these recipes in route CSS.

The stable dashboard uses two independent stacks, so each card keeps its content height and gaps stay equal. From 1280px the attention stack leads on the left: Health issues, Care reminders (three-item previews) and Horses. The main stack holds pending horse invitations, Today with Next 7 days, and Today's training with its Add training session action. Narrower screens use one column: health, care, invitations, Today, Today's training, Horses. On phones, the Events section keeps the “Today · date” heading and the collapsed Next 7 days row, as on desktop. On phones, health issues and care reminders are matching inline disclosures above the day's work; each opens to its top items, and care shows up to three reminders with their due line, then All reminders. Week and agenda training entries set the horse name bold and the session title in medium weight, with times muted. Dashboard training rows are the same flat row at every width: time and status icon, then horse dot and “Horse · title”. **The Quick Completion Rule.** Every training entry the viewer may record, today or earlier, carries the 44px completion check at its top right on Home, in week and list views and in the month's day agenda, beside the link and never inside it. A session with several horses carries one check that completes every horse the viewer may record: all of them for a stable owner or an editor of every horse, only their own horse for an owner sharing the session. Month cells carry no check, because the cell is too small; hovering any entry, month cells included, opens the shared calendar preview: session details, one row per horse with its own check (or its status when the viewer cannot record it), and a whole-session check labelled “Complete” (“Zakończono”) when the viewer may record every horse, its box in the same column as the horses' boxes. Training detail pages, personal and stable, carry the same labelled check at the top right of the Overview panel, a fact about the session rather than a header action beside Edit and “…” (the stable training page, whose details sit in a disclosure, keeps it beside the byline under its title), for one horse or many, labelled “Complete” (“Zakończono”) either way: the box shows the state and the accessible name names the horses, so the label never grows with the session. There is no second session button further down; each horse's own check stays on its record card. A training record card has one header row (the horse's name; its status, or the check that shows it, then the pencil), its facts, and one footer under a hairline in body-size muted text: “Created by … · Last recorded …”, then who can see the record. Ordinary events follow the same rule: a manager ticks off a started, single (non-recurring), uncancelled event with the labelled Complete check in the same place, at the top right of Overview, and it replaces Change status in the header actions, since Cancel lives in the “…” menu. Series, future and cancelled events keep Change status. Reminders, health issues and medication records have no detail page; their Complete and Resolve actions stay on their rows. Touch screens have no hover preview: a month chip opens the record, and tapping the date opens the day agenda, whose entries carry the checks. Phones and narrow tablets (a calendar under 56rem) show only dates and horse dots, so the agenda is where completion happens there. A tall attention list must not stretch the space between sections in the main column. The stable Home header holds only the title and, when the stable has one, Call emergency contact (outlined); on phones it is a full-width row under the title. Contacts are reached from the stable's Yard and contacts page and the phone Go to menu, never from the header. The header adds no padding of its own, the stable overview shows no breadcrumb trail (it would only restate the title), and the first panels follow the title at the section gap. A Health issues card with one or two horses hugs its content. Pending horse invitations lead the main column, never as a full-width band; their decisions sit beside the invitation on desktop and split the row on phones.

Signed-in navigation uses a 14.5rem desktop sidebar from 1024px. Its toggle narrows it to a 4.25rem icon rail and widens it again, and the choice persists; the sidebar never disappears at desktop width. The toggle slides the sidebar and the page between widths together with an ease-in-out disclosure transition, and the new contents fade in. The full menu keeps its width while it slides, so labels are revealed, not rewrapped. Restoring the saved choice on load never animates, and reduced motion switches widths instantly. The rail shows the toggle, then Home, Events, Training, Horses and My care contacts as icons named by tooltips on hover and focus, then the compact account controls; stables are reached by widening it. The brand leads; Home, Events, Training, Horses and My care contacts follow as one uncaptioned list, then the captioned Stables group; account controls stay at the bottom. The menu has one shape on every page, inside a stable or not, and has no stable picker. Home, Events, Training log and Horses keep the same ordering and workspace meaning. The active item is revealed within the independently scrolling navigation area. Narrower screens use a branded header and a left-side drawer. Phones retain labeled bottom navigation; More opens the same drawer as Menu. Keep the header compact; inside a stable it shows the stable's name. Language and appearance live together in account Preferences, with the existing saving/retry behavior. All navigation targets are at least 44px tall. Public navigation retains its separate header.

Preserve the useful order of identity, description, metadata and actions. Row actions wrap on narrow screens; persistent entity navigation belongs below identity and keeps a readable single-line overflow treatment. Shared component options own density, width, span, alignment and action placement. Specialized calendar/timeline geometry remains in its domain owner. `DetailGrid mobileColumns={2}` supports short paired facts on phones; longer identifiers and prose retain one column.

`DetailReference` is the opt-in pattern for grouped reference data inside one paper section. `DetailReferenceGroup` aligns a compact heading column with a bounded fact area on desktop and stacks the heading above the facts below 1024px. 32px group spacing and the nested heading separate categories; groups never draw rules between them. Values read at one size (17px) in both layouts. `DetailReferenceList` and `DetailReferenceField` provide semantic definition lists with quiet labels, readable values, paired short facts and full-width prose. Identifiers and care lists stack on phones; long values wrap without truncation. Keep notes expanded and distinguish missing values from explicitly recorded absence. Domain components own grouping and translations; adopt this pattern deliberately rather than changing existing detail consumers globally.

Horse Care keeps configured vet and farrier contacts in a shared reference panel titled “Care contacts” above Care reminders and Health issues, with emergency notes as a nested group inside it. Phone links include a phone icon and a 44px touch target. Every displayed phone value is a `ContactLink`; its touch target is an overlay, so the value keeps its neighbours' baseline. On phones, care contact labels sit above name and phone, which share one row. **The Reminder Row Rule.** A reminder row has the same shape as a horse row: a leading date tile (`EventDateBadge`), a one-line title and a one-line muted meta line, then one compact outlined “…” button at the row end (the vertical dots of a detail page's phone header, at 32px with a 44px invisible touch target: `Button size="icon-row"`), centred on the two lines at every width. There is no completion check: a check beside a one-line row read as out of place. The tile carries urgency instead of badges or warning text: destructive when overdue, warning (amber) when high priority, muted once closed; the same states are visually hidden text beside the title. The title truncates with an ellipsis and the meta line reads only category and horse (“Vet · Juniper”; the horse only outside a single-horse context), plus the state (Done, Dismissed) of a closed row. Everything else opens from the title (a `DisclosureTitleButton` laid over it, with the trailing caret), never a separate Details link: the full title, a line with the due date, priority and responsible person, then notes, completion attribution, follow-up and who can see the record; the opened details sit below the row, so the tile and menu never move. The menu holds every action: Complete (or Reopen on a closed row) first, then Complete & repeat, Edit, Dismiss and Remove last; for reminder rows this replaces the Pencil Rule's footer pencil. An assignee who may only complete sees a menu with just Complete or Reopen. The row reports a failed action inline and locks its menu while one is saving. Read-only rows have no empty action area. Reminder lists put To do / Done / All in a quiet text toggle (`CareReminderStatusToggle`) under the search row; status is never a Filters facet, so the default view shows no active-filter chip or count.

**The Section Ownership Rule.** Give each working group one soft section, except the single page-owned list (see the Canvas List Rule). Put open facts and open rows inside it. Add a distinct record boundary only for expanded details, editing, or a genuinely independent task. Never stack routine panel frames inside one another.

## Elevation & Depth

Control, surface and panel shadow tokens are `none`. Hierarchy comes from surface contrast, spacing, type, selection fills and restrained record bands. Overlays use their shared stacking, border and backdrop treatments. Do not add ambient shadows to ordinary sections or records.

Working-app motion uses Motion for React through `AppMotionProvider`: bounded list layout/presence, measured disclosures, continuous segmented tracks and local status feedback. Individually bordered choices fill in place; compact choices and segmented controls match regular button heights. Buttons keep stationary hit targets with interior press response. CSS owns simple control states and Base UI overlay transitions; native router View Transitions own navigation and persistent chrome. Do not animate the same node/property with two systems.

Routine timing is 120–220ms with 140ms exits; dialog entrances use a six-pixel settle and slight scale, while form action contents transition through pending, confirmed and retry states without moving the button; confirmed care gets a 320ms drawn journal check and a modest ring only for the confirmed final outstanding item. Server results remain authoritative, including undo and retry. Initial data and background synchronization never earn completion celebrations. Reduced motion removes spatial travel and height tweening while retaining clear state feedback. See the [motion contract](src/components/motion/README.md) and [coverage/verification ledger](docs/design/motion/interaction-coverage.md) for conventions, intentional exceptions and evidence boundaries.

## Shapes

Controls use 6px corners, record hover/bands use 8px and sections use 12px. Ordinary rows have no border rails or bottom rules. **The Action Height Rule.** Controls that share a line share a height: buttons, selects, toggles, links styled as buttons and any status pill in that row (`Badge size="action"`, matching the sm button: 32px on desktop, 44px on phones). When an action turns into a status (Withdraw → Withdrawn, Resolve → Resolved, Complete → Completed), the status takes the action's place in the same row, at the same height, and keeps at least the action's width (`reserveLabel`), so the row never shrinks or jumps. Status pills that are not in an action row keep the small badge size (24px). **The Alike Size Rule.** Elements of one kind that share a line share a size, at rest and after interaction: picker rows in one grid line stretch to the tallest (the label is a grid cell so its row fills it); a badge beside a compact title overhangs it rather than making that row taller; controls set their height with `min-h` and padding that fits inside it, so content never adds stray pixels; a disclosure header keeps one height open or closed, because a closed section's summary trails its title on the same line, truncated, instead of adding a line. Check with `.browser-checks/alike-dimensions.mjs`, which clicks and hovers every choice and disclosure. **The Structure Rule.** A border stays when it shows structure the eye has to follow: calendar and table grids, form sections (each its own card, so its fields read as one group), hairlines between reference groups on a profile or detail page, and standalone objects such as the date and time tiles beside an event. A border goes when it only repeats what spacing already says: a box around a page's single list, a card inside a card, a rule under every list row. Detailed horse rows show the name bold, the owner in body colour, then breed, discipline, age, sex, height and shoeing as one muted dot-separated line, with visually hidden labels. The onboarding stepper is unboxed: markers (check, number, clock) with step names, the current step filled and semibold; status words exist only for screen readers. Expanded details can have a one-pixel neutral outline. Count badges, switches and compact icon controls retain functional circular geometry; do not turn ordinary layout containers into pills.

## Components

### Actions and selection

`Button` default and solid variants both use evergreen with paper text. Their default minimum height is 40px, increasing to 44px for coarse pointers. Outline and secondary variants use neutral surfaces; ghost and subtle controls stay quiet until interaction. Destructive controls use a burgundy tint and burgundy text. Disabled controls retain geometry and reduce opacity; keyboard focus uses a primary border and a 3px ring at 25% opacity.

Use the shared `action="create"`, `action="edit"` and `action="delete"` props for semantic action icons. Ordinary navigation and submit actions do not acquire an icon just because of their wording. Keep decorative icons out of headings.

Tabs, toggles, calendar selection, timeline period selection and selected record rows consume the deep neutral ink tokens. Use the native/shared selected state and accessible attributes rather than a color-only local approximation. Persistent navigation should expose the current destination; choice controls should expose their pressed or selected state.

Use `DashboardTabbedCard` for nested views in a single working section (Events, horse Activity, Care and Nutrition). Its `TabsList variant="line"` uses 17px bold labels, 48px targets and a 3px neutral-ink active underline on one shared divider. Keep labels on one horizontally scrollable row. Actions sit alongside the tabs when the card has room and move below them in narrow containers; use the card's width rather than the viewport to make that decision. Keep the content description inside the active panel and avoid repeating its selected tab as a heading. Keyboard focus is an inset primary ring, distinct from the active underline.

### Page and section actions

Every working view follows the same three placement rules. Use the shared primitives; do not hand-place these controls in feature files.

**The Back Rule.** Every view below a global navigation destination has a Back control at the top left, above the title. Pages never place it by hand. `src/components/layout/pageHierarchy.ts` maps every route to its parent, to `false` for global destinations (Home, Events, Training, Horses, Stables and standalone flows), or to `'none'` for layouts, redirects and files. A stable's overview and its own pages (Horses, Events, Training, Care, the stable view, Analysis, Settings) prefer history: Back returns to the page the person came from, and only when there is none does it link up (the pages to the overview, the overview to All stables), so Back never bounces between the overview and a page opened from it. The map is exhaustive over the generated route tree, so a new route that does not declare its Back is a type error. `PageBack` reads the deepest matched route; `DashboardPageHeader`, `DashboardEntityHero` and `RouteFormCard` render it in the shared `PageBackSlot` by default. Detail and form routes reached from several lists use `preferHistory`. Forms pass their guarded close as `onClick`. Pass `backAction={null}` only to suppress Back; `PageBack target` is reserved for parents that depend on loaded data (personal training on the shared event route). A page without a standard header renders `<PageBackSlot><PageBack /></PageBackSlot>`.

**The Entity Header Rule.** Horse and event detail use `DashboardEntityHero`: Back, identity (photo or date block, title, one meta line), then actions (right-aligned beside the title from `md`; on phones one square vertical-dots button, `EntityActionsMenu`, at the end of the Back row, holding every header action with Edit first and destructive items last), then secondary content such as section navigation. The page-level Add is filled and Edit is outlined, a pencil labelled just “Edit” whose accessible name says what it edits (“Edit training session”, “Edit horse”); page-level controls such as training completion and an event's Change status share the action row, before Edit; an ordinary event's status is a badge in the meta line, not an Overview fact.

**The Add Rule.** If something can be added, the view shows an “Add …” button on the same row as the title of the page or section that owns it, at every width. On phones, page actions stay beside the title when both fit; when they don't, they move to their own row under the title, so a button label never breaks across two lines. Use `CreateRecordDialog` for dialog creation, which renders the title-row trigger itself, or an `action="create"` `ButtonLink` for route forms.

**The Shortcut Rule.** On phones, the same creation actions are repeated in one circular button at the bottom right. That repetition is deliberate: some people reach for the thumb button and some open the section and look for Add. `FloatingActionsProvider` in the application shell owns the slot. Each `CreateRecordDialog` registers automatically. Route creation registers with `FloatingCreateShortcut`. One action gives a direct “+”; several give one Add menu. A page that renders its own `MobileActionMenu` or `MobileFloatingAction` (Home's quick menu, the horse action menu, the event edit pencil) claims the slot, and registered shortcuts stay hidden. Never stack two floating buttons. Desktop has no floating button. Home's quick menu has one Go to group: My horses, then the current stable's shortcuts under a quiet, muted sub-label with the stable name; Add follows. An open round-button menu dims the page with the same scrim as dialogs; the round button, now showing Close, stays above it.

**The Daily Action Rule.** Events and Training each have one primary action (Add event, Add training session). On phones it is a full-width bar above the bottom navigation, always visible, so those pages show neither the title-row button nor the round shortcut there; desktop keeps the title-row button. These labels, especially in Polish, are too wide to sit beside a page title on a phone. Use `PagePrimaryAction` in `DashboardPageHeader.actions`; `MobileActionBar` claims the floating slot.

**The Round Button Rule.** The round phone button means Add, with one exception: event and training detail make it a pencil that opens Edit, so editing is always within thumb reach (Edit is also first in the header menu). Horse pages keep their record menu on the round button because every item in it adds something; it holds Edit horse too, so the horse header shows no actions on phones.

**The Add Weight Rule.** The Add that belongs to the page is filled, and so is a dashboard section's Add beside its “All …” button. Any other Add that belongs to a section is outlined; tab rows of `DashboardTabbedCard` mark their record-list Adds as section-owned through `SectionAddContext`. Every Add uses the plus icon and “Add <noun>”; on phones a dashboard section's pair reads just “All” and “Add” (`PhoneShortLabel`) so it never wraps, while the full label stays the accessible name; dashboards never let an Add outrank what needs attention.

**The See All Rule.** A section that previews a longer list shows one “All …” link (`SeeAllLink`, an outlined button at the Add's height with a leading list icon) in its title row, before its filled Add, so the pair matches in size and colour carries the hierarchy. Never at the bottom of the section. When the pair does not fit beside the title it wraps to its own row, starting at the title's left edge. The one exception is a phone attention disclosure, where All reminders ends the open panel.

**The Attention Rule.** Home leads with health issues and due care, in the destructive colour at every width, then pending decisions, then daily work. Phone summaries name what is wrong instead of giving only a count; phone attention titles use the serif display face at 18px.

**The Row Action Rule.** Record actions sit on one row: the main action first, Remove last. Every removal uses the shared `action="delete"` styling: muted ink with a destructive trash icon at rest, turning fully destructive on hover, focus and press, so a list never reads as a column of alarms; the confirmation dialog carries the strong danger treatment.

**The Danger Zone Rule.** Archive stable and Delete horse are a quiet footer section after the main content (`DashboardSectionCard surface="flat" size="compact"`): no card, sans nested title, one help line, the destructive button. Never a card that competes with the record.

**The Disclosure Rule.** Every disclosure uses one cue: a trailing muted caret that points down when closed and up when open (`DisclosureChevron`, and the same glyph on native `<summary>`). Attention disclosures keep destructive title text, but the caret stays neutral. On phones the row uses the full record width.

**The View and Section Rule.** Exclusive view choices (Week/Month, Calendar/Event log, Compact/Detailed, Log/Calendar) use `ChoiceButtonGroup layout="segmented"` at every width, including horse Activity's Log/Calendar; time and status filters inside a view (Activity's Upcoming/History, reminders' To do/Done/All) are quiet text toggles (`TextToggleGroup`) with the selected one in ink, semibold and underlined, never a second segmented control; the view control sits at the right end of the first content row and, in Calendar, moves into the calendar toolbar. Section navigation uses the underlined style everywhere, including `TabsList variant="section"` and `DashboardNavigation` section links. Calendar toolbars use one anatomy at every width: a quiet date group (chevron, period title, chevron, then a text Today) at the left; the view control, Filters and any actions at the right. On phones a view control wraps to its own row with Filters at the right edge; Filters always keeps its label; the period title is never a separate card heading. Filters shows a round count only when something is active. Active filter chips and Clear all stay one line high at every width; on phones their 44px targets come from invisible overlays.

**The Navigation Rule.** Phones have five tabs: Home, Events, Training, Horses and Menu. The menu mirrors the sidebar, so it keeps the daily links, because it covers the tab bar when open. **The Stable Row Rule.** Every stable is listed by name in a group captioned “Stables” that ends with “All stables”, even when no stable is listed. A stable's row links to its overview; a separate trailing caret button beside it (a sibling, never nested in the link) discloses the stable's pages, without icons, indented under a hairline. The current stable's pages start open; others start closed. Settings appears only under stables the user owns. Inside a stable, the phone header shows its name, and the Horses tab is selected on its horse pages, as Events and Training are on theirs. A personal training session, its edit page and its creation share `/events` URLs with events but select Training in the sidebar and the tab bar (the page claims it once the event loads). Outside a stable, Horses is also selected on My care contacts and Deleted horses, because their Back leads to Horses. The sidebar has one entry per page: the directory's tabs share “Yard and contacts”. Horse sections keep four tabs plus More on phones and six plus More on wider screens; More shows the name of a hidden section while you are on it.

**The Mobile Form Rule.** Route forms float two labelled pills, Close and the submit label, so the form stays visible behind Safari's toolbar and neither action depends on an icon. Onboarding steps float the same pills (Do this later or Cancel, then the step's continue action) through `OnboardingStepActions`.

**The Focused Edit Rule.** A section pencil opens a form showing only that section's fields, not the whole record form. Horses use `HorseEditEntry section=…`; the stable Yard tab and the Stable settings Yard contacts / Yard information groups open `/stables/$stableId/edit?section=information|contacts`, which renders the matching subset of `StableFormFields` and returns to the Yard tab after saving. The unscoped edit route keeps the full form for settings.

**The Pencil Rule.** If a section can be edited, an always-visible pencil sits in the top-right corner of that section's title row. Pass it through the `edit` slot of `DashboardSectionCard`, `DashboardSubsection` or `DetailReferenceGroup`, never through `actions` or the body: the slot renders it last, after any Add actions, inside `SectionEditSlot` so its 44px target adds no height. Use `EditActionButton` for inline editors, `EditActionLink` for route forms and `HorseEditEntry appearance="icon"` for horse editor sections. Its accessible name says what it edits (“Edit care information”, “Edit Ben Carter”). Always-open forms and toggles (account profile) need no pencil. Records in a list put the same pencil, followed by Remove, in their action footer; a “…” menu is only for further actions, never for Edit or Remove alone; when a row already has one, Remove moves into it as the last, separated, destructive item (`RecordRemoveMenuItem` with a controlled `RecordRemoveAction`), so the footer reads main action, pencil, “…”. Only whole-entity edits in a page header (Edit horse, Edit event) keep a labelled button.

**The Stable View Rule.** Like a horse profile, the stable view keeps its sections inside one page: Contacts, People, Yard information, Documents and Getting started are tabs of `/stables/$stableId/stable?tab=…`, so switching never changes page or Back. Former `/documents` and `/welcome` URLs redirect to their tab. Analysis stays a separate page.

**The Panel Rule.** Every panel is a `DashboardSectionCard` (or a `DashboardSubsection` / `DetailReferenceGroup` inside one) whose title, description, badges, `actions` and `edit` come from props. Do not hand-write headings, descriptions or title rows inside a card body, and do not stack card frames. Calendars and lists put their Add action in the page header, not in a calendar toolbar; only the daily pages above use a phone bottom bar.

### Records, facts and badges

Compose flat records through `DashboardItemCard`, `DashboardItemRecordContent`, `DashboardMetaList` and shared action/footer helpers. `DashboardMetaList` separators never start or end a wrapped line. A file-state badge (No file attached, File unavailable) follows the document title inline. A record's audience is one quiet status line inside the record it describes (`RecordAudienceLabel`): a lock or people icon with “Private · owner and carers” or “Shared · stable names”, the rules behind the `?` help button and Manage sharing as an inline link; never a disclosure, and never a free-floating list. On training detail it sits in each horse's card, under the creator. A page's secondary list link (Deleted horses) is a quiet text link in the title row before Add. Use the detail primitives for related reference facts and forms rather than turning every value into a metric card. Row links remain whole-row targets where appropriate; do not add redundant open buttons.

`DashboardItemList` and `ScrollableList` own row spacing through `app-record-list`, which pulls rows out by their inset so text aligns with the section title; rows no longer alternate. The inherited `--record-background` works for both direct rows and semantic list-item wrappers. Nested lists restart their own sequence. Rows use `app-record` (14px block / 12px inline inset) or compact 10px block inset. Keep related records in a single column for scanning. Hover and selection take precedence over alternating fills. Do not restore left status rails or closing rules on ordinary records.

Use `DashboardRecordDetails` for optional long notes. Keep record identity, due date, urgent status and available actions visible when collapsed. Opening details adds a neutral boundary to the owning record. Clinical instructions that must remain visible are ordinary record content, not an automatic disclosure. Tables use the same alternating surface treatment; structural calendar/time-grid lines remain in their domain owner.

Badges are for actionable attention, exceptional status, access, selection, a necessary mixed-record kind or a meaningful count. Badges are tinted labels (soft surface, readable ink), never solid action fills, and keep one meaning everywhere: health is the destructive tint, care and warnings the warning tint, roles, access and invitation status neutral, information the blue information tint. A mixed-record kind tag uses its kind's tint while the record is open and neutral once it is closed. An overdue reminder says so in its due line (“Overdue · 5 Nov 2026”, destructive ink with a warning icon) instead of a separate Overdue badge; priority and closed states keep their badges. Ordinary facts belong in metadata or detail fields. Never add an eyebrow above a heading. Routine planned, active or medium-priority states need no repeated chip when the context already conveys them.

Document availability remains backend-owned. The document title is the Open link; Download is one compact ghost icon button with an accessible name; Remove sits last with the shared delete styling and keeps its label at every width. On phones the actions sit as one unbroken group under the document's text, aligned with the title. Use `DocumentDownloadAction` for filename-preserving downloads, stable pending geometry, duplicate prevention and recoverable failure feedback. Keep unavailable downloads in the same disabled slot with an explanatory tooltip. An action that no longer applies but has a route elsewhere (Withdraw on an event that already happened) stays in its slot greyed out as `UnavailableAction`: the reason and the next step show on hover and on tap, since phones have no hover. Removal permissions do not control access to otherwise available files.

### Forms and overlays

Inputs use the shared 40px control height (44px on narrow or touch screens), 6px corners, paper surface, visible input border and 16px medium text at every width (which also prevents iOS focus zoom). Focus uses the shared `app-control-focus` outline; invalid states use burgundy and disabled controls use the muted surface. Use `Field` and form layout/action primitives for labels, errors and submit rows. Native `required` or `aria-required` controls drive the shared label asterisk, a quiet muted mark rather than burgundy, attached to the label text by a thin space; use `FieldLabel required` or `FieldLegend required` for grouped choices and alternative requirements.

Route forms cap their content at 56rem, centred together with the page title (`DashboardPage width="narrow"`). **The Title Rule.** A page or detail title stands alone on its line. Personal or the stable's name leads the small muted meta line under it (“Personal · Created by Antek”), never a “Title · Stable” suffix. **The Column Width Rule.** Pages about one record or one task share that 56rem column: route forms, Profile, Pricing and the event and training detail pages (personal and stable), whose entity header keeps Back at the far left while its date tile, title and actions align with the column. Width is a fixed cap, never a percentage, so line length stays readable on wide screens. Pages that scan many records (dashboards, lists, calendars, analysis, horse profiles with tabbed lists) use the full page width. They put Back at the top left of the page on every viewport; it runs the same exit and unsaved-changes guard that Cancel used to run. The Profile page uses the same 56rem cap and footer hairline but keeps Save in its footer row on phones, because it keeps the tab bar; on phones its profile section drops the card chrome and sits on the paper like route forms. Invitation rows read Resend, then “…” (Copy link, Revoke); an invitation that cannot be copied keeps Revoke visible. An unavailable download stays disabled at no less than 3:1 against its row, with the reason in a keyboard-reachable tooltip. Document rows label Download (quiet ghost with its icon) like Remove. Row decisions (horse invitations) are compact: the confirming action first, outlined with a tick, then the other in a neutral subtle outline at the same size, side by side with an 8px gap at every width. Route form footers carry one hairline at the content width above the actions, never a tinted or edge-to-edge band. Field help sits behind a small outlined question icon button (24px circle, 44px hit area, muted ink) beside the label; placeholders are examples (“e.g. …”) in muted, regular-weight text so they never read as entered values. Route form footers show Close (the same guarded exit as Back) and the submit action at every width. Discard changes is a quiet text action at the start of the desktop footer, shown only while the form has edits; its space stays reserved so Close and submit never shift. Phones float only Close and submit. When the first, always-visible section's heading would only restate the page title, it is visually hidden. Use a `?` help button only for behaviour the field cannot show (ownership, contact linking, shared colour); restated guidance is removed, and short limits belong in visible hint text. Event and training creation keep horse selection and all mandatory inputs together in the first, always-visible `FormSection` (`collapsible={false}`). Optional sections stay collapsed with the shared quiet Optional tag (`FormOptionalTag`) beside their title; onboarding steps use the same tag, never a filled badge. A collapsed section shows only its entered-value summary, trailing the title on the same line, or nothing when empty. Training's “Also taking part” is its own collapsed Optional section after the first section; its summary lists the ticked names, and “Led by” stays in the first section. A horse without a photo shows its initial in muted ink on one borderless pale stone tile everywhere (`HorseAvatar`, `--selection-surface`), which separates from card and canvas in both themes; no per-context overrides. The horse form keeps the photo and required identity in its first section (Owner name in the left column, Sex on its own full-width row, then Birth date or age as a label with its Birth date / Age switch underneath and no help button), followed by collapsed optional sections: Breed & appearance (including calendar colour), Identification & insurance, Care & health and Nutrition. Forms carry no "Fields marked * are required" line, and an open section or a group shows no description that only lists its fields; keep a description only when it warns about behaviour the fields cannot show, such as a nutrition history entry not changing the current plan. Do not number independent sections as if they were required steps. Validation still expands the affected section and focuses the first error.

A nickname's “Show nickname instead of name” checkbox sits directly under its input, with no help tooltip. Birth date or age is one labelled row with a Birth date | Age segmented choice; both inputs stay mounted and linked, and only the chosen one is shown. Photo fields on the profile and horse forms use `FileUploadField variant="avatar"`: the round avatar is the upload and drop target, with Add/Change photo and the type/size hint beside it; no dashed drop zone.

Safari compatibility belongs to shared primitives. Form grids and their children must shrink inside their columns (`min-width: 0`); native date/time controls must not exceed the container. Textareas use automatic height with a minimum height, rather than inheriting the single-line control height. `field-sizing: content` is an enhancement: the native scrolling/resizing fallback must remain usable. Form disclosures use normal document flow and `hidden`/`inert` for collapsed content, keeping registered values mounted without relying on animated intrinsic grid sizing. Avoid adding feature-local browser detection or fixed field-container heights.

Run `pnpm test:forms:webkit` against a local dev server after changing shared form layout. It checks production-owned form fixtures and the design-system control specimen for overlap, escaping content and mobile control sizing. See [Safari verification scope and setup](docs/design/reviews/safari-forms-2026-10-14.md); a mobile WebKit viewport is not a physical iPhone certification.

Record creation and editing dialogs fill the mobile viewport below 768px, covering the underlying page and navigation without outer gutters or rounded corners. Keep the title and close action above a separately scrolling form body, with safe-area insets and sticky form actions. Follow the visual viewport while the keyboard is open and scroll the dialog body to reveal focused fields. Desktop keeps the bounded modal; brief confirmation alerts keep their compact treatment.

Route ordinary deletion through `RecordRemoveAction` and the shared confirmation dialog so the object, consequence, cancel path, pending state and retry are explicit. Keep failed mutations recoverable. Shared dialog, menu, tooltip, alert and toast components own transient surfaces; long forms retain the canonical reachable submit area.

Horse identity keeps the same photo size, metadata and spacing across its sections. On desktop, horse editing uses a visible permission-gated header action. On mobile, one horse-level circular action menu is shared across Profile, Activity, Training, Care, Nutrition and Documents. It contains every permitted creation action (event, training session, reminder, health issue, nutrition log, weight, medication and document), followed by Edit horse. Section title-row “Add …” buttons stay visible on every viewport; only their phone shortcuts yield to this menu. Choosing a record action opens the existing form on its owning tab, consumes the navigation intent once, and returns focus to the shared menu after closing. Hide this menu during route editing so the form owns the bottom controls. Editing retains sticky save controls and confirmation before resetting dirty values. Choice groups have programmatic names, and invalid fields reference their error messages. Multiline horse lists preserve raw typing while synchronizing normalized arrays and reconcile external resets.

Month calendars use bounded viewport-aware rows and switch to a compact date grid when their container is narrower than 56rem; at every width a selected-day agenda (“Events on <date>”, today or the month's first day until a day is chosen) follows the legend under the grid, and choosing a day (its number, its empty cell area or +N more) updates it in place. Text and browser zoom are never scaled to fit; short viewports retain normal page scrolling. Busy cells retain horse markers in the date header, one compact entry and an explicit overflow action. Grids are framed (`app-panel-strong`) and ruled in both directions: a shaded weekday header, hairlines between columns and under every week, so dates are easy to track across and down. Desktop day numbers use lining figures and, like entry titles, read at 15px; out-of-month cells take the muted fill and stay empty; today is a filled circle on the date and means today only (the Training week header uses the same circle on the day number); the selected day is a pale stone tint with a thin inset outline, and a selected today shows the circle inside the tint. Month and week entries are small outlined cards on the cell, so neighbouring events stay distinct; the same entries in a list (selected-day agenda, phone week list, Home) are open rows. The collapsed “Horse colours” legend sits directly under every grid that shows horse dots, at every width; month rows reserve room so it stays on the first screen when the readable row floor allows; six-week months on short screens scroll to it. Week time grids follow the same rule: a framed table with a shaded header and column rules. Weekday headers align left at the day cell's inset, in line with the day numbers; compact date grids keep them centred. Day markers and desktop event chips use one vocabulary: horse colour dots, one neutral muted dot for an event without a horse, and +N for extra horses; the legend names the neutral dot “No horse”. Every month chip shows up to two lines before an ellipsis, so identical titles read the same in every cell; day selection keeps the month in place. Training completion actions live in the selected-day agenda, with read-only status in month summaries.

Shared horse identity uses the saved `calendarColourId`, separate from coat colour. New horses receive an available palette colour; existing horses have a deterministic identity fallback until their profile is saved. `HorseCalendarIdentity` owns markers, named identities and the initially collapsed “Horse colours” legend. Day markers represent distinct horses, with an explicit extra-horse count, and carry a 1px card-coloured halo in dark mode; they never imply completed sessions. Event types and status keep text/icon cues. Single-horse history retains record-type cues. Palette selection belongs in the horse form's Breed & appearance section and identifies colours already used by authorised roster horses. Keep colour names, selected checks and named agenda records as non-colour alternatives. Presets use compact swatches with a moving selection ring; custom colour editing opens the shared dialog on desktop and mobile, with a separate draft and explicit Use colour/Cancel actions. A hue/saturation/brightness editor, hex entry and a compact inline row of light/dark preview chips support precise choice. Custom six-digit hex colours preserve their exact value across themes; presets retain theme-adjusted tokens. Reduced-motion preferences disable spatial transitions.

Training creation puts horse selection, date and work before optional planning details. A blank title derives from the selected work. Optional session information, status and duration remain in the additional-details disclosure; outcome belongs with notes. Reuse sticky form actions and protect meaningful edits without warning on untouched forms. Collapsed form sections show their selected summary on phones as well as desktop. Unallocated horse/day cells remain blank; filters start collapsed and retain visible active-filter feedback.

Training details use one main record per horse: linked identity and status, labelled training facts, a separated area for focus/outcome/next steps when present, then recording actions. Personal training details do not repeat a separate horse roster; additional per-horse notes, costs and participation remain accessible in a closed disclosure. The mobile event/session edit action is the round pencil (Round Button Rule), hidden while the keyboard is open; desktop keeps the visible header Edit.

### Time comparisons

Use `TimeComparisonChart` for numeric rows and event/interval lanes on one continuous calendar-date axis. Keep units and numeric scales separate by row, use semantic chart colors, and show actual observations with straight connecting segments. A single measurement stays a point; missing observations stay absent. Context markers and overlapping intervals pack vertically while retaining their calendar positions. These are recorded relationships in time, without causal or health judgments.

The chart owns rendering and responsive tick density. Its caller owns records, filtering, aggregation, units, localized labels and formatters, selected-record details, and an accessible record table. Preserve keyboard/tap selection and the underlying source records when aggregating bars. See the [shared chart contract](src/components/charts/README.md).

`DateRangeControl` reuses labeled shared fields and stacks them on phones; its caller owns presets, validity and query bounds. Keep the comparison within one paper working section with existing serif section headings and controls. Record details remain open beneath the chart instead of adding nested summary cards. The horse implementation and evidence boundaries are recorded in [horse analysis](docs/features/horse-analysis-exploration.md).

### Demonstration and rollout

The style lab preserves the component inventory and adds a clearly labeled sample schedule. Day selection changes the local schedule; the care action marks a sample grooming task complete and offers undo, with explicit feedback that no live record changed. These controls demonstrate shared primitives without suggesting server persistence.

The horse form at `/page-lab/horse-form` reuses production fields and schema validation with local-only save/reset. It does not exercise uploads, authorization or backend persistence.

Review the remaining page families for specialized surfaces, local type overrides, responsive layout and interaction states before claiming a complete migration. The public landing's separate visual language remains outside this record.

## Do's and Don'ts

### Do:

- **Do** use shared semantic tokens and primitives across light and dark themes.
- **Do** keep headings in sentence case and records readable at the established body sizes.
- **Do** use one soft section per working group and shared open record rows, with row text aligned to the section title.
- **Do** preserve working navigation, permissions, loading, error, empty and undo behavior while changing presentation.
- **Do** label sample data and local-only interactions honestly.

### Don't:

- **Don't** restore condensed uppercase display type, decorative eyebrows, heading icons, background patterns or marketing imagery in app chrome.
- **Don't** confuse deep neutral ink selection with burgundy destructive states.
- **Don't** add nested card stacks, ambient shadows or decorative accent rails to ordinary records.
- **Don't** duplicate shared button, field, tab, badge or record-row styling in feature files.
- **Don't** claim prototype interactions or every page-family migration are complete without implementation and review.

### Styling ownership and exceptions

Application pages inherit the approved consolidated dashboard direction through shared components. Public landing compositions keep their separate surface brief. Historical `dashboard-lab` studies retain scoped experimental CSS for comparison; production components must not import it. Print boundaries, calendar/time-grid geometry, sticky form action boundaries, input borders and overlays are functional exceptions, not alternate record designs.

### Back navigation

Use `BackButton` or `BackLink` from `src/components/ui/back-action.tsx` for every return control: left arrow plus localized text, transparent background, no border, and a minimum 44px touch target. Page-level back actions belong at the top left beneath the app navigation and above the title, using `DashboardPageHeader.backAction` when available. Never place them in the right-aligned primary action rail or below the form. Keep chart-local return controls with their chart context, using the same visual treatment. Preserve explicit destinations, history fallbacks, pending states, and unsaved-form protections.
