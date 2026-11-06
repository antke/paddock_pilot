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
    fontSize: 'clamp(46px, 5.5vw, 84px)'
    fontWeight: 500
    lineHeight: 1.03
    letterSpacing: '-0.024em'
  headline:
    fontFamily: "'Fraunces Country', Georgia, serif"
    fontSize: 'clamp(34px, 3.9vw, 58px)'
    fontWeight: 500
    lineHeight: 1.08
    letterSpacing: '-0.024em'
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

The signed-out `/` page uses warm paper, evergreen, a characterful serif and countryside photography. It sells one idea: get rid of the whiteboard and the group chat. The opening photograph sinks into an evergreen wall, a real whiteboard hangs on that wall, and the visitor's own scrolling wipes it, leaving the same notes behind as a tidy list. The page closes on an invitation to wipe your own. There are no sun marks or decorative ornaments.

This is a **public-landing-only** record of [PublicLandingPage.tsx](../../../src/components/landing/PublicLandingPage.tsx), [YardBoard.tsx](../../../src/components/landing/YardBoard.tsx), [publicLanding.css](../../../src/components/landing/publicLanding.css), the shared chrome in [CountryLandingHero.tsx](../../../src/components/landing/CountryLandingHero.tsx) and [countryLanding.css](../../../src/components/landing/countryLanding.css). Its copy lives in `publicLanding.en.ts` and `publicLanding.pl.ts`. It does not change the root design system or authenticated application. The retained `open-yard` comparison route is outside the delivered composition described here.

## Palette and typography

The frontmatter records the palette and desktop type roles. Paper is the page ground and reverse text; evergreen is the wall the board hangs on and anchors headings. Straw lifts the headline's second line on evergreen. Marker red `#b5392c`, blue `#23375f`, black `#24272a` and green `#1f6b47` appear only as marker on the board. Supporting copy uses `#414a3e` on paper and `#e1e3ce` on evergreen.

Fields run photograph, evergreen, white board, dusk photograph, paper, evergreen. Each photograph dissolves into evergreen with no seam.

Primary actions are paper with evergreen text on evergreen fields, and evergreen with paper text on the board, with a 2px lift on hover. The header's “Sign in” sits on a dark translucent backing so it holds contrast over any part of the photograph. The landing explicitly sets `color-scheme: light` and keeps its variables local.

Fraunces Country supplies display and section headings; Manrope Variable supplies body copy and navigation. All display settings share one tracking value, `-0.024em`. Supporting text uses one lead size, `clamp(18px, 1.45vw, 21px)`, 21px on upright tablets and 17px on phones. The two hands below appear only on the board.

### Font provenance

The self-hosted Latin WOFF2 lives in [public/fonts/fraunces](../../../public/fonts/fraunces/README.md). Its README credits Phaedra Charles and Flavia Zimbardi / Undercase Type, records the Google Fonts download on 2026-09-17, and preserves the stylesheet and binary source URLs. The bundled [SIL Open Font License 1.1](../../../public/fonts/fraunces/OFL.txt) accompanies it. The README records optical-size and weight axes, softness 50 and wonk 1. CSS exposes normal weights 400–700 and uses `font-display: swap`. Manrope is reused from the application.

The board is written by more than one person, so it uses two hands: Sedgwick Ave and Mansalva, self-hosted as `Yard Hand A` and `Yard Hand B` from [public/fonts/sedgwick-ave](../../../public/fonts/sedgwick-ave/README.md) and [public/fonts/mansalva](../../../public/fonts/mansalva/README.md), each with its Latin-ext subset for Polish, its SIL Open Font License and a README recording the Google Fonts download on 2026-11-06. Ligatures are off, because Sedgwick Ave's `fl` reads as `A`. Lines containing `ą` use Yard Hand B, because Sedgwick Ave opens a gap after that glyph.

## Layout and reading order

One shared inner grid aligns the header, sections and footer: `width: min(calc(100% - 2 * var(--country-gutter)), 1280px)`, with a gutter of `clamp(22px, 5vw, 96px)`.

