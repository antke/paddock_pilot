# Assessment B — detector and browser evidence

Independent assessment B; did not read Assessment A or earlier critiques. Target: src/components/analysis/AnalysisCentre.tsx; scope also AnalysisHorseTab.tsx, HorseComparisonExplorer.tsx, StableActivityTimelineChart.tsx, src/components/charts/TimeComparisonChart.tsx, src/components/ui/date-range-control.tsx.

## Deterministic detector

Ran exactly once:
`node /Users/antek/.agents/skills/impeccable/scripts/detect.mjs --json src/components/analysis/AnalysisCentre.tsx src/components/analysis/AnalysisHorseTab.tsx src/components/analysis/HorseComparisonExplorer.tsx src/components/analysis/StableActivityTimelineChart.tsx src/components/charts/TimeComparisonChart.tsx src/components/ui/date-range-control.tsx`
Exit 0. Complete JSON `[]`. 0 findings across these six files; therefore no rule names/file locations or false-positive findings exist. This is a clean bounded static scan, not evidence of interaction/accessibility quality. Raw output temporarily stored at /private/tmp/analysis-detector-B.json. Ignore file did not exist (test/read emitted nothing); parent may record same result.

## Browser method and limitations

Fresh B-owned hidden IAB tab at http://127.0.0.1:9090/page-lab/analysis. Existing production components rendered by page-lab, fictional baseline and busy/empty fixtures. Desktop 1280×1000 and mobile 390×844 explicitly measured via innerWidth/innerHeight. Screenshots were valid, single rendered viewports, with no malformed/tiling artifacts in B captures. Default fixture 90 days of comparison records; choosing Last year changes time domain but does not create additional records. This is NOT a screenshot of the live seeded Thistle full-year dataset. Parent reports independently verified live annual record counts; use them as parent evidence, not B rendered observation.

Browser evaluate is documented read-only. Mutable title/script injection prohibited by that API: skipped overlay preflight mutation, overlay injection, browser presentation and Impeccable live-server. No reliable user-visible overlay exists. Fallback = bounded static detector plus production-component screenshots, DOM, geometry and source. App dev server owned by parent, no B server spawned.

## Findings supported by observations

### 1. Comparison inputs consume substantial space before the first plot; compact controls would improve first understanding (P1/P2 depending product priorities)

Desktop baseline comparison screenshot B-horse-desktop.jpg shows four suggested presets followed by Measure / Compare with / Additional context, then Period / From / To, then other-training checkbox, sample disclosure and summary before chart. This is 4 visible preset choices plus 7 separate parameter controls (3 selection fields, period, two dates, one checkbox), with a separate subject selector. Do not call this an eleven-choice single menu: the groups are labelled and presets are exactly four. Opening Measure exposes five options; each context select exposes nine including None; period has five. Detail disclosure exists for source table.

HorseComparisonExplorer.tsx:132–216 lays out all controls above chart. Mobile presents six 40px fields in single column. At mobile 390, H2 Compare over time document y=1451.17, first weight point document y≈2408.42: plot arrives roughly 0.9 viewport after its section heading. Compare section next H2 (horse summary) starts y=3210.63, about 1760px after comparison heading. Full page document includes lab-only navigation above Analysis Centre; exclude that lab-only chrome when describing production first viewport. Desktop comparison heading y=918.45 and plot top about y=1380 in unscrolled fixture; production-relative offset ≈460px. Initial page screenshot therefore showed only heading and no plot due to additional lab chrome, not because production necessarily hides entire chart.

Sources: HorseComparisonExplorer.tsx:132, 161, 181, 210, 340; AnalysisHorseTab.tsx:58–69.

### 2. Dense annual mobile chart is selectable by keyboard but visually/tactually crowded (P1)

Year range verified 3 Oct 2025–2 Oct 2026. Desktop 6 axis ticks include years and are separated. Mobile 3 ticks: 3 Oct 2025 / 3 Apr 2026 / 2 Oct 2026; no overlapping axis labels. Same-year 90d mobile axis 4 ticks: 5 Jul / 4 Aug / 2 Sept / 2 Oct, appropriately omits year within same year. Do not report missing annual year labels.

At 390px viewport (document scrollWidth=390; no page horizontal overflow), chart plotting extent is x93–333, only 240px over a full year. With just 11 duration bars in the final 90 days, fixed 10px bars merge into a dark block on right; e.g. Jul6 and Jul10 centers differ only2.63px. Interactive chart buttons measured 28×28px both mobile and desktop. Annual mobile x positions for weights: 264.93,274.82,287.35,299.22,311.09,317.68 (left edge; all width28). Mid-Aug and early-Sep targets overlap in both x and y; neighboring session targets overlap too. Thus one can activate adjacent later-painted marks instead of intended near mark. Did not test actual erroneous pointer activation, so describe as overlapping hit regions, not demonstrated wrong record response. Keyboard Enter on 15 Aug 2026 · 503 kg correctly set aria-pressed and displayed selected source record. Focus outline clearly visible in mobile screenshot. Record table alternative exists. All dates retained in accessible point labels.

TimeComparisonChart.tsx:61–78 (plot width/ticks); 84–88 (numeric row184px); 196–204 (fixed bar10px); 247–259 (all points button28px); 271–305(axis). HorseComparisonExplorer.tsx:345–352 handles year-aware labels correctly. Best fix density-aware aggregation/zoom with robust touch selection, preserving detailed source records and keyboard option. Full live annual density not rendered here; issue already observed with sparse 90-day fixture compressed into actual annual domain.

Screenshots B-horse-year-mobile-chart.jpg (plot and visible selected focus) and B-horse-year-desktop.jpg; B-horse-year-mobile.jpg shows selected source panel and unobstructed yearly labels.

