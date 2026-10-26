# Personal and stable records: implementation plan

Status: implemented in the local checkout on 2026-10-24; final verification and release evidence are recorded in [delivery evidence](personal-stable-sharing-delivery.md). Production deployment/data review and authenticated cross-role browser acceptance remain release gates. Product rules below were agreed on 2026-10-24.

## Outcome

One horse has one continuing history. Personal and stable screens are authorized views of the same activities and results. Users create, edit and complete work once. Sharing changes access, never creates a second editable copy.

This plan replaces the earlier proposed unchecked sharing default and the former-stable retention policy in `features/horse-ownership.md` and `access-control-matrix.md`. The ownership, training, access-control and product documents now describe the local revision and distinguish it from the previous deployed behavior.

## Agreed product rules

1. A horse retains all its records, attachments, authorship and results, including contributions made by stable staff.
2. Leaving a stable or withdrawing sharing removes that stable's access to the affected horse records, including staff-authored contributions. The former stable does not retain a separately readable snapshot. A separately invited personal carer retains only the access supplied by that independent grant.
3. For owner/editor creation involving a horse placed in a stable, put **Share with [stable name]** at the top of the form, checked by default. Unchecking keeps the record personal. This applies regardless of which view opened the form.
4. Without a stable placement, create a personal record without a sharing checkbox. Editing preserves the existing sharing setting.
5. A stable administrator creating a record for someone else's horse always creates a shared record, also visible to the horse owner. Explain this fixed audience instead of presenting a checkbox that implies a choice. An administrator acting on their own horse uses owner rules.
6. Shared schedules and completion status are visible to stable members. Shared care details and training notes are visible to stable administrators; personal horse access continues to apply to owners and invited carers. Ordinary membership does not grant access to those details.
7. Horse owners, editor carers and authorized stable administrators may complete shared training/care work. Viewer carers and ordinary members cannot complete it merely through those roles.
8. Joining a stable offers selection of existing owned horses and history categories for each selected horse. Category choices share existing history only, not future records automatically.
9. Sharing care history includes current care-profile information such as allergies, feeding routines and emergency notes. Explain that inclusion before confirmation.
10. Sharing a recurring activity applies to the series, with individual-occurrence exceptions.
11. A shared record appears in both personal and stable views. Edits, completion and reopening update the same canonical state in every authorized view.

## Scope and boundaries

Include identity display, horse creation, stable joining, horse profile/care information, events, training, reminders, documents, sharing management, departure, data migration and all derived access surfaces.

Preserve horse ownership and carer grants independently of membership. Preserve group scheduling for remaining participants when another horse leaves. A participant cannot delete or hide the entire group activity for everyone; changing their horse's sharing removes that horse's protected details from the stable view. Do not expose private-record placeholders or counts.

One canonical activity does not require one physical database row. Retain linked participants and one training result per event, horse and occurrence. Never introduce separate personal/stable copies or a synchronization job between copies.

## Delivery sequence

### 0. Establish the current baseline and reproduce the mismatch

- [x] Inspect current local changes before editing; preserve unrelated work and reconcile any overlapping fixes already underway.
- [x] Trace personal/stable create, edit, complete and reopen paths with actual event ID, horse ID and occurrence date.
- [ ] Reproduce the reported completion mismatch and distinguish duplicate database entries, duplicate display projections, mismatched occurrences and stale subscriptions.
- [x] Inventory name consumers and editors: Clerk identity, preferred account name, stable overrides and typed horse-owner contact names.
- [x] Inventory all consumers of horse access, record origin, stable filtering and historical snapshots, including notification jobs and storage downloads.

Evidence from the earlier review: personal creation omitted a stable destination; stable lists filtered on event stable; training completion already used a shared mutation and an event/horse/date key. Four backend training tests passed then, but did not reproduce the reported end-to-end issue. Several affected files have subsequently changed locally; revalidate these findings rather than treating them as the current baseline.

Acceptance: a reproducible failing scenario or explicitly documented reproduction gap, an affected-surface inventory, and an implementation delta against current code.

### 1. Implement canonical sharing and authorization

- [x] Separate origin/authorship, activity management, placement, audience and result identity. Do not overload `stableId` to represent all five.
- [x] Add indexed sharing relationships referencing canonical records, destination stable, horse participation where relevant, and placement context. Final schema shape should follow the baseline audit; a single `isShared` boolean is insufficient for multi-horse/multi-stable activities.
- [x] Represent series sharing plus occurrence overrides. Define precedence once and reuse it for queries, edits and notifications.
- [x] Centralize server capabilities: read schedule/status, read details, edit content, complete work and manage sharing. Derive permissions from the record and actor, never the route used to open it.
- [x] Remove blanket administrator access to unshared horse history. Separate basic roster fields from protected care/profile information.
- [x] Apply grants to list/detail queries, calendars, timelines, dashboards, comparisons, search, counts, exports, downloads and queued notifications.
- [x] Preserve content withheld from an editor's view when processing updates; do not replace redacted fields with empty values.
- [x] Ensure unsharing and departure revoke access promptly, including direct links and background delivery. Preserve canonical records and attachment references.

