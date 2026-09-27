# Calendar source audit — 19 September 2026

Bounded, read-only Impeccable audit in Operate mode. No application edits, detector runs, tests, builds or browser actions. Preserve ivory/evergreen/oat tokens, the approved type system, direct event destinations and the shared recurrence/status contract. This is source evidence and a next-pass plan, not new visual verification or route closure.

Read first: [event-family evidence](event-family-2026-09-18.md), [shared ownership](shared-style-ownership-2026-09-18.md), [dashboard command centre](dashboard-command-center-2026-09-19.md), [dashboard/analysis browser evidence](dashboard-analysis-browser-2026-09-19.md), and the corresponding project-coverage entries. The existing desktop/month and mobile/agenda pass already confirmed Enter disclosure, agenda focus, Escape return, repeated expansion, month reset, recurring/spanning examples and no page overflow at 390px. Those results are not repeated or credited as new evidence here.

## Verdict and priorities

The calendar uses a coherent domain-specific system: shared occurrence projection, global section/row typography, token-based calendar recipes and an intentional narrow-screen agenda. No replacement visual identity is warranted. The main defect is semantics inconsistent with the implemented keyboard model; the confirmed mobile “+1 more” defect belongs to the style-lab specimen rather than the production narrow-screen calendar.

Four bounded findings merit the next pass. No P0 blocker or proven data omission was found. Accessibility, responsive and integrity findings are concrete below; performance, full contrast/dark appearance and assistive-technology behavior were not measured, so a numerical /20 health score would imply evidence this source-only pass does not have.

### P2 — Calendar declares an interactive grid without a grid keyboard model

**Owner:** `stables/StableEventsCalendar.tsx:185–277`; visual primitives in `events/EventCalendar.tsx` deliberately accept semantic props rather than impose roles.

The desktop shell has `role="grid"`, week rows and gridcells. Cells have neither a roving focus target nor arrow/Home/End handling. Every visible event link and dense-day disclosure remains independently tabbable; empty days cannot receive keyboard focus. The only calendar key handler is Escape on the disclosed agenda. A dense month can therefore contribute about 93 stops before its disclosed event list (up to two links plus one disclosure per day). Do not describe this as inaccessible event links: native Tab/Enter still works. The mismatch is the grid's advertised composite interaction, plus a long navigation sequence.

**Minimum recommendation:** retain this surface as a read-only month **table with links**, using table/rowgroup/row/columnheader/cell semantics (prefer native elements where practical) and preserve direct link Tab/Enter behavior. It is not currently a date picker or editable schedule; do not add a date-selection action solely to satisfy an inherited role. Expose the full date on cells and retain current-date meaning. Empty leading/trailing cells must preserve column positions for assistive technology: do not simply retain `aria-hidden` cells and assume the remaining cells still map to correct weekdays. Use proper empty table cells or explicit column indices if a non-native structure is necessary.

If efficient arrow-based date navigation is explicitly desired instead, that is a larger but bounded interaction choice: one roving date target, arrows moving by one/seven days, Home/End within a week, clearly defined month boundary behavior, and an explicit way to enter/leave a cell's event links. Never just remove links from Tab without providing equivalent access. Do not copy analysis's one-dimensional period group onto a two-dimensional month. Recommended command: **Impeccable harden**. Table semantics is the smaller default correction.

### P2 — Style-lab calendar specimen violates its own narrow-screen rule

**Owner:** `design/StableDesignGuidelines.tsx:1385–1448`; helpers `EventCalendarChrome.ts:5–88`.

The specimen renders seven columns at all widths, contains static non-link event chips, and disables its only `+1 more` button. The prior dashboard/analysis browser report already documents that button squeezed into a vertical column at 390px. This is real existing visual evidence, not a new browser finding. The style-lab rule around line 546 correctly says full month calendars become agendas below md, but the specimen does not exercise that owner or behavior.

**Minimum recommendation:** replace this isolated static grid with a small, clearly identified local specimen using the actual `StableEventsCalendar`, with sparse, dense and empty scenarios. Shared calendar primitives remain the visual owners; the sample supplies data only. If a separate primitive-only diagram is retained for developer documentation, label it a static diagram, contain it in a deliberately named desktop-width preview, and do not present a disabled disclosure as the operable reference. Actual narrow-screen and disclosure evidence must still come from the real composition. No seven-column mobile redesign or new pattern is needed. Recommended command: **Impeccable adapt**.

