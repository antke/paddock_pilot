---
name: Paddock Pilot — Field journal landing
description: A warm country editorial design for the signed-out home page.
colors:
  evergreen: '#263f30'
  paper: '#f7f1e5'
  supporting-copy: '#4e5547'
  rule: '#c8caba'
  clay: '#aa563e'
  wash: '#e7e8d8'
  straw: '#d8be96'
  evergreen-hover: '#3f5842'
  reverse-copy: '#e1e3ce'
  selection: '#d8be96'
typography:
  display:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: 'clamp(46px, 4.7vw, 74px)'
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: '-0.03em'
  headline:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: 'clamp(40px, 4.5vw, 66px)'
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: '-0.03em'
  title:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: '36px'
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: '18px'
    lineHeight: 1.8
  control:
    fontFamily: "'Manrope Variable', sans-serif"
    fontSize: '14px'
    fontWeight: 600
    lineHeight: 1.4
rounded:
  control: '4px'
components:
  button-primary:
    backgroundColor: '{colors.evergreen}'
    textColor: '{colors.paper}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '15px 24px'
  button-primary-hover:
    backgroundColor: '{colors.evergreen-hover}'
  account-action:
    backgroundColor: 'transparent'
    textColor: '{colors.evergreen}'
    typography: '{typography.control}'
    rounded: '{rounded.control}'
    padding: '10px 18px'
---

# Design System: Paddock Pilot — Field journal landing

## Scope and direction

The signed-out `/` page uses warm paper, evergreen, a characterful serif and countryside photography. It sells one idea: get rid of the whiteboard and the group chat. A photographic band gives way to a paper sheet carrying the promise, an evergreen section tidies the yard's notes, and the page closes on evergreen with an invitation. There are no sun marks or decorative ornaments.

This is a **public-landing-only** record of [PublicLandingPage.tsx](../../../src/components/landing/PublicLandingPage.tsx), [publicLanding.css](../../../src/components/landing/publicLanding.css), the shared chrome in [CountryLandingHero.tsx](../../../src/components/landing/CountryLandingHero.tsx) and [countryLanding.css](../../../src/components/landing/countryLanding.css). Its copy lives in `publicLanding.en.ts` and `publicLanding.pl.ts`. It does not change the root design system or authenticated application. The retained `open-yard` comparison route is outside the delivered composition described here.

## Palette and typography

The frontmatter records the palette and desktop type roles. Paper is the page ground and reverse text; evergreen anchors headings, primary actions and two section fields. A straw tint, `color-mix(in srgb, #d8be96 42%, #f7f1e5)`, grounds the sharing section. Clay colours the headline's second line and focus outlines on paper. Supporting copy uses a muted green neutral.

Sections change on a real change of field: photograph, evergreen, paper, straw, paper, evergreen. The wash `#e7e8d8` sits about 1.1:1 against paper, too close to separate sections, so it is reserved for the board switch and paper-button hover.

Primary buttons use evergreen with paper text and `#3f5842` on hover; on evergreen they reverse to paper with a wash hover. The header's “Sign in” action uses paper text and a quiet paper outline over the photograph. The landing explicitly sets `color-scheme: light` and keeps its variables local.

Fraunces Country supplies display and section headings; Manrope Variable supplies body copy, navigation and record details. The headline is two block spans at `clamp(46px, 4.7vw, 74px)`, 1.06 line height, each on one line above phone width; below 700px it flows at `clamp(38px, 10.5vw, 56px)`. Section headings are `clamp(40px, 4.5vw, 66px)`, 40px on mobile. Lead copy is 18px/1.75, 16px on mobile. Note numerals are tabular.

### Font provenance

The self-hosted Latin WOFF2 lives in [public/fonts/fraunces](../../../public/fonts/fraunces/README.md). Its README credits Phaedra Charles and Flavia Zimbardi / Undercase Type, records the Google Fonts download on 2026-09-17, and preserves the stylesheet and binary source URLs. The bundled [SIL Open Font License 1.1](../../../public/fonts/fraunces/OFL.txt) accompanies it. The README records optical-size and weight axes, softness 50 and wonk 1. CSS exposes normal weights 400–700 and uses `font-display: swap`. Manrope is reused from the application.

