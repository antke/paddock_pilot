---
name: Paddock Pilot
description: A tactile, friendly field-office system for clear small-yard coordination.
colors:
  stable-green: "#203f2d"
  primary-ink: "#fff8e8"
  oat-canvas: "#e4d5be"
  near-black-ink: "#15110d"
  ledger-paper: "#fff9ed"
  ledger-paper-ink: "#15110d"
  saddle-leather: "#ead2ad"
  muted-paper: "#efe1c8"
  weathered-ink: "#5b5145"
  sage-wash: "#d7ddc8"
  red-clay: "#8e392f"
  red-clay-ink: "#fff8e8"
  wood-rail: "#b69d75"
  dark-leather-input: "#876f4d"
  field-surface: "#f1dfc3"
  pressed-oat: "#e0cfb5"
  raised-paper: "#f6ead4"
  olive-signal: "#68713d"
  brass-signal: "#ad792c"
  saddle-brown-signal: "#835225"
  sidebar-paper: "#f3e3ca"
  night-oak: "#30271f"
  warm-night-ink: "#f8eddb"
  night-card: "#3a2f24"
  night-card-ink: "#fff6e6"
  green-ink: "#18251b"
  night-saddle: "#5b432e"
  night-muted: "#443627"
  night-muted-ink: "#d1bd9c"
  night-sage: "#4c5130"
  pale-clay: "#edc9be"
  deep-clay-ink: "#351713"
  light-olive: "#aeb47a"
  bright-brass: "#c89642"
  warm-copper: "#d39a61"
  night-sidebar: "#2b241d"
  night-sidebar-rail: "#6f573b"
  night-surface: "#362b22"
  night-raised-paper: "#47382a"
typography:
  scale:
    micro-62: "0.62rem"
    micro-625: "0.625rem"
    micro-10: "10px"
    micro-68: "0.68rem"
    micro-70: "0.7rem"
    micro-72: "0.72rem"
    xs: "0.75rem"
    sm: "0.875rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
    3xl: "1.875rem"
    4xl: "2.25rem"
    5xl: "3rem"
    6xl: "3.75rem"
    7xl: "4.5rem"
  display:
    fontFamily: "Arial Black, Avenir Next Condensed, Helvetica Neue Condensed, Impact, sans-serif"
    fontSize: "3rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "normal"
  headline:
    fontFamily: "Arial Black, Avenir Next Condensed, Helvetica Neue Condensed, Impact, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "normal"
  title:
    fontFamily: "Arial Black, Avenir Next Condensed, Helvetica Neue Condensed, Impact, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  control:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
  action:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "normal"
  wordmark:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  mono:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.667
    letterSpacing: "normal"
rounded:
  compact: "2px"
  control: "4px"
  row: "6px"
  panel: "10px"
  large: "14px"
  xlarge: "18px"
  xxlarge: "22px"
  pill: "9999px"
spacing:
  micro: "4px"
  tight: "8px"
  compact: "12px"
  standard: "16px"
  roomy: "20px"
  comfortable: "24px"
  loose: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.stable-green}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.saddle-leather}"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "40px"
  badge-primary:
    backgroundColor: "{colors.stable-green}"
    textColor: "{colors.primary-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "2px 10px"
    height: "24px"
  input:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "6px 12px"
    height: "36px"
  card:
    backgroundColor: "{colors.ledger-paper}"
    textColor: "{colors.ledger-paper-ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  record-row:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.ledger-paper-ink}"
    rounded: "{rounded.row}"
    padding: "20px"
  tab-active:
    backgroundColor: "{colors.raised-paper}"
    textColor: "{colors.near-black-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "40px"
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

- **Stable Green** (`--primary`; light `#203f2d`, dark `#d7ddc8`): primary actions, selected states, focus treatment, positive status, and the occasional full brand surface.
- **Primary Ink** (`--primary-foreground`; light `#fff8e8`, dark `#18251b`): text and icons placed on Stable Green.

### Secondary

- **Saddle Leather** (`--secondary`; light `#ead2ad`, dark `#5b432e`): warm secondary actions, filter chips, and supporting emphasis.
- **Sage Wash** (`--accent`; light `#d7ddc8`, dark `#4c5130`): quiet horse-world adjacency and low-intensity contextual emphasis.
- **Olive Signal** (`--chart-2`; light `#68713d`, dark `#aeb47a`): informational states and secondary chart series.
- **Brass Signal** (`--chart-3`; light `#ad792c`, dark `#c89642`): due-soon, warning, and schedule emphasis.
- **Saddle Brown Signal** (`--chart-4`; light `#835225`, dark `#d39a61`): readable foreground partner for brass warning surfaces and secondary data.
- **Red Clay** (`--destructive`; light `#8e392f`, dark `#edc9be`): destructive actions, overdue states, and errors only.

