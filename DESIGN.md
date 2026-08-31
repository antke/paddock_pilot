---
name: Paddock Pilot
description: A tactile, friendly field-office system for clear small-yard coordination.
colors:
  stable-green: '#1d4937'
  primary-ink: '#fcf7ed'
  oat-canvas: '#e7dfd0'
  near-black-ink: '#1b1915'
  ledger-paper: '#fcfaf4'
  ledger-paper-ink: '#1b1915'
  saddle-leather: '#ddc7a7'
  muted-paper: '#e9e0d3'
  weathered-ink: '#565047'
  sage-wash: '#d5ddcf'
  quiet-green: '#355f4c'
  quiet-green-ink: '#fffaf1'
  quiet-green-muted-ink: '#d9e5dd'
  red-clay: '#9c423a'
  red-clay-ink: '#fff8f3'
  wood-rail: '#b9aa93'
  dark-leather-input: '#9f8f76'
  field-surface: '#eee7da'
  pressed-oat: '#e2d8c7'
  raised-paper: '#f4efe6'
  olive-signal: '#607258'
  brass-signal: '#a46f2c'
  saddle-brown-signal: '#7b4f2f'
  sidebar-paper: '#e9dfce'
  night-oak: '#20231f'
  warm-night-ink: '#f3eee4'
  night-card: '#2b2d27'
  night-card-ink: '#f7f2e9'
  green-ink: '#17251d'
  night-saddle: '#594a39'
  night-muted: '#32352e'
  night-muted-ink: '#c2baa9'
  night-sage: '#425447'
  pale-clay: '#f0b9b2'
  deep-clay-ink: '#321b18'
  light-olive: '#9fb48e'
  bright-brass: '#d6a35a'
  warm-copper: '#d58e67'
  night-sidebar: '#1c1f1b'
  night-sidebar-rail: '#575247'
  night-surface: '#252922'
  night-raised-paper: '#373a32'
typography:
  scale:
    xs: '0.75rem'
    sm: '0.875rem'
    base: '1rem'
    lg: '1.125rem'
    xl: '1.25rem'
    2xl: '1.5rem'
    3xl: '1.875rem'
    4xl: '2.25rem'
    5xl: '3rem'
    6xl: '3.75rem'
    7xl: '4.5rem'
  display:
    fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif'
    fontSize: '3rem'
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: '-0.015em'
  headline:
    fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif'
    fontSize: '2.25rem'
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: '-0.015em'
  title:
    fontFamily: 'Barlow Condensed, Arial Narrow, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: '-0.015em'
  body:
    fontFamily: 'Manrope Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  control:
    fontFamily: 'Manrope Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 'normal'
  action:
    fontFamily: 'Manrope Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: 'normal'
  label:
    fontFamily: 'Manrope Variable, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: '0.035em'
  wordmark:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: '1.5rem'
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 'normal'
  mono:
    fontFamily: 'Geist Mono Variable, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.667
    letterSpacing: 'normal'
rounded:
  compact: '4px'
  control: '6px'
  row: '8px'
  panel: '12px'
  large: '16px'
  xlarge: '20px'
  xxlarge: '24px'
  pill: '9999px'
spacing:
  micro: '4px'
  tight: '8px'
  compact: '12px'
  standard: '16px'
  roomy: '20px'
  comfortable: '24px'
  loose: '32px'
  section: '48px'
