# Landing correction confirmation — 19 September 2026

Browser control recovered in the selected in-app browser after the old tab disappeared and a fresh tab (9) loaded normally. No browser switch, server restart, authentication bypass, real account write or product-care mutation was performed. This increment advances the pending confirmation in `landing-browser-2026-09-19.md`; it does not close all landing or app route requirements.

## Confirmed corrections and preserved identity

- **Gathered Yard, 320 / 390 / 768 pixels:** the main heading keeps whole words, and narrow capability headings sit beside their corresponding descriptions rather than overlapping the promise. Document scroll width equals the viewport in all three cases. The first capability heading begins at y618 (320), y590 (390), and y719.59 (768) in the measured layouts, below the hero content. Settled screenshots are listed below.
- **Stable Aisle, 320 / 390 / 768:** WORKSPACE remains a whole word; the heading fits its 280 / 350 / 704px container. Document scroll width equals viewport width. The visible aisle image loaded in the retained captures.
- **Care Cycle:** the earlier positioning correction keeps all four labels inside the desktop section. A newly visible P2 typography defect split ATTENTION and TOGETHER mid-letter at 1365px. The only new UI edit in this increment removes the 9ch desktop cap, retains the existing 12ch measure, and explicitly restores normal word/overflow wrapping on this variant's capability headings. Positions, headline, palette, actual country page and app components remain unchanged. At 1365px labels are 247.29px wide, versus the prior 185.46px; at 1024px they are 241.55px wide. In both widths labels and the central heading have nonintersecting text boxes, stay inside the section and introduce no horizontal overflow. Light/dark desktop captures confirm whole-word labels. At 1024px the decorative horseshoe path still crosses parts of the label area; that is a remaining old-concept composition limitation, not a claim that this exploratory artwork is production-ready.
- **Shared anchor reset:** Care Cycle's light inverse CTA renders dark text `rgb(41,51,44)` on `rgb(233,231,219)`; its sign-in link remains ivory. Dark CTA renders `rgb(23,37,29)` on `rgb(182,203,185)`, with a light sign-in link. Gatefold uses the same inverse/default distinction in both capture themes. Gallery Open concept renders ivory on evergreen, while Choose this direction is evergreen on the surrounding light surface. Review active links also retain their utility colors. Actual pricing Start setup renders ivory on `rgb(36,76,59)`. Style Lab navigation and calendar sample links retain their normal ink tones. Calculated sRGB text/background ratios for the observed solid CTA pairs are 10.55:1 (light inverse), 9.28:1 (dark) and 9.19:1 (pricing/default). This verifies these pairs and consumers, not every link, image-backed text, focus state or a complete contrast audit.

## Live country page

The actual signed-out `/` still uses the approved photographic Field journal composition, Fraunces Country headings, Manrope body text, short copy, palomino Juniper example and shared lower-section alignment. Main/CTA headings share x68.25 at1365 and x22 at390; the inset Juniper heading deliberately has its own record-panel inset. Both viewports have no document horizontal overflow. The hero and Juniper images report complete and are visible.

On a clean load, the actual document contains the Manrope @font-face stylesheet from the installed package and the scoped Fraunces face. The browser now exposes `document.fonts.status === 'loaded'`, `document.fonts.check('400 16px "Manrope Variable"') === true` and `document.fonts.check('600 43px "Fraunces Country"') === true`. Country paragraphs compute to Manrope and headings to Fraunces. This is stronger readiness evidence than the earlier computed-family-only observation. The pageAssets inventory still lists only the initial shell fonts; it is retained as a limitation of that inventory, not as evidence that the declared/ready country fonts failed. No font file was fetched directly through an alternate browser mechanism.

The example remains explicitly labeled Example/Example horse record. Planned click updates its selected state and farrier text; Completed Space followed by Enter leaves Completed pressed and Planned unpressed. This is local illustrative state only. The care-example screenshot was captured immediately after the keyboard interaction, so its animated indicator can be between positions; it is not a settled underline-layout assertion.

The development-only TanStack Devtools launcher is visible over the top-left of some country screenshots. It is not part of the public visual identity. These are development captures, not cleaned promotional mockups.

## Navigation, preview isolation and cleanup

The previously unverified `/landing-lab/audit-unknown-variant` now resolves to `/landing-lab` and displays the real five-concept gallery. Opening Gathered Yard through its actual gallery link reaches the review controls. Choosing Use dark theme sets the iframe source to a dark capture; the iframe's document theme is dark while the parent remains light. Choosing Use light theme returns the review to light. No redirect-loop defect was observed.

The temporary application Dark preference left by the earlier interrupted audit was restored through the real theme button on `/pricing`: Dark → Auto → Light. The final button names light mode; the document data-theme and colorScheme both read light. Subsequent Style Lab/gallery/review parents remain light. The old pending browser-choice question is no longer needed for this recovered session.

Viewport override reset and handoff state are recorded in the final cleanup note below. No OS/browser theme, motion preference or browser process was changed.

## Screenshots and measurement artifacts

Artifact directory: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-confirmation/`.

- `gathered-yard-320.jpg`, `gathered-yard-390.jpg`, `gathered-yard-768.jpg`
- `stable-aisle-320.jpg`, `stable-aisle-390.jpg`, `stable-aisle-768.jpg`
- `care-cycle-light-1365.jpg` — before the new label-wrap correction; do not present as final
- `care-cycle-light-1365-after.jpg`, `care-cycle-light-1024-after.jpg`, `care-cycle-dark-1365.jpg`
- `gatefold-light-1365.jpg`
- `style-lab-1280.jpg` — restored light theme and the existing explicitly labeled local specimen; this capture does not certify every library state
- `country-desktop-1365.jpg`, `country-mobile-390.jpg`, `country-care-example-390.jpg`
- `country-mobile-measurements.json`, `country-font-assets.json`, `care-cycle-light-measurements.json` (the latter is before the new label measure)

Immediate captures after viewport-only changes were mis-scaled by the browser capture path. Fresh page loads at the selected width produced correctly sized, settled captures; the mis-scaled files were replaced/removed. This tooling issue was not misreported as application overflow. No image content was edited or synthesized.

## Checks and remaining scope

For the single class-only CareCycle change: full TypeScript and production Vite build pass; scoped ESLint, Prettier and diff checks pass; Impeccable detector returns `[]`. Logs: `/tmp/paddock-landing-confirm-types.log`, `/tmp/paddock-landing-confirm-build.log`, `/tmp/paddock-landing-confirm-detector.json`. No new class-string tests were added and the full unit suite was not rerun for this typography-only change. The last full-suite checkpoint remains 542 tests /110 files, before this increment.

Still open: actual OS reduced motion and enlarged-text checks, complete contrast/performance assessment, authenticated root dispatch and account destinations, unverified downstream app/form/component states, and the previously recorded live backend/persistence gaps. The country comparison controls and other experimental map motion variants retain their earlier bounded evidence; this increment does not certify all their states. The 1024px CareCycle decorative-path crossing remains a documented lab limitation. Browser access is recovered, not proof that the project-wide goal is complete.

Final cleanup confirmed: viewport override reset to the browser's normal 1280×720 / DPR2; tab9 is at `/style-lab`, whose loaded heading is Stable journal system and document theme is light. The tab was marked for handoff so subsequent audit work can reuse it.