### Neutral

- **Oat Canvas** (`--background`; light `#e4d5be`, dark `#30271f`): the page canvas and start of the fixed background gradient.
- **Near-Black Ink** (`--foreground`; light `#15110d`, dark `#f8eddb`): primary reading color.
- **Ledger Paper** (`--card`; light `#fff9ed`, dark `#3a2f24`): the clearest content surface and main card plane.
- **Field Surface** (`--surface`; light `#f1dfc3`, dark `#362b22`): broad soft bands, header and footer chrome, and lower-emphasis sections.
- **Pressed Oat** (`--surface-muted`; light `#e0cfb5`, dark `#443627`): segmented controls and grouped inset regions.
- **Raised Paper** (`--surface-elevated`; light `#f6ead4`, dark `#47382a`): controls, rows, active tabs, and nested working surfaces.
- **Muted Paper** (`--muted`; light `#efe1c8`, dark `#443627`): disabled and quiet fills.
- **Weathered Ink** (`--muted-foreground`; light `#5b5145`, dark `#d1bd9c`): descriptions, metadata, captions, and secondary labels.
- **Wood Rail** (`--border`; light `#b69d75`, dark `#876f4d`): structural outlines and dividers.
- **Dark Leather Input** (`--input`; light `#876f4d`, dark `#b69d75`): high-visibility input and dark-mode control borders.
- **Sidebar Paper** (`--sidebar`; light `#f3e3ca`, dark `#2b241d`): navigation-adjacent background when a sidebar surface is needed.

### Named Rules

**The Warm Paper Rule.** Build hierarchy with Oat Canvas, Field Surface, Ledger Paper, Pressed Oat, and Raised Paper; plain white and generic cool grey are not default surfaces.

**The Working Green Rule.** Stable Green signals action, selection, focus, or a deliberately branded region; it is not a filler color for arbitrary containers.

**The Semantic Rail Rule.** Use four-pixel left rails on repeated records to communicate primary, warning, danger, or muted meaning without flooding the whole card with color.

## Typography

**Display Font:** Arial Black, with Avenir Next Condensed, Helvetica Neue Condensed, Impact, and sans-serif fallbacks  
**Body Font:** Manrope, with system sans-serif fallbacks  
**Brand Font:** Georgia, with Times New Roman and serif fallbacks  
**Label/Mono Font:** Manrope for labels; Geist Mono Variable for identifiers and technical reference

**Character:** Condensed black display type gives dry operational pages a confident noticeboard headline, while Manrope keeps records, descriptions, and controls calm and highly legible. Georgia appears only in the wordmark and rare editorial accents; Geist Mono is reserved for dates, identifiers, tokens, and technical values.

### Hierarchy

- **Hero Display** (900, `48px` → `60px` at `640px` → `72px` at `1024px`, `0.92` line-height): uppercase hero statements only.
- **Page Headline** (900, `36px` → `48px` at `640px`, `0.92` line-height): route titles and major destinations.
- **Section Headline** (900, `30px` → `36px` at `640px`, `0.92` line-height): major sections and grouped work areas.
- **Panel Title** (900, `24px` → `30px` at `640px`, `0.92` line-height): titled cards and important panels.
- **Nested Heading** (900, `18px`, `0.95` line-height): inset surfaces and compact internal groups.
- **Record Title** (600, `18px`, `1.375` line-height): important row titles; dense records use medium `16px`.
- **Body** (400, `14px`, `24px` line-height): everyday record copy and explanations; prominent descriptions use semibold `16px` with a `28px` line-height.
- **Control** (500–700, `14px`, `20px` line-height): inputs and actions.
- **Label** (500–900, `10px`–`14px`, normal tracking): uppercase metadata, eyebrows, and compact interface labels.
- **Wordmark** (700, `24px`, `1` line-height): Paddock Pilot brand text only.

### Named Rules

**The Noticeboard Headline Rule.** Use condensed black uppercase type for display hierarchy, not for paragraphs, form labels, or ordinary record titles.

