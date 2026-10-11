---
target: Horse and stable analysis clarity
total_score: 23
max_score: 40
stable_score: 21
horse_score: 25
score_basis: mean of two scope scores
na_heuristics:
p0_count: 0
p1_count: 3
timestamp: 2026-10-02T14-25-12Z
slug: src-components-analysis-analysiscentre-tsx
---
Method: dual-agent (A: /root/analysis_design_assessment · B: /root/analysis_evidence_assessment)

# Horse and stable analysis — clarity review, 2 October 2026

**The page has useful evidence, but it makes the user assemble the meaning. The largest improvement is a clearer reading order: orient → understand → explore → inspect. More color can support that order; it cannot establish it.**

This is an expert critique, not a usability study. Both assessments independently inspected production components in the local fixture page. A reviewed desktop structure; B reviewed desktop/mobile, annual date range, keyboard point selection, crowded and empty states. The parent additionally checked the live development queries. No application code or database records were changed.

## Design specificity and overall impression

The page belongs to this product: aligned horse measurements, training coverage, care appointments and source records are useful domain-specific material. The stable-journal typography and paper surfaces are worth keeping. The problem is that the stable view leads with an appointment timeline, while the horse view leads with configuration. Both postpone the overview that would explain what to look for.

The bounded deterministic scan returned **0 findings across six source files**. It did not identify the hierarchy, scope or interaction problems found in the browser. There were no detector false positives to adjudicate. This is a clean style scan, not a usability or accessibility certification.

## Design health

Scores are expert judgments on a 0–4 scale. All ten heuristics apply.

| Heuristic | Stable | Horse | Main limitation |
|---|---:|---:|---|
| Visibility of status | 3 | 3 | Selected state is visible; the scope of surrounding summaries is less clear. |
| Match with real-world thinking | 2 | 2 | “Blocks” and “signals” precede practical questions. |
| User control and freedom | 3 | 3 | Good switching/presets; weak reset and return-to-exploration path. |
| Consistency | 2 | 3 | Stable display filters do not narrow associated counts/details. |
| Error prevention | 2 | 3 | Horse date validation is sound; scope can still be misread. |
| Recognition rather than recall | 2 | 2 | Readers must connect distant chart, detail and summary sections. |
| Efficiency | 2 | 2 | Exploration requires repeated configuration and traversal. |
| Visual hierarchy and restraint | 1 | 2 | Too much apparatus before useful interpretation. |
| Error recovery | 2 | 3 | Horse retry exists; empty stable keeps unnecessary controls. |
| Help and explanation | 2 | 2 | Considerable explanation, but insufficient guidance toward a question. |
| **Total** | **21/40** | **25/40** | **Both need significant improvement.** |

Combined tracking score: **23/40**, the mean of the two scope scores. It is not a measured task-success rate. Loading/error/access scores include source review; network failures were not induced.

## What to preserve

- Real observation dates, separate numeric units/scales and explicit missing-duration coverage. These make the comparisons trustworthy.
- Source-record inspection and the record-table alternative. Keyboard Enter successfully selected a chart point with visible focus.
- The existing reusable components, calm application shell and clear domain terminology where it already exists.

## Five priority issues

### 1. [P1] The important answer comes after the machinery

The stable order is timeline → selected-period details → needs attention. The horse order is comparison builder → horse identity/status → several supporting panels. In the inspected fixtures, “Needs attention” began about **2,358px below the Analysis Centre heading on desktop and 3,346px below it on busy mobile**. Those measurements exclude the lab navigation offset; they are examples, not universal page dimensions.

**Fix:** Put a compact, factual overview first. Stable analysis should help answer “What changed across the yard, and which horses deserve a closer look?” Horse analysis should answer “What changed for this horse, and what was recorded around that time?” Keep current actionable care visible, but avoid recreating the entire daily dashboard.

Evidence: `AnalysisCentre.tsx:265`, `AnalysisHorseTab.tsx:58`. Commands: **shape → distill**.

### 2. [P1] Time ranges, filters and data coverage do not form one clear contract

Stable category/status filters affect timeline blocks while the selected-period totals and lists retain all activity. An explanatory sentence below the chart cannot reliably undo the expectation that a filter applies to the accompanying results.

