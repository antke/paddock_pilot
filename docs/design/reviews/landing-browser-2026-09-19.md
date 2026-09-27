# Public landing and comparison labs — implementation / browser evidence

**Status: historical first inspection and correction batch. The browser recovered; [the follow-up confirmation](landing-confirmation-2026-09-19.md) supersedes the browser-access, font-readiness and temporary Dark-preference gaps recorded here. Remaining scope stays explicit; no route closure.**

19 September 2026. Continues [landing source audit](landing-source-2026-09-19.md). Preserve scoped [Field journal authority](../landing/DESIGN.md), including Fraunces/Manrope, photography, approved copy and local Juniper example. This family intentionally differs from the application. No real account writes or product care mutations.

## Implementation

- Restored Manrope via its already installed font package, imported by the country component that owns the landing CSS. App font tokens remain unchanged. Package CSS uses variable weights, unicode-range subsets and swap; only required subsets should load in browser. Computed font-family and visual rendering were inspected; font-resource readiness remains unverified.
- Country comparison review's existing title becomes H1 with its existing visual role; preview stage becomes main. No new promotional labels or layout sections.
- LandingLabThemeBoundary owns explicit capture theme during pending and loaded content, prevents nested ownership, and restores application preference without storage writes. LandingLabChrome owns acknowledged copy status and manual recovery with the actual capture URL. The shared clipboard helper always removes its temporary legacy field and restores focus only if that field still owns it.

The type detector raised 31 findings against country CSS: one overused-font heuristic and app-DESIGN font/type-ramp comparisons. Fraunces and Manrope are explicitly approved in the scoped landing DESIGN; its documented 12px truth label/14px controls/36px example title/43px mobile headings are deliberate scoped roles. These are not grounds to replace the landing with application typography. Runtime font delivery was found by source inspection, not the detector. Detector log: `/tmp/paddock-landing-type-detector.json`.

## Planned verification scope

The bounded pass covered the cases recorded below. Initial scope: actual root 1365/768/390/320, care toggle and skip keyboard flow; clean font/asset evidence; all registry concept dispatches and map studies; explicit light/dark while saved preference differs, review iframe behavior and preference restoration; country comparison controls and title/landmark; visible copy feedback and canonical URL. Clipboard rejection can be simulated in focused tests without weakening browser permissions. Authenticated root dispatch, external accounts, OS reduced motion, enlarged text and complete performance/contrast remain separate evidence requirements.

## First batched inspection — confirmed correction list

Initial source fixes passed 440 tests across 90 files, full TypeScript/build and scoped lint before browser work. Public root: inspected 1365/768/390/320, no page overflow, lower headings share x=68.25 desktop,38.40 tablet,22px mobile. Native skip activation followed by Tab enters the hero account link (the main itself is not focused). Planned/Completed Enter/Space repeat correctly with truthful local note and pressed state. Desktop images loaded successfully, hero1600 and palomino480. Computed copy requests Manrope; screenshot matches the restored shape, but direct font-face readiness API is not exposed by the browser's read-only DOM proxy. Asset inventory confirmation remains to do.

All seven older concept openings dispatched in browser at desktop/narrow widths; Night Survey also inspected dark. This is bounded first-screen/semantic evidence, not a complete scroll-motion or every-state certification. Country review's own H1/main and both compositions were observed; open-yard remains hero-only. Review copy click shows acknowledged success and actual clipboard contains canonical capture URL with mode=capture/theme, no viewport. Changing theme clears old status. With app Dark selected, light capture root is light; review parent stays dark while screenshot shows light iframe. Manual copy failure is focused-test evidence only.

Three additional browser findings form the one correction batch:

1. **P1 — Shared anchor reset defeats action contrast.** Unlayered `a { color: inherit }` in styles.css overrides Tailwind utility colors. CareCycle's light secondary CTA computed foreground rgb(252,249,241), background rgb(233,231,219), about 1.18:1. The same pale label appears in Gatefold, dark review selection and gallery links. Move the reset into the existing base layer so component/link color recipes regain authority. Do not scatter !important fixes around callers.
2. **P2 — Old lab heading geometry does not fit the current display face.** At390px Stable Aisle's narrow character measure splits WORKSPACE with a lone E; Gathered Yard's absolutely positioned capability headings overlap the promise. Correct the shared scoped narrow H1 measure/wrapping/scale and put Gathered's narrow capability headings alongside their existing paragraphs. Preserve desktop experimental compositions and the actual country page.
3. **P2 — CareCycle desktop labels anchor to a zero-height wrapper.** Top labels start at y845 with top0, bottom labels end there; lower content gets clipped. Correct that wrapper's desktop positioning so existing percentage offsets refer to the actual section.

