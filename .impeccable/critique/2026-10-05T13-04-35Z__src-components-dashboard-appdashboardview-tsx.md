---
target: Entire signed-in dashboard structural redesign
total_score: 25
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-10-05T13-04-35Z
slug: src-components-dashboard-appdashboardview-tsx
---
# Signed-in dashboard: structural redesign proposal

Status: analysis and design only. No production implementation or canonical design-system changes.

Method: dual-agent (A: `/root/design_assessment`; B: `/root/mechanical_assessment`) plus parent source review, authenticated live review and structural synthesis. The independent design assessment finished before mechanical findings entered synthesis. All fourteen requested Impeccable lenses were read and combined. Product mode: Operate.

## Recommendation

Use a **daily-work dashboard**: active stable and date; exceptions requiring attention; one view of today's training, events and care; then future preparation and stable reference. Keep the established Alegreya/Alegreya Sans pairing, Pine & Paper palette, paper sections, alternating rows, domain navigation and permission model.

The user's brief challenges the current section boundaries. DESIGN.md's current training-led composition is evidence of the incumbent, not a constraint on this proposal. The unanswered optional prioritisation question is resolved provisionally in favour of coordinating today's work and care, based on PRODUCT.md. No workflow analytics or user tests establish that recording training is the dominant visit intent.

Returning users should identify their stable and date, see recorded health concerns/overdue work/pending responses, understand today's commitments, and act on the relevant record. Recording unplanned completed work remains a prominent shortcut because it is a distinct task that may have no existing row.

## Evidence and limits

- Authenticated `http://localhost:9090/` inspected at desktop, 1024×900 and 390×844. The actual demo yard had seven high-severity issues across six horses, overdue care, no training or events today, and one Friday event in the seven-day preview. The data is a development/demo yard; it is not evidence of customer behaviour or typical workload.
- Shared production renderers inspected through existing page-lab samples: crowded 50-horse content, pending invitations, simulated failure and retry, health expansion and keyboard focus. The sample home omits live setup and updates; those were examined in source.
- Source review includes home and stable dashboard compositions, shared shell, headers, actions, records, navigation, empty/loading states, translations, invitation handling, updates/setup, data projections and relevant queries.
- Detector: one scan of `src/components/dashboard`, exit 0, `[]`. This did not find the structural or measured focus issues. No false positives. No full WCAG certification, real-device test, dark-theme interaction audit or production performance measurement is claimed.
- No live mutations, account preference changes, test-data seeding or production code edits.

## Diagnosis, ranked by impact

1. **P1 — Priority is determined by section ownership rather than the user's work.** At 390px, an empty training panel and empty events panel precede the first overdue record. The health disclosure provides a count but no visible horse context until expanded. The strongest action is attached to the empty training panel. On desktop the attention column is earlier in DOM order but visually to the right: keyboard and visual scan take different routes. [BarnBoardGrid.tsx:31](../../../src/components/dashboard/command-center/BarnBoardGrid.tsx#L31). Rebuild reading order around attention, today's work and support; retain independent column heights.

