# Horse ownership and stable placement

Implemented locally on 2026-10-05. Deployed to the Convex development deployment `aware-llama-765` on 2026-10-07. The CLI validated the backend, installed the ownership indexes and reported functions ready; a subsequent read-only function-spec check confirmed the ownership, invitation recovery, transition, personal contact and event endpoints. Connected acceptance testing remains pending. No development-data preparation or reset was run.

## Domain model

A Clerk-backed user is a global identity. `horses.ownerId` is the sole owner; it does not change when membership or placement changes. `horseCarers` grants a user viewer or editor access independently of stable membership. An unclaimed horse instead has a `custodianStableId` and is managed by that stable's admin until an invited owner accepts.

`horsePlacements` records each period at a stable. A horse has at most one active placement, with `stableId` and `currentPlacementId` kept as indexed projections on the horse. A user can have memberships in several stables while different horses occupy different stables. Personal horses need no stable or placeholder yard.

Health, medication, weight, nutrition, documents, care reminders and training records reference their horse. A record's optional `stableId` and `sourcePlacementId` identify its origin, not ownership of the horse. Contributions by owners/editor carers are personal; contributions by stable admins acting through placement are stable-origin records. An owner who also administers the stable acts as the horse owner for these records.

The central authorization helpers are in `convex/libs/horsePermissions.ts`. All horse routes use `/horses/:horseId`; event routes use `/events/:eventId`. Historical event links carry horse/participation context so another participant's later scheduling changes do not rewrite the departed horse's history.

## Lifecycles

- **Create personally:** create the horse under the current user, with an optional stable placement. All horse-care features work without a stable.
- **Connect:** the owner selects a stable they already own or belong to. The UI explains that its admin gains access to the complete horse history.
- **Leave or move:** review future stable appointments and choose pending stable tasks to continue personally. A revision check rejects a changed review. A resumable background job locks writes, snapshots the stable's contributions, freezes per-horse event history, withdraws future participation, continues selected tasks, closes placement and optionally creates the next placement. Canonical records retain their IDs and original provenance.
- **Forced member removal:** ends placements for that member's horses and carries every pending stable task into personal care. It never reassigns horse ownership.
- **Claim:** a stable admin creates an unclaimed horse and invites its owner. Acceptance attaches the existing horse to the recipient and grants membership in its current stable.
- **Transfer:** an email-bound, expiring invitation must be accepted by the intended recipient. The recipient keeps the current placement only if already a stable participant; otherwise acceptance includes the departure review. Completion revokes previous carer grants and other pending invitations. Personal pending tasks are assigned to the new owner.
- **Archive/delete account:** archiving departs the horse, revokes carers/invitations and retains the horse in trash for 14 days. Account deletion preserves identity tombstones and does not give the stable admin ownership. An owner can restore a horse into personal care; a custodian can restore an unclaimed horse into a new placement at its stable.
- **Permanent purge:** removes the canonical horse and records after retention. Former-stable snapshots and their referenced document blobs survive. A running transition prevents purge until preservation finishes.

`horseTransitions.advance` commits pages of up to 50 records with its cursor. The scheduler continues each phase; the cron resumes interrupted jobs. Completion is idempotent. The former stable's paginated history is read-only and server-produced. Documents download through authenticated, no-store application/Convex endpoints, including snapshot documents; an old document link does not bypass revoked access.

Shared scheduling and private horse records have separate permissions. Stable event organizers can update scheduling but cannot read or overwrite other horses' service notes, training outcomes, costs or clinical records. Personal multi-horse events require edit access to every participating horse. Dashboards, comparisons, reminders and email delivery recheck horse access.

## Ownership UI follow-up (2026-10-07)

The accepted Impeccable review recommendations are implemented:

