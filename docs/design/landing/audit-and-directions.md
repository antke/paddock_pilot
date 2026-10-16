# Landing audit and direction lab

Date: 2026-10-12. Scope: the current working-tree public landing and a new five-direction lab round. The signed-out `/` page is **not changed** by this work.

## Verdict

Keep the warm equestrian editorial character, but reconnect it to the current **Stable journal / Pine & paper** application. The strongest opportunity is not another set of feature cards: it is a clearer product story, the app’s actual typography and color roles, and more deliberate full-width composition.

The current page’s photographic opening, quiet sign-in header, short narrative, and closing action remain useful. The new first direction refines those foundations. Four further directions test materially different layouts before any production promotion.

## Source-confirmed findings

Priority describes design/product importance, not security severity.

| Priority | Finding and evidence | Recommended action | Status |
|---|---|---|---|
| High | **The brand foundations have diverged.** `src/components/landing/countryLanding.css` owns Fraunces/Manrope, country-specific colors, and 4px controls. `src/styles.css` now owns Alegreya/Alegreya Sans, Pine & paper, and 6px controls. | Carry the current font, palette, action, and focus roles into marketing, while keeping marketing-specific type scale and layout. | Applied to all five new directions; production remains unchanged. |
| High | **The narrative under-represents individual owners.** Production `landing.intro` and `landing.startDescription` emphasize the stable. `PRODUCT.md` explicitly supports personal horse care, independent carers, and a continuing record independent of placement. | Say clearly that an owner can start with their horse; collaboration and stable coordination are additions, not prerequisites. | Shared EN/PL lab copy covers those facts. Production copy is preserved. |
| Medium | **The fictional record is not the desired structural proof.** `PublicLandingPage.tsx` centers the shared-care section on the Juniper portrait and local care example. It is labeled honestly, but conflicts with the established preference for open, factual marketing compositions. | Replace it in the exploration with concise, verified capability statements. Defer detailed product screenshots until a direction is selected. | New directions have no faux records, fictional people, or product-interface simulations. The live example is untouched. |
| Medium | **The old lab does not match public localization/navigation.** `landingLabContent.ts` is English-only; the legacy footer lacks Plans and the shared language selector. | Give the new round complete public navigation and shared English/Polish language behavior. | New footer includes Plans, Sign in, and `LanguageSelector`, retaining its readiness/save-error/retry behavior. |
| Medium | **The old country page is intentionally light-only.** `.country-page` pins its local light palette and `color-scheme`. This is a separate design choice, not intrinsically an accessibility defect. | Let the new round use the lab’s light/dark controls and the app’s corresponding semantic colors. | New captures use `LandingLabThemeBoundary`. Inverse fields use `brand-surface` with its dedicated foreground pair, not an assumption about dark-mode `primary`. |
| Medium, before production promotion | **Hero-photo provenance is not established in the existing landing design record.** This is an evidence gap, not a finding that the photo is unlicensed. | Confirm acquisition and usage rights before promoting a photographic direction. | Existing image retained for internal comparison; no new provenance claims made. |

## What is already working

- The production landing owns its public header/main/footer independently of the authenticated app shell.
- Existing working-tree refinements simplify the header to Sign in and place language selection in the footer. These changes are preserved.
- The current hero already uses responsive image sources, image dimensions, and high fetch priority.
- Existing code includes a skip link, keyboard focus treatment, usable control targets, and reduced-motion handling.
- Account actions and Plans point to real application routes.
- The interactive production example uses local state and makes no record writes; it is explicitly labeled Example.
- The existing lab provides lazy concept imports, review/capture URLs, theme isolation, width presets, and noindex metadata. This infrastructure is reused rather than replaced.

## Five new directions

All five use the same factual capabilities: continuing horse history, plans/reminders, care records, and appropriately scoped collaboration. None invent testimonials, adoption figures, time-saving metrics, general-purpose chat, or subscription promises.

