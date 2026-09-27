# Timeline overview — browser correction and confirmation

19 September2026. Actual `StableActivityTimelineChart` through the analysis sample and actual chart in Style Lab. This closes the previously timed-out local overview-control check; it does not verify authenticated analysis queries or every chart configuration. Observations and captures below were made by the parent browser auditor.

## Findings and corrections

**P2 — displayed overview bounds altered navigation math.** At1280 the viewport was1184px over37632px of content, an actual3.146% window. The overview imposed an8% semantic width for usability. Starting at scrollLeft2288, Right moved to3201 and Left returned to2577.5, exposing drift.

`src/components/analysis/timelineOverviewGeometry.ts` now derives exact viewport bounds and centered scroll positions. `StableActivityTimelineChart.tsx` owns this domain math; global `src/components/timeline/ActivityTimeline.tsx` accepts separate `windowBounds` and preserves a minimum44px interactive target without inflating the semantic viewport. Explicit shared Zoom in/out controls replace resize handles. Column zoom ranges from0.85 to2.2, and the current visible range and zoom have textual status. At a limit, the relevant zoom control disables.

**P2 — animated geometry invalidated centered zoom.** The first confirmation found a second defect: the canvas width and event left/width animated over300ms. At320,100→115→130→115→100% zoom settled at scrollLeft3210.5 instead of2736. Global canvas/event geometry is now immediate, retaining color/filter feedback. Domain geometry must settle before a centered-scroll calculation; reduced-motion configuration alone would not fix ordinary-mode drift.

## Final browser evidence

- At320, repeated zoom round-trip produced scrollLeft2736→3168→3600→3168→2736. The normalized center remained approximately0.07653 within rounding; the true overview width was0.765306%. ArrowRight moved to3488.5 and ArrowLeft returned to2736.
- The move target measured44×56px, keyboard focus remained visible/retained, and document width stayed320. Native pointer dragging moved scrollLeft to16278. Maximum220% and minimum85% zoom disabled the appropriate controls without losing the current area.
- At1280, normalized viewport centers were0.076530612 initially,0.076530982 at maximum zoom and0.076531091 at minimum zoom: no drift beyond subpixel rounding. Document width remained1280.
- Style Lab now uses the actual chart. At1280 its zoom controls work; at320 the move target receives focus and no document overflow appears. Enter on Sample completed visit announces a local-only action and stays on `/style-lab`.
- Viewport override was reset; the retained tab11 was reloaded in Light and marked for handoff.

Pointer cancellation, unmount cleanup and scroll-boundary cases have regression evidence. This pass does not label them native pointercancel observations or physical touchscreen evidence.

## Captures

Real browser captures; `before-1280.jpg` records the original defect, not the corrected state. The other four show the final actual consumers within their captured viewport scope.

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/timeline-overview-confirmation/before-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/timeline-overview-confirmation/after-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/timeline-overview-confirmation/after-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/timeline-overview-confirmation/style-lab-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/timeline-overview-confirmation/style-lab-320.jpg`

## Validation

Before the final immediate-geometry correction, the combined affected run passed68tests/11files, production build and targeted detector with no findings. That checkpoint does not validate the later correction by itself.

**Final correction checks:**16focused tests/3files, including the updated repeated-zoom regression; full TypeScript, scoped lint/format/diff and production build passed. Logs: `/tmp/paddock-timeline-immediate-tests.log`, `/tmp/paddock-timeline-immediate-types.log`, `/tmp/paddock-timeline-immediate-format.log`, `/tmp/paddock-timeline-immediate-build.log`. The full suite was not rerun;542/110 is a historical full-suite checkpoint. The final targeted detector on four owners also passed with no findings: `/tmp/paddock-timeline-immediate-detector.json`. This is source evidence, not visual/accessibility proof.

## Boundaries

The analysis overview keyboard/zoom/pointer gap is bounded-addressed, including the two discovered defects. Actual authenticated data/permissions, all charts/configurations, assistive-technology speech, physical touch, enlarged text, native pointercancel, OS reduced motion and full contrast/performance remain unverified. Prior period-header and other analysis evidence is preserved. No live event was opened or changed. The seven unique-composition gaps and root signed-in branch in [completion scope](completion-scope-2026-09-19.md) remain; this chart confirmation does not close them.