Implementation recommendation: one shared authorization layer with record-specific adapters, rather than independent permission logic in each feature. A sharing grant gives an audience access; it does not automatically grant editing authority.

Acceptance: the same record ID has the same content and capabilities in either view; a stable administrator cannot retrieve an unshared record through any supported endpoint.

### 2. Unify creation, completion and occurrence behavior

- [x] Reuse canonical create/edit actions and consistent form payloads across personal and stable entry points.
- [x] Apply the agreed default sharing choice only to new records; never reset visibility when editing.
- [x] Keep a single authoritative result for each event/horse/occurrence. Use the same result projection across lists, cards, detail pages and dashboards.
- [x] Make completion, reopening and edits reactive across both views; preserve latest notes when changing status only.
- [x] Make create retries and double submissions idempotent without preventing intentionally similar activities.
- [x] Offer relevant existing scheduled sessions from “Log training,” with “Record this session” and “Create a new session.” Do not silently match by title/date.
- [x] For group sessions show per-horse completion and an accurate aggregate such as “2 of 3 completed.” Completing one horse never completes another.
- [x] Keep invited, confirmed, declined and withdrawn participation distinct from completion and sharing.

Acceptance: create once, complete in either view, reopen in the other, and edit notes without duplicate activities or divergent state. Recurring dates and different horses remain independent.

### 3. Add existing-horse selection and history sharing to joining

- [x] After invitation acceptance, show a checklist of owned horses, with current placement visible. Allow joining without adding horses.
- [x] Offer a compact new-horse action for users with no existing horse. Do not require recreating an existing horse.
- [x] Expand history category choices only for selected horses. Use explicit labels, descriptions and counts; show empty categories clearly.
- [x] Group events, training, care history/current care profile, documents and pending care tasks coherently. Explain health, medication, weight and nutrition within care; do not silently include financial documents or unrelated contact directories.
- [x] Use a fixed cutoff for “existing history” and preview the selected scope before committing. Clearly distinguish completed history from ongoing recurring schedules and pending tasks.
- [x] Define and test how the selected history range maps to series rules and occurrence exceptions; do not accidentally publish future occurrences as a side effect of selecting past history.
- [x] Route horses at another stable through the existing move review. Recheck ownership, placement and membership server-side at commit time.
- [x] Make bulk sharing resumable and retry-safe. Show progress and recoverable errors without requiring invitation acceptance again.
- [x] Keep membership acceptance, horse placement and history-sharing outcomes identifiable so partial failure is understandable and recoverable.

Acceptance: an existing owner joins, selects horses/history, and sees those same records in the stable without duplication or unintended future sharing.

### 4. Simplify identity, forms and audience communication

- [x] Resolve account display names consistently: preferred name, then usable sign-in name, then a suitable fallback. Fix the current-user suggestion that preferred a placeholder such as “Member.”
- [x] Use one canonical account-profile editor; link to it from other surfaces. Remove routine stable-name overrides from onboarding and plan treatment of existing overrides without silently discarding data.
- [x] Distinguish account ownership from typed owner/contact names. Typing or selecting a person's name must not imply an ownership transfer or access grant.
- [x] Keep genuinely stable-specific contact fields explicitly labeled. Do not silently publish global contact changes to unrelated audiences.
- [x] Reduce horse creation to essential fields and one save. Offer optional care/profile enrichment afterward; retain efficient editing for existing complete records.
- [x] Put the sharing control at the top of event, training and other horse-record forms. Use one clear save action and expandable optional details rather than an obligatory multi-section workflow.
- [x] For horses in different stables, group sharing choices by named destination only when necessary. Never expose another horse's unshared details through shared event text or participant lists.
- [x] Provide record-level sharing management and bulk history sharing from horse management. Separate “Stop sharing,” “Cancel activity” and “Delete.”
- [x] Implement audience/capability feedback as shared components with English and Polish copy, keyboard support and mobile layouts.

Acceptance: users can predict the audience before saving, find the saved object, and understand why an action is available or read-only without learning backend terminology.

### 5. Replace former-stable retention and migrate safely

- [x] Update leave, move, member removal, stable archive, transfer and account-deletion paths to preserve the horse's canonical history while revoking obsolete stable access.
- [x] Remove former-stable snapshot-reading permissions, including staff-origin records and document links. Audit existing snapshots and preserve any data/blob that is not safely represented by canonical records before cleanup.
- [x] Keep remaining participants' shared group schedules functional while removing the departing horse's protected data. Retain the horse owner's historical participation context without providing former-stable access to it.
- [x] Prevent later rejoining from reviving previous sharing automatically; treat the new placement and history selection explicitly.
- [x] Inventory existing data and backfill grants deliberately. Do not make historically personal records shared merely because their horse has a stable placement.
- [x] Review duplicate candidates; merge only verified duplicates, preserving results, attachments, references, authorship and usable old links. Do not merge on title/date alone.
- [x] Stage deployment so old endpoints cannot bypass the new permissions. Rollback must not silently restore blanket administrator access or snapshot access.