The horse range applies to the comparison only; the following care/weight panels use independent current/recent summaries. Some of these are derived from capped stable-wide lists. In the live demo yard, **20 horses had weight records, but only eight weight-trend summaries were returned**. Thistle Run was included; other horses can lose summary detail even when their full comparison contains observations. That is a data-completeness issue to fix, not proof those horses lack records.

**Fix:** Label “History · [selected dates]” separately from “Current care · as of today.” Keep filters and associated detail lists consistent, or explicitly distinguish “Shown events” from “All activity.” Fetch complete horse-scoped summaries rather than looking up a selected horse in a stable top-eight list. Show missing/stale coverage as unknown, not reassuring zero. Define completed training from recorded outcomes when aggregating stable workload, rather than treating all scheduled events as completed work.

Evidence: `AnalysisCentre.tsx:417`, `:724`; `HorseComparisonExplorer.tsx:82`; `convex/stableAnalysis.ts:796`; `analysisHorseData.ts:122`. Commands: **clarify → harden**.

### 3. [P2] The comparison form competes with the result

There are four useful presets followed by seven parameter controls: three selectors, period, two date fields and a training-status checkbox. These are grouped controls, not eleven choices in one menu, but they all appear before the plot. On mobile, the first plotted point was roughly **957px below the comparison heading** in the inspected fixture.

**Fix:** Default to one ready-made comparison. Show only its question/preset and a compact period control above the chart. Put measure, second/third dataset and training-status inclusion behind “Customize comparison.” Show From/To fields when Custom dates is selected. Label the chosen question, e.g. “Weight alongside training,” instead of relying on the generic “Compare over time.”

Evidence: `HorseComparisonExplorer.tsx:132`. Commands: **distill → clarify**.

### 4. [P1] Chart density and inspection do not scale to the year view

The annual mobile plot merged fixed-width training bars, and 28×28px record targets overlapped. Keyboard selection worked; incorrect pointer activation was not tested. This was already visible when compressing the short fixture into a year. The live Thistle query contains **198 training entries**, so the annual experience needs an explicit density strategy. The full Thistle annual dataset was verified through the query, not rendered in this browser pass.

The stable timeline has a related issue: its default day column is **384px wide inside a 324px mobile viewing area**, clipping portions of the date/TODAY context. Selected horse-record details also sit below all chart rows, separating the evidence from its explanation.

**Fix:** Offer clearly labelled weekly/monthly training totals at long ranges, retaining contributing records on selection. Keep weight as actual observations. Use density-aware bar widths and a date/cluster inspector for nearby touch targets. Make a full stable day fit on mobile; use week/month overview for initial scanning. Keep date focus and the selected-record inspector adjacent on desktop and immediately available on mobile. Provide “Return to previous range” after focusing around an event.

Evidence: `TimeComparisonChart.tsx:196`, `:247`; `StableActivityTimelineChart.tsx:117`; `HorseComparisonExplorer.tsx:378`. Commands: **adapt → shape → polish**.

### 5. [P2] Color is too restrained for categories and too strong for a neutral vet visit

Weight and training use neighboring greens. Several domains reuse colors, while routine veterinary events use the destructive color, which also signals genuine urgency. Separate labelled rows mitigate the ambiguity, but the palette does little to aid fast recognition.

**Fix:** Add a chart-specific palette inside a distinct analytical section while retaining the existing application theme. A proposal: pine for weight, blue for training, ochre for nutrition, plum for health-related context; secondary domains receive distinct labels/marks. Keep only two or three active datasets visible by default. Assign category colors consistently across both scopes; use status badges/patterns for urgency. Reserve warning/destructive semantics for actual status. Validate the final palette in light/dark themes and with color-vision simulations; no contrast failure is claimed by this review.

Evidence: `horseComparisonData.ts:47`, `StableActivityTimelineChart.tsx:127`. Commands: **colorize → polish**.

## Proposed structure