| Direction | Visual proposition | Review route |
|---|---|---|
| **1. Field Journal** | Refine the existing photograph → pine → paper sequence, retain the familiar hero wording, reconnect fonts/actions to the app, and replace the faux care panel with open capability statements. | `/landing-lab/field-journal` |
| **2. Yard Editorial** | Oversized paper typography, an offset introduction, a wide photographic interlude, and a ruled editorial narrative. | `/landing-lab/yard-editorial` |
| **3. Open Paddock** | An unshaded panorama with text outside the image, followed by broad alternating paper/pine capability bands. | `/landing-lab/open-paddock` |
| **4. Working Journal** | Direct sans-serif hierarchy, stone/paper rhythm, and generous open chapters. The numbered chapters are marketing content, not simulated dashboard rows. | `/landing-lab/working-journal` |
| **5. Pine Statement** | A pine-dominant typographic opening, immense Alegreya statements, and flat paper/stone fields. No imagery is needed to carry the idea. | `/landing-lab/pine-statement` |

Each includes header, hero, four capabilities, closing invitation, and complete footer. The gallery defaults to the five current directions. Earlier concepts are behind an archive disclosure; archived preview frames mount only when opened. Existing archived URLs and Paddock Map studies remain valid. “Choose this direction” marks a URL-based review preference; it never switches the live landing.

## Current-round design contract

- **Mode:** Persuade. Marketing scale can be bolder than task UI, but brand foundations remain shared.
- **Fonts:** shared Alegreya and Alegreya Sans with real serif/sans fallbacks. No additional font assets or dependencies.
- **Colors:** consume application semantic variables. Inverse bands use `--brand-surface`, `--brand-surface-foreground`, and `--brand-surface-muted-foreground` in both themes.
- **Controls:** shared `ButtonLink`, shared control corners/focus behavior, at least 44px navigation targets, and 52px signup actions. The native language control keeps the shared implementation.
- **Layout:** open full-width fields; one aligned inner grid with responsive gutters; no outer card, repeated feature boxes, ambient shadows, or fictional product records.
- **Type scale:** deliberately marketing-specific and scoped to `currentLandingLab.css`. Common headings use fluid 56–112px H1, 40–76px H2, and 28–40px H3 scales. Individual concepts expand desktop H1 up to 160px for Editorial and 200px for Statement; mobile overrides constrain each composition. Body copy uses 19px desktop and 18px mobile. These are intentional direction experiments, not proposed changes to the authenticated app’s type ramp.
- **Motion:** no required animation or new motion library. Reduced-motion visitors retain the full composition.
- **Images:** existing responsive panorama sources with reserved dimensions; opening imagery prioritized only where above the fold. Editorial interlude imagery is lazy-loaded.
- **Localization:** additive `landingDirections` resource keys; existing production `landing.*` strings and archived English-only concepts are unchanged.

The design hook flags these local marketing sizes against the root application type ramp. Those differences are intentional and documented here; no global ignore values or changes to the existing Impeccable configuration were made. Older lab font-size and stale design-sidecar warnings are outside this scoped round and were not silently repaired or suppressed.

## Verification record

Source inspection and automated semantic checks are distinct from rendered-browser verification. Impeccable’s main skill loaded, but access to its bundled audit reference was denied; this document does not claim the complete bundled procedure was performed.