### 3. Stable timeline cannot fit a whole day column on mobile at default zoom (P2)

StableActivityTimelineChart.tsx:117–120 defines day24rem =384px versus mobile calendar region width324px. Default scroll centers current period (278–285), so the mobile busy screenshot cuts off start of 'Day'/'2 Oct' at left and TODAY tag at right. Selected column extends outside visible region even before visiting other dates. The plot is horizontally navigable; this is local clipping, not page overflow. Useful context (day label, all badges) is incomplete until user scrolls/zooms. Dense timeline screenshot also shows appointment title truncation and large blocks. Overview says visible columns8–8 of98, zoom100%. Movable window hit area measured44×56px: do not claim minimap handle has too-small touch target. It visually looks narrow but overlay hit area is enlarged.

Sources StableActivityTimelineChart.tsx:117–125,278–285,348–365,481–518,841–846. Screenshot B-stable-busy-mobile.jpg.

### 4. Stable attention and horse summary compete with long exploration sections (P2)

Production order stable timeline, selected period breakdown, Needs attention (AnalysisCentre.tsx:265–292). Baseline desktop fixture measured H1 Analysis Centre y628.53; timeline H2 y918.45; selected period H2 y2106.37; Needs attention H2 y2986.71. Relative to Analysis Centre header, attention begins2358px lower. Busy mobile: Analysis Centre y1130.75; timeline y1399.17; selected period y3132.58; attention y4476.34. Relative gap3346px. Lab chrome accounts for initial page offset, but not within-component gap. This is a material traversal for triage. Horse summary is below the entire compare explorer (AnalysisHorseTab.tsx:58–69), and horse mobile further includes Health, Weight, Nutrition, Care plan, Documentation gaps through y7139.97.

ScrollableLists cap long records, which helps: busy mobile care-record region352px high, selected-event region420px, attention368px. However user navigates both main page and several inner scroll regions. Preserve caps; prioritise a brief attention/coverage summary and disclosure of secondary detail. Do not advocate showing all annual records at once.

### 5. Colour role collisions, not verified contrast failures (P2/minor)

Stable timeline completed vet visit renders muted burgundy despite Completed label; code eventTypeAccents.vet = var(--destructive) (StableActivityTimelineChart.tsx:129). This assigns danger colour to neutral service category while genuine urgent records also use destructive (AnalysisCentre.tsx:736,829,931). Green has multiple roles across training, charts, current selected area. Horse comparison rows explicitly reuse chart colours: weight chart1; training and care chart2; condition and medication chart3; nutrition and competition chart4; health chart5 (horseComparisonData.ts:47–55). Default weight and training therefore use close greens, but separate labelled tracks and different line/bar marks mitigate confusion. CSS defines chart1=#285b43, chart2=#557865, chart5=#962f43 equal destructive at styles.css:147–164. No contrast ratio was calculated. Do not call this a WCAG contrast failure. Recommendation separate category identity from urgency; retain labels/shapes.

## Strengths, contrary evidence and cautions

- Explicit units on numeric tracks, shared date axis, real date positioning, year-aware labels and source selection; evidence text expressly states adjacency does not establish cause. Missing-duration training appears separately instead of an invented zero.
- Keyboard Enter selection works and displays visible focus/aria-pressed. Source supports roving selected period tabindex and Home/End/ArrowLeft/ArrowRight in timeline (StableActivityTimelineChart.tsx:365–384), plus arrow-key minimap control841–846. Do not claim general keyboard-inaccessible charts.
- DateRangeControl.tsx:43–73 labels both dates, links invalid state to role=alert; HorseComparisonExplorer.tsx:101–106 prevents bad dates/reversed range/>3660 days; live query has loading, retry and locked handling243–269. Those network states were source-reviewed only, not simulated in fixture.
- Empty stable honestly says no timeline events, no overlaps and no urgent actions; still retains scale, zoom and10 filter choices despite nothing to filter. This adds noise and offers no immediate create-record action. Empty behaviour was observed, not captured as screenshot.
- Baseline fixture has contradictory summary 'No high-severity active issue' alongside urgent high active health records, and comparison latest weight508 differs from summary510. These are separate fixture data inputs; do NOT file as confirmed production data bug. Full live reconciliation not inspected by B.
- Four suggested comparison presets are within skill's4-option guideline; seven category filters exceed it but are a meaningful parallel category set. Treat reducing visible knobs as judgement, not automatic violation.
- Dev lab navigation, fixture selectors, fictional explanatory language and devtools are scaffolding and excluded from product critique.

## Screenshot artifacts

All at /Users/antek/Documents/projects/paddock_pilot/.impeccable/review/analysis-critique-2026-10-02/:
- B-horse-desktop.jpg
- B-horse-year-desktop.jpg
- B-horse-year-mobile-chart.jpg
- B-horse-year-mobile.jpg
- B-stable-busy-mobile.jpg

## Required run notes for parent synthesis

Independent B did not consume A/prior critiques. Static detector executed once,0 findings complete JSON. No ignore file content. Target slug/persistence/trend owned by parent. Hidden fresh IAB tab; no visibility promotion. Mutable injection unavailable documented read-only evaluate; overlay and its live-server skipped explicitly, no overlay claim. Viewport desktop then mobile temporary overrides reset successfully. B tab closed successfully. No app code edits, deployment, backend mutation, seeding or server creation. Only screenshot artifacts plus temporary report/raw JSON. Parent may remove /private/tmp/analysis-detector-B.json and /private/tmp/analysis-critique-B.md after incorporating evidence; persistent screenshot artifacts should remain.