components:
  button-primary:
    backgroundColor: '{colors.ledger-paper}'
    textColor: '{colors.stable-green}'
    borderColor: '{colors.stable-green}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '10px 16px'
    height: '40px'
  button-emphasis:
    backgroundColor: '{colors.stable-green}'
    textColor: '{colors.primary-ink}'
    borderColor: '{colors.stable-green}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '10px 16px'
    height: '40px'
  button-outline:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.near-black-ink}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '10px 16px'
    height: '40px'
  button-secondary:
    backgroundColor: '{colors.saddle-leather}'
    textColor: '{colors.near-black-ink}'
    typography: '{typography.action}'
    rounded: '{rounded.control}'
    padding: '10px 16px'
    height: '40px'
  badge-primary:
    backgroundColor: '{colors.stable-green}'
    textColor: '{colors.primary-ink}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '2px 10px'
    height: '24px'
  input:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.near-black-ink}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '6px 12px'
    height: '40px'
  card:
    backgroundColor: '{colors.ledger-paper}'
    textColor: '{colors.ledger-paper-ink}'
    rounded: '{rounded.panel}'
    padding: '24px'
  record-row:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.ledger-paper-ink}'
    rounded: '{rounded.row}'
    padding: '20px'
  tab-active:
    backgroundColor: '{colors.raised-paper}'
    textColor: '{colors.near-black-ink}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '8px 14px'
    height: '40px'
---

# Design System: Paddock Pilot

## Overview

**Creative North Star: "The Tack Room Noticeboard"**

The system should feel like the friendly place in a small yard where the useful details live and the community stays in touch. It combines the approachable social character of a tack-room noticeboard with the order of a yard ledger and the practical confidence of a warm field office. Routine operational data is presented with enough visual character to invite attention, never at the expense of reading speed or clarity.

The interface is tactile, friendly, and workmanlike. Warm paper layers, clear rails, compact controls, condensed display headings, and contextual photography keep dense records from feeling dry. It remains contemporary and horse-world adjacent without drifting into rustic decoration, antique styling, or enterprise-dashboard sterility.

**Key Characteristics:**

- Warm, mode-aware paper and earth colors rather than clinical white and grey.
- Dense information organized through strong type roles, borders, and tonal layers.
- Friendly community character grounded by practical, accountable workflows.
- Flat surfaces at rest, with depth created by contrast and structure rather than shadows.
- Sparse photography and semantic accent rails used only when they add context or meaning.

## Colors

The palette behaves like paper, ink, timber, leather, foliage, brass, and clay translated into a clear operational interface. The frontmatter references the live CSS variables so the same semantic roles follow light and dark mode.

### Primary

- **Stable Green** (`--primary`; light `#1d4937`, dark `#b6cbb9`): primary actions, selected states, focus treatment, positive status, and the occasional full brand surface.
- **Primary Ink** (`--primary-foreground`; light `#fcf7ed`, dark `#17251d`): text and icons placed on Stable Green.
- **Quiet Green** (`--brand-surface`; light `#355f4c`, dark `#324d3f`): rare inverse callouts for urgent handovers or emergency context that must interrupt the ordinary paper hierarchy.
- **Quiet Green Ink** (`--brand-surface-foreground`; light `#fffaf1`, dark `#f7f2e9`): primary text on Quiet Green. Secondary text uses `--brand-surface-muted-foreground` (light `#d9e5dd`, dark `#c9d8cd`) instead of generic grey.

### Secondary

- **Saddle Leather** (`--secondary`; light `#ddc7a7`, dark `#594a39`): warm secondary actions, filter chips, and supporting emphasis.
- **Sage Wash** (`--accent`; light `#d5ddcf`, dark `#425447`): quiet horse-world adjacency and low-intensity contextual emphasis.
- **Olive Signal** (`--chart-2`; light `#607258`, dark `#9fb48e`): informational states and secondary chart series.
- **Brass Signal** (`--chart-3`; light `#a46f2c`, dark `#d6a35a`): due-soon, warning, and schedule emphasis.
- **Saddle Brown Signal** (`--chart-4`; light `#7b4f2f`, dark `#d58e67`): readable foreground partner for brass warning surfaces and secondary data.
- **Red Clay** (`--destructive`; light `#9c423a`, dark `#f0b9b2`): destructive actions, overdue states, and errors only.

### Neutral

