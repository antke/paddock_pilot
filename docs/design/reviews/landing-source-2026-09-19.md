# Public landing and comparison labs — source audit, 19 September 2026

Read-only Impeccable audit of the signed-out landing, its country comparison and the older overdrive lab. No application edits, test runs, detector runs, builds or browser inspection were performed. This is preparation for a bounded family pass, not route closure. The current public-account browser report verifies only that leaving the application shell clears its header offset on `/`; that sanity check is not a landing review.

## Design authority and assessment

Preserve [the scoped field-journal design](../landing/DESIGN.md): Fraunces Country headings, Manrope body/control text, ivory and evergreen, photographic opening, readable local Juniper example, shared lower-section alignment and the approved short copy. Do not restore eyebrows, sun ornaments, age/breed captions or screenshot galleries. The application’s Alegreya system is a different scope.

The live composition remains coherent with that authority, but its Manrope loading dependency has drifted. Country CSS is a justified shared owner for this public identity, not a proliferation of route-specific app styles. Keep its tokens and shared grid local; do not replace it with dashboard cards or rewrite the approved content. The comparison lab uses older app-token experiments and is not the live design authority.

A complete numerical accessibility/performance score is withheld: source inspection cannot establish rendered contrast, focus visibility, actual font use, image crop, network timing or responsive fit. Source-confirmed actionable findings below comprise **three P2 issues and one P3 issue**. Motion and responsive concerns are explicitly separate verification targets.

## Routes and variant inventory

| Surface | Actual composition and boundary |
| --- | --- |
| `/`, signed out | `PublicLandingPage` → `CountryPage`, overlay `CountryHeader`, journal `CountryLandingHero`, shared-care product example, closing invitation and footer. Signed-in root dispatches to dashboard/onboarding and is outside this review. |
| `/landing-lab` | Parent layout provides `noindex, nofollow`; gallery contains five titled concept entries, lazy capture iframes and local URL selection. Selection changes the review URL only, not production or stored product settings. |
| `/landing-lab/$variant?mode=review` | `LandingLabReview` plus `LandingLabChrome`, containing a capture iframe. Viewport choices: fit, 390, 768, 1440. Theme choices: light/dark. Unknown variant navigates back to gallery. |
| `/landing-lab/$variant?mode=capture` | Lazy actual experiment inside `LandingLabCapture`; visible Suspense fallback. Full document separate from review chrome. No custom lab chunk-failure recovery was found; inspect inherited router error behavior rather than assume none exists. |
| `/landing-lab/country-study` | Independent comparison chrome; composition journal/open-yard, desktop/mobile frame, review/preview mode. Journal preview renders the actual full public page. Open-yard preview renders header + alternate hero only, **not a complete alternate landing page**. |

Five registry entries are `gathered-yard`, `stable-aisle`, `paddock-map`, `care-cycle`, and `owner-member-gatefold`. Paddock Map dispatches to three studies: `layered-fields` (default; canonical URL omits `mapVersion`), `moving-gates`, `night-survey`. Thus there are seven distinct overdrive compositions, plus two country openings; the full live country page is reused, not a tenth independent design.

`landingLabSearch.ts` constrains mode/theme/viewport/map versions and strips irrelevant map state from other concept links. Parent/root dispatch bypasses application chrome for landing-lab paths. Labs are publicly reachable with noindex metadata, **not DEV-gated**; this is existing behavior, not evidence of a private-data leak. Their account links are real route exits, so safe inspection should not submit those forms.

## Source-confirmed findings

### P2 — The approved Manrope face is declared but no longer loaded

**Owners:** `src/components/landing/countryLanding.css:20`, `src/routes/landing-lab/country-study.css:5`, global `src/styles.css` font imports.

Both scopes request `'Manrope Variable', sans-serif`. Fraunces has a local `@font-face`, but the current source contains no Manrope import or face definition. The package remains in `package.json`; installing a font package does not load its CSS. The scoped design record still assumes Manrope is supplied by the application. A clean document therefore cannot rely on the intended face and falls back to the generic sans family, altering widths and hierarchy.

**Bounded remedy:** restore a landing-owned Manrope loading path using the installed package or properly licensed local assets. Preserve application typography. Confirm the actual loaded face and lower-section alignment in a clean preview, not merely the computed family string. Command: **typeset**.

### P2 — Explicit light capture is not isolated from saved application dark mode

**Owners:** `LandingLabPrimitives.tsx:27–32`, `LandingLabPage.tsx` capture fallback, root `THEME_INIT_SCRIPT`, `src/styles.css` root and `.dark` tokens.