| Reading step | Stable analysis | Individual horse |
|---|---|---|
| **Orient** | Stable name, history period, clearly separate current-care status. | Horse identity, latest measurement/date, current-care exceptions. |
| **Understand** | Two or three traceable findings about changes and coverage. | One neutral summary of the selected comparison, with observation count and dates. |
| **Explore** | Horse overview table plus a focused activity/recording trend. | Ready-made comparison, compact range and aligned chart rows. |
| **Inspect** | Select a horse or period for the relevant source records. | Select a date/record for nearby details and “Around this change.” |
| **Go deeper** | Detailed appointment timeline, filters and full records. | Custom comparisons, health/nutrition/care history and documentation. |

For the stable, a **horse-by-horse overview table** would be more useful than additional KPI cards: horse, latest weight/change with dates, completed training and duration coverage, open health records, overdue reminders. A row should open that horse while preserving the history range. Keep measures in their own units; do not combine all horses' weights into a “stable health” score. Use explicit reasons for follow-up rather than an opaque ranking.

For the horse, retain the four comparisons as entry points. Put health, nutrition and documentation lists in a compact “Supporting records” area. Reveal detail on purpose rather than rendering every domain as an equally prominent section.

## A richer chart container

Yes: a slightly tinted chart surface, stronger data colors, direct labels and a clear plot boundary would help. Avoid dark decorative dashboards or adding a frame around every row. The chart should feel like the focal working area within the existing stable journal.

Reuse `TimeComparisonChart` for numeric comparisons and retain `ActivityTimeline` for detailed appointment inspection. Add shared scope/range, chart-frame, coverage and record-inspector patterns only where both views need them. Centralize domain-color assignments. This makes refinement reusable rather than introducing separate chart systems.

## Cognitive load and user journey

The independent design review judged **6/8 cognitive-load checks weak for stable and 5/8 for horse**: chiefly focus, hierarchy, sequencing and progressive disclosure. These checklist counts are diagnostic judgments, not psychological measurements; a menu with more than four options is not automatically a defect.

The current journey is reassuring visual tone → substantial configuration/navigation → useful source detail → more lists. The best moment is selecting evidence. Bring that moment earlier, and leave the user with a clear understanding of both what was recorded and what remains unknown.

Persona checks:
- **First-time owner/member:** must translate “blocks,” “signals” and “additional context” into a useful question. Lead with plain comparisons and meaningful scope labels.
- **Frequent reviewer:** must rebuild context across subject/range changes and distant details. Preserve the range and make return/reset explicit.
- **Keyboard, low-vision and mobile users:** keyboard point selection is a strength; overlapping touch targets, small axes and distant inspectors need attention. This was not a full assistive-technology audit.

## Polish and eventual delight

**Structure first:** establish the two reading paths, complete the data contract, reduce initial controls and solve annual density. Cosmetic polish alone will leave the central problem intact.

**Polish second:** refine chart colors, label hierarchy, axis ticks, mobile widths and empty states; reduce the oversized “Work in progress” notice to proportionate beta context. Replace “nutrition correlations” or “linked” language with dated proximity where that is all the data establishes. When a year contains records for only a few months, state the actual coverage and offer “Fit recorded period.”

**Delight after clarity:** synchronize date focus across rows; keep the date position steady while switching comparisons; make selecting a feed/care change open a useful before/after window with a clear return action; preserve the selected horse/range during drill-down. These should make users feel that the app keeps track of their question. Avoid celebration or playful judgments around health and weight.

## Acceptance checks for the next design

- A new user can identify the subject, time period, one meaningful change and one next exploration without scrolling through configuration.
- A year of Thistle Run data remains legible and selectable at 390px, with aggregation and missing-duration coverage stated.
- A stable filter and its associated details agree; all-history/current-care distinctions are explicit.
- Horses outside the stable's top lists receive complete horse summaries.
- Selecting a record reveals its actual date and source without losing the comparison context.

These are proposed validation tasks, not tests already passed by a redesign.

## Questions for the next step

1. Should the first structural pass cover both views together, or begin with the horse comparison workspace? Recommendation: both together so scope and navigation become consistent.
2. Should the charts use a richer palette inside the current paper theme, or become a more visually distinct analytical workspace? Recommendation: a richer chart palette within the current theme.