- **Oat Canvas** (`--background`; light `#e7dfd0`, dark `#20231f`): the page canvas and start of the fixed background gradient.
- **Near-Black Ink** (`--foreground`; light `#1b1915`, dark `#f3eee4`): primary reading color.
- **Ledger Paper** (`--card`; light `#fcfaf4`, dark `#2b2d27`): the clearest content surface and main card plane.
- **Field Surface** (`--surface`; light `#eee7da`, dark `#252922`): broad soft bands, header and footer chrome, and lower-emphasis sections.
- **Pressed Oat** (`--surface-muted`; light `#e2d8c7`, dark `#34382f`): segmented controls and grouped inset regions.
- **Raised Paper** (`--surface-elevated`; light `#f4efe6`, dark `#373a32`): controls, rows, active tabs, and nested working surfaces.
- **Muted Paper** (`--muted`; light `#e9e0d3`, dark `#32352e`): disabled and quiet fills.
- **Weathered Ink** (`--muted-foreground`; light `#565047`, dark `#c2baa9`): descriptions, metadata, captions, and secondary labels. It remains visibly secondary while keeping small text crisp on every paper surface.
- **Wood Rail** (`--border`; light `#b9aa93`, dark `#665f52`): structural outlines and dividers.
- **Dark Leather Input** (`--input`; light `#9f8f76`, dark `#817768`): high-visibility input and dark-mode control borders.
- **Sidebar Paper** (`--sidebar`; light `#e9dfce`, dark `#1c1f1b`): navigation-adjacent background when a sidebar surface is needed.

### Named Rules

**The Warm Paper Rule.** Build hierarchy with Oat Canvas, Field Surface, Ledger Paper, Pressed Oat, and Raised Paper; plain white and generic cool grey are not default surfaces.

**The Working Green Rule.** Stable Green signals action, selection, focus, or a deliberately branded region. A full green component border communicates interactivity, so static cards keep Wood Rail boundaries and place green inside their hierarchy instead.

**The Reference Surface Rule.** Common non-interactive reference groups use Ledger Paper, a Wood Rail border, Stable Green headings and labels, and Near-Black values. This separates the content without competing with primary controls.

**The Quiet Green Rule.** Reserve Quiet Green for rare urgent handover or emergency callouts, pair it only with its inverse foreground tokens, and do not use it for common reference groups or ordinary record lists.

**The Semantic Rail Rule.** Use four-pixel left rails on repeated records only when they communicate a real type, urgency, selection, or status distinction. Ordinary upcoming records keep the neutral Wood Rail boundary; they do not receive a decorative Stable Green rail.

**The Earned Label Rule.** Do not add eyebrows above headings. Badges, tags, and compact labels appear only when they communicate an actionable state, access constraint, selection, necessary mixed-record kind, or a count that changes a decision. Put ordinary facts in metadata or body copy, and remove repeated category, plan, or status chips when the surrounding context already explains them.

## Typography

**Display Font:** self-hosted Barlow Condensed, with Arial Narrow and sans-serif fallbacks

**Body Font:** self-hosted Manrope Variable, with system sans-serif fallbacks

**Brand Font:** Georgia, with Times New Roman and serif fallbacks

**Label/Mono Font:** Manrope for labels; Geist Mono Variable for identifiers and technical reference

**Character:** Barlow Condensed gives dry operational pages a confident, purpose-built noticeboard headline, while Manrope keeps records, descriptions, and controls calm and highly legible. Georgia appears only in the wordmark and rare editorial accents; Geist Mono is reserved for dates, identifiers, tokens, and technical values. Product copy does not drop below `12px`; smaller dimensions are reserved for non-text geometry.

### Hierarchy

- **Hero Display** (700, `48px` → `60px` at `640px` → `72px` at `1024px`, `0.96` line-height, `-0.015em` tracking): uppercase hero statements only.
- **Page Headline** (700, `36px` → `48px` at `640px`, `0.96` line-height, `-0.015em` tracking): route titles and major destinations.
- **Section Headline** (700, `30px` → `36px` at `640px`, `0.96` line-height, `-0.015em` tracking): major sections and grouped work areas.
- **Panel Title** (700, `24px` → `30px` at `640px`, `0.96` line-height, `-0.015em` tracking): titled cards and important panels.
- **Nested Heading** (700, `18px`, `1` line-height, `-0.01em` tracking): inset surfaces and compact internal groups.
- **Record Title** (600, `18px`, `1.375` line-height): important row titles; dense records use medium `16px`.
- **Body** (400, `14px`, `24px` line-height): everyday record copy and explanations; prominent descriptions use semibold `16px` with a `28px` line-height.
- **Control** (500–600, `14px`, `20px` line-height): inputs and actions.
- **Label** (500–700, `12px`–`14px`, subtle positive tracking): uppercase metadata and compact interface labels.
- **Wordmark** (700, `24px`, `1` line-height): Paddock Pilot brand text only.

