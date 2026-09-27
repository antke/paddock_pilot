# Stable family audit — 18 September 2026

## Scope and verdict

This bounded Impeccable Operate pass covers the stable list, settings overview/archive, create/edit fields, provider directory, deleted-horse recovery, and owner/member welcome renderers. Member administration and invitation controls received source fixes and interaction tests, but their full page composition is still unverified. This is partial project coverage, not completion of the 53-route audit.

The approved ivory/Alegreya/evergreen/oat language is preserved. No new local palette or decorative UI was introduced. Stable/provider/deleted-horse/welcome rows now reuse global flat record chrome. Shared `FormGroup` gains an optional semantic heading level without changing its global visual style or default; standalone stable form groups use h2, while edit's existing h2 section retains h3 groups.

## Confirmed findings and fixes

- **P2: Preview drift.** The stable-list preview showed event metadata absent from production; settings overview omitted real fields and had an inactive edit action. `StableListPage` and `StableSettingsOverviewContent` now serve production and sample compositions. The settings Providers and Deleted horses tabs reuse actual callback-driven views with safe local operations. The Members tab still uses substitute rows; it must not count as production-page verification.
- **P2: Async confirmations could disappear or misreport progress.** Archive, provider, deleted-horse, invitation-revoke and member-removal controls guard pending requests and retain failures for recovery. Invitation requests are now independent per row. Production wrappers retain real backend operations; samples exercise the same view without them.
- **P2: International stable names rejected.** Shared validation now accepts Polish and other international letters/marks, with existing limits and invalid-input restrictions retained. Field errors are explicitly associated with controls; required stable name/location are identified. Create gets the existing shared sticky action/reset pattern.
- **P2: Misleading setup and retention states.** Welcome counts active, unexpired invitations; joined members independently satisfy that step. Email delivery is not used as a gate because a copied valid link remains usable. Deleted horses become eligible for removal after 14 days; the copy no longer promises removal at that exact instant. Restore remains available while a record exists, matching backend behavior.
- **P2: Missing accessible checklist state.** Welcome list items expose their completion state; form disclosure exposes its controlled region and expanded state. Unnecessary nested form chrome was removed.
- **Prototype limitation fixed during browser inspection:** provider and deleted-horse "Failure, then retry" scenarios now fail once, then succeed, so a dialog can retain its draft through retry without requiring access to the outside scenario selector.

Detailed implementation/source evidence: [stable forms](stable-forms-2026-09-18.md), [providers](provider-directory-2026-09-18.md), [deleted horses](deleted-horses-2026-09-18.md), [welcome](stable-welcome-2026-09-18.md), [members/invitations](stable-members-source-2026-09-18.md).

## Rendered and interaction evidence

Browser: Codex IAB, localhost development fixtures. Desktop 1280×720; mobile 390×844. Actual viewport/scroll widths checked from rendered DOM. No live save, invitation, archive, restore or permanent deletion was performed. Sample links leading to authenticated routes were inspected, not treated as successful authenticated navigation.