**The Natural Copy Rule.** Product copy and data remain in natural case with neutral letter spacing; uppercase is a compact label or display treatment, never a substitute for hierarchy.

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

The form language uses small, deliberate curves and hard-working edges. Controls use a `4px` radius, rows use `6px`, and panels use `10px`. Larger `14px`, `18px`, and `22px` radii exist for rare oversized compositions, not ordinary cards. Borders are normally one pixel; semantic record rails are four pixels.

Circles are functional exceptions: count badges, compact icon targets, switches, calendar indicators, and the floating action button. Full pills should not spread into cards, navigation containers, or ordinary text controls.

**The Small-Corner Rule.** Default to `4px` controls, `6px` rows, and `10px` panels; large soft cards and excessive pill geometry do not belong to the incumbent system.

## Components

Components should feel tactile, friendly, and workmanlike: compact enough for real yard data, warm enough to invite use, and explicit enough to make state unmistakable.

### Buttons

- **Shape:** gently squared control radius (`4px`), one-pixel border, bold `14px` label, and no shadow.
- **Primary:** Stable Green with Primary Ink, `40px` default height, and `16px` horizontal padding; hover darkens the fill to `90%` opacity.
- **Outline:** Raised Paper with Wood Rail and Near-Black Ink; hover shifts the rail to Stable Green and adds an `8%` green wash.
- **Secondary:** Saddle Leather with Near-Black Ink; use for supporting but visible actions.
- **Ghost / Subtle:** transparent at rest and gain an `8%` green wash on hover; subtle begins in Weathered Ink.
- **Destructive:** a `10%` Red Clay wash and clay text, never a full alarming block by default.
- **Focus:** Stable Green border plus a two-pixel `25%` ring. Disabled controls keep their geometry and reduce opacity to `50%`.

### Chips

- **Style:** compact `24px` semantic badges with a `4px` radius, semibold `12px` labels, and role-specific fills or borders.
- **State:** Stable Green is primary or successful, Saddle Leather is secondary, Brass Signal is warning, Olive Signal is informational, Pressed Oat is neutral, and Red Clay is destructive.
- **Special shapes:** only numeric count badges are circular; micro timeline tags shrink to `16px` high.

### Cards / Containers

- **Corner Style:** panels use `10px`; rows use `6px`.
- **Background:** Ledger Paper for clear cards, Field Surface for broad soft bands, Raised Paper for nested work, and Pressed Oat for segmented groups.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** one-pixel Wood Rail or the mode-aware subtle rail; strong panels use the full rail.
- **Internal Padding:** `24px` for canonical cards, `20px`–`28px` for sections and heroes, and `16px`/`20px` for compact/comfortable record rows.

### Inputs / Fields

- **Style:** `36px` high, Raised Paper fill, Wood Rail border, `4px` radius, medium `14px` text, and `12px` horizontal padding.
- **Focus:** Stable Green border and a two-pixel `25%` green ring.
- **Hover:** a quieter `30%` primary border shift; picker icons add an `18%` green circular wash.
- **Error / Disabled:** errors use Red Clay border and ring; disabled fields switch to Pressed Oat and `60%` opacity.

### Navigation

- **Style:** a sticky Field Surface header with a subtle bottom rail and restrained backdrop blur. The Georgia wordmark supplies the friendly identity; navigation itself uses compact ghost buttons.
- **Active:** a `10%` Stable Green wash with Near-Black Ink; hover uses `8%`.
- **Responsive:** navigation wraps into a full-width third row on small screens, then returns inline at `640px`.

### Record Cards

- **Style:** Raised Paper rows with `6px` corners, one-pixel rails, `16px` or `20px` padding, semibold titles, readable `24px` body line-height, and compact metadata.
- **Semantic accent:** optional four-pixel left rails use Stable Green, Brass Signal, Red Clay, or muted ink.
- **Interactive:** hover adjusts border and surface rather than lifting the card; selected rows add a `10%` green wash and a one-pixel `25%` ring.

### Tabs and Segmented Controls

- **Style:** Pressed Oat group surface with `10px` outer corners and `4px` tab corners.
- **Active:** Raised Paper, a visible rail, Near-Black Ink, and no shadow.
- **Section tabs:** condensed black uppercase labels are allowed when tabs represent major page sections; compact mode switches remain in Manrope.

### Dialogs and Overlays

- **Style:** strong bordered Ledger Paper/Popover surface, `10px` corners, `20px` padding, `24px` semibold title, and no shadow.
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
