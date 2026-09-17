---
name: Paddock Pilot — Field journal landing
description: A warm country editorial design for the signed-out home page.
colors:
  evergreen: "#263f30"
  paper: "#f7f1e5"
  supporting-copy: "#4e5547"
  rule: "#c8caba"
  clay: "#aa563e"
  evergreen-hover: "#3f5842"
  reverse-copy: "#e1e3ce"
  selection: "#d8be96"
typography:
  display:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: "clamp(52px, 5.4vw, 88px)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: "clamp(43px, 4.5vw, 66px)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: "36px"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "18px"
    lineHeight: 1.8
  control:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  control: "4px"
components:
  button-primary:
    backgroundColor: "{colors.evergreen}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "15px 24px"
  button-primary-hover:
    backgroundColor: "{colors.evergreen-hover}"
  button-small:
    backgroundColor: "{colors.evergreen}"
    textColor: "{colors.paper}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "11px 19px"
---

# Design System: Paddock Pilot — Field journal landing

## Scope and direction

The signed-out `/` page uses warm paper, evergreen, a characterful serif and countryside photography. The revised composition opens with a full-width photographic hero, presents the product in a second full-viewport green section, and closes with a simple invitation. There are no sun marks or decorative ornaments.

This is a **public-landing-only** record of [PublicLandingPage.tsx](../../../src/components/landing/PublicLandingPage.tsx), [CountryLandingHero.tsx](../../../src/components/landing/CountryLandingHero.tsx) and [countryLanding.css](../../../src/components/landing/countryLanding.css). It does not change the root design system or authenticated application. The retained `open-yard` comparison route is outside the delivered composition described here.

## Palette and typography

The frontmatter records the implemented palette and desktop type roles. Paper is the page ground and reverse text; evergreen anchors headings, ordinary primary actions and the product section. Supporting copy and rules use muted green neutrals. Clay remains a focus and visit-toggle hover accent. The overlay header wordmark, including its desktop dot, uses paper.

The hero and overlay header reverse primary buttons to paper with evergreen text; their hover fill is `#e7e8d8` and focus outline is paper. Other primary buttons use evergreen with paper text and `#3f5842` on hover. The landing explicitly sets `color-scheme: light` and keeps its variables local.

Fraunces Country supplies display and section headings; the existing Manrope Variable supplies body copy, navigation and record details. The hero uses three block spans on desktop, with `clamp(52px, 5.4vw, 88px)` type at 1.06 line height. Tablet uses 64px. Below 700px, the spans flow inline with `clamp(43px, 11vw, 66px)` type at 1.08. Shared-care and closing headings use the same `clamp(43px, 4.5vw, 66px)` scale and 1.1 line height, becoming 43px on mobile.

Hero copy is 17px/1.8 with a 38ch measure, becoming 16px and 35ch on mobile. Shared-care and closing copy is 18px/1.8, becoming 16px on mobile. The product's care heading is 36px, becoming 29px; visit controls and dates are 15px, the visit title is 19px, and the note is 16px (15px on mobile). The “Example” truth label is 12px. Dates use tabular numerals.

### Font provenance

The self-hosted Latin WOFF2 lives in [public/fonts/fraunces](../../../public/fonts/fraunces/README.md). Its README credits Phaedra Charles and Flavia Zimbardi / Undercase Type, records the Google Fonts download on 2026-09-17, and preserves the stylesheet and binary source URLs. The bundled [SIL Open Font License 1.1](../../../public/fonts/fraunces/OFL.txt) accompanies it. The README records optical-size and weight axes, softness 50 and wonk 1. CSS exposes normal weights 400–700 and uses `font-display: swap`. Manrope is reused from the application.

## Layout and reading order

One shared inner grid aligns the header, hero text, section containers and footer: `width: min(calc(100% - 2 * var(--country-gutter)), 1280px)`, with a gutter of `clamp(22px, 5vw, 96px)`. “Good care is / a shared effort.” and “Make yourself / at home.” occupy the same left column and share its left edge. Their desktop section grid uses `1.2fr 1fr` columns with a 10% gap (6% on tablet), stacking below 700px.