| Surface | Observed evidence | Remaining limits |
| --- | --- | --- |
| Stable list | Production composition at both widths; long Polish name/location fit; empty state retains All stables heading and Get started action. | Real route query loading/error and authenticated links not exercised. |
| Settings overview | Standard/long/minimal fields; desktop/mobile wrapping; address line 2 and emergency phone present; minimal content omits absent optional fields. One h1. Dark mobile theme inspected; original light theme restored. | Production query/owner authorization and full dark-state matrix unverified. |
| Archive | Sample pending visibly says Archiving; Escape cannot dismiss; failed request retains actionable dialog; Cancel works; local success is reported only after response and sample can reset. Mobile long-name dialog fits. | Real archive mutation/navigation and support restoration unverified. |
| Stable form | Mobile empty submit focuses name and associates name/location errors; Polish values accepted; pending disables fields; failed sample retains entries; acknowledged local save shown; dirty Reset opens confirmation; Keep editing preserves text and Reset restores sample. Desktop/mobile field layout inspected. | Real create/edit submission, navigation, permissions and browser-level unsaved navigation remain open. HMR-interrupted attempts were discarded and reset cycle rerun after source settled. |
| Providers | Desktop directory; mobile long contact details fit; required-name validation; create dialog initially focuses Name; pending blocks Escape; failed draft remains; direct retry creates local record and restores Add provider focus. Local edit success restores Edit focus. Read-only hides edit/remove/add; empty read-only text verified. | Full consumer role routing, actual backend/clipboard/phone links and remote refresh races unverified. Removal lifecycle has regression tests, not a complete browser pass. |
| Deleted horses | Recent vs eligible records expose appropriate actions; mobile long-name delete dialog, pending Escape guard and failed-delete recovery; local restore removes row and restores group focus; local permanent delete confirmed only after response; restore-only access hides deletion. Desktop flat directory captured. | Backend expiry/purge scheduling, authorization and linked-record deletion effects unverified. Failure-then-retry sample policy follows provider pattern; its retry after latest tweak is test/source evidence only. |
| Welcome | Owner 0/4, 2/4 and 4/4 scenarios; semantic per-item completion; desktop layout. Member mobile form retains failed entries; acknowledged save updates 0/2 to 1/2 and collapses editor. Enter toggles Edit details/Hide form with correct aria-expanded. | Real membership/profile persistence and invitation-driven refresh unverified; full dark/text-scale/reduced-motion coverage remains open. |
| Settings consumer composition | Providers and Deleted horses tabs render actual views inside settings; keyboard Enter activates Deleted horses; embedded samples suppress redundant page headers. | Members tab remains an inert substitute; activity/tab keyboard matrix needs full pass. |

The sample controls and large navigation area above specimens belong to the lab, not production page composition. TanStack's floating development launcher visible in screenshots is also development infrastructure.

## Screenshots

Absolute artifact root:
`/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/stable-audit/`

- `stables-list-desktop.png`, `stables-list-mobile.png`
- `overview-desktop.png`, `overview-long-mobile.png`, `overview-dark-mobile.png`
- `archive-failure-desktop.png`, `archive-mobile.png`
- `stable-form-desktop.png`, `stable-form-fields-mobile.png`
- `providers-desktop.png`, `provider-failure-mobile.png`, `providers-readonly-mobile.png`
- `deleted-horses-desktop.png`, `deleted-horse-failure-mobile.png`
- `welcome-owner-desktop.png`, `welcome-member-fields-mobile.png`

These are viewport captures; they do not claim a full-page scan. Mobile field screenshots demonstrate layout, while failure/success assertions are documented separately where the alert was outside the captured viewport.

## Checks and bounded closeout

- Full TypeScript: pass.
- Full Vitest suite: **287 tests / 54 files pass**.
- Scoped ESLint across stable components/forms/labs/routes and changed shared FormLayout: pass.
- Production Vite build: pass (`/tmp/paddock-stable-audit-build.log`).
- `git diff --check`: pass.
- Impeccable static detector on stable components, stable fields and FormLayout: `[]` (`/tmp/paddock-stable-detector.json`). This is not proof of full accessibility or visual quality.

No whole-family numeric accessibility/performance score is asserted: full contrast measurement, assistive-technology testing, 200% text scale, reduced-motion state coverage, live route loading/error handling and authenticated/backend checks are incomplete. The bounded polish pass addressed heading semantics and sample retry usability; no further cosmetic iteration is justified by current evidence.

## Next required work

1. Replace the Members settings substitute with the actual membership composition and safe callbacks; inspect members page, invitations, reassignment and onboarding consumers.
2. Continue untouched families in the project checklist: care/reminders, documents, analysis, public/account pages and all remaining horse subpages/states.
3. Validate authenticated route integration and backend outcomes in an authorized disposable environment. Existing fixture results cannot close these gaps.

The project goal remains active. No deployment or commit is included in this audit pass.
