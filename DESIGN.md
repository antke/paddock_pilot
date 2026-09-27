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
  night-canvas: '#272a24'
  night-ink: '#f0f3ea'
  night-primary: '#a9c7ab'
  night-selection: '#d9decc'
  night-selection-surface: '#41493a'
  night-destructive: '#f2a8b7'
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

The shared foundation is implemented. Some specialized components and route-local overrides still need review by page family; this document does not certify every app screen as fully migrated. The lab demonstrates sample day selection and local care completion with undo. A full care-completion animation and horse-profile preview from the prototype have not been shipped as shared app features.

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

Dark mode maps the same roles through `.dark`; use semantic utilities rather than copying light hex values into components. Text selection uses the selection surface, the caret uses primary, and the scrollbar is tinted from primary and the neutral border.

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

The stable dashboard uses independent main and attention stacks. Today, Next 7 days and Horses form the main stack; Health issues and Care reminders have separate titled sections, their own empty states, and three-item initial previews. A tall attention list must not stretch the space between sections in the main column.

Preserve the useful order of identity, description, metadata and actions. Row actions wrap on narrow screens; persistent entity navigation belongs below identity and keeps a readable single-line overflow treatment. Shared component options own density, width, span, alignment and action placement. Specialized calendar/timeline geometry remains in its domain owner. `DetailGrid mobileColumns={2}` supports short paired facts on phones; longer identifiers and prose retain one column.

**The Section Ownership Rule.** Give each working group one soft section. Put open facts and gently alternating rows inside it. Add a distinct record boundary only for expanded details, editing, or a genuinely independent task. Never stack routine panel frames inside one another.

## Elevation & Depth

Control, surface and panel shadow tokens are `none`. Hierarchy comes from surface contrast, spacing, type, selection fills and restrained record bands. Overlays use their shared stacking, border and backdrop treatments. Do not add ambient shadows to ordinary sections or records.

Shared buttons have a one-pixel pressed translation and 150ms color/border feedback. Height-collapse helpers use 200ms ease-out transitions. The global reduced-motion rule removes smooth scrolling, reduces animations/transitions to 0.01ms and limits animation iterations to one; shared buttons also suppress their pressed transform. These are shipped utility interactions, not a claim that the prototype's larger animation sequence is implemented.

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

Inputs use the shared 40px control height, 6px corners, paper surface, visible input border and 15px medium text. Focus uses the same 3px primary ring; invalid states use burgundy and disabled controls use the muted surface. Use `Field` and form layout/action primitives for labels, errors and submit rows.

Route ordinary deletion through `RecordRemoveAction` and the shared confirmation dialog so the object, consequence, cancel path, pending state and retry are explicit. Keep failed mutations recoverable. Shared dialog, menu, tooltip, alert and toast components own transient surfaces; long forms retain the canonical reachable submit area.

Horse editing uses a visible permission-gated header action, sticky save controls and confirmation before resetting dirty values. Choice groups have programmatic names, and invalid fields reference their error messages. Multiline horse lists preserve raw typing while synchronizing normalized arrays and reconcile external resets.

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