Development inventory on 2026-10-25 found no snapshots, no duplicate candidates under the documented heuristic and zero eligible grants; ambiguous placement provenance was withheld. No mutation or merge was needed. Production review remains a separate release gate.

Acceptance: the horse retains all history after leaving; the former stable cannot retrieve it, including through old URLs, snapshots, downloads and notifications.

### 6. Validate and release

- [x] Run permission-focused backend tests and cross-view integration tests before broad repository verification.
- [ ] Exercise authenticated end-to-end flows with distinct owner, editor carer, viewer, administrator and ordinary-member accounts.
- [x] Verify desktop/mobile, keyboard use, both themes and English/Polish audience copy.
- [x] Run required typecheck, lint, test and production build/smoke checks against the final changes.
- [x] Update ownership, training, access-control and product documentation to match shipped behavior. Record any remaining verification limitation explicitly.

Do not ship phases 1–5 as disconnected UI changes that promise privacy or consistency the server does not enforce. They may be developed incrementally behind a coherent rollout boundary. The isolated preferred-name fix can ship independently with its own regression coverage.

## User-facing communication contract

- View context: **My horses** and the actual stable name; switching views does not change record identity.
- Editable new-record audience: **Share with Willow Stable**, checked by default for placed horses.
- Fixed administrator audience: **Shared with Willow Stable and the horse owner**.
- Personal audience: **Not shared with a stable**. Explain personal carer access where applicable; never claim “Only me” when carers can read it.
- Shared audience: **Shared · Willow Stable**; activating the label opens audience details and permitted sharing actions.
- Schedule versus details: explain that members see schedule/status and administrators see shared details. Do not repeat a long permission matrix on every form.
- Care sharing: explicitly mention current allergies, feeding routines and emergency notes alongside care history.
- Completion: check icon plus **Completed**, separate from the sharing label. Use per-horse status for multi-horse sessions.
- Read-only capability: **View only** with a concise reason where relevant. Avoid unexplained disabled actions.
- Save result: **Saved to Maple's records** or **Saved and shared with Willow Stable**, with a link to the canonical record.
- Empty stable state: explain that the view contains shared records; do not reveal whether another user's private entries exist.
- Failure: preserve draft and audience selection. Distinguish a failed save from pending bulk sharing and provide a safe retry.

Use restrained icons and color as supporting cues, never the only indication of visibility or status. Avoid a second confirmation for routine saves. Confirm actions with wider consequences, such as withdrawing shared group participation or moving a horse, with a concrete impact summary.

## Required acceptance scenarios

1. Set preferred name to xyz; account, suggestions and ownership labels agree and do not show Member (me).
2. Create a shared session personally; stable and personal views reference the same activity/result. Complete, reopen and edit from either authorized view.
3. Uncheck sharing when creating; no stable role can discover the record through membership, including administrators and direct-link access.
4. Administrator creates a record for another owner's horse; audience is fixed/shared and the owner sees the same record.
5. Share/unshare an existing completed entry; identity, notes and completion survive unchanged.
6. Complete one horse in one recurring occurrence; other horses and dates remain unchanged. Test a private occurrence inside a shared series.
7. Join with existing horses and selected history; no horse/activity duplication, no accidental future-category defaults, no hidden sharing of excluded categories.
8. Care-history sharing includes explained current care information; ordinary members still cannot retrieve detailed notes.
9. Multi-stable/multi-horse activities reveal only authorized participants/details at each destination.
10. Leave, revoke sharing, remove membership and rejoin; all history stays with the horse, old stable access ends, and rejoining does not revive prior grants.
11. Old document links, exports, search, aggregates and queued notifications honor current access.
12. Retry creation, completion and bulk sharing; no duplicate records or lost notes. Concurrent edits preserve fields the actor cannot see.

## Implementation entry points

Backend: `convex/schema.ts`, `convex/horseOwnershipSchema.ts`, `convex/libs/horsePermissions.ts`, `convex/libs/eventPermissions.ts`, `convex/libs/horseEventHistory.ts`, `convex/events.ts`, `convex/training.ts`, `convex/horseTransitions.ts`, `convex/stableInvitations.ts`, `convex/onboarding.ts`, `convex/people.ts`, horse-care/document/reminder modules and notification delivery.

Frontend: `src/components/ownership/PersonalEvents.tsx`, `usePersonalTraining.ts`, shared training calendar/completion components, event editor, horse forms, onboarding/FirstHorseStep, invitation views, horse management, account profile and stable member details.

Shared: `shared/training/trainingEntries.ts`, event occurrences/schema, access helpers and English/Polish locale resources.

## Resolved engineering design

The indexed placement-bound grant schema, resumable paginated job, fixed history cutoff, category boundaries and conservative migration policy are implemented and documented in [delivery evidence](personal-stable-sharing-delivery.md). Unchecked items above require connected accounts. Development read-only inventory and duplicate/provenance review are complete; no eligible backfill or verified duplicate merge was found. Production data review and deployment remain release gates.