- **Delete horse** names the actual operation, confirms the specific horse and recovery deadline, and leads to Deleted horses. Care contacts have separate Edit and confirmed Delete actions.
- Move review repeats the source and destination, explains the new administrator’s access and unchecked-task consequences, and offers Cancel. Access management names the account owner and current stable administrator; ownership transfer has its own section.
- Invitations preserve the token through sign-in/sign-up, offer account switching and actionable recovery states, and keep horse details behind the original authorization query. A separate status query returns only the recovery-state enum.
- **Appointments** provides a full searchable list and month calendar. My horses previews up to 12 occurrences within 90 days, including continuing recurring and multi-day visits, with View all. Frozen appointments retain their horse/participation context after a move.
- Forms retain failed input and show local pending/error/success feedback. Onboarding can return to its starting choice without discarding the profile draft. Personal contact copying, owner display names, personal appointment help, history record types and dates now use accurate English/Polish copy.

## Pre-release rollout

Existing records are disposable test fixtures. Keep the frontend and Convex functions on the same revision; deploy the backend before exercising the new signed-in UI.

1. Deploy from the configured **development** checkout to generate bindings, validate the schema and push functions. Completed on 2026-10-07 using `node --use-system-ca node_modules/convex/bin/main.js dev --once --typecheck enable --tail-logs disable`. Node required the macOS system certificate store for this environment; TLS verification remained enabled. Check the selected development deployment before any later deployment.
2. For a fresh-account test, create a new horse through the app; no fixture preparation is needed. To reuse legacy test horses, choose one development-data approach. Preserve fixtures by setting `DEV_SEED_ENABLED=true` on that development deployment and running `pnpm exec convex run devOwnership:prepareTestData '{"confirm":"prepare-disposable-ownership-fixtures"}'`. This installs placement/provenance on legacy test horses. Alternatively, the internal `devOwnership:resetTestDomain` action requires `{"confirm":"discard-all-test-domain-data"}` and removes the test domain in bounded transactions, preserving users, personal subscription records and external billing. Use it only for explicitly disposable test data, then rerun the existing development seed. Neither helper is a migration strategy for real customers.
3. Existing `devSeed` and `devHorseAnalysisSeed` now install placement provenance. Use test owners in two stables plus an invited nonmember carer to exercise the scenarios below. Keep email delivery in console mode for fixtures.
4. Run `pnpm verify`. After backend deployment, run the connected acceptance checks below. Disable the fixture gate when finished.

No backward data migration or silent remote reset is included. Until fixture preparation or reset is run, legacy horses with `stableId` but no placement are not valid move candidates.

## Verification

Local verification passed TypeScript, lint (zero errors and three existing shadowing warnings), 896 tests across 183 files, a Vercel-format production build and the anonymous production SSR smoke test. The first unrestricted parallel test run hit three timeouts in unrelated analysis suites; those passed in isolation, followed by a complete run with four workers. `convex/horseOwnership.test.ts` covers personal records, admin/member privacy, carer acceptance/revocation, claims, transfers, moves between two stables, immutable origin permissions after return, forced departure, account deletion, trash restoration, paginated/idempotent transitions, recurring shared history, authenticated documents and stale/expired invitations. The DEV-only specimen at `/page-lab/ownership` reuses production management/departure, contacts, invitation recovery and appointment views with labeled synthetic data and local callbacks. The follow-up browser pass checked management at 1280px and 390px, Polish management and deletion confirmation, contact editing and invitation recovery on phones, and appointment list/calendar layouts. One desktop select-caret alignment issue was corrected and visually confirmed. Authenticated persistence, live account switching, dark mode and screen-reader speech were not exercised by this specimen.

Still required against the deployed development backend:

- Complete personal onboarding and add/edit each horse record type without a stable.
- Invite and revoke a viewer/editor through the actual sign-in and email-return flow.
- Connect, leave, move and return; verify both owners/admins, task choices and historical documents.
- Accept a claim and a transfer from a second account; verify old links and subscriptions remain correctly scoped.
- Confirm background transition progress, recovery cron and download routes under real Clerk sessions.

The browser specimen and Convex tests do not replace these connected checks.
