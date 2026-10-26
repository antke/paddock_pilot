---
target: "Calendars: responsive density and shared horse colours"
total_score: 24
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-10-21T08-02-02Z
slug: src-components-events-eventcalendar-tsx
---
Method: dual-agent (A: /root/calendar_design · B: /root/calendar_evidence)

Calendar review — Events, Training and horse history

The existing stable-journal visual language is coherent. The opportunity is to make the month answer “which horses are involved?” without sacrificing event details. Preserve the palette, typography and month-plus-agenda pattern.

Provisional design health: 24/40, based on source, supplied screenshots and the limited browser evidence described in run notes. This is not an accessibility certification.

| Heuristic | Score | Finding |
| --- | --- | --- |
| Visibility of status | 3 | Today, selected dates and completion feedback exist; dots hide identity. |
| Match with real world | 3 | Familiar dates and horse records; record-count dots do not identify horses. |
| User control | 3 | Filters and navigation exist; training overflow switches to week view. |
| Consistency | 2 | Height, dot semantics and day selection differ across calendars. |
| Error prevention | 3 | Permission and pending-state guards exist; colour selection needs constraints. |
| Recognition | 2 | Names are available in details, but dots require interpretation. |
| Efficiency | 2 | Tall rows and minimum grid widths impede scanning. |
| Minimalist design | 2 | Coherent theme, but disproportionate empty cells and completion controls. |
| Error recovery | 2 | Completion errors retain the record; recovery instructions are limited. |
| Contextual help | 2 | Previews and labels help; dot meaning remains unexplained. |
| Total | 24/40 | Acceptable; significant improvements needed. |

Deterministic scan: five calendar TSX files scanned, zero findings and no false positives. Manual source review and the measured stable fixture still expose geometry and semantic issues that this scan does not detect. The event calendar shell measured 836px tall with five 160px rows. Training and timeline findings are source-based.

Strengths:
- Shared calendar primitives and a coherent visual identity.
- Mobile already separates a compact overview from readable day details.
- Source includes selected-date semantics, date/count accessible names and reversible completion controls.

Priority issues:
1. P1 — Fixed month geometry. Training rows have min-h-64 (256px): 1,280px for five weeks and 1,536px for six, before headers. Shared event cells are 160px, with a 224px coarse-pointer rule. Use one shared density contract, bounded row heights based on available calendar space and week count, and compact entries. Preserve readable minimums and normal page scrolling. Do not use CSS transform scaling or override browser zoom. Suggested action: impeccable adapt.
2. P1 — Conflicting dot meanings. Mobile dots currently count records, desktop events use event-type colours, and training uses activity colours. Reserve horse markers for identity in multi-horse calendars. Deduplicate horse dots per day, keep event counts separate, and show type/status with labels or icons. Suggested action: impeccable clarify.
3. P2 — Overview cards carry too much detail. Training month cards include two rows and large completion controls. Move full actions into the selected-day agenda; show compact identities, activity/time where space permits and read-only status in the overview. Suggested action: impeccable distill.
4. P2 — Inconsistent overflow. Training opens a week; other calendars expose the selected day. Make date and overflow controls reveal one day’s agenda, with “View week” separately labelled. Suggested action: impeccable clarify.
5. P2 — Detailed layout begins too early. Training’s md breakpoint can show an 896px minimum month grid in a narrower content area. Choose layout from available container width, then adjust density for height. Suggested action: impeccable adapt.

Refined proposal:
- Shared horse colour confirmed by the user. Store a separate calendarColourId; the existing horse.color describes coat colour.
- Begin with a curated theme-aware palette of approximately 10–12 choices, automatically assigned and saved. Put a labelled swatch choice in Edit horse under existing permissions. A selected check and colour names support keyboard and non-colour use. An unrestricted picker is unnecessary for the first release.
- Avoid reused defaults within the relevant roster and label used choices. A finite palette cannot guarantee perceptual uniqueness across all combined stables. Never silently recolour horses when filters, sort order or placement change.
- Mobile: one 6–8px dot per distinct visible horse, up to three plus +N additional horses. Dot counts are not session counts. Selecting the day shows every matching record with horse names.
- Desktop: compact event rows show participant dots, names where space allows, and +N for additional horses. A multi-horse event stays one event. Training records remain per horse where the underlying record is per horse.
- Status stays separate. Horse dots indicate involvement, not completion. Existing completed-only filters should determine which records contribute dots when users want to inspect completed training.
- No-horse events use a neutral, explicitly labelled stable/general-event marker. Do not hide them. Only authorised identities enter dots and legends.
- “Horse colours” is a collapsed, labelled disclosure near the toolbar. Include authorised horses relevant to the current view, pair every swatch with a name, and remember open/closed state while navigating. Keep filtering an explicit separate interaction.
- A single-horse history gains little from repeating one horse colour. Keep identity in the header and record types in labels/icons.
- Calculate density from the actual available area and 4/5/6 week rows, with readable lower/upper bounds. Let the page scroll below the safe lower bound. Do not force an entire month plus expanded agenda into every viewport.
- Implement identity persistence/resolution and shared horse-marker/legend primitives before applying them across Events, Training and history. Include permission-safe roster projections in server responses.

Cognitive load: moderate. The main problems are hierarchy, working-memory demand and potentially long expanded choice groups. The familiar seven-day grid is not itself a choice-overload failure.

Persona risks:
- Frequent planner: tall months and a surprise switch to week view interrupt scanning.
- First-time owner/carer: identical dots can mean horses, events or statuses.
- Low-vision or keyboard user: colour must have named alternatives; shrinking targets would undo existing accessibility work.

Emotional journey: the month promises orientation, then hides useful context behind empty space or anonymous marks. Named day details restore confidence. The proposal brings identity into that initial overview while keeping completion feedback.

Minor observations: distinguish today from the selected date; persist legend state; retain names at all decision points; treat light/dark and coarse-pointer layouts independently. Validate six-week months, repeated sessions, dense/multi-horse/no-horse events, long names, narrow desktops, tablets, mobile and 200% zoom.

Remaining design choice: move completion controls into the day agenda (recommended), or retain direct completion in month cells? This determines the minimum safe desktop row height.