| Check | Result |
|---|---|
| Landing, lab, and localization tests | **Passed: 19 files, 96 tests.** Covers all five current directions, five archived IDs, three Paddock Map studies, gallery archive mounting, URL/search behavior, semantic headings/landmarks, factual copy, destinations, real shared language-selector interactions, translation parity, and theme isolation/restoration. Command: `pnpm exec vitest run src/components/landing-lab src/components/landing/PublicLandingPage.test.tsx src/i18n --reporter=verbose --maxWorkers=2`. |
| TypeScript | **Passed:** `pnpm typecheck`. |
| Scoped ESLint | **Passed:** landing-lab and the additive/parent EN/PL locale files. |
| Formatting and diff hygiene | **Passed:** current-round sources and gallery/registry/chrome checked with Prettier; `git diff --check`. The gallery required formatting only. |
| Final production build and anonymous smoke | **Passed:** `pnpm build:smoke`, after the scoped focus fix. `/`, `/sign-in`, `/sign-up`, and `/pricing` returned HTTP 200 with complete server-rendered documents. This is not a signed-in browser test or a deployment. |
| Full repository suite | **Incomplete, not passing.** The bounded two-worker run was stopped at its background time limit before a final summary. Its partial log contains failure markers and an email scheduled-function `EnvironmentTeardownError`; a reliable final failure count/location was not available. No unrelated tests or email code were changed. An earlier default-concurrency run was stopped manually. |
| Initial rendered-browser batch | **30 captures completed:** each direction at 390px/1440px in light/dark English, 768px light English, and 390px light Polish. All reported zero horizontal/text overflow, zero captured browser errors, loaded images where present, and footer language controls. Measured signup targets were approximately 52.8px high. Computed fonts were Alegreya/Alegreya Sans, not the old landing fonts. Representative desktop/mobile, dark, Polish, and tablet screenshots were visually inspected. |
| Material fix and bounded confirmation | Keyboard interaction found focusable signup links without a visible outline in the rendered app. Added an explicit **current-round-only** 2px focus outline, with dedicated inverse colors; shared controls/global styling were not changed. Keyboard checks then confirmed visible skip-link focus, skip-to-main flow, and a 2px solid signup focus outline for all five pages. **One final 10-capture confirmation** (390px Polish and 1440px English for each direction) completed with zero overflow/browser errors. No further visual polishing pass was performed. |
| Browser localization | All five pages switched EN → PL → EN through native select change events in the actual app. Headless macOS native-popup keystrokes did not reliably commit the selection, so native-popup keyboard operation is not claimed as verified. Guest locale persistence and selector readiness/error behavior are also covered by automated tests. |
| Gallery/review runtime interactions | **Partial.** One browser run passed current/archive frame counts (5 → 10 → 5), selecting Field Journal as a review preference, opening its review, and setting 390px width. The driver then encountered a transient null iframe document. Later gallery navigations remained at `RoutePending` for over 30 seconds, so dark-review, archived/map browser navigation, and production-page browser comparison were not completed. Source review found correct synchronous lab routes and no iframe-loading gate; the root still has an unchanged Clerk/Convex bootstrap dependency, but the exact stalled dependency was not established. These behaviors have passing automated coverage, which is not substituted for a runtime pass. No unrelated routing/authentication changes were made. |

**Preview-switching follow-up (2026-10-12):** after a reported stale preview, keyed the review iframe by its capture source so concept, Paddock Map study, and theme changes explicitly replace the browsing context; viewport-only changes retain it. The intermittent original symptom was not reliably reproduced and iframe reuse is not claimed as a conclusively established root cause. Post-change browser clicks verified actual headings for all five current concepts, distinct content classes for all three map studies (including return to the default), dark theme inside the preview, fresh iframe identity on source changes, and retained identity at 390px width. Added three regression tests; the updated landing-lab suite passed **6 files / 60 tests**, with typechecking, scoped ESLint, formatting, and diff hygiene also passing. This focused check completes the review-switching/theme checks left partial above, not the remaining gallery/authentication or production-browser checks. The earlier production build/smoke result predates this one-line follow-up.

**Limits:** these checks are not an exhaustive WCAG, screen-reader, performance, or image-pixel contrast certification. A signed-in browser session was not exercised. Photo rights still need confirmation before production promotion. Existing user edits to the production landing/app shell/toast and design configuration remain outside this implementation.

**Environment note:** the pre-existing development server on port 9090 returned a module-resolution error for `@tanstack/history`. Port 9091 was already occupied, so a separate server on port 9195 was started for this inspection without stopping either existing server. Browser inspection uses an isolated headless Chrome profile and no project dependency installation.
