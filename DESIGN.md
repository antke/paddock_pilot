---
name: Paddock Pilot — Stable journal
description: A warm, readable app system for everyday stable coordination.
colors:
  off-white: '#eeece8'
  ink: '#30372f'
  paper: '#fcfbf8'
  evergreen: '#285b43'
  selection: '#55594c'
  selection-ink: '#f8fbf9'
  pale-stone: '#e4e6dc'
  burgundy: '#962f43'
  destructive-ink: '#fff8f9'
  secondary: '#e4e6dc'
  muted-ink: '#62695f'
  divider: '#bec8c2'
  input-border: '#7d8b83'
  surface: 'color-mix(in srgb, #fcfbf8 70%, #eeece8)'
  surface-muted: '#eeece8'
  quiet-green: '#306c53'
  quiet-green-ink: '#f7fbf8'
  quiet-green-muted-ink: '#dfede4'
  warning: '#87571f'
  warning-surface: '#f1e2c8'
  information: '#365f4d'
  information-surface: '#e0ede5'
  night-canvas: '#1c1e1d'
  night-paper: '#272a28'
  night-raised: '#303431'
  night-row: '#2c302d'
  night-sidebar: '#202321'
  night-ink: '#eeece8'
  night-muted-ink: '#b8bcb8'
  night-primary: '#91c8a9'
  night-primary-ink: '#172b20'
  night-selection: '#eeece8'
  night-selection-surface: '#3e4440'
  night-divider: '#515a54'
  night-input-border: '#8b978e'
  night-destructive: '#f2a8b7'
  night-destructive-ink: '#321c22'
  night-warning: '#edc28b'
  night-warning-surface: '#463729'
  night-information: '#b0c9e0'
  night-information-surface: '#293b4b'
  night-quiet-green: '#284639'
  night-quiet-green-ink: '#f0f3ee'
  night-quiet-green-muted-ink: '#c9dcd1'
  night-quiet-green-border: '#6c9680'
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
    fontSize: '0.8125rem'
    fontWeight: 500
    letterSpacing: 'normal'
  wordmark:
    fontFamily: 'Alegreya, Georgia, Times New Roman, serif'
    fontSize: '1.5rem'
    fontWeight: 600
    lineHeight: 1.25
  mono:
    fontFamily: 'Geist Mono Variable, monospace'
    fontSize: '0.8125rem'
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
- Soft paper sections on a soft stone canvas, with open, alternating record rows.
- Distinct action, selection and destructive colors in both themes.
- Useful interaction feedback without decorative headings, patterns or imagery.

## Colors

Pine & paper is the approved app palette: warm stone, soft paper and a rich pine accent. The frontmatter records the implemented light palette and key dark counterparts. CSS semantic variables remain the implementation source, including additional status, chart and sidebar roles.

- **Evergreen** (`--primary`) identifies primary actions and focus. Primary text uses `--primary-foreground`.
- **Deep neutral ink** (`--selection`) and **pale stone** (`--selection-surface`) identify selected controls, navigation and rows. Solid selection fills use `--selection-foreground`; pale stone fills use deep neutral ink or the normal readable foreground according to the primitive.
- **Burgundy** (`--destructive`) identifies destructive actions and errors. It is separate from selection.
- **Off-white**, **paper**, **surface** and **surface-muted** provide the canvas, contained content, quiet regions and grouped controls. The application main canvas uses surface-muted; working sections use paper.
- **Ink** and **muted ink** provide reading hierarchy; dividers use `--border` or its subtle mixed counterpart. Inputs use `--input` for a clearer boundary.
- **Quiet green** retains its own inverse foreground pair. Warning and information badges use their dedicated foreground/surface tokens rather than arbitrary chart colors.

**Charcoal & pine** is the approved dark palette (selected 16 October 2026). A charcoal canvas supports lighter working panels and raised controls; neutral stone marks selections, while readable pine green identifies actions. The light theme's off-white becomes the main text colour, preserving the journal's warmth without an olive tint across every surface. Pink destructive feedback, amber warnings and blue information states remain distinct.

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
- **Nested headings:** Alegreya Sans, usually 18px with medium or bold emphasis and a snug line height. Keep them distinct from display headings.
- **Body scale:** `text-xs` is 13px, `text-sm` is 15px and `text-base` is 17px. Record descriptions commonly use 15px/24px. Prominent copy commonly uses 17px/28px.
- Body weights are 400, 500 and 700. Existing sans `font-semibold` utilities request 600 and resolve to the loaded 700 face. The action token records that existing utility request; it does not imply a separate 600 font file.
- Labels, tabs and actions use sentence case and normal tracking. Mono is for code, identifiers and token references; ordinary dates and step numbers use tabular numerals in Alegreya Sans, never monospace.

