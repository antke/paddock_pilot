# Shared time comparison charts

`TimeComparisonChart` renders aligned rows on one continuous calendar axis. It has no horse, training, query, or translation logic. Use it for measurements alongside events or date intervals.

Each `TimeChartRow` supplies a label, semantic colour (`var(--chart-1)`, etc.), optional unit/domain and one of four types:

- `line`: actual numeric observations, joined by straight segments. One point stays a point.
- `bar`: numeric observations or caller-defined aggregates. The default scale begins at zero.
- `events`: dated markers with collision-aware vertical packing.
- `intervals`: date bands with collision-aware packing; `openEnd` distinguishes unknown ends.

Each point has a stable ID, date, accessible/tooltip label and source `recordIds`. Bars may reference several records. The caller chooses aggregation, supplies `onSelect`, and renders record details and an accessible table. Pass `selectedId` to expose the active mark through its pressed state; marks support keyboard focus and tap/click selection. Dates use `YYYY-MM-DD`; different rows do not need matching observation dates. The chart clips intervals to the supplied range and uses the same horizontal scale in every row.

Supply a valid ordered range and filter observations before rendering. Positioning clamps dates to the range; it does not exclude out-of-range observations. Include intervals that overlap the range even when they begin earlier. Use `endDate` for known ends and `openEnd` for unknown ends, which extend to the range end with a dashed end marker. Keep the original dates and uncertainty in labels/details; clipping is not a new recorded endpoint.

Supply localised date/number formatters and empty/axis/accessible labels. Units remain separate by row. Keep missing values absent; never turn missing duration or measurements into zero. The chart does not interpolate values into tooltips or add extrapolated observations. Use an increasing `domain` for bounded scores. Default bar domains begin at zero; custom domains are caller-owned.

The renderer measures its container and reduces date ticks on narrow screens. `minTickSpacing` defaults to 80 pixels; increase it for longer labels. The horse caller includes years and uses 120 pixels for ranges spanning calendar years. Keep series labels and units visible; colour alone must not identify a row. This renderer shows chronology, not statistical correlation or causal effects.

`timeComparisonGeometry.ts` owns scale and context-lane geometry and can be tested without a browser. `DateRangeControl` in `components/ui` is a separate reusable controlled input. Supply `start`, `end`, `onChange`, `preset`, `presets`, `onPresetChange`, and localised `labels`; `invalid` connects both date fields to the error alert. Callers own date validation, query bounds, preset policy and switching to custom mode after manual changes. The control does not impose a minimum year; the horse caller supports historical records and validates a maximum range span of 3,660 days.