The document theme script sets `<html class="dark">` from stored/automatic preference. A lab frame adds `.dark` for a dark preview but makes no light override for `theme="light"`. Its app custom properties inherit the root dark values; `.dark` descendant selectors also remain active. The iframe has its own document but reads the same origin storage. Consequently the URL’s Light choice is not authoritative when the application preference is dark. Country landing’s independent fixed-light tokens are not the same bug.

**Bounded remedy:** resolve the explicit capture theme at the lab document boundary, or otherwise isolate both tokens and dark selectors without changing the user's saved app preference. Include pending fallback and nested review frames. Commands: **harden**, **colorize**.

### P2 — Clipboard denial has invisible and incorrect recovery

**Owners:** `LandingLabChrome.tsx:36–50,204–205`, `landingLabSearch.ts:getLandingLabCaptureUrl`.

On failure the only status is an `sr-only` live region saying “Copy failed; use the address bar”. The address bar is the review URL, whereas the requested capture URL changes mode and removes viewport state. Sighted users receive no success/failure feedback, and following the failure instruction copies a different kind of link. Clipboard unavailability is particularly relevant when previews are opened over a same-Wi-Fi HTTP address, though this audit did not execute that case.

**Bounded remedy:** expose a compact visible status and a genuine capture link or selectable capture URL on failure. Keep acknowledgement after the clipboard promise resolves. Avoid stale feedback across variant changes or repeated requests. Commands: **harden**, **clarify**.

### P3 — Review documents lack their own page heading

**Owners:** `LandingLabReview`/`LandingLabChrome`, country-study review branch.

The gallery and actual captures have H1s. The outer generic review document has no H1; country-study presents its title in `<strong>` and also lacks a main landmark. The iframe’s H1 belongs to a different document and does not supply an outer heading. This weakens heading navigation through the review tool, not the production landing.

**Bounded remedy:** turn existing review title text into a concise H1 and give country-study preview content a main landmark, without adding promotional copy or extra vertical sections. Command: **polish**.

## Good source contracts to preserve

- Actual public landing has one H1 and a main landmark, named public/footer navigation, native route links, visible keyboard focus rules and a skip link. Root has approved auth-dependent shell separation.
- The care example uses native buttons in a named group, `aria-pressed` and a polite atomic live region. Completed/Planned is local state, visibly marked “Example”; it does not mutate a horse or pretend to save. Both states retain visit identity and time.
- Shared country container rules align the hero and lower sections. The two-column content stacks below 700px. Controls have explicit 44px minimum heights (54px primary buttons). These are source safeguards, not evidence of 320px/enlarged-text success.
- Country images have dimensions and responsive sources. Hero fetch priority is high; the below-fold palomino is lazy. Files inspected on disk: hero 480/960/1600 JPEGs are 29,712 / 84,736 / 189,590 bytes; palomino 480/960 JPEGs are 49,426 / 152,905 bytes; Fraunces WOFF2 is 66,788 bytes. No LCP/CLS or transferred-byte measurement was made. There is no source basis for blanket image re-encoding now.
- Overdrive concepts are lazy loaded, preserve working account links and share factual content. Geometry is decorative SVG. The gallery’s iframes are lazy, pointer-inert and removed from ordinary tab order; inspect their screen-reader discoverability before changing their semantics.
- Old `LandingAppPreview`, `LandingProductProof`, `LandingPrimitives` and `landingContent.ts` remain in source, but the current public page does not import the rejected screenshot gallery. Their stale content is not a live-page defect. Do not delete or migrate them without confirming all consumers.

## Verification targets, not established visual failures

1. **Country typography and narrow composition:** after restoring font loading, inspect 320/390, 768 and desktop, plus enlarged text. Check wordmark + two account links, the hero’s inline mobile headline, product label row, 90px mobile portrait crop, section alignment and footer. The existing fixed 43px mobile H2 and nowrap header action could constrain smaller widths; no overflow was measured here.
2. **Keyboard:** Tab to country skip link, activate, then verify the next focus stop actually enters content; fragment scrolling alone is insufficient. Exercise Planned/Completed with keyboard, repeat rapidly, confirm stable focus and truthful announcement. Traverse into/out of review iframes and every chrome control; check focused controls stay visible within deliberate horizontal preview/nav scrollers.
3. **Theme isolation:** save dark (also auto-dark) preference, then open light and dark capture URLs and their review iframes. Confirm toolbar choice, computed tokens and capture all agree; switching lab theme must not persist an app preference. Country page should remain its deliberate fixed-light identity.
4. **Scoped motion:** `landingLabOverdrive.css` still uses the separate blanket 0.01ms duration policy. Drawn paths and gate groups have explicit static end states; Gathered Yard arrival, aisle transform and gatefold clipping do not have equivalent explicit reduced-motion animation removal at desktop widths. Because these are view-timeline animations, do not assume short duration stops scroll-linked spatial changes. Inspect normal/reduced motion in a browser supporting view timelines and the unsupported static fallback. Country’s immediate 2px hover state in reduced motion is explicitly recorded in its approved design and is not automatically a redesign target. See [motion source audit](motion-source-2026-09-19.md).
5. **Comparison reliability:** check all five variant dispatches and three map studies, malformed search/default handling, choice links and copied capture URLs. Distinguish intentional 1440px preview overflow from unwanted document overflow. Verify small-screen shared lab header fit rather than assuming the live country header's breakpoint rules cover it.
6. **Assets/performance:** inspect actual font loads and hero/palomino source choice at representative DPRs, image failure readability, and crop/contrast over the photograph. The hero's mobile source caps at 960px, a quality/performance tradeoff to inspect, not a confirmed defect. Existing asset provenance notes remain; do not invent external licensing evidence.