**The Shared Type Rule.** Use `DashboardDisplayHeading`, section/page headers, `DashboardInlineHeader`, `TextLabel` and record/detail primitives before adding local heading recipes.

## Layout

The full-height shell retains header, main and footer. `.page-wrap` caps content at 90rem with at least 1rem gutters. Shared layout helpers provide equal, split, sidebar and command-center grids; use their responsive behavior and named gap props rather than repeating route-local grids. Common stack gaps are 16px, a token-controlled 20px, and 32px. Grid layouts collapse before text is made smaller.

`DashboardSection` defaults to `chrome="soft"`: one paper surface per working group. `DashboardSectionCard` defaults to `surface="panel"` and uses the same inset, gap and surface tokens. Keep page/entity headers open on the canvas. Use `chrome="flat"` / `surface="flat"` for subgroups already inside a section, without additional borders or inset. Detail facts stay open inside their owning section.

The tuning controls live together in `src/styles.css`: `--app-canvas`, `--app-section-surface`, `--app-section-border`, `--app-section-inset`, `--app-section-gap`, `--app-section-content-gap`, and the `--app-record-*` tokens. Section inset and gap are 20px on desktop and 16px below 640px; content gap is 16px. The default section boundary is surface contrast, with a transparent border slot that can be tuned centrally. Do not duplicate these recipes in route CSS.

The stable dashboard uses independent main and attention stacks. Today’s training leads the main stack with a direct Record completed work action, followed by Today, Next 7 days and Horses. On phones, a compact health disclosure precedes training and care reminders follow Today. On desktop, Health issues and Care reminders retain separate sections and three-item previews in the attention column. A tall attention list must not stretch the space between sections in the main column.

Signed-in navigation uses a 14.5rem desktop sidebar from 1024px, with a persistent collapse preference. Brand and one route-aware workspace picker lead; daily work, supporting records and stable management form separate groups; account controls stay at the bottom. Home, Events, Training log and Horses keep the same ordering and workspace meaning. The active item is revealed within the independently scrolling navigation area. Narrower screens and collapsed desktop navigation use a branded header and a left-side drawer. Phones retain labeled bottom navigation; More opens the same drawer as Menu. Keep the header compact and move workspace selection into the drawer on mobile. Language and appearance live together in account Preferences, with the existing saving/retry behavior. All navigation targets are at least 44px tall. Public navigation retains its separate header.

Preserve the useful order of identity, description, metadata and actions. Row actions wrap on narrow screens; persistent entity navigation belongs below identity and keeps a readable single-line overflow treatment. Shared component options own density, width, span, alignment and action placement. Specialized calendar/timeline geometry remains in its domain owner. `DetailGrid mobileColumns={2}` supports short paired facts on phones; longer identifiers and prose retain one column.

`DetailReference` is the opt-in pattern for grouped reference data inside one paper section. `DetailReferenceGroup` aligns a compact heading column with a bounded fact area on desktop and stacks the heading above the facts below 1024px. Neutral rules and 24px group spacing separate categories. `DetailReferenceList` and `DetailReferenceField` provide semantic definition lists with quiet labels, readable values, paired short facts and full-width prose. Identifiers and care lists stack on phones; long values wrap without truncation. Keep notes expanded and distinguish missing values from explicitly recorded absence. Domain components own grouping and translations; adopt this pattern deliberately rather than changing existing detail consumers globally.

Horse Care keeps configured vet and farrier contacts in a shared reference section above both Care reminders and Health issues, with emergency notes in a separate visible group. Phone links include a phone icon and a 44px touch target. Reminder rows pair the title with priority/status, then label due date, category and responsibility explicitly. Include the horse only outside a single-horse context. Keep completion attribution separate and put permitted actions in a compact footer; read-only rows have no empty action area.

**The Section Ownership Rule.** Give each working group one soft section. Put open facts and gently alternating rows inside it. Add a distinct record boundary only for expanded details, editing, or a genuinely independent task. Never stack routine panel frames inside one another.

## Elevation & Depth

Control, surface and panel shadow tokens are `none`. Hierarchy comes from surface contrast, spacing, type, selection fills and restrained record bands. Overlays use their shared stacking, border and backdrop treatments. Do not add ambient shadows to ordinary sections or records.

Working-app motion uses Motion for React through `AppMotionProvider`: bounded list layout/presence, measured disclosures, shared segmented selection and local status feedback. Buttons keep stationary hit targets with interior press response. CSS owns simple control states and Base UI overlay transitions; native router View Transitions own navigation and persistent chrome. Do not animate the same node/property with two systems.

