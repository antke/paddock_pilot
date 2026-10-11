# Shared stable operations implementation

Scope: implement the 2026-10-01 product review while retaining the existing visual system. Prefer shared primitives; put new reusable controls in the global UI/forms/dashboard collections. No decorative eyebrows, redundant status tags, new CRM, full chat, or generic task board.

## Completion requirements

- [x] Member-readable Stable destination: contacts, people, yard information; owner administration remains protected.
- [x] Restrained navigation with discoverable training, documents, analysis and setup.
- [x] Callable/email contacts and a dashboard emergency-contact shortcut.
- [x] Saved horse provider references resolve current details; historical event snapshots remain stable.
- [x] Compact health attention precedes daily training on phones; care reminders remain near the top; no misleading all-clear; daily training includes quick recording.
- [x] Outstanding reminders by default, explicit history, selected reminder deep links across pagination.
- [x] Edit/reschedule, reopen/undo, optional next due with retained history and retry-safe writes.
- [x] Explicit delegated responsibility and completion attribution with server-enforced access.
- [x] One derived, resumable operational setup checklist, optional home prompt and durable dismissal.
- [x] Opt-in daily due digest, clear in-app/delivery expectations, idempotent queue and send-time access rechecks.
- [x] Shared dirty-form navigation/reload protection on long horse/event forms.
- [x] Validate lightweight yard updates against existing event communications and implement the minimal useful gap without full chat.
- [x] Preserve print summaries, documents, history, recurring events, acknowledged saves, and owner/member safeguards.
- [x] EN/PL copy and permission/lifecycle coverage.
- [x] Aggregate typecheck, lint, regression tests, production build and SSR smoke.
- [x] Desktop+phone rendered verification.

## Implementation decisions

- Daily navigation is Today, Horses, Training log, Calendar, Care, Stable. Stable opens Contacts by default; People and Yard are tabs. Documents, Analysis and Getting started remain named links above those tabs. Training is a primary destination beside Calendar. Owner settings stay separate.
- Current horse vet/farrier contacts can reference the shared directory. Removing or reclassifying a provider keeps the last details on linked horses; historical event snapshots are unchanged.
- Stable owners and the existing record managers delegate reminders to active members. Assignees can complete assigned care and reopen their own completion; assignment, editing and follow-up scheduling keep manager permissions. Follow-ups preserve their source horse/event context. Undo keeps a separately scheduled follow-up and says so explicitly.
- Setup is derived from actual contact, emergency, vet, farrier, horse, team and yard records. These optional steps share one derivation between the checklist and dismissible Home prompt; the initial onboarding flow is still skippable.
- Daily care email is opt-in and off by default. It summarizes due/overdue counts after 09:00 in the selected account timezone, reusing the existing outbox, retries and send-time access checks. It sends no empty summaries. No account was opted in during implementation.
- Event-change email covers appointments; dated Yard updates cover general notices. Active members can post, authors/owners can edit or remove, and expiry is optional. Home shows at most three updates and hides the section when empty. There are no chat, comment, reaction or additional email mechanisms.
- Reusable additions live in the global UI, forms, list-layout and dashboard collections and are registered in StableDesignGuidelines. Existing visual primitives and EN/PL resources are reused.

## Training workflow refinement — 2026-10-02

- Training log restored beside Calendar in the main navigation, including its active state on training detail/create routes.
- Today’s training leads Home’s main content, showing planned/completed sessions by horse and a Record completed work action even on empty days. Quick recording starts with today’s date and completed status; planning remains available from the training log.
- Unallocated horse/day cells in the training calendar are blank, without repeated empty-state labels or decorative icons.
- Refinement checks: 20 relevant tests, TypeScript, scoped ESLint, production build and SSR smoke passed. Desktop/phone dashboard and navigation were visually checked; quick add reached the training create route. Chrome extension UI interrupted the loaded-form inspection; today’s default is verified in the route source.

## Mobile workflow follow-through — 2026-10-02

- Reduced the phone header, retained all destinations, and moved language/theme to Preferences. Training filters start collapsed, with active selections summarized and an explicit clear action.
- Put horse/date/work first when creating training. Recording leads with status, duration and outcome, retaining optional changes to the plan. Sticky actions, acknowledged saves, retry, meaningful draft protection and linked field errors are shared with existing forms.
- Compact horse working headers and reminders precede routine contact reference. Emergency notes stay visible. Phone contacts have direct call actions; edit/remove actions use accessible menus and existing confirmations.
- At 390×844, the header measured 113px (previously 205px); today’s training started around 350px (previously 1,419px). The training agenda was visible in the first screen. Untouched forms left without a warning; real edits retained/discarded correctly and focus returned to the record action.
- Verification: full suite 164 files / 783 tests passed; after final corrections, 36 affected tests, TypeScript, scoped ESLint, Vercel production build and anonymous SSR smoke passed. Earlier full ESLint also passed. Chrome’s open extension popup blocked the final visual confirmation of active-nav reveal and stale editing-badge corrections. No physical-device keyboard test was performed. The temporary viewport override was reset and no live records were saved.

## Verification evidence

- Targeted permission/lifecycle tests cover live provider references, cross-stable rejection, delegated reminder access, idempotent follow-ups, stale edit races, reopening, digest opt-in/rechecks/timezones, setup dismissal, and yard update ownership/expiry.
- UI regressions cover rejected draft retention, guarded navigation/reload, acknowledged saves, reminder history/default-empty copy, callable contacts, and urgent dashboard DOM order.
- Development Convex schema/functions synced successfully. No production deployment, live yard posts or email opt-in was performed.
- Final release checks passed: TypeScript, ESLint, 163 test files / 778 tests, Vercel-targeted production build, and anonymous SSR smoke (Home, sign-in, sign-up, pricing, repeat Home). The test runner reports harmless jsdom scrollTo notices.
- Deterministic design detector: no findings in the new/changed dashboard, shared guard or Stable route surfaces.
- Rendered verification completed in the authenticated development app on desktop and at 390×844: Home, Contacts, People, Yard, reminder editing, selected-reminder navigation, profile email preference, setup checklist and horse provider lookup. Mobile health starts around 374px and care reminders around 747px (previous review: 1,637px and 2,011px); both precede routine content. Saved vet lookup fills contact details; horse and Yard drafts block navigation and were discarded without saving.
- The rendered directory revealed that alphabetical role sorting buried vets. Final ordering prioritizes vets and farriers; confirmed in the live view. Updated EN/PL help describes the directory’s broader use. Follow-up verification passed TypeScript, scoped ESLint, and 40 provider/localization tests.
- Member boundaries were exercised in backend tests rather than by signing into another account. No live care records, contacts, notification preferences or yard notices were changed during browser verification. Temporary mobile viewport override was reset.