2. **P1 — Shared record focus is too faint.** Keyboard testing confirmed a 3px primary ring at 25% opacity, no border and no outline. Against paper it is approximately 1.49:1. [DashboardItemCard.tsx:710](../../../src/components/dashboard/DashboardItemCard.tsx#L710). Author-supplied focus indicators require 3:1 against adjacent colours under [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). Fix this shared primitive regardless of which structure is selected.

3. **P2 — The time model is fragmented and sometimes misleading.** “Today” means events only; training is separate; reminders include overdue items and the next 14 days; “Next 7 days” includes today plus six days and completed/cancelled events. Selecting today repeats the same event records. Training is deliberately excluded from `events.list`, so the current calendar is not a complete upcoming-work view. [dashboardData.ts:46](../../../src/components/dashboard/command-center/dashboardData.ts#L46), [events.ts:319](../../../convex/events.ts#L319). Unify today's presentation while preserving domain records. Replace the mini-calendar with a future-only, date-labelled agenda.

4. **P2 — Headers carry incompatible responsibilities.** Training has capture plus navigation, events has creation, care has description plus navigation, health has no header action, and horses has creation plus navigation. `DashboardSectionHeader` flex wrapping accommodates these choices but cannot make them coherent. `section` and `panel` both resolve to 24px, making differing section importance visually equal. [TodayTrainingCard.tsx:27](../../../src/components/dashboard/command-center/TodayTrainingCard.tsx#L27), [DashboardSectionHeader.tsx:57](../../../src/components/dashboard/DashboardSectionHeader.tsx#L57), [DashboardDisplayHeading.tsx:13](../../../src/components/dashboard/DashboardDisplayHeading.tsx#L13). Establish action ownership before button treatment.

5. **P2 — Conditional content lacks a priority policy.** Horse invitations appear after the entire dashboard; optional setup and updates interrupt the main sequence between today and the week. Empty updates vanish before their loading branch, creating a late-arrival region. [AppDashboardView.tsx:37](../../../src/components/dashboard/AppDashboardView.tsx#L37), [BarnBoardGrid.tsx:45](../../../src/components/dashboard/command-center/BarnBoardGrid.tsx#L45), [DashboardUpdates.tsx:81](../../../src/components/dashboard/DashboardUpdates.tsx#L81). Pending responses belong near attention; updates and optional setup belong with stable context.

6. **P2 — Mobile adaptation preserves boxes more than usefulness.** The compact week uses minimum 16rem columns; the inspected phone showed today and a sliver of tomorrow while Friday's sole appointment was hidden. Its content measured 1840px inside 343px. Separately, dashboard panels extended to approximately x=392.5 at a 390px viewport, with global horizontal clipping masking the missing right gutter. The intrinsic-sizing cause needs implementation isolation. [EventCalendarChrome.ts:104](../../../src/components/events/EventCalendarChrome.ts#L104), [AppShell.tsx:323](../../../src/components/layout/AppShell.tsx#L323), [styles.css:605](../../../src/styles.css#L605).

7. **P2 — Data loading is broader and more coupled than this overview needs.** Four sequential Suspense queries plus optional suspending setup can hold the whole page behind its fallback. Queries collect complete event/training histories, including events across accessible stables, before filtering the visible window. [AppDashboard.tsx:55](../../../src/components/dashboard/AppDashboard.tsx#L55), [training.ts:19](../../../convex/training.ts#L19), [userCareOverview.ts:91](../../../convex/userCareOverview.ts#L91). This is a source-confirmed cost risk, not measured production latency. Parallel queries or prefetching address the [documented Suspense waterfall](https://tanstack.com/query/latest/docs/framework/react/guides/request-waterfalls).

Keep: distinctive type, readable body sizes, neutral selection, semantic colour tokens, restrained surfaces, whole-record links, direct work capture, independent column stacks, invitation concurrency/error/focus handling, and the existing care-completion/undo model. Do not flatten every control or introduce decorative severity rails.

## Before/after map

| Current | Recommended destination | Reason |
|---|---|---|
| Stable-name page hero plus shell switcher | Persistent named stable switcher; page heading Today with full date | Keep scope visible without spending the page title on repeated identity |
| Emergency call and Contacts in hero | Stable utility area, reachable on all widths | Permanent reference, independent of section state |
| Today's training | Today's work: timed schedule and untimed work | Training is one kind of today's commitment |
| Today (events only) | Same schedule; shared event remains one event row | One chronological scan across the yard |
| High-severity health issues | Needs attention: named horses, recorded severity and available issue context | Surface concern before routine work; never infer medical urgency |
| Care reminders, overdue through +14 days | Overdue → attention; due today → today's work; future → Coming up; full horizon → Care | Every reminder has one home based on its date/status |
| Next 7 days mini-calendar | Coming up, tomorrow through +7 days with explicit dates | Preparation without duplicate today/history/empty day tiles |
| Horse preview and Add horse | Compact supporting horse shortcuts; Add horse on directory or first-horse empty state | Retrieval is daily; roster creation is contextual |
| Pending horse invitations after dashboard | Needs attention response disclosure with visible count and subjects | Decisions are discoverable before routine content |
| Setup notice | Compact optional checklist link; stronger setup state only when it enables use | Avoid recurrent setup competing with an operating yard |
| Stable updates | Dated supporting preview; full editing/history under Stable → yard | Shared notices remain visible without becoming an operational task queue |
| No stable / incomplete required onboarding | Preserve existing onboarding routes | Do not fabricate an empty operational dashboard |

## Two structural proposals

### A. Daily work — recommended

One main column contains Needs attention and Today's work. A narrower support column contains Coming up, Stable updates, Horses and optional setup. Main reading and DOM order agree. On narrower screens the main column comes first, then supporting content.

Today's work has a chronological schedule of events and training, an Any time today group for due reminders/untimed work, and a Completed today disclosure. Keep per-horse training results tied to their occurrence; do not turn a multi-horse event into multiple independent completions. Cancelled work is available in a clearly labelled disclosure or full domain history, excluded from outstanding counts.

Attention groups use separate units: horses with recorded high-severity issues, overdue reminders, horse invitations. No invented aggregate “urgent” score. Start with a concise preview in each nonempty group, show the total and a specific expand/open action. Do not let a huge backlog consume the whole page, and never silently conceal the existence of other groups. Expanding one group must not stretch the other column or introduce nested scrolling on phones.

Coming up covers tomorrow through seven days ahead, labels the actual dates, and joins planned events, planned training and future care reminders. Each record links to its existing owner surface. It is not labelled “All calendar entries”; Calendar currently excludes training. Keep wider planning in Calendar, Training log and Care. Completed and cancelled records do not count as future work. Multi-day events use one concise span with a “continues” indication when applicable.

Tradeoff: requires a reliable mixed-record projection and richer capability data. It is a meaningful structural change, not rearranging existing cards. It best serves shared coordination without replacing specialised workflows.

### B. Horse rounds

Make horses the primary reading unit. Each horse row exposes recorded concerns, today's training, care due and pending horse invitations; expand the row for work details. Keep shared appointments, stable-wide reminders and updates in a separate Across the yard region, above horse rows on phones when time-critical. A shared event has one authoritative event row; horse rows link to participation context rather than duplicate its action.

Tradeoff: excellent for owners or members physically moving horse to horse and recording a round. Weaker for answering “what happens next across the yard,” coordinating multi-horse providers, and supporting people with no horse ownership. More per-horse expansion, joins and permission complexity; large rosters are harder to scan. Preserve a stable order during interaction rather than moving horses under the user's pointer after each completion.

Choose A for the product described in PRODUCT.md. B would become preferable if observed daily usage is dominated by horse-by-horse rounds. No evidence currently establishes that preference.

## Wireframe specification

The accompanying interactive wireframes show Daily work desktop, Daily work mobile and Horse rounds. They use fictional records, not live data, and are not connected to mutations. A quiet-day design control demonstrates removal of the attention block and consolidation of the empty working view.

Desktop: stable/account utilities and domain navigation → Today/date with capture/planning toolbar → approximately two-thirds main work, one-third support. Keep at least roughly 36rem usable main-column width and 18–20rem support; collapse before the content needs smaller text. The current 90rem cap can remain.

Intermediate: use one work column once two readable columns cannot fit. Supporting modules may form a two-column grid only while each remains readable. Do not treat 1024px as a squeezed desktop or add a new hidden action menu merely because a header wraps.

Phone: named stable context, account/preferences and available destinations remain reachable. Keep the existing horizontal destination strip and selected-destination reveal. Page actions wrap beneath the date. Attention precedes today's work; row actions move below record identity/metadata; future entries use a vertical list. No sticky capture bar or floating action overlays the records. Whole-record navigation is appropriate only for rows without nested actions; action-bearing rows use a title link and sibling buttons.

Typography: existing 30/36px page heading, 24px section heading, 18px sans subgroup heading, established 17/15px record/body roles. Make overdue dates and recorded severity readable decision text (15px), leaving routine category/author facts secondary. Change role assignment before changing tokens. The written section type scale and actual component differ; reconcile only after approval.

Colour: evergreen identifies deliberate forward actions/focus; pale stone/neutral ink identifies selection; warning identifies overdue/due exceptions; burgundy identifies recorded high-severity context and errors/destruction with explicit text. Never colour a whole normal record as an alarm or make all record links green. Preserve light and dark semantic mappings.

## One action policy

| Role | Placement | Prominence and labels | Responsive behaviour |
|---|---|---|---|
| Unattached work capture | Page toolbar | Filled evergreen **Record completed work**, because the task may have no planned row | Under date on phone, text remains visible; no sticky duplicate |
| Routine planning/creation | Page toolbar for **Add event**; owning surfaces for **Plan training**, **Add horse**, **Add reminder**, **Add update** | Neutral outline when it begins a separate flow; first-use enabling action may be filled | Wrap intact; move to owning empty state when that is the relevant next step |
| Act on an existing record | Beside/under the row | **Record result**, **Complete** as bounded neutral controls; final save/confirmation can be filled | Below content in narrow containers; never nested in a row-wide link |
| Invitation decision | Invitation's expanded response row, with visible summary/count above | **Approve** and **Decline** equally discoverable; do not visually suggest a preferred decision | Wrap together below subject and date; stable pending geometry |
| Navigation | Global navigation, record title, section footer/header when it expands scope | Descriptive links: **All horses**, **All updates**, **Training log**; no generic View/Open without context | Keep visible labels and sufficient target area; no hover-only affordance |
| Local disclosure | Immediately after preview / named group | Text plus chevron/count: **Show 7 more overdue reminders**, **Completed today · 2**; a real button/summary, not a navigation link | Same control and semantics; content expands in document flow |
| Destructive change | Record detail/management surface | Existing burgundy treatment and confirmation with named object/consequence | Preserve dialog focus, cancellation and retry |

There is no primary-button quota. Weight follows task relevance, locality and consequence. Two filled actions are valid when each is the clear commitment in an independent active workflow. Section headings name content; they are not a parking place for every available action. A navigation destination can look like a button when it starts a task, while remaining an anchor semantically.

## State rules

| State | Required behaviour |
|---|---|
| Quiet existing yard | One concise day's-work empty message; no empty training/events/health/reminder cards. Keep work capture and useful next appointment/horse access. Avoid “All clear” when it only means no records. |
| First horse / setup incomplete | One role-aware enabling state, e.g. Add your first horse, plus setup access. Do not stack empty operational modules. Optional setup remains dismissible. |
| Busy | Group by meaning, show truthful totals and bounded previews; keep attention types visible, use explicit expansion, and preserve access to the full domain lists. |
| Long content / Polish | Wrap names and actions; keep horse, date and decisive status visible. Disclose notes, not the identity or warning needed to act. Include year for materially old/ambiguous dates. |
| Missing data | Show “Horse details unavailable” or the existing fallback and honest counts. A missing record or denied capability is not “no work.” Never infer an assignee from horse ownership. |
| Limited permissions | Stable-wide visibility remains. Render mutation controls from server capabilities, including horse ownership/event creation relationships; retain useful detail links. Members may still add their own horse. |
| Loading / stable switch | Scope header stays legible; reserve regional space and label loading. No cross-stable stale data/actions while a new stable loads. Optional updates/setup cannot suspend available work. |
| Error | Local retry, retained known data clearly marked when stale, and distinction from empty; preserve global route retry for route-wide failure. |
| Completion / failure / concurrency | Reuse existing mutation flow and required recurrence details; prevent double submit, retain row/input on error, announce success, restore focus and preserve reminder Undo semantics. Health review is never a “complete issue” shortcut. |

Current dashboard aggregates do not expose all titles, assignees, completed care or action capabilities needed by this proposal. Extend authorised read models deliberately; do not fabricate these fields in presentation code. No new chat, assignment system, severity inference or subscription rule is proposed.

## Staged implementation plan

1. **Data and behavioural contract.** Define a discriminated dashboard work-item model and selectors in `command-center/dashboardTypes.ts`, `dashboardData.ts`, `dashboardAttention.ts`. Keep event occurrence IDs, per-horse training keys, date ranges, status and server capabilities explicit. Specify de-duplication and count units. Add targeted tests for recurrence, multi-day overlap, cancellations, completion, missing records and stable isolation.
2. **Shared structural and accessibility contract.** Fix focus in `DashboardItemCard` and `ScrollableList`; resolve intrinsic width in `AppShell`/layout. Give `DashboardSectionHeader` and `DashboardActions` consistent content/navigation/toolbar slots and container-based wrapping. Use `DashboardDisplayHeading`, `DashboardInlineHeader`, `DashboardMetaList`, `DashboardRecordDetails`, `Button`/`ButtonLink`; do not create another token system.
3. **Compose the recommended home.** Refactor `BarnBoardGrid`/`StableCommandCenter`, `ActiveStableHeader`, `TodayTrainingCard`, `TodayBriefingCard`, `PriorityQueueCard`, `MiniCalendarCard`, `HorseRosterCard`. Combine presentation through typed adapters while retaining specialised record components. Keep new attention/agenda composition local until repeated same-intent use justifies extraction.
4. **Conditional and mutation integration.** Move `PendingHorseInvitationList`, `StableSetupNotice`, `StableUpdates`/`DashboardUpdates` into owned regions. Reuse `useCareReminderActions`, care completion UI and training result flows. Bring both `AppDashboardView` and `StableDashboard` into alignment intentionally; do not accidentally add home-only invitation queries everywhere.
5. **Loading and query scope.** Parallelise/prefetch independent requests and isolate optional loading/error boundaries. Use active-stable and date/status-bounded projections without dropping recurring templates or multi-day overlaps. Profile before adding memoisation, virtualisation or background prefetching. Record cold-load, stable-switch and completion latency on representative data.
6. **One bounded verification cycle.** Extend the existing page-lab fixtures with setup, updates, permissions, mixed work and failures. Review desktop/intermediate/mobile plus long Polish copy, keyboard/focus and light/dark together. Fix findings in one batch, confirm once, then document the approved shared action/structure rules and reconcile DESIGN.md. No repeated cosmetic iteration.

## Acceptance criteria

- In a five-second inspection, representative owner/member users can name the stable/date and point to the highest-priority recorded concern or next commitment. Test both roles; this is a target, not a result already achieved.
- A training plan, non-training event and due reminder for today appear in one working sequence. Each actionable record appears once; per-horse training and shared-event completion identities remain distinct.
- No future-preview item duplicates today's working records. The displayed future range is explicit and counts only planned/outstanding items. Recurring and multi-day occurrences remain correct.
- Pending horse invitations are signposted above routine work; subjects and response controls require at most one disclosure. Existing failure, retry, concurrency, acknowledgement and focus behaviour survives.
- With no events/training/due reminders, the dashboard presents one truthful operational empty state. If high-severity issues or overdue care remain, it still shows them. No repeated Add horse action in both header and empty state.
- Every creation/navigation/completion/disclosure action follows the policy above. Review the layout with multiple legitimate filled buttons; it must still have an understandable hierarchy.
- At 320, 390, 768, 1024 and 1440px, and 200% zoom, no records or actions are clipped; page gutters remain intact; only the intended navigation strip scrolls horizontally. Row actions retain readable labels and at least 44px touch targets.
- Keyboard/DOM order matches the visual task order. Headings and labelled regions are coherent; focus remains visible and meets 3:1 against adjacent surfaces. Normal text meets 4.5:1, large text 3:1. Verify both themes and reduced motion.
- Owner, member-own-horse, member-other-horse and member-no-horse fixtures expose only authorised mutations. Stable changes never retain actionable rows scoped to the previous stable.
- A failed optional update/setup query leaves available operational records usable. A failed work query is labelled with retry, not shown as an empty day.
- No request volume or returned history grows without bounds merely because the stable accumulates old training/events. Validate a bounded recurring-event strategy and record measured cold-load/stable-switch improvements rather than claiming them from source changes.
- Full detail, Calendar, Training log, Care, Horses, contacts, setup, updates and invitations remain reachable. The proposal is not complete until all these paths and states have owners.

## Assessment scores and provenance

Heuristic scores are reviewer judgements, not usability-test measurements: status 3, real-world match 3, control/freedom 2, consistency 3, error prevention 3, recognition 2, efficiency 2, minimalism 3, error recovery 3, help 1: **25/40**. Technical audit: accessibility 2, performance 2, responsiveness 3, theming 3, integrity 4: **14/20**.

The most exposed personas are the distracted mobile member (hidden future appointment), new member (priority/responsibility unclear) and coordinating owner (invitation discovery and cross-domain scan cost). The calm opening is a strength, but high-severity counts without explanatory context create concern without enough direction.

Questions skipped: the user requested a decisive integrated proposal; one optional prioritisation question was asked during investigation, and the product-based assumption is stated above. No implementation approval has been inferred.