**Important distinction:** production `StableEventsCalendar.tsx:155–183` hides the month grid below md and renders **all** visible-month occurrences as EventRows. There is no mobile `+N` truncation to fix in that composition. Its agenda includes cancelled/completed status and spanning end dates. Avoid applying a speculative “show more on mobile” patch that starts hiding records currently available.

### P2 — Disclosed agenda has no surviving focus policy when its presentation disappears

**Owner:** `StableEventsCalendar.tsx:75–98,109–111,250–290`.

Ordinary open/Close/Escape is already implemented and previously observed. Two other source paths are uncovered:

- The selected agenda and its trigger are CSS-hidden below md, with no breakpoint focus transfer. A focused desktop agenda link can disappear during resizing, orientation changes or browser zoom while selection remains. No focus response exists in source; exact browser focus destination is not claimed.
- Reactive data can reduce a selected dense day to two events, unmounting the stored disclosure trigger while retaining its agenda; Close then calls `.focus()` on a detached button. If that day loses all occurrences, the agenda itself unmounts without recovery. The month-change buttons already remain connected and deliberately clear selection, so that path should not be rewritten as a defect.

**Minimum recommendation:** a persistent, named calendar container or month heading with `tabIndex={-1}` can be the surviving fallback. Restore to the original trigger only when it is connected and rendered; otherwise use the surviving target. On breakpoint/data changes, transfer focus only if it was inside content becoming hidden/removed, never from an unrelated control. Keep selection/data truthful and avoid unconditional focus effects on ordinary query updates. A single responsive agenda owner is another option, but do not duplicate all selected-day records on narrow screens merely to preserve a DOM node. Recommended command: **Impeccable harden**.

### P2 — Calendar lab fixtures are not isolated from arbitrary source events

**Owner:** `page-lab/prototypes/CalendarPageLab.tsx:12–15,37–116`.

The lab appends generated records to incoming events in both local and connected PageLab branches. All generated entries spread the first event. Dense-day records do not clear inherited `recurrence` or `endDate`; the spanning record does not clear recurrence. Thus a source recurring series or duration can silently change the intended fixture, including making supposedly one-off dense records recur or disappear under an inherited recurrence end. The fixture is unavailable when the incoming stable has no event. There is no direct empty/current-month scenario, reset/date control or local data-update case. Synthetic IDs are actual event links and can navigate to a nonexistent authenticated event page; the sample currently provides no calendar-specific explanation of that limitation.

**Minimum recommendation:** use explicit, deterministic local event records with required fields from a safe base, clearing unrelated optional recurrence/range properties. Separate the local sample from connected real-event rendering; do not append fake records into a live-data specimen. Reuse existing safe fixture infrastructure/DEV bypass, label sample records and their route limitation, and provide a few scenario controls. No production mutation hook is required. Verify original event identity remains authoritative for recurring occurrence links. Recommended command: **Impeccable harden**.

## Shared ownership and legitimate geometry

| Owner / exact consumers | Keep / bounded action |
| --- | --- |
| `EventCalendar.tsx` → `StableEventsCalendar`, `StableDesignGuidelines` | Semantic-free visual primitives are appropriate. Add compatible table element support only if the chosen semantic correction needs it; no default role change that turns a static diagram into a widget. |
| `EventCalendarChrome.ts` → those primitives and `dashboard/command-center/MiniCalendarCard` | Seven-column geometry, day boundaries, count density, selection/current-day tokens, chip truncation, strip snap and responsive panels belong here. Preserve required calendar boundaries; they are not generic redundant wrappers. |
| `StableEventsCalendar` → actual `/stables/$stableId/events/calendar`, `/page-lab/calendar` | Own month state, recurrence projection, responsive representation and disclosure/focus behavior. Production query remains `api.events.listForStable`; it asserts stable visibility and filters inactive horses. No permission/backend changes are indicated by this audit. |
| `EventRow` → mobile month agenda and expanded day agenda, plus other event consumers | Already uses global flat records. Keep the prior correction. Titles are bounded to two lines; assess a very long title in the real agenda before broadening this shared component. No new local fonts/colors. |
| `MiniCalendarCard` → `BarnBoardGrid` and dashboard variants/labs | Uses a named seven-day group of native buttons, not `role=grid`. Its keyboard contract is therefore different and should not inherit month-grid roving behavior automatically. Its occurrence/status corrections and local keyboard/mobile evidence are in existing reports. |
| Existing MiniCalendar `bg-card` overrides | At the initial audit these remained on selected-day/column panels and event/empty rows. The bounded owner extraction documented below subsequently removed the feature-local paper decisions without changing their visual output. |
| Shared Button sizes / calendar disclosure | Current Button already increases targets for coarse pointers. `CalendarMoreEventsButton` uses that owner and overrides ordinary min-height. Do not assert a 32px mobile failure from one class without measuring the coarse-pointer cascade. Event chip anchor has no equivalent coarse target adjustment; verify its two-line rendered size at tablet widths before proposing a shared recipe change. |