Gallery choice and clearing changed only review URL state. Visiting an intentionally unknown concept URL stalled tab6 (Page.navigate timeout, repeated DOM/AX command timeouts); browser inventory remains responsive and lists the tab at that URL. This is an unverified recovery path, not proof of an application redirect defect. Investigating separately without restarting the server or claiming success.


## Correction batch and final checks

The three first-inspection defects are corrected in source: the anchor reset is inside the existing base layer; shared `.landing-overdrive h1` narrow rules preserve whole words with a fluid scale; Gathered Yard pairs mobile headings with their descriptions and keeps desktop floats; CareCycle uses a static desktop wrapper so its percentage labels anchor to the full relative section. Country typography and public composition are unchanged by this batch. These are implemented corrections, **not final rendered pass claims**.

Final validation after the correction batch: **440 tests / 90 files passed**, full TypeScript and Vite build passed, scoped lint/format and `git diff --check` passed. Logs: `/tmp/paddock-landing-final-tests.log`, `/tmp/paddock-landing-final-types.log`, `/tmp/paddock-landing-final-build.log`, `/tmp/paddock-landing-final-format.log`. Focused theme/variants 15 tests; clipboard/chrome/search 22 tests. Type detector after the font/heading semantic edit returned the same 31 explained scoped-design findings (`/tmp/paddock-landing-type-detector-final.json`).

The original tab6 and a fresh same-browser tab7 both timed out on navigation and DOM/AX inspection. Browser tab listing and metadata operations remained available. A read-only HTTP HEAD outside sandbox loopback restrictions returned **200 text/html** for the existing local server; it was not restarted. An isolated installed-router diagnostic reached the gallery once, idle, with replace history index0; its lightweight gallery stand-in does not verify real provider/iframe loading. Thus the unknown-variant route remains **unverified**, not a proven redirect-loop defect. No speculative route fix was made.

Further browser retries stopped after repeated failure. Viewport override reset successfully; tab7 preserved for handoff. The temporary app Dark preference used in theme testing **could not yet be restored to Light** through the unresponsive UI and must be restored when access returns. Closing old temporary tab6 also timed out. No OS/browser preference or process was changed to bypass this issue.

### Pending confirmation batch

- Inspect corrected Gathered and Stable Aisle at320/390/768, CareCycle desktop label containment, and shared link colours in CareCycle/Gatefold/gallery/review (both themes).
- Representative style-lab and application consumers must confirm the global anchor reset restores intended utility colours without an unintended contrast change. Country root needs one regression check.
- Use the browser's pageAssets font inventory on the actual country page to distinguish actual Manrope resource delivery from a computed-family declaration. No direct font-readiness result is claimed; the read-only DOM proxy did not expose an iterable document.fonts.
- Confirm unknown-variant navigation when browser control is healthy; restore temporary Light preference.
- OS reduced motion, enlarged text, complete contrast/performance, real account destinations and authenticated root dispatch remain open. The separate motion-source findings are not resolved by this batch.

## Screenshot evidence

All images below are **first-inspection evidence**, taken before the final shared anchor/layout correction. They must not be presented as corrected lab screenshots. Directory: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit`.

- [Public desktop opening](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/country-desktop.png)
- [Public desktop product](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/country-product-desktop.png)
- [Public mobile product](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/country-product-mobile.png)
- [320px public opening](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/country-320.png)
- [Light capture under saved Dark](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/capture-light-saved-dark.png)
- [Mobile review with light frame](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-audit/review-mobile-light-frame.png)

Other first-inspection files: `country-review-mobile.png` (scrolled alternate hero inside review), `gallery-320.png` (scrolled gallery card), `stable-aisle-mobile.png`, `care-cycle-mobile.png`, `gatefold-mobile.png`, `layered-fields-mobile.png`, `moving-gates-mobile.png`, `night-survey-mobile.png`, `stable-aisle-desktop.png`, `care-cycle-desktop.png`, `owner-member-gatefold-desktop.png`, `paddock-map-desktop.png`, `moving-gates-desktop.png`, `night-survey-desktop.png`. These document dispatched concepts and specific defects; not every lower section/state was inspected. Floating palm launcher belongs to development tools.

## RSS response evidence

Read-only GET of `/rss.xml` against the existing development server returned **200**, `application/rss+xml; charset=utf-8`. Python XML parser accepted an RSS2.0 root with channel title Paddock Pilot, link `http://localhost:9090`, and zero items, matching current generated empty blog data. Evidence files: `/tmp/paddock-rss-headers.txt`, `/tmp/paddock-rss.xml`. This resolves the local empty-feed response gap, not populated-content validity or production SITE_URL configuration. No feed code changed.
