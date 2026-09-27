# Exploratory landing lower-section confirmation

19 September 2026. Bounded source corrections and browser observations recorded by the parent auditor. This pass covers seven exploratory concepts: Gathered Yard, Stable Aisle, Care Cycle, Owner/Member Gatefold, and the Layered Fields, Moving Gates and Night Survey map versions. It does not redesign or modify the approved country landing.

## Findings and shared corrections

Initial lower-section observations at390 and1280 found oversized capability headings splitting words inside narrow columns, even when the overall viewport was wide. Decorative map lines also crossed copy too strongly. These were composition defects, not missing product content.

`LandingLabCapabilityHeading` in `src/components/landing-lab/LandingLabPrimitives.tsx` now sizes the capability heading against its article container using `clamp(2rem,13cqi,5.5rem)`, preserving whole words. LayeredFields, MovingGates, NightSurvey, StableAisle and OwnerMemberGatefold use this shared owner and article container geometry. This is deliberately scoped editorial typography, not a replacement for dashboard typography.

`src/components/landing-lab/landingLabOverdrive.css` reduces map stroke opacity to0.14 and CareCycle field-SVG opacity to0.18. Lines still pass behind some copy, but are subordinate. This is not a claim that all geometry was removed or redesigned.

## Rendered confirmation

- The five corrected heading consumers were rechecked at320 and1280. All four capability articles in each inspected composition retain whole words and no article overflow. Ten after-correction captures distinguish this evidence from the fourteen initial390/1280 captures.
- CareCycle at1024 was rechecked after the opacity correction. Its labels are whole and contained; the softened SVG no longer has the earlier visual weight. The experimental path still exists behind copy.
- All seven concepts were inspected through their final article/body and footer at320, including dark Night Survey. Document width stayed320. Keyboard focus moved through footer Sign in and then Create account. No footer destination was activated; this is keyboard/readability evidence, not authenticated navigation evidence.
- CareCycle and Gathered Yard retain their legacy experimental layout. The approved public country landing and its photography/content/type identity were untouched.

## Captures

All32 listed files exist. Captures are actual browser output, not generated mockups. Initial captures are before this bounded correction; only filenames marked after record the corrected state.

### Initial lower sections —14 before captures

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/care-cycle-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/care-cycle-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/gathered-yard-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/gathered-yard-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/layered-fields-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/layered-fields-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/moving-gates-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/moving-gates-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/night-survey-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/night-survey-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/owner-member-gatefold-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/owner-member-gatefold-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/stable-aisle-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/stable-aisle-390.jpg`

### Corrected capability headings —10 captures

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/layered-fields-1280-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/layered-fields-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/moving-gates-1280-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/moving-gates-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/night-survey-1280-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/night-survey-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/owner-member-gatefold-1280-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/owner-member-gatefold-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/stable-aisle-1280-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/stable-aisle-320-after.jpg`

### Latest path/footer confirmation —8 captures

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/care-cycle-1024-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/care-cycle-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/gathered-yard-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/layered-fields-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/moving-gates-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/night-survey-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/owner-member-gatefold-footer-320-after.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/landing-lower-sections/stable-aisle-footer-320-after.jpg`

## Validation and boundaries

Current combined validation:52 focused tests/8 files, full TypeScript, production Vite build, scoped ESLint and diff checks passed. Exact11 current-increment files pass formatting. A broader31-file format check flags existing OnboardingStepper.tsx union formatting, left untouched. Detector reports one advisory at landingLabOverdrive.css332: max1023 h1 clamp(2.25rem,9vw,4.5rem), deliberate scoped exploratory display sizing permitted by DESIGN.md149/245; no other findings. This is not detector[] or a full-suite rerun. Historical full-suite542/110 remains separate. Logs use /tmp/paddock-onboarding-landing-current-*.log; exact format result: /tmp/paddock-onboarding-landing-current-increment-format.log.

This closes the bounded lower-section/heading/footer observation gap, not every experimental configuration or production route. Invalid-variant fallback, every theme/mode combination, physical touch, assistive technology, enlarged text, actual OS reduced motion and full contrast/performance remain separate limits. No live account action or mutation occurred. Country landing evidence remains in its prior reports.