Routine timing is 120–220ms with 140ms exits; confirmed care gets a 320ms drawn journal check and a modest ring only for the confirmed final outstanding item. Server results remain authoritative, including undo and retry. Initial data and background synchronization never earn completion celebrations. Reduced motion removes spatial travel and height tweening while retaining clear state feedback. See the [motion contract](src/components/motion/README.md) and [coverage/verification ledger](docs/design/motion/interaction-coverage.md) for conventions, intentional exceptions and evidence boundaries.

## Shapes

Controls use 6px corners, record hover/bands use 8px and sections use 12px. Ordinary rows have no border rails or bottom rules. Expanded details can have a one-pixel neutral outline. Count badges, switches and compact icon controls retain functional circular geometry; do not turn ordinary layout containers into pills.

## Components

### Actions and selection

`Button` default and solid variants both use evergreen with paper text. Their default minimum height is 40px, increasing to 44px for coarse pointers. Outline and secondary variants use neutral surfaces; ghost and subtle controls stay quiet until interaction. Destructive controls use a burgundy tint and burgundy text. Disabled controls retain geometry and reduce opacity; keyboard focus uses a primary border and a 3px ring at 25% opacity.

Use the shared `action="create"`, `action="edit"` and `action="delete"` props for semantic action icons. Ordinary navigation and submit actions do not acquire an icon just because of their wording. Keep decorative icons out of headings.

Tabs, toggles, calendar selection, timeline period selection and selected record rows consume the deep neutral ink tokens. Use the native/shared selected state and accessible attributes rather than a color-only local approximation. Persistent navigation should expose the current destination; choice controls should expose their pressed or selected state.

Use `DashboardTabbedCard` for nested views in a single working section (Events, horse Activity, Care and Nutrition). Its `TabsList variant="line"` uses 17px bold labels, 48px targets and a 3px neutral-ink active underline on one shared divider. Keep labels on one horizontally scrollable row. Actions sit alongside the tabs when the card has room and move below them in narrow containers; use the card's width rather than the viewport to make that decision. Keep the content description inside the active panel and avoid repeating its selected tab as a heading. Keyboard focus is an inset primary ring, distinct from the active underline.

### Records, facts and badges

Compose flat records through `DashboardItemCard`, `DashboardItemRecordContent`, `DashboardMetaList` and shared action/footer helpers. Use the detail primitives for related reference facts and forms rather than turning every value into a metric card. Row links remain whole-row targets where appropriate; do not add redundant open buttons.

`DashboardItemList` and `ScrollableList` own alternating row backgrounds through `app-record-list`; the inherited `--record-background` works for both direct rows and semantic list-item wrappers. Nested lists restart their own sequence. Rows use `app-record` (14px block / 12px inline inset) or compact 10px block inset. Keep related records in a single column for scanning. Hover and selection take precedence over alternating fills. Do not restore left status rails or closing rules on ordinary records.

Use `DashboardRecordDetails` for optional long notes. Keep record identity, due date, urgent status and available actions visible when collapsed. Opening details adds a neutral boundary to the owning record. Clinical instructions that must remain visible are ordinary record content, not an automatic disclosure. Tables use the same alternating surface treatment; structural calendar/time-grid lines remain in their domain owner.

Badges are for actionable attention, exceptional status, access, selection, a necessary mixed-record kind or a meaningful count. Ordinary facts belong in metadata or detail fields. Never add an eyebrow above a heading. Routine planned, active or medium-priority states need no repeated chip when the context already conveys them.

Document availability remains backend-owned. Keep Open quiet and use `DocumentDownloadAction` for filename-preserving downloads, stable pending geometry, duplicate prevention and recoverable failure feedback. Keep unavailable downloads in the same disabled slot with an explanatory tooltip. Removal permissions do not control access to otherwise available files.

### Forms and overlays

Inputs use the shared 40px control height (44px on narrow or touch screens), 6px corners, paper surface, visible input border and 15px medium text (at least 16px on mobile to prevent iOS focus zoom). Focus uses the shared `app-control-focus` outline; invalid states use burgundy and disabled controls use the muted surface. Use `Field` and form layout/action primitives for labels, errors and submit rows. Native `required` or `aria-required` controls drive the shared label asterisk; use `FieldLabel required` or `FieldLegend required` for grouped choices and alternative requirements.

Mobile route forms keep the title and Cancel on one row. Event and training creation keep horse selection and all mandatory inputs together in the first, always-visible `FormSection` (`collapsible={false}`). Optional sections stay collapsed with a persistent, quiet Optional label beside their title, while entered values remain visible in their summary. Do not number independent sections as if they were required steps. Validation still expands the affected section and focuses the first error.

