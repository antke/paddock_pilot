# Dashboards, invitations and analysis — browser audit

19 September 2026. Impeccable audit/harden/polish following [source findings](dashboard-analysis-source-2026-09-18.md). This is the next family in the project-wide audit, not a closure of all routes. Preserve the warm global design and deliberate landing differences.

## Actual owners and safe specimens

- `/page-lab/stable-dashboard` renders the actual StableCommandCenter, with routine, recurrence/multi-day, health-only attention, 50-horse/overdue and empty scenarios. `createDashboardLabData` now delegates to the production command-data builder instead of duplicating its old start-date-only schedule logic. The raw source event dates remain intact while display rows can represent occurrences.
- `/page-lab/horse-invitations` renders the actual query-free PendingHorseInvitationList. Approval/decline are local delayed Promises with failure/retry and interruption scenarios. The specimen is gated to development fixture mode before cloning data; no invitation mutation or notification occurs.
- `/page-lab/analysis` now renders the actual StableAnalysisPageView, including the real locked prompt. Its former hybrid of unlocked charts with `hasAccess:false` is removed. Unlocked populated, empty and 50-horse states contain explicitly fictional, backend-shaped records, all five care-signal kinds, same-period signal overflow and event statuses. Links deliberately lead to real app routes and are not proof of authenticated navigation.

The route specimens exercise shared production presentation. They do not replace the root AppDashboard authentication/onboarding/active-stable query composition or StableDashboard/StableAnalysisPage authorization and subscription wrappers.

## Changes to verify

1. Shared dashboard schedule includes recurring occurrences and multi-day overlap, with stable occurrence keys, original event destinations and truthful completed/cancelled presentation.
2. Needs attention exposes high-severity horses independently of the five-horse roster. The overview query preserves all high-severity targets after the ranked preview; permissions and archived/deleted filtering remain unchanged. Reminder preview limits are disclosed.
3. Invitation rows have independent guards and target-specific busy/error feedback. Success is acknowledged only after the callback or authoritative query removes a row. Focus follows a removed focused row without stealing focus from unrelated controls; re-invitations remain visible.
4. Analysis scope is searchable, calendar scale is named, display filters explicitly affect blocks rather than aggregate details, every supplied care signal is inspectable, and redundant surfaces are flattened at shared/domain owners. Scroll areas are named and keyboard-focusable with visible scrollbars. Chart pointer cancellation and unmount clean up listeners. Canvas width transitions respect reduced motion.
5. Analysis latest-weight calculation reuses the same shared tie ordering as horse history. Optional care-cadence dates have accurate inferred return types, with unchanged runtime policy.

## Verification boundary

Browser observations, screenshots, final checks and any correction batch will be appended below. Until then this report is source/specimen evidence only. Native narrow-screen behaviour, authenticated routes, live requests, subscription refresh, entitlement changes and actual backend notification/persistence remain unverified. Source detector results alone do not establish visual or accessibility conformance.

## First browser inspection — actual observations

Controlled local fixture, desktop 1366×1000 and narrow 390×844. Only sample invitation callbacks ran; no production mutation, notification or entitlement action was performed.

- Dashboard recurrence/multi-day scenario rendered four entries today, including a continuing clinic, completed visit, cancelled lesson and occurrence of a weekly event whose base date was earlier. Keyboard selection of Sunday disclosed its continuing clinic and preserved the source event destination. The health-only scenario exposed both urgent horses outside the five-horse roster, with `careView=health` destinations. The crowded scenario disclosed 10 urgent horses, expanded all 10 with Enter, and showed five of 12 reminders with an explicit seven-more disclosure. The empty stable gave honest no-event/no-horse states. Narrow document width equalled 390px.
- Invitation Juniper approval and Atlas decline were both visibly pending at once. Neither row claimed success. Both deliberately failed, retained their rows and displayed independent inline errors. Keyboard retry removed Juniper only after acknowledgement and moved focus to Atlas's decline action. Retrying Atlas and completing Meadow left the named invitation region focused with a truthful empty state. Switching to Empty while a long-label request was pending produced no late success message in the new sample. Narrow failures wrapped without document overflow. This is local Promise behaviour, not live backend delivery.
- Analysis Day → Week → Month changed the selected-period heading accordingly. Hiding Training removed its calendar blocks while preserving the training detail link and all ten care records, matching the new scope explanation. The care-list region was keyboard-focusable; End/PageDown reached scrollTop 384.5 of a 737px list with a 352px viewport, exposing its lower records.
- The 50-horse sample found horse 50 by keyboard search and explicit selection, opened its actual horse analysis, and offered Stable overview. In dark narrow mode the long heading wrapped and the document stayed 390px wide. The actual locked view showed the Premium prompt and View plans action. Empty unlocked analysis rendered zero blocks and no urgent actions.