The month grid's `overflow-hidden`, truncated chip text and date-cell padding are intentional density choices. At intermediate width/200% text they need observation, but are not proven clipping defects from source alone. Avoid flattening the selected-day boundary, changing the palette or altering typography to resolve semantic issues.

## Existing evidence and sample gaps

`stableDashboardDates.test.ts` already covers Monday-first ordering, same-day chronology, cross-month spanning days, recurrence materialization and empty projection. Shared occurrence tests cover the recurrence model separately. No dedicated StableEventsCalendar interaction test was found in the inspected test inventory. Do not rerun or rewrite recurrence algorithms to fix UI semantics.

Add a small fixture set around the actual owner:

1. Sparse month: zero, one and exactly two records on different days; one long title, long location, completed and cancelled status.
2. Dense day: at least six records, including two titles identical until their long suffix and an ongoing multi-day entry. A second dense day allows switching agendas.
3. Empty current month and a month with events only outside the current window; explicit reset to Today.
4. Data-update controls: six → two → zero selected-day records, without changing calendar identity, plus stable change. Pure local state only.
5. Boundary dates: month starting Sunday/Monday, December/January rollover, leap February, and recurrence spanning a month boundary. Keep the production month-navigation behavior; a small initial-month seam may help deterministic fixtures/tests if introduced at the actual owner.

These are source/sample gaps, not claims that dates or statuses currently fail.

## Precise next browser round

Use actual owner via `/page-lab/calendar` plus the corrected style-lab calendar specimen. One batched initial round, one correction confirmation maximum.

- **Desktop 1366px and intermediate 768–820px:** inspect month title/count, weekday alignment, long chips, focus rings at clipped outer edges, two vs six records, all statuses. Confirm chip activation retains actual event ID and recurrence does not invent per-occurrence status.
- **Keyboard:** Previous/Today/Next have stable focus and a correct live announcement. Under the recommended table contract, screen-reader table navigation discovers the correct weekday/date and native Tab/Enter reaches each event/disclosure; do not claim grid arrow keys exist. If the full grid alternative is chosen, explicitly exercise all advertised arrow/Home/End and link-entry/exit behavior including empty cells and month boundaries.
- **Disclosure:** Enter/Space opens dense day, focus enters named agenda, every record is present in chronological order; Escape/Close returns to the originating control. Repeat, switch to a second dense date, navigate month and return Today. Then locally reduce six → two → zero with focus both inside and outside the affected content; no BODY/hidden-node focus and no unrelated focus theft.
- **Responsive transition:** with focus inside an expanded desktop agenda, cross md to 390px; verify a visible surviving target. Return desktop and check selection truth. Distinguish tool-induced sample reset from an app state bug before recording evidence.
- **Mobile 390px, narrow 320px and enlarged text:** full date-led agenda includes every occurrence; no compressed seven-column `+N` in either actual route or reference specimen, no page overflow, long title/status/metadata remain usable. Check spanning records carry actual start/end meaning. Verify touch target geometry with coarse-pointer emulation rather than width alone.
- **Dark/reduced motion:** existing tokens remain readable, selected/today/focus indicators stay distinguishable, disclosure does not require animation. The separate global motion audit remains its own bounded correction.

