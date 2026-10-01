# Horse analysis: comparison explorer

Exploration and implementation record, 29 September 2026. The first comparison explorer is implemented; see [First implementation](#first-implementation--29-september-2026) for the shipped scope. The proposal and further views below preserve the original design rationale and do not imply that every proposed interaction has shipped.

## Purpose

Help a horse owner or stable member see how recorded weight, condition, training and care changed over the same period, then inspect the underlying records. Extend the existing horse view in Analysis, preserving the established visual system. The primary task is comparing histories, not diagnosing causes.

## What the current records support

| Source | Available structured information | Suitable representation | Boundary |
| --- | --- | --- | --- |
| Weight records | Measurement date, kg/lb, optional body condition score (1–9) | Dated weight points with connecting segments; separate condition strip | Convert units consistently; missing condition is not zero |
| Training records | Horse and occurrence date, completion status, activities, format, optional minutes, rider, focus/outcome notes | Completed-session marks, minutes per session, weekly recorded minutes/counts | Minutes are optional; no intensity, exertion or performance scores |
| Nutrition logs | Change date, summary, optional feeding-routine/recommended/avoid snapshots | Change markers and expandable notes | No structured daily feed quantities, energy or nutrients; a snapshot does not prove adherence |
| Health issues | Noted date, optional severity, current status, resolution timestamp | Issue markers or recorded open-to-resolved spans | Resolution timestamp reflects when marked resolved; not necessarily actual recovery date; no symptom score history |
| Medication | Start and optional end date, status, name, free-text dosage/frequency/reason | Course bands and notes | No administration log; a recorded course does not prove doses were given |
| Care and competition events | Dates, type, status, horse links, optional cost and notes | Appointment/competition markers; intervals between confirmed completed visits | Plans are not completed care; recurrence needs occurrence-level evidence |
| Reminders | Due date, category, status, completion timestamp | Follow-up context or separate completion view | Completing a reminder is not proof a clinical procedure occurred |

Source evidence: `convex/schema.ts`, `shared/training/trainingSchema.ts`, `shared/horses/weightRecordSchema.ts`, `docs/features/training-log.md`.

## Recommended comparisons

| Priority | Comparison | Question the display helps explore | Display |
| --- | --- | --- | --- |
| First | Weight × training | How did recorded weight change during periods of more or less recorded training? | Weight line above session marks or weekly minutes, aligned by date |
| First | Weight × nutrition changes | What measurements were recorded before and after a feeding change? | Weight line with change markers and exact notes |
| First | Weight × body condition | Did measured weight and recorded condition move together? | Two aligned plots, kg and 1–9, without a shared numerical scale |
| First | Training × health/medication | How did the recorded training pattern overlap an issue or medication course? | Session bars above issue/course bands |
| Next | Training × care visits | What was recorded around farrier, dental, vet or physio appointments? | Training bars plus completed-visit markers |
| Next | Weight/condition × health/medication | What measurements occurred during an issue or course? | Measurement plot plus bands |
| Next | Training × competitions | What did recorded preparation and subsequent training look like? | Training timeline anchored on competition dates |
| Next | Nutrition changes × health issues | Which changes and issues were recorded near one another? | Two aligned event lanes; chronological context only |
| Next | Training activity mix over time | Was the recorded programme varied or concentrated? | Weekly activity composition, with explicit handling of multi-activity sessions |
| Later | Recorded event costs × care types | When did recorded horse-specific costs accumulate? | Monthly bars by type; explicitly partial costs |

Avoid an unrestricted "compare anything" matrix. Numerical measurements, events and intervals need different encodings. Let users select meaningful combinations while the application chooses the suitable chart.

## Main interaction

At the top of the existing horse analysis view, introduce one full-width comparison section:

1. Horse selection stays in the existing Analysis scope selector.
2. Provide useful entry points: Weight & training, Feeding changes, Condition, Training & care.
3. Controls: Measure, Compare with, date range (30/90/180 days, year, custom). Default to 90 days, with a clear way to include older records.
4. Measure options: weight, body condition, completed training sessions, recorded training minutes. Context options: training, nutrition changes, health issues, medication, care visits, competitions. Permit a second context layer as an explicit addition rather than enabling everything initially.
5. Show the measured trend above compact context lanes sharing the exact horizontal time scale. Use separate vertical scales for different units rather than arbitrary dual-axis overlays.
6. Hover, focus or tap a real record for its actual date/value and source. Selecting it opens details below the chart on mobile and in an adjacent panel where space allows.
7. A period selection gives descriptive facts with coverage: number of measurements, first/last values and dates, completed sessions, recorded minutes, nutrition changes. Never automatically colour weight gain or loss as good/bad.

Preserve the current serif headings, paper surfaces and restrained chart colours. Give the chart most of the width; avoid another grid of competing summary cards. On mobile, stack the controls and lanes without squeezing the axis labels. Reuse existing chart/theme components, localisation and record navigation.

## Time and evidence rules

- Use a continuous calendar axis: 1 February, 5 February and 25 February must retain their real spacing. Each series keeps its own observation dates.
- Draw measured points prominently. Straight connecting segments are visual guides, not additional measurements. No smoothed curves, fabricated daily weights or extrapolation beyond observations. A gap may be highlighted without assigning it an invented value.
- Tooltips report actual observations and dates. If displaying a nearby observation, label its date/distance explicitly. Never present an interpolated weight as measured.
- Use a consistent local calendar-date convention across date strings and timestamps; preserve the source date and original unit in details.
- Default training comparisons to confirmed completed sessions. Plans, cancelled, skipped and unconfirmed sessions remain distinguishable context; they never silently become completed workload. Reuse existing occurrence projection and legacy one-off completion rules; deduplicate by horse, event and occurrence date.
- Label empty periods "No recorded training" rather than "Rest". Show duration completeness, e.g. "Minutes recorded for 8 of 11 completed sessions"; missing minutes do not become zero.
- Keep separate observations made on the same day accessible. Weekly aggregation may sum completed sessions/minutes, but must state the bucket and coverage.
- Activity tags may overlap within a session. Do not count its full duration in every tagged activity or imply time allocation that was never entered. Use a "mixed" category or explicitly overlapping tag counts until per-activity duration exists.
- A recurring care plan or global series status alone cannot establish that every occurrence happened. Do not fabricate historical visit intervals from it.
- Nutrition changes remain markers; do not turn free-text feeding instructions into a numerical intake series. If a plan band is added later, call it recorded plan context, not confirmed intake.
- Medication end dates can be unknown; show an open end. Historical health bands describe record status timing, not measured recovery.
- Include intervals starting before the selected range when they overlap it. Clearly mark clipped/unknown endpoints.
- Offer "No records in this period", a single measurement (point, no trend), partial pair (show available data), loading/error and locked access states. Allow a record table as an accessible alternative.
- The feature shows temporal association. Do not label descriptive changes as effects or publish a correlation coefficient from sparse, irregular or mostly categorical records.

## Further views worth exploring

**Around a change.** Select a nutrition change, appointment or competition, then inspect a chosen number of days before/after. Show the actual nearest measurements on each side, their dates and distance from the event. With insufficient observations, show that limitation instead of a calculated effect. Other changes remain visible.

**Training rhythm.** A month strip with completed, skipped, cancelled and unconfirmed sessions, plus weekly totals. This reveals the recording pattern and session spacing without interpreting blank days as rest. A rolling seven-day count/minutes curve can later help comparisons cross week boundaries, with the calculation named explicitly.

**Care intervals.** A horizontal sequence of verified completed farrier/dental/vet visits, labelled with elapsed days. An upcoming planned visit uses a distinct future marker. Avoid prescribing a universal ideal interval.

**Preparation around competitions.** Anchor the view on a competition and show prior training frequency, activities and subsequent records. Competition outcomes/scores and exercise intensity require new structured fields before effectiveness can be quantified.

**Recorded costs.** Potentially useful operational analysis, but separate from condition/training relationships. Use explicit horse cost shares and clear fallback rules; do not attribute a whole stable event cost to each horse. Currency and incomplete cost coverage need resolution first.

## Implementation implications, once the design is settled

- The existing `AnalysisHorseTab.tsx` is a summary/list composition. Add the comparison surface as the primary analytical element, with current summaries beneath it.
- The current `stableAnalysis.getForStable` excludes training events and does not load `trainingRecords`. It returns capped stable-wide summary lists; these are not a complete per-horse series.
- Add a horse-scoped, date-range query returning typed raw measurements, confirmed training projection and dated context records. Preserve current server-side stable/horse access checks and premium analysis gating.
- Do not parse translated display strings back into values. Normalise weight units before aggregation and preserve source records for drill-down.
- Include range-overlapping intervals and, if useful, one clearly labelled measurement outside either range boundary. Do not silently truncate the series.
- Carry English/Polish labels, dates and number formatting through the controls, axes, states and detail view.
- Verify date alignment, mixed units, missing durations/condition scores, same-day observations, recurrence/legacy rules, status exclusion, access control and sparse/empty series when implementing.

## Proposed first scope

One shared comparison explorer, the four first-priority presets above, a date range, optional context lanes and record drill-down. Follow it with the existing horse summaries. Defer statistical correlation, causal claims, automated health advice, arbitrary text scoring and additional data-entry requirements.

## First implementation — 29 September 2026

The approved comparison explorer now sits above individual-horse summaries. It includes the four presets, configurable measurement/context/additional context, 30/90/180/365-day and custom ranges, record details, a record table, and a four-week before/after action. Weight, condition, training, nutrition, health, medication, completed one-off care visits and completed competitions are available in the selectors. Daily training bars group completed records and expose all contributing sessions; records with missing duration remain separate markers. Other training statuses are opt-in context.

The shared graph lives in `src/components/charts/TimeComparisonChart.tsx`; its reusable API is documented beside it. Shared range inputs live in `src/components/ui/date-range-control.tsx`. Training occurrence projection moved to `shared/training/trainingEntries.ts`, with existing client exports preserved. A separate `stableAnalysis.getHorseComparisons` query validates access and retrieves complete horse evidence for a bounded range, using an IANA zone for timestamp dates.

This is an Operate-mode extension of the existing app design: one paper section, shared serif section heading, existing choice/select/date controls, numeric rows and compact context lanes. Details sit below the chart at all widths, with an expandable record table as an alternative way to select records. The renderer owns geometry and selection targets; the horse caller owns evidence preparation, labels, translations, summaries and record navigation. See the [shared chart contract](../../src/components/charts/README.md) and [design guidance](../../DESIGN.md#time-comparisons).

Historical custom ranges are supported without an arbitrary minimum year, with a maximum span of 3,660 days. Ranges crossing calendar years include years in axis labels and reduce tick density. Completed care context uses care classification rather than treating every completed non-training event as a care visit. The view retains the recording limitations above: optional minutes, record-status resolution dates, unknown medication ends and no causal interpretation.

`/page-lab/analysis` exercises the same component with explicitly illustrative records. Further dedicated training-rhythm, care-interval and competition-preparation summaries remain follow-up views; their underlying timelines can already be compared in the explorer. Cost analysis and new intensity/feed/performance fields remain outside this first implementation.

## Annual demo history

`devHorseAnalysisSeed:seedYear` adds a deterministic 365-day comparison history to one existing horse in the active `Paddock Pilot Demo Yard`. It requires `DEV_SEED_ENABLED=true` and is an internal mutation. Use the development deployment:

```sh
pnpm exec convex run devHorseAnalysisSeed:seedYear '{"horseId":"<demo-horse-id>","end":"2026-09-30","confirm":"seed-horse-analysis-year"}'
```

The generated history includes irregular weights (including a few pound measurements), optional body-condition scores, seasonal training volume, missed sessions and missing durations, eight feeding changes, three resolved health episodes with illustrative medication courses, care appointments and competitions. Weights are anchored to the horse's latest existing non-generated measurement. Medication entries deliberately use placeholders, not actual drug names or doses.

Every generated entry is marked `[Demo analysis year]`. The seed preserves existing records, links events to the horse, and skips already-generated entries for the same horse/end date. Keep the same end date when rerunning: a different end date creates a separate dataset. It neither resets the yard nor edits horse profiles, subscriptions, reminders or invitations. Choose **Last year** in horse analysis for the full dataset; other training statuses are an opt-in context layer. Existing records remain alongside the synthetic history.