Safari compatibility belongs to shared primitives. Form grids and their children must shrink inside their columns (`min-width: 0`); native date/time controls must not exceed the container. Textareas use automatic height with a minimum height, rather than inheriting the single-line control height. `field-sizing: content` is an enhancement: the native scrolling/resizing fallback must remain usable. Form disclosures use normal document flow and `hidden`/`inert` for collapsed content, keeping registered values mounted without relying on animated intrinsic grid sizing. Avoid adding feature-local browser detection or fixed field-container heights.

Run `pnpm test:forms:webkit` against a local dev server after changing shared form layout. It checks production-owned form fixtures and the design-system control specimen for overlap, escaping content and mobile control sizing. See [Safari verification scope and setup](docs/design/reviews/safari-forms-2026-10-14.md); a mobile WebKit viewport is not a physical iPhone certification.

Record creation and editing dialogs fill the mobile viewport below 768px, covering the underlying page and navigation without outer gutters or rounded corners. Keep the title and close action above a separately scrolling form body, with safe-area insets and sticky form actions. Follow the visual viewport while the keyboard is open and scroll the dialog body to reveal focused fields. Desktop keeps the bounded modal; brief confirmation alerts keep their compact treatment.

Route ordinary deletion through `RecordRemoveAction` and the shared confirmation dialog so the object, consequence, cancel path, pending state and retry are explicit. Keep failed mutations recoverable. Shared dialog, menu, tooltip, alert and toast components own transient surfaces; long forms retain the canonical reachable submit area.

Horse identity keeps the same photo size, metadata and spacing across its sections. On desktop, horse editing uses a visible permission-gated header action. On mobile, one horse-level circular action menu is shared across Profile, Activity, Training, Care, Nutrition and Documents. It contains every permitted creation action (event, training log, reminder, health issue, nutrition log, weight, medication and document), followed by Edit horse. Section-owned floating and inline create triggers yield to this menu on mobile; desktop retains its section actions. Choosing a record action opens the existing form on its owning tab, consumes the navigation intent once, and returns focus to the shared menu after closing. Hide this menu during route editing so the form owns the bottom controls. Editing retains sticky save controls and confirmation before resetting dirty values. Choice groups have programmatic names, and invalid fields reference their error messages. Multiline horse lists preserve raw typing while synchronizing normalized arrays and reconcile external resets.

Month calendars use bounded viewport-aware rows and switch to a compact date grid with a selected-day agenda when their container is narrower than 56rem. Text and browser zoom are never scaled to fit; short viewports retain normal page scrolling. Busy cells retain horse markers in the date header, one compact entry and an explicit overflow action; day selection keeps the month in place. Training completion actions live in the selected-day agenda, with read-only status in month summaries.

Shared horse identity uses the saved `calendarColourId`, separate from coat colour. New horses receive an available palette colour; existing horses have a deterministic identity fallback until their profile is saved. `HorseCalendarIdentity` owns markers, named identities and the initially collapsed “Horse colours” legend. Day markers represent distinct horses, with an explicit extra-horse count; they never imply completed sessions. Event types and status keep text/icon cues. Single-horse history retains record-type cues. Palette selection belongs in the horse profile's optional details and identifies colours already used by authorised roster horses. Keep colour names, selected checks and named agenda records as non-colour alternatives. Presets use compact swatches with a moving selection ring; custom colour editing opens the shared dialog on desktop and mobile, with a separate draft and explicit Use colour/Cancel actions. A hue/saturation/brightness editor, hex entry and light/dark previews support precise choice. Custom six-digit hex colours preserve their exact value across themes; presets retain theme-adjusted tokens. Reduced-motion preferences disable spatial transitions.

Training creation puts horse selection, date and work before optional planning details. A blank title derives from the selected work. Optional session information, status and duration remain in the additional-details disclosure; outcome belongs with notes. Reuse sticky form actions and protect meaningful edits without warning on untouched forms. Collapsed form sections show their selected summary on phones as well as desktop. Unallocated horse/day cells remain blank; filters start collapsed and retain visible active-filter feedback.

Training details use one main record per horse: linked identity and status, labelled training facts, a separated area for focus/outcome/next steps when present, then recording actions. Personal training details do not repeat a separate horse roster; additional per-horse notes, costs and participation remain accessible in a closed disclosure. The mobile event/session edit action is a direct circular pencil link above navigation, with the same safe-area positioning as the action menu. Hide it while an inline editor or keyboard is open; retain the visible header action on desktop.

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
- **Do** use one soft section per working group and shared alternating record rows.
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