1. **Opening.** The photograph fills the top of a full-height evergreen field and dissolves into it, with no card and no hairline. The headline, intro and account action stack at the foot of the first screen, on the shared left edge.
2. **The board.** One pinned screen. The heading sits on the evergreen wall above a whiteboard aligned to the shared grid. The “Tidy it up” button sits beside the heading; the heading fades as the wipe starts.
3. **Tidied up.** The same pinned screen, once wiped. “Paddock Pilot tidies it up.” replaces the wall heading, and the board holds five ruled entries drawn from the notes, one line of copy and an account action.
4. **Sharing.** A dusk paddock, a crop of the opening photograph's soft distance, dissolves into evergreen with a two-line statement and one sentence.
5. **Questions.** Paper. Three rows on one shared line, cost first, question left and answer right, separated by rules.
6. **Closing invitation.** Evergreen, with the closing line in the display serif and a final account action.

The compact footer follows with copyright, “Plans”, “Sign in” and the language selector. Signup routes remain `/sign-up/$`, sign-in routes `/sign-in/$`, and “Plans” links to `/pricing`. The header contains only the wordmark and “Sign in”.

## Components and interaction

**Actions and navigation.** Primary actions have 4px corners, a 58px minimum height and an inline arrow. Hover changes fill and lifts the action by 2px. The compact header action has a 44px minimum height. Text links have 44px minimum height. Keyboard focus uses a 2px outline with 5px offset. A keyboard-revealed “Skip to content” link targets the main landmark.

**Language.** The footer uses the shared native language selector. All landing copy, including the board's notes, exists in English and Polish.

**The board.** A flat drawing of a whiteboard: one solid surface, one solid grey frame, and ghosts of older notes. There is a turnout rota, circled and boxed notes, arrows and a “do not wipe” box. Text is translated SVG type placed by hand in two compositions, wide (1600×800) and tall (360×640); any upright screen gets the tall one. On wide screens the board stays 2:1 and sits centred on the wall, narrowing when a window is too short for it. Screen readers get one description of the board instead of its scrawl.

Three routes wipe the board, and it stays tidy afterwards. The “Tidy it up” button beside the heading works everywhere. With a mouse, the eraser replaces the cursor over the board and wipes where it goes, with no click needed; after about two-thirds of the board's worth of rubbing the board finishes itself. A board that has been rubbed never sweeps from the start: the notes fade out, then the tidy board fades in. If the visitor does neither, the board wipes itself as they try to scroll past it: the sticky stage pins, they get about 70% of a screen of further scrolling to read it, then the scroll is held for the length of the sweep, and it is released as soon as the board is tidy. Nothing else on the page holds the scroll. Anyone who arrives past the board, from a restored position or the End key, is never pulled back; the board is simply tidy when they return. Scrolling does not scrub the wipe, because a tester tried to drag the eraser and the scroll link gave them no way to.

A flat two-colour eraser follows the sweep, which masks the writing through an SVG mask with a half-wiped fringe. Each tidy entry fades in as the eraser reaches its band. There are no category labels or icons. The two headings fade in sequence, never together. The board's link stays out of the tab order until it can be seen, and so does the button once it has been used.

**Motion.** The wipe is the page's one authored moment. It runs on a timer, as a sweep or a fade, started by the button, the mouse or the attempt to scroll past, and never scrubs with the scroll. There is no looping animation. With reduced motion the board does not pin: it shows full, then tidy, and the page simply scrolls.

## Photography and depth

The opening uses the repository's `field-office-panorama` JPEGs from [public/landing-lab](../../../public/landing-lab), in 480px, 960px and 1600px variants, with high fetch priority. The sharing section shows only the left third of the same photograph, the out-of-focus paddock, enlarged. Both carry translated alt text and use `object-fit: cover`.

The opening photograph is generated imagery, confirmed by the project owner on 2026-11-06. The palomino portrait is no longer on this page; its provenance remains in [assets/juniper-palomino.md](assets/juniper-palomino.md). Supplied moodboard imagery remains reference material, not published artwork.

Depth comes from the photographs and colour fields. Everything drawn on the page is flat, the board and eraser included: no shadows, gradients, gloss or bevels. The landing defines no suns, stamps, paper texture, rope borders or decorative icon grids.

## Implementation guardrails

- Keep styles and tokens scoped to the public landing and preserve the shared 1280px grid.
- Keep each photograph dissolving into evergreen, and keep rules to the question rows.
- Keep the board's notes fictional and free of real contact details, with no captions saying so. Do not restore removed ornaments, decorative labels or testing/payment copy.
- Keep the wipe's mask growing as a path. Safari paints a dashed stroke inside a mask as if it were solid, so a dash offset blanks the board at once.
- Preserve font attribution and its bundled license. Do not invent product capabilities, customer proof or asset provenance.

This is a code-based design record, not an accessibility certification or a substitute for browser validation.