### Named Rules

**The Noticeboard Headline Rule.** Use condensed black uppercase type for display hierarchy, not for paragraphs, form labels, or ordinary record titles.

**The Natural Copy Rule.** Product copy and data remain in natural case with neutral letter spacing; uppercase is a compact label or display treatment, never a substitute for hierarchy.

**The Detail Fact Rule.** Core reference facts use a `14px` semibold label with strong secondary contrast and a `16px` value in the shared `DetailField` readable treatment. Reserve the smaller muted label role for supporting metadata, and group related facts in one panel instead of turning each value into a separate metric card.

## Layout

The application uses a full-height header/main/footer shell. Content sits in a centered wrapper capped at `90rem` with a minimum `1rem` gutter on each side; the main area is a twelve-column grid. Standard dashboard pages use `24px` vertical gaps, compact pages use `16px`, and loose compositions use `32px`.

Panels follow a consistent `16px`–`32px` rhythm. Cards commonly use `24px` internal padding, hero and major section surfaces use `20px`–`28px`, record rows use `16px` or `20px`, and nested panel stacks use `8px`–`16px` gaps. Prefer the named gap and layout props in the shared dashboard primitives over route-local spacing recipes.

Responsive behavior is mobile-first. At `640px`, action rows, two-column forms, and header groups gain horizontal structure; at `768px`, the centered default content width occupies eight of twelve columns; at `1024px`, two- and three-column operational grids appear; at `1280px`, sidebar, command-center, and four-column layouts activate. Dense screens keep their proven information structure and collapse grids before reducing legibility.

**The Shared Rhythm Rule.** Start with `16px`, `24px`, or `32px` gaps and `16px`, `20px`, or `24px` padding; introduce a new measurement only when the component has a real geometric constraint.

**The Work Before Ornament Rule.** Preserve scannable record order, labels, actions, and responsive collapse before adding editorial asymmetry or imagery.

## Elevation & Depth

The system is flat and layered. The normative control, surface, and panel shadow tokens are all `none`; depth comes from changing paper tones, one-pixel rails, inset surfaces, sticky chrome, and occasional backdrop blur. Cards remain flat at rest. Menus, dialogs, and tooltips gain precedence through z-order, borders, contrast, short scale/fade transitions, and a restrained translucent overlay rather than ambient drop shadows.

### Shadow Vocabulary

- **Control** (`box-shadow: none`): buttons, fields, badges, tabs, menus, and tooltips.
- **Surface** (`box-shadow: none`): rows and inset working surfaces.
- **Panel** (`box-shadow: none`): cards, heroes, and section containers.

### Named Rules

**The Flat-But-Layered Rule.** Separate planes with color, borders, and structure; do not add a shadow to make a component feel finished.

**The Overlay Exception Rule.** Transient surfaces may use backdrop blur, z-order, and `100ms`–`350ms` fade/scale motion, but they keep the same bordered paper construction.

## Shapes

The form language uses small, deliberate curves and hard-working edges. Controls use a `6px` radius, rows use `8px`, and panels use `12px`. Larger `16px`, `20px`, and `24px` radii exist for rare oversized compositions, not ordinary cards. Borders are normally one pixel; semantic record rails are four pixels.

Circles are functional exceptions: count badges, compact icon targets, switches, calendar indicators, and the floating action button. Full pills should not spread into cards, navigation containers, or ordinary text controls.

**The Small-Corner Rule.** Default to `6px` controls, `8px` rows, and `12px` panels; large soft cards and excessive pill geometry do not belong to the incumbent system.

