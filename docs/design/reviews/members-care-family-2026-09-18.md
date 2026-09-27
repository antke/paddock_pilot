# Members, reminders and horse history — browser audit

18 September 2026. This is partial coverage of the real production views rendered with explicitly local sample data. It does not establish authenticated routing, authorization or persisted backend results. No live invitations, saves, removals or horse reassignments were performed.

## Scope and shared ownership

Member directory/settings, invitation management, stable activity log, stable care reminders, horse timeline and printable care summary. Related source reports: [members](stable-members-source-2026-09-18.md), [reminders](reminders-2026-09-18.md), [history](horse-history-2026-09-18.md).

The approved Alegreya/Alegreya Sans, ivory, evergreen and neutral selection system remains intact. Member rows, reminders, timeline entries and summary records consume shared flat variants. No page-specific palette or font was introduced. Necessary exceptions: invitation email titles do not clamp, because hiding the domain conceals the recipient; printable records retain their print-specific rules; domain layout and heading levels remain explicit.

The directory now has a safe actual-view specimen with an injected local form. Settings Members now embeds actual member management, replacing its inert substitute. The activity specimen exercises the real StableActivityLogCard. These improvements make browser evidence representative of component composition, not backend behavior.

## Browser findings and corrections

- **P2 — member removal lost focus when its row disappeared.** The removal dialog now resolves a surviving Members focus target. Browser confirmation after acknowledged sample removal: active element is the Invite member button. Cancel retains the original connected trigger.
- **P2 — invitation recipients were clamped.** The long email now wraps fully, including `@example.test`, at 390px; actions remain available and document width stays 390px.
- **P2 — headerless reminder lists skipped a heading level.** Browser now shows H1 page followed by H2 reminder records. Horse reminders explicitly retain H3 under their H2 section, through a backward-compatible shared heading prop.
- **P2 — add-dialog focus could be lost across a breakpoint.** Desktop opener becomes hidden on mobile. Shared CreateRecordDialog now selects the connected visible trigger. Two regression tests cover both directions. An HMR-interrupted attempt was discarded. With source edits held, a desktop-open/mobile-submit browser check confirmed the acknowledged new row remained and focus returned to the visible Add reminder button.
- **P2 — sparse nutrition summary was a blank heading.** It now says “No nutrition profile has been recorded.” Confirmed in browser after the change.
- **P2 — flat sections became filled in dark mode.** The global `app-panel` utility had a redundant `dark:bg-card` rule overriding consumers' `bg-transparent`. Removed that duplicate; `bg-card` already uses the theme token. Timeline's flat section now computes to transparent in dark mode while its search surface remains filled. `timeline-dark-desktop.png` captures the corrected result. Other panel consumers still require verification.
- **P2 — constrained scroll regions lacked keyboard access.** Shared ScrollableList supplies a named focusable region, visible scrollbar and token-backed inset focus indicator when constrained. ResizeObserver updates its edge affordances. The activity consumer supplies “Recent stable changes”; the reminder horse picker supplies “Available horses.” Other consumers still need their own rendered verification.

## Observed states and interactions

### Member directory and settings

- Directory: desktop two-column composition; 50-member and long-name mobile specimen without horizontal overflow; owner and empty variants. Opening edit focuses the first field. Failed local save keeps the draft and inline explanation; retry acknowledges success and returns focus to Edit details. Component tests cover cancel/reset and prevent live mutation mounting.
- Invitation creation: pending Escape does not dismiss; rejection preserves email and inline error; retry adds a local invitation with explicit “No email was sent” feedback.
- Member removal with horses: confirmation requires a new owner before enabling removal. Failure preserves that selection; retry confirms two local reassignments. Separate final check confirms focus survives removal of the triggering row.
- Concurrent invitation resend: two rows display pending independently and settle. No email sent. Long address, expired, accepted, pending activation, declined and revoked states inspected.
- Owner-only settings shows the owner and “No invitations yet.” The 50-member directory was inspected; a separate settings 50-member text query did not establish its count and is not credited.

### Reminders