## Existing evidence and proposed bounded next pass

Read source tests: `PublicLandingPage.test.tsx`, `CountryLandingHero.test.tsx`, `LandingLabChrome.test.tsx`, `landingLabSearch.test.ts`, `landingLabVariants.test.tsx`, and the lab path helper tests. They cover approved copy/removals, route targets, care toggle state, registry/dispatch factual landmarks, canonical URL state and successful clipboard copy. They do not establish font rendering, actual-router selected-state semantics, clipboard rejection UI, root theme isolation, layout, focus traversal or reduced-motion behavior. No tests were rerun for this report.

[Historical landing status](../landing-implementation-status.md) records earlier desktop/mobile and skip-link inspection, but includes earlier-composition language (such as ornaments) and predates the global typography update. Use it as historical evidence, not fresh approval of every present state. The newer scoped design is the current visual authority. [Public/account browser report](public-account-browser-2026-09-19.md) adds only country-root shell-clearance regression evidence.

Recommended next increment: **typeset → harden → bounded animate review → polish**. Fix the three source-confirmed P2s and small review semantics together, preserve identity, then one batched desktop/mobile/browser-state inspection and one confirmation round if corrections are necessary. Local care toggles, lab URL selection and clipboard operations are safe specimens. Signup/signin/pricing link navigation can stop at the destination boundary; no real account, billing or care writes are needed.

## RSS: separate non-UI response gap

`src/routes/rss[.]xml.ts` exposes a GET handler assembling RSS from `allBlogs`, deduplicating slugs, sorting dates and returning `application/rss+xml; charset=utf-8`. `content-collections.ts` defines `content/blog`; no current source directory was present, and `.content-collections/generated/allBlogs.js` currently exports an empty array. Cached historical content is not evidence of served feed entries. `SITE_URL` depends on `VITE_SITE_URL`, with localhost as its fallback.

No HTTP response was fetched in this task. A previous restricted-loopback curl failure does **not** establish server unavailability; browser work was healthy. Keep response status/content type, valid XML/empty-channel behavior, configured deployment URL and future content/link validity unverified. This is a response/metadata check, not a missing UI screen or an excuse to add a feed page.

## Capture-theme correction supplement

`LandingLabThemeBoundary` now temporarily resolves an explicit capture theme on the document root, updating its existing light/dark classes, `data-theme` and `color-scheme`. `LandingLabCapture` places the boundary outside Suspense, so its pending fallback and loaded concept share the same authoritative theme. `LandingLabPageFrame` reuses that boundary for standalone concept rendering; context gives nested frames one document owner rather than competing snapshots/cleanup. Descendant-only dark classes were removed from those two owners. No color tokens or motion rules changed.

The boundary never writes storage. On exit it restores the previous application document state, retaining unrelated root classes. An automatic preference is resolved against the current system preference, and a preference changed in another tab while reviewing is respected. If embedded storage access is denied, the prior document snapshot is restored. Review/gallery iframe documents establish their own capture boundary; the review parent document remains on its application preference. Root theme initialization and ThemeToggle are unchanged.

Focused validation: **15 tests across 2 files passed** (five new theme-lifecycle cases plus ten existing variant cases); scoped ESLint and scoped whitespace checks passed. Tests cover explicit light during lazy fallback over saved dark, loaded nested frames under StrictMode, repeated light/dark capture changes, application preference restoration, automatic/system and later stored preference changes, standalone frames, review iframe source/parent isolation, and denied storage. This is component/document-state evidence; actual computed tokens, iframe rendering and initial-route paint remain for the parent browser pass. No browser, build or full suite was run by this agent. Theme UI source is frozen at this checkpoint.