## Layout and reading order

One shared inner grid aligns the header, sections and footer: `width: min(calc(100% - 2 * var(--country-gutter)), 1280px)`, with a gutter of `clamp(22px, 5vw, 96px)`.

1. **Opening.** A photographic band runs to `min(58svh, 560px)`. A paper sheet with 12px corners overlaps its lower 120px and sits on an evergreen field that runs unbroken into the board section. It carries the headline across its full width, then the intro and account action on one row, which stack below 900px. On phones the sheet runs full width with rounded top corners.
2. **The board.** The same evergreen field continues. A heading and paragraph precede a paper board.
3. **Keeps itself tidy.** Paper. The heading sits above four statements in two columns, one column on phones. Each opens with a stronger lead clause; there are no dividers.
4. **Sharing.** Straw tint. The palomino photograph bleeds to the left edge beside the heading and three stacked points, and sits above them below 900px.
5. **Questions.** Paper. A sticky heading sits beside question and answer pairs. These are the only rules on the page outside the board's title bar, between pairs only.
6. **Closing invitation.** Evergreen, with the shared heading grid and a paper account action.

The compact footer follows with copyright, “Plans”, “Sign in” and the language selector. Signup routes remain `/sign-up/$`, sign-in routes `/sign-in/$`, and “Plans” links to `/pricing`. The header contains only the wordmark and “Sign in”.

## Components and interaction

**Actions and navigation.** Primary actions have 4px corners, a 54px minimum height and an inline arrow. Hover changes fill and lifts the action by 2px. The compact header action has a 44px minimum height. Text links have 44px minimum height. Keyboard focus uses a 2px outline with 5px offset. A keyboard-revealed “Skip to content” link targets the main landmark.

**Language.** The footer uses the shared native language selector. All landing copy, including the board's notes, exists in English and Polish.

**The board.** One paper panel with 12px corners and a thin title-bar divider. Two native buttons switch “As it is” and “Tidy it up”, exposing selection through `aria-pressed`. “As it is” shows scattered, rotated paper notes; “Tidy it up” settles them into four columns (Calendar, Reminders, Horses, Contacts) with Phosphor icons and no dividers. Columns share the board's row tracks through subgrid, so items align across columns. Phones show one note per group, so the whole board fits on one screen. Switching never changes the board's height.

The board tidies itself once, six seconds after 80% of it comes into view, leaving time to read the notes. Scrolling away before then cancels it, using the switch hands control to the visitor, and reduced-motion preference leaves it to the switch. This is local React state with no writes to real records.

**Motion.** The notes settling is the page's one authored moment. There is no looping animation. Reduced-motion preference disables transitions.

## Photography and depth

The opening uses the repository's `field-office-panorama` JPEGs from [public/landing-lab](../../../public/landing-lab), in 480px, 960px and 1600px variants, with high fetch priority. The sharing section uses the generated `juniper-palomino` JPEGs, 480×384px and 960×768px, lazy-loaded. Both carry translated alt text and use `object-fit: cover`.

External photographer credits, original acquisition source and license for the unchanged opening photograph are **not established by the inspected repository records**. The palomino portrait was generated using the built-in image-generation tool on 2026-09-17 at the user’s request; its provenance is recorded in [assets/juniper-palomino.md](assets/juniper-palomino.md). Supplied moodboard imagery remains reference material, not published artwork.

Depth comes from the photographs, colour fields and the paper board. Only the loose notes carry a small shadow. The landing defines no suns, stamps, paper texture, rope borders or decorative icon grids.

## Implementation guardrails

- Keep styles and tokens scoped to the public landing and preserve the shared 1280px grid.
- Keep each section change a real change of field, and keep rules to the question rows and the board's title bar.
- Keep the board's notes unlabelled but fictional: phone numbers stay in ranges reserved for fiction. Do not restore removed ornaments, decorative labels or testing/payment copy.
- Preserve font attribution and its bundled license. Do not invent product capabilities, customer proof or asset provenance.

This is a code-based design record, not an accessibility certification or a substitute for browser validation.