The first round also found three concrete correction targets: analysis health attention links still opened the default care tab; a multi-day calendar block's label was offscreen when the viewport started on a continuation day; the chart's period headers and overview bars repeated hundreds of potential keyboard stops. Empty chart copy also incorrectly suggested filters and used “1 periods”. These are being corrected as one bounded batch before confirmation.

### Tooling and evidence limits

Viewport changes can reset this preview's sample state and briefly return stale screenshot pixels. The narrow health screenshot was recaptured after the override settled; the initial stale image was overwritten. Full-page captures are not used. One locator evaluation timed out after an otherwise successful calendar key action; a read-only DOM measurement subsequently showed the actual named region, its 358px viewport and horizontal scroll position. No claim rests on that timeout. Theme switching itself was not isolated as the cause of the viewport reset.

This round did not exercise OS reduced-motion preferences or enlarged text, live authentication/authorization/subscription transitions, real invitation acknowledgements, production links with valid records, or mobile touch hardware. Source/unit evidence for those mechanisms is kept separate.

## Captured evidence

Viewport PNGs are stored outside application assets; they are audit artifacts, not bundled product media.

| Evidence | Scope |
| --- | --- |
| [Dashboard desktop schedule](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/dashboard-desktop-schedule.png) | Selected Sunday, continued clinic and distinct completed/cancelled entries. |
| [Dashboard narrow health](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/dashboard-mobile-health.png) | Urgent horses outside the roster preview; readable long name and day-strip affordance. |
| [Invitation narrow failures](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/invitations-mobile-failure.png) | Two independent retained errors; third row remains available. |
| [Analysis desktop initial calendar](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/analysis-desktop-calendar.png) | First inspection, before continuation-label correction; intentionally retained as defect evidence. |
| [Analysis care digest](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/analysis-desktop-care-records.png) | Named bounded care list and flat selected-period detail. Screenshot precedes lower-list keyboard scroll measurement. |
| [Horse 50 dark narrow analysis](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/analysis-mobile-horse-50-dark.png) | Actual horse-specific analysis selected by keyboard; full heading wraps. |

## Bounded correction and confirmation

One correction batch, then one confirmation round; no further UI polishing after that round.

- Health attention links now explicitly open `careView=health`. Care-cadence links retain the default Reminders tab. Browser DOM inspection confirmed both destinations; valid authenticated record navigation is still separate.
- Shared ActivityTimelineEventBlock owns the sticky content treatment. At desktop the continuing clinic began at x=-341px while its readable content stayed at x=62px. At 390px width it stayed at x=30px; on the next day its content right edge was 286px, within the event's 379px right edge. Title, metadata and duration badge stayed visible. The style-lab direct consumer also fit: 68px content within an 89px block at narrow width. No page-specific cosmetic override was added.
- Timeline period headers have one sequential Tab stop. ArrowRight moved focus, selected state and the detail heading to 20 September; End selected 18 December and Home selected 12 September. Overview miniatures skip sequential Tab; existing named move/resize controls and pointer jumps remain. A browser attempt to key the overview move control timed out despite it being present and enabled, so that particular browser action is **not verified**; component coverage is not relabelled as browser evidence.
- True empty analysis now says “No events scheduled in this timeline yet.” and “1 period”. Filtered-out content retains the distinct filter explanation.
- Narrow document width remained 390px for the confirmed analysis and style-lab timeline samples. No authentication, live data or user account settings were changed beyond exercising/restoring the app's theme control. Viewport override was reset and light theme restored.