## Components

Components should feel tactile, friendly, and workmanlike: compact enough for real yard data, warm enough to invite use, and explicit enough to make state unmistakable.

### Buttons

- **Shape:** gently squared control radius (`6px`), one-pixel border, semibold `14px` label, and no shadow.
- **Primary:** Ledger Paper with a Stable Green border and label, `40px` default height, and `16px` horizontal padding; hover adds a `10%` green wash. This is the normal primary action treatment across application pages.
- **Solid emphasis:** Stable Green with Primary Ink; reserve it for rare conversion or floating create actions where the hierarchy genuinely needs one stronger control.
- **Neutral outline:** Raised Paper with Wood Rail and Near-Black Ink; hover shifts the rail to Stable Green and adds an `8%` green wash.
- **Secondary:** Saddle Leather with Near-Black Ink; use for supporting but visible actions.
- **Ghost / Subtle:** transparent at rest and gain an `8%` green wash on hover; subtle begins in Weathered Ink.
- **Destructive:** a `10%` Red Clay wash and clay text, never a full alarming block by default.
- **Focus:** Stable Green border plus a two-pixel `25%` ring. Disabled controls keep their geometry and reduce opacity to `50%`.
- **Action icons:** controls that open add/create forms use the shared plus icon, controls that open edit forms use the shared pen icon, and delete/remove controls use the shared trash icon. Declare these through `Button` or `ButtonLink`'s semantic `action` prop so size, weight, order, and accessibility stay canonical. Ordinary navigation and form submit buttons do not inherit an icon merely from their label.

**The Action-Verb Icon Rule.** Use `action="create"`, `action="edit"`, or `action="delete"` at the control’s canonical owner; do not hand-place competing action icons in feature code.

**The Destructive Record Rule.** Route ordinary record removal through `RecordRemoveAction` so users see the object, consequence, pending state, and a safe cancel path before deletion. Keep the dialog open after a failed mutation so the action can be retried.

### Chips

- **Style:** compact `24px` semantic badges with a `6px` radius, semibold `12px` labels, and role-specific fills or borders.
- **State:** Stable Green is primary or successful, Saddle Leather is secondary, Brass Signal is warning, Olive Signal is informational, Pressed Oat is neutral, and Red Clay is destructive.
- **Special shapes:** only numeric count badges are circular; micro timeline tags shrink to `16px` high.
- **Purpose:** reserve badges for attention, exceptional state, access, selection, or one necessary kind label in a mixed-record list. Ordinary facts such as type, category, dosage, frequency, shoeing, stable name, and horse name belong in metadata or labelled detail fields.
- **Density:** omit routine `planned`, `pending`, `active`, `low`, and `medium` chips when the surrounding context already establishes them. An ordinary record should rarely exceed one kind badge plus one exceptional-state badge.

**The Metadata-Before-Badge Rule.** If removing a chip would not hide an action, exception, permission, or cross-record distinction, render the value as metadata instead.

### Cards / Containers

- **Corner Style:** panels use `12px`; rows use `8px`.
- **Background:** Ledger Paper for clear cards, Field Surface for broad soft bands, Raised Paper for nested work, and Pressed Oat for segmented groups.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** one-pixel Wood Rail or the mode-aware subtle rail; strong panels use the full rail.
- **Internal Padding:** `24px` for canonical cards, `20px`–`28px` for sections and heroes, and `16px`/`20px` for compact/comfortable record rows.
- **Responsive records:** exceptional badges stay near the top edge before long copy, while footer actions wrap at the bottom-right rather than hiding in a horizontal strip.
- **Reference groups:** Ledger Paper with a Wood Rail border; use Stable Green for the title and labels while values remain Near-Black. Do not use a green outer border on static information.
- **Document rows:** use the canonical bordered record surface with a `16px` filename and Near-Black note text. Reserve Weathered Ink for compact format, type, size, added date, and linked-record metadata; document rows do not use borderless soft chrome. File availability comes from the backend’s explicit available, unavailable, or metadata-only state rather than being inferred from a missing URL. Available files expose distinct Open and Download actions to every viewer: Open uses quiet ghost chrome for optional preview, while the canonical green-bordered `DocumentDownloadAction` is the primary file action, preserves the filename, prevents duplicate requests, reports pending state without changing width, and provides recoverable failure feedback. Keep Download directly before the tinted destructive Remove action on every row. Missing or unavailable files retain the same disabled Download slot and expose the reason through the shared Tooltip rather than collapsing into a delete-only action area or relying on a native title. Record-management permission controls removal, not file access.