1. **Immersive opening.** The hero is at least `100svh`, with a 720px desktop minimum and 700px mobile minimum. The photograph covers the entire section behind HTML text. A dark green horizontal gradient supports paper text; mobile uses a uniform dark overlay. The header sits absolutely over the hero with its own fading green background. The promise, short explanation and account action form a single vertical sequence. No product record appears in this opening.
2. **Shared care and product.** The full-width evergreen section is also at least `100svh`, with vertically centered content and `clamp(64px, 7vw, 112px)` padding (58px on mobile). Its heading and supporting paragraph precede a paper product representation. A simple “Paddock Pilot / Horses / Juniper” bar introduces a horse profile and an interactive care record. The profile and record use `0.7fr 1.3fr` columns on desktop and stack on mobile, where the profile becomes a compact horizontal row.
3. **Closing invitation.** The paper section uses the shared heading grid and 104px vertical padding (64px on mobile). The exact supporting copy is: **“Create your stable, add your horse and invite your friends.”** An account action follows. There is no testing or payment reassurance copy.

The compact footer follows with copyright, “Plans” and “Sign in”. Signup routes remain `/sign-up/$`, sign-in routes `/sign-in/$`, and “Plans” links to `/pricing`. On mobile, the header keeps its actions in one row and stacks the wordmark words.

## Components and interaction

**Actions and navigation.** Primary actions have 4px corners, a 54px minimum height and an inline arrow; the compact header action has a 44px minimum height. Hover changes fill and lifts the action by 2px, with 180ms ease-out transitions. Text links have 44px minimum height and underline on hover. Keyboard focus uses a 2px outline with 5px offset. A keyboard-revealed “Skip to content” link targets the main landmark.

**Product representation.** One paper panel with 12px corners and a thin header divider contains the example, without shadows or nested cards. The horse profile shows only the portrait, without an age or breed caption. The care record remains readable HTML. Its figure heading “Juniper’s care” retains “Example” to identify fictional data; decorative eyebrows, audience labels and redundant “Provider” or “Notes” sublabels are absent.

**Care example.** Two native buttons in an accessible group switch “Planned” and “Completed”, exposing selection through `aria-pressed`; Completed is initial. The visit title and time remain visible. Planned shows “Sam Taylor, farrier.”; Completed shows “Trim completed. Next visit to be arranged.” and a completed icon. The note is a polite, atomic live region. Toggles have 44px minimum height, a 2px selected underline, and 160ms ease-out color/border transitions. This is local React state with no writes to real records.

**Motion.** There is no looping animation. Reduced-motion preference disables transitions and smooth scrolling; the hover translation becomes an immediate state change. No new inputs, dialogs, pricing cards or FAQ components are implemented.

## Photography and depth

The full-width hero reuses the repository's `field-office-panorama` JPEGs from [public/landing-lab](../../../public/landing-lab), in 480px, 960px and 1600px variants. Responsive sources use `sizes="100vw"`, high fetch priority and asynchronous decoding. The alt text describes a chestnut horse looking over a stable gate in evening light. The image uses `object-fit: cover`, positioned at 65% horizontally on desktop and 68% on mobile. It has no arched frame; text is layered over it with a contrast overlay.

The product profile uses generated `juniper-palomino` JPEGs in 480×384px and 960×768px variants, lazy-loaded with descriptive alt text. Its centered desktop crop is up to 300px wide and 240px high, with 4px corners. Mobile uses a centered 90px square. Both crops keep the ears and muzzle visible. The original generated PNG and the built-in generation prompt are saved in [assets/juniper-palomino.md](assets/juniper-palomino.md).

External photographer credits, original acquisition source and license for the unchanged hero photograph are **not established by the inspected repository records**. Juniper’s replacement profile portrait was generated using the built-in image-generation tool on 2026-09-17 at the user’s request; its provenance is recorded separately. Supplied moodboard imagery remains reference material, not published artwork.

Depth comes from the immersive photograph, green color field, paper product panel and thin rules. The landing defines no box shadows, suns, stamps, paper texture, rope borders or decorative icon grids.

## Implementation guardrails

- Keep styles and tokens scoped to the public landing; preserve the shared 1280px grid and aligned narrative headings.
- Keep the photographic opening and full-viewport product section in that order, with readable product details and accessible visit controls.
- Preserve the exact closing copy and “Example” truth label; do not restore removed ornaments, decorative labels or testing/payment copy.
- Preserve font attribution and its bundled license. Do not invent product capabilities, customer proof or asset provenance.

This is a code-based design record, not an accessibility certification or a substitute for browser validation.