- Actual production page composition, mixed permission records and H1/H2 semantics inspected.
- Search no-match and recovery checked; State=Completed isolates the vaccination record; Clear all restores the list.
- Failed local completion preserves original state and inline error; retry changes the row to Completed only after acknowledgement.
- Blank create shows title error. Selecting Juniper and creating “Sample hoof check” adds one locally acknowledged record; the mobile form scrolls with its submit action available.
- Read-only sample has no Add or Complete actions; empty sample has explicit zero-count and empty message.
- No mobile horizontal overflow at 390px. Production pagination, undo/reopen and complete backend permission behavior are not verified.

### Activity, timeline and summary

- Activity: 20 long changes, keyboard PageDown in named region at 390px. After scrolling settled, `scrollTop=588`, `clientHeight=608`, `scrollHeight=2211`, focus remained on region. Desktop counterpart also reached scrollTop=588 (608px viewport, 1756px content), with focus retained; empty activity inspected.
- Timeline: all five record types render; Weight filter isolates the weight record; search no-match and Clear all recovery work. 80 records with long horse name render at 390px without page overflow. Missing horse produces an alert, distinct from empty-history guidance. Desktop and mobile inspected.
- Summary: actual profile, contacts, nutrition, health/medication, weights, events, nutrition changes and document metadata render. Horse identity survives inside the summary itself. Long name/identifier/document fixture has no horizontal overflow at 390px. Sparse and missing variants are distinct; newly added nutrition empty copy verified.
- Print button wiring is component-tested. Actual print pagination, browser preview, outer lab/app chrome and paper output are **not verified**.

## Screenshots

Absolute artifact directory: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/members-care-audit/`.

| Files | Evidence |
| --- | --- |
| `directory-desktop.png`, `directory-long-mobile.png`, `directory-failure-mobile.png` | Actual directory composition, long mobile data and retained failed draft |
| `members-settings-desktop.png`, `members-long-mobile.png` | Member settings and full invitation address after fix |
| `invite-failure-mobile.png`, `member-removal-failure-mobile.png` | Failed local request retains entered data and retry controls |
| `activity-keyboard-desktop.png`, `activity-keyboard-mobile.png` | Focused scroll region and visible scrollbar |
| `reminders-mobile.png`, `reminder-create-mobile.png` | Real reminder rows and mobile creation form |
| `timeline-desktop.png`, `timeline-weight-mobile.png`, `timeline-long-mobile.png` | Timeline, filtering and long sample composition |
| `care-summary-desktop.png`, `care-summary-long-mobile.png` | Summary identity and responsive long horse name |

Screenshots prove only the visible composition, not all transitions. The development-tool launcher visible in captures is not production product styling. Lab scenario controls and navigation are fixture chrome.

## Remaining boundaries

Authenticated routes/roles, actual persistence, invitation email/clipboard, query loading/failure boundaries, print output, dark/reduced-motion variants, text scaling and all consumers of shared changes remain open. The member directory currently places the private profile below a long roster on mobile; this was not silently redesigned. The timeline backend's existing event-link limit also remains documented in the source report.

No route is marked fully complete by this pass. Documents, analysis, remaining horse tabs/forms, dashboard, public/account/onboarding and shared control states still require their own coverage.

## Validation for this family

35 tests across 9 focused files passed after the focus and heading fixes. Parent scoped ESLint and formatting checks passed. The static Impeccable detector exited successfully with no findings emitted for member owners, reminders, history, ScrollableList and CreateRecordDialog. These checks are not a whole-project completion gate; final aggregate validation is recorded separately.

Final aggregate validation after the document fixes: **311 tests / 62 files passed**, full TypeScript check passed, production `vite build` passed, and `git diff --check` passed. Build log: `/tmp/paddock-audit-build.log`. Document browser results are in [documents-browser-2026-09-18.md](documents-browser-2026-09-18.md). Remaining horse-record source findings are in [horse-records-source-2026-09-18.md](horse-records-source-2026-09-18.md); those next-family findings have not yet been implemented.