Automated additions should test actual semantic/focus behavior, missing-trigger fallback, responsive focus recovery seam and clean fixture properties. Avoid class-string mirror tests or counting source-only checks as rendered mobile proof. Run scoped tests/lint/typecheck only after implementation, then the parent-owned aggregate/build schedule. Final bounded command after corrections: **Impeccable polish**, preserving the existing identity.

## Local sample implementation supplement

`design/CalendarSample.tsx` now supplies the actual `StableEventsCalendar` with explicit local records, rather than a static seven-column diagram. Its exported contract is `CalendarSample({showUpdateControls?: boolean} = {})`; the style-lab can use the default specimen and Page Lab enables delayed data updates. Scenario/month selection remounts the calendar intentionally; six → two → zero record updates do not, allowing the real agenda's reactive focus recovery to be exercised.

`design/calendarSampleData.ts` owns deterministic records with fictional IDs: six entries on day 18 (including a continuing clinic), a second dense day, sparse long labels/location, completed/cancelled entries, a month-boundary clinic and a two-occurrence weekly series retaining its original event identity. Each month begins at local midnight. Selectable months include current month, leap February 2024, December 2026, January 2027, a Sunday start and a Monday start. Empty works without incoming events. No arbitrary incoming record is spread into fixture generation.

The optional delayed controls apply a local update after three seconds, allowing focus to enter the current agenda first. Scenario/month changes, explicit Cancel/Reset and unmount cancel the timer. Feedback distinguishes a scheduled update from the applied sample state. Sample navigation limitations are visible: IDs have no real event pages. No query, mutation or network adapter is mounted by the specimen.

`page-lab/prototypes/CalendarPageLab.tsx` uses this specimen only when DEV and the development bypass are active. Its connected branch renders only supplied events for the current stable, retains the actual Add event destination, and resets calendar identity when the stable changes. It does not mix synthetic events into connected records. The sample branch omits a misleading live creation action.

Focused sample tests cover clean recurrence/range ownership and date cases; delayed same-identity record changes; scenario/month/cancel/unmount timer cancellation; default style-lab usage; and fixture/connected isolation. Verification results will be recorded after the coordinated check window; this supplement alone is not a pass claim.

Sample implementation checks: **7 tests across 2 files passed**, scoped ESLint passed, full `tsc --noEmit` passed, and scoped whitespace check passed. Test coverage is local/component-only; no browser or build was run by this agent. Parent owns the real calendar semantics/focus checks, combined validation and rendered confirmation. Sample UI source is frozen after this checkpoint.

## Weekly calendar paper ownership — bounded follow-up

Rechecked the earlier ownership finding against current callers. `MiniCalendarCard` is rendered only by `BarnBoardGrid`, which passes data and placement geometry. That always uses the default flat chrome, selectable seven-day strip and selected-day disclosure. `StableCommandCenter` promotes that composition into `AppDashboardView`, `StableDashboard`, Dashboard Lab and the stable-dashboard Page Lab. No current caller passes cards/soft chrome, `showInlineEvents`, or `showSelectedDay={false}`; those remain dormant options rather than independently verified product states.

Moved all seven feature-local `bg-card` decisions to `events/EventCalendarChrome.ts`. The named `calendarWeekPaperClassName` recipe centralizes paper for event and empty rows; existing week-day-panel and selected-day-panel recipes compose the same paper decision themselves. MiniCalendar retains only legitimate placement/breakpoint classes at those call sites. Its public props, palette tokens, native day buttons, selected state and disclosures are unchanged. In the dormant inline branch, today's border emphasis remains while its paper background stays the same as before (the former local bg-card had already overridden bg-surface-muted). No dormant variant was deleted or turned into a new design.

This is a source-preserving ownership extraction, not a visual redesign or a new color finding. Existing `DashboardAnalysisPageLab.test.tsx`: **4 tests passed**; full TypeScript, scoped ESLint and Prettier passed. No class-string tests were added. No new browser observation is claimed. The narrow confirmation, if required, is the existing dashboard sample with a populated selected day and an empty selected day, at mobile and desktop; compare paper, selection, empty text and native event destinations. There is no need to introduce three new chrome-mode specimens solely for unused API branches.

Logs: `/tmp/paddock-calendar-paper-tests.log`, `/tmp/paddock-calendar-paper-types.log`, `/tmp/paddock-calendar-paper-lint.log`, `/tmp/paddock-calendar-paper-format.log`.
