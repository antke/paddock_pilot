---
target: stable-wide Analysis tab
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
timestamp: 2026-08-25T10-23-35Z
slug: src-components-analysis-analysiscentre-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|------:|-----------|
| 1 | Visibility of System Status | 3 | Timeline selection and counts are clear; lower work has no ownership or completion state. |
| 2 | Match System / Real World | 2 | Yard language is strong, but health, medication, nutrition, weight, and reminders are all called “events.” |
| 3 | User Control and Freedom | 2 | Timeline controls are capable; watchlist horses and urgent reminders provide no direct action path. |
| 4 | Consistency and Standards | 2 | Similar-looking lower rows behave differently, and equivalent analysis is shaped by competing client and server models. |
| 5 | Error Prevention | 2 | “All clear” and 100% documentation can overstate confidence; status filters also behave contrary to their checked state. |
| 6 | Recognition Rather Than Recall | 2 | “Open a horse tab” requires remembering the horse and returning to navigation instead of following a direct link. |
| 7 | Flexibility and Efficiency | 1 | No sorting, assignment, claiming, bulk handling, or expert path through the lower work. |
| 8 | Aesthetic and Minimalist Design | 2 | Attractive system, but fixed-height whitespace and redundant panels make the page much longer than its information warrants. |
| 9 | Error Recovery | 2 | Lower content is mostly read-only; the route lacks a tailored recovery state and urgent work cannot be retried in context. |
| 10 | Help and Documentation | 2 | Explanations are useful, but urgency, coverage rules, and date windows are not defined. |
| **Total** | | **20/40** | **Acceptable; significant operational UX work remains.** |

## Design Specificity Verdict

**LLM assessment:** The stable activity timeline is distinctly Paddock Pilot: it combines the warm Tack Room Noticeboard visual language with a credible planning instrument for a small yard. Below it, the experience becomes category-generic. “Stable watchlist,” “Action queue,” and a percentage-based documentation card could belong to almost any admin dashboard, and they omit the product’s clearest differentiator: shared responsibility—who owns, claimed, completed, or handed over the work.

**Deterministic scan:** The detector returned `[]`: zero findings across `AnalysisCentre.tsx`, `StableAnalysisPage.tsx`, `StableActivityTimelineChart.tsx`, and `analysisCentreData.ts`. This confirms no known mechanical anti-pattern, not functional completeness. The important defects are interaction logic, data provenance, responsive composition, and information value.

**Visual overlays:** No reliable user-visible overlay is available. Codex Browser’s evaluation surface rejected mutable injection, so the live detector server was not started. Evidence came from fresh-tab desktop/mobile rendering, DOM snapshots, screenshots, interaction state, computed geometry, and source/backend tracing.

## Overall Impression

The top half is already a strong analysis product. The selected date/period inspector is part of that strength and should remain, preferably visually integrated with the timeline. The single biggest opportunity is to make everything below answer one question: “What needs attention, who owns it, and what should happen next?” The current lower panels repeat schedules, hide urgent actions behind read-only rows, and end on an incomplete audit percentage.

## What’s Working

1. **Timeline plus selected-period detail is a genuine master-detail tool.** Day/week/month scale, categories, selected state, overlap handling, provider/location metadata, and deep links create real planning value.
2. **The visual system is coherent and product-appropriate.** Warm flat surfaces, condensed headings, readable metadata, and restrained semantic color retain the noticeboard character without becoming decorative.
3. **Baseline semantics and state coverage are good.** The page has one H1, section H2s, named timeline controls, pressed states, specific empty states, a clear locked-plan state, and legible light/dark rendering.

## Priority Issues

### [P1] The stable-wide page has competing sources of truth

**Why it matters:** `StableAnalysisPage` fetches a dedicated `stableAnalysis` result, but `AnalysisCentre` uses only its timeline signals and recomputes most lower metrics from dashboard data. The Page Lab already exposes the drift as “4 event blocks · 0 events · 2 urgent events.” Reminder windows also differ: the queue promises 30 days while dashboard reminders originate from a 14-day overview.

**Fix:** Make `convex/stableAnalysis.ts` return one explicit stable-wide view model with scoped names, date windows, denominators, and action targets. Stop parallel client re-derivation. Replace generic “events” with “care updates” or exact categories; replace “All clear” with the narrower “No urgent actions” only when the unified urgent-work list is empty.

**Canonical owner:** `convex/stableAnalysis.ts`, then `StableAnalysisPage.tsx`, `analysisCentreData.ts`, and `AnalysisHero`.

**Suggested command:** `$impeccable clarify`

### [P1] The lower “Action queue” is neither analysis nor an action queue

**Why it matters:** It repeats ordinary upcoming events already visible in the timeline, mixes those links with static reminder cards, and gives users no way to open, complete, dismiss, claim, or assign the most urgent records. The watchlist also says “Open a horse tab,” but its horse cards are inert. This is especially weak for a product built around members sharing yard work.