### Inputs / Fields

- **Style:** `40px` high, Raised Paper fill, a stronger leather-toned input rail, `6px` radius, medium `14px` text, and `12px` horizontal padding.
- **Focus:** Stable Green border and a two-pixel `25%` green ring.
- **Hover:** a quieter `30%` primary border shift; picker icons add an `18%` green circular wash.
- **Error / Disabled:** errors use Red Clay border and ring; disabled fields switch to Pressed Oat and `60%` opacity.

### Navigation

- **Style:** a sticky Field Surface header with a subtle bottom rail and restrained backdrop blur. The Georgia wordmark supplies the friendly identity; navigation itself uses compact ghost buttons.
- **Active:** a `10%` Stable Green wash with Near-Black Ink; hover uses `8%`.
- **Responsive:** navigation wraps into a full-width third row on small screens, then returns inline at `640px`.

### Record Cards

- **Style:** Raised Paper rows with `8px` corners, one-pixel rails, `16px` or `20px` padding, semibold titles, readable `24px` body line-height, and compact metadata.
- **Semantic accent:** optional four-pixel left rails use Stable Green, Brass Signal, Red Clay, or muted ink.
- **Interactive:** hover adjusts border and surface rather than lifting the card; selected rows add a `10%` green wash and a one-pixel `25%` ring.

### Tabs and Segmented Controls

- **Style:** Pressed Oat group surface with `12px` outer corners and `6px` tab corners.
- **Active:** Raised Paper, a visible rail, Near-Black Ink, and no shadow.
- **Section tabs:** condensed black uppercase labels are allowed when tabs represent major page sections; compact mode switches remain in Manrope.
- **Entity detail navigation:** keep identity and status in the header, then place persistent route tabs on a separate rail below. Preserve one-line order with horizontal overflow on narrow and zoomed layouts instead of wrapping tabs into competing rows.

### Dialogs and Overlays

- **Style:** strong bordered Ledger Paper/Popover surface, `12px` corners, `20px` padding, `24px` semibold title, and no shadow.
- **Long forms:** keep the submit row visible with the canonical sticky `FormSubmitActions` treatment when a dialog body must scroll; do not create feature-local modal footers.
- **Backdrop:** `15%` foreground tint with a very light blur where supported.
- **Motion:** `100ms` fade and `95%` scale transition; respect reduced-motion settings.

## Do's and Don'ts

### Do:

- **Do** use the shared semantic tokens and primitives so light and dark modes preserve the same hierarchy.
- **Do** make routine events and records attractive through display hierarchy, warm surfaces, concise metadata, and meaningful semantic rails.
- **Do** preserve dense, scannable information structure and responsive collapse before adding expression.
- **Do** use contextual horse and yard photography sparingly where it helps users understand place, animal, or workflow.
- **Do** keep interactions legible with visible hover, focus, selected, disabled, error, loading, and reduced-motion states.

### Don't:

- **Don't** replace the warm paper system with plain white cards, cool-grey SaaS chrome, gradients used as decoration, or arbitrary new hues.
- **Don't** add ambient card shadows, glassmorphism, oversized soft corners, or pills where a compact control or row belongs.
- **Don't** turn horse-world character into antique styling, decorative tack motifs, or visual clutter that competes with the records.
- **Don't** use condensed uppercase display type for paragraphs, field labels, ordinary record titles, or long navigation strings.
- **Don't** fabricate local button, card, field, badge, tab, filter, or record-row recipes when a canonical primitive already owns the pattern.