Final screenshots:

- [Desktop continuation label](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/analysis-desktop-calendar-confirmed.png)
- [Mobile continuation label](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/analysis-mobile-calendar-confirmed.png)
- [Style-lab shared timeline consumer](/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/dashboard-analysis-audit/style-lab-mobile-timeline-confirmed.png)

## Checks

- Aggregate: **367 tests / 79 files passed**, `/tmp/paddock-dashboard-analysis-final-tests.log`.
- Full TypeScript, scoped ESLint and `git diff --check` passed.
- Production Vite build passed, `/tmp/paddock-dashboard-analysis-final-build.log`.
- Impeccable source detector returned `[]` for analysis, timeline, command-center and invitation-list owners, `/tmp/paddock-dashboard-analysis-final-detector.json`. This does not prove visual, performance or WCAG conformance.
- The first aggregate attempt exposed an existing wall-clock race in HorseHealthRecords.test.tsx: its 150ms sample response could finish before the pending Escape assertion under parallel load. The pending portion now controls the response clock and explicitly advances it to failure, leaving the production behaviour unchanged. The focused five-test file and subsequent full aggregate pass. The failure is retained in the audit history here rather than hidden by a blind rerun.

## Scoped Impeccable assessment and remaining work

Implementation-integrity verdict: **pass for the reviewed shared presentation boundary**. Approved type, neutral selections, evergreen actions and flat section/record hierarchy remain at shared owners. Inline event coordinates and semantic signal colours are justified domain geometry, not arbitrary page restyling. This is not a whole-project pass.

| Dimension | Provisional score / 4 | Evidence and limitation |
| --- | --- | --- |
| Accessibility | 3 | Meaningful names, failure focus and roving keyboard selection observed. Full screen-reader flow, all contrast pairs, overview keyboard browser action and OS reduced motion remain open. |
| Performance | 2 | Production build and 50-horse sample work; no measured performance profile or large real query timings yet. |
| Responsive | 3 | Desktop and 390px layouts inspected; no document overflow in reviewed samples. Text enlargement, touch hardware and all intermediate widths are not established. |
| Theming | 3 | Token-based shared owners; dark narrow horse view observed. Every state/contrast pair was not measured. |
| Integrity | 3 | Actual production presentation, honest sample boundary, owner-level fixes and tests; connected authorization/composition still needs verification. |
| Total | **14/20 — Good, scoped and provisional** | Never use this score as release/accessibility certification. |

Open items:

- **P2, shared motion:** the existing global `0.01ms` reduced-motion blanket in styles.css remains. Timeline transitions now have explicit reduced-motion paths, but the system-wide motion audit still needs meaningful alternatives and real preference verification. Next: Impeccable animate, then bounded polish.
- **P2, style-lab calendar specimen:** the unrelated calendar grid immediately above Planning rails compresses “+1 more” into a very narrow vertical column at 390px (visible at the top of the final style-lab screenshot). Planning rails itself fits. Revisit the calendar grid owner and its actual calendar consumers during the calendar/shared-specimen audit; this confirmation did not authorize an endless expansion of this family's polish pass. Next: Impeccable adapt, then bounded polish.
- **Verification gaps:** authenticated AppDashboard and StableDashboard query composition; real permission boundaries, invitation acknowledgement and re-invitation subscriptions; entitlement transitions; real route links; backend persistence; mobile touch, enlarged text, all contrast combinations, OS motion preference and measured performance. In-memory tests and local samples prove narrower contracts only.

This family has a completed bounded local pass, not full route closure. The project goal remains active. Next family source review is [public/account/access](public-account-source-2026-09-19.md).