**Fix:** Replace the lower watchlist/queue combination with one full-width **Needs attention** worklist containing only exceptions: overdue/high-priority reminders, high-severity active issues, missing follow-up notes, and genuinely overdue care cadence. Sort by urgency and due date; show the reason, horse, due state, owner/assignee when the model supports it, and a direct permission-aware action. Remove routine upcoming events from this list. Keep a compact horse-pressure summary only if it links directly to the relevant horse tab or record.

**Canonical owner:** Product/work model and `convex/stableAnalysis.ts`; composition in `ActionQueuePanel`, `ReminderRow`, and `StableWatchlistPanel`; reuse reminder actions from the canonical Care components.

**Suggested command:** `$impeccable shape`

### [P1] Watchlist cards are unusable on mobile and 200%-zoom-like widths

**Why it matters:** At 390px, avatar and badges consume the shared three-column record grid, collapsing Juniper’s content column to zero and metadata to roughly 7–11px. Text renders one character per line and the two-row watchlist grows to about 1,544px, pushing useful content far below the fold.

**Fix:** Correct the canonical record layout below `sm`: avatar plus flexible content on the first row, badges on a full-width row beneath. Summarize long profile-gap copy as “6 profile details missing” with detail on demand. Verify at 320–390px and 200% zoom.

**Canonical owner:** `DashboardItemCardContent` in `DashboardItemCard.tsx`, then `HorseCardContent` in `HorseCard.tsx`; do not patch only Analysis.

**Suggested command:** `$impeccable adapt`

### [P1] The timeline status filters do not do what they say

**Why it matters:** All, Completed, and Planned start selected. With All still active, clearing Completed leaves the completed Dental block visible because `shouldShowOccurrence` returns true for All first. This is a correctness defect inside the otherwise strong timeline.

**Fix:** Treat All as mutually exclusive with Completed/Planned, or automatically clear All when a status-specific filter changes. Keep the rule understandable in keyboard and screen-reader states. Also add keyboard behavior to the overview move/resize controls; they are currently pointer-only and the visual handles are about 8px wide.

**Canonical owner:** state in `AnalysisCentre.tsx`; filtering and window control behavior in `StableActivityTimelineChart.tsx` and the ActivityTimeline primitives.

**Suggested command:** `$impeccable harden`

### [P2] Documentation confidence is incomplete and visually over-weighted

**Why it matters:** The panel can show 100% using only event-level aftercare notes while the backend separately knows about missing horse-outcome notes. It also exposes an internal TODO—“Provider contact is left out here until required provider rules are defined”—as user copy. When there are zero gaps, a full-width panel still consumes substantial space. The watchlist and queue likewise share a forced 37.45rem height, leaving a large blank watchlist.

**Fix:** Define “documented” explicitly. Fold missing event and horse-outcome notes into Needs attention as concrete records. Keep a compact **Record confidence** summary only if it explains its denominator and links to the missing items; collapse the all-clear state to a small resolved row. Remove the developer caveat and unconditional matched heights.

**Canonical owner:** `DocumentationGapsPanel`, `DocumentationCoverageSummary`, stable-wide grid composition, and `convex/stableAnalysis.ts`.

**Suggested command:** `$impeccable distill`

## Persona Red Flags

**Alex — experienced stable owner:** The timeline is efficient, but routine events are repeated below it while urgent reminders cannot be acted on. There is no sorting, assignment, claiming, or batch path, and “All” makes status-specific timeline filters ineffective.

**Mara — regular yard member checking work on a phone:** The watchlist becomes thousands of pixels of letter-by-letter text at 390px. She cannot see who owns a task or claim it, and must remember a horse/reminder while navigating elsewhere.

**Sam — keyboard and screen-reader user:** Timeline period controls have strong names, but move/resize handles are pointer-only. Reminder and horse rows visually resemble linked records without being focusable. “Urgent events” does not explain which domain records are urgent.

## Minor Observations

- The selected-period inspector should stay, but can read as the timeline’s detail drawer rather than a second standalone analysis section.
- Active medication is not inherently a warning; only missed doses, end dates, reactions, or unresolved symptoms should create stable-wide attention.
- “Provider details missing” should not appear for every event type unless the product defines provider details as required for that type.
- The backend already supplies richer stable-wide results—care cadence, horse-outcome gaps, health frequency, and more. Do not display them merely because they exist; only promote a measure when it changes a yard decision.
- Current four horse tabs fit at 390px, but a larger stable will create a multi-row tab strip; this should become a horizontally scrollable single rail or searchable horse selector when horse tabs are refined.
- The `Personal Pro` badge communicates entitlement, not operational state; it should remain quiet relative to urgent work.

## Questions to Consider

- If users can do only one thing below the timeline, should it be “understand more” or “claim and finish the next piece of work”?
- What exact evidence earns the phrase “No urgent actions”?
- Is an active medication inherently attention-worthy, or only when there is a missed dose, upcoming end, reaction, or unresolved symptom?
- Should shared responsibility first appear as assignment/claiming, or is a read-only “handled by” handover trail the right first step?
