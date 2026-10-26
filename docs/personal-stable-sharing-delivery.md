# Personal/stable sharing delivery evidence

## Status and scope

Implemented locally on 2026-10-24. No production deployment, production data inventory/backfill, snapshot cleanup or duplicate merge was performed. Authenticated cross-role browser acceptance remains a release gate. The checkout already contained 79 modified tracked files plus untracked work; overlapping event, training, authorization, form and translation work was preserved.

The initial targeted baseline passed 38 tests. The reported browser completion mismatch was not reproduced under authenticated accounts. Code inspection established that stable lists selected by origin `event.stableId` and omitted personally created shared work. This revision discovers records through explicit audience grants. That finding does not establish duplicated database activities or stale subscriptions in existing data.

## Implemented behavior

- `recordShares` references the canonical record, horse participant, named destination and current placement. Origin/authorship remain provenance. Exact occurrence rules override series rules; bounded history grants require a date and never authorize later occurrences. Stopping all sharing also disables occurrence exceptions.
- `recordCapabilities`, event permissions and sharing helpers enforce personal owner/editor/viewer access independently of membership. Administrators can read details and complete shared work; members see shared schedule/status only. Private data is withheld from stable administrators, direct links, documents/downloads, derived summaries, comparisons, timelines, audit logs and queued notification delivery.
- New owner/editor records for a placed horse default to shared with a visible opt-out across personal/stable forms. Staff acting for someone else's horse have a fixed shared audience. Editing does not reset sharing. `recordCreationRequests` makes retries of one submitted request idempotent without merging intentionally similar sessions.
- Training uses one event/horse/date result, status-only updates preserve notes, scheduled-session choices link to existing activities, and groups show per-horse outcomes plus aggregate completion. Mixed-audience participant lists and event text are redacted; whole-event edits require authority over every participant/occurrence.
- Existing-horse joining, optional history preview, management controls, date-specific audience feedback and resumable progress are available in English and Polish. Account display names use the preferred name, usable sign-in name, then fallback. Existing legacy stable aliases remain editable; routine new aliases were removed. New-horse creation shows essentials first with optional enrichment; typed owner contacts do not grant access.
- Leave/move/removal/archive/transfer paths revoke placement-bound access, retain canonical content/attachments and independent personal carers, and prevent rejoin from reviving grants. Selected pending tasks keep their original IDs and provenance. Departing group participation retains frozen historical context without canceling other horses' shared schedules. Former-stable snapshot endpoints expose no retained horse history.

## History boundaries

`historySharingJobs` records request identity, fixed cutoff, categories, placement, phase/cursor and progress. Pages revalidate current authority and placement. Retries reuse the job; recurring history grants end at the cutoff and ongoing schedules require a separate deliberate share.

Categories cover events, training, care, documents and pending care tasks. Care includes health, medication, weight, nutrition and the current care profile. Shared care-profile fields cover feeding, allergies and emergency care, not private contact directories or insurance. Document selection excludes financial/insurance and unclassified “other” documents. Empty categories and scope counts are previewed. Membership, connection and history sharing remain separate recoverable operations.

## Verification

- Permission, lifecycle, idempotency, bounded recurrence, redaction, private creation, care/profile and migration tests use Convex fixtures with distinct identities. `sharingAcceptance.test.ts` exercises canonical cross-view behavior, fixed-cutoff sharing and explicit resharing of departed history; `sharingMigration.test.ts` checks proven provenance, explicit opt-out preservation, retry behavior and sole-source snapshot detection.
- Desktop (1280px) and mobile (390px) audience specimens were inspected with English/Polish, light/dark themes and keyboard toggling. No horizontal overflow was observed. Captures are under `.impeccable/review/sharing/`. The design detector returned no findings. The independent finish reviewer accepted the occurrence-feedback correction after code/test review.
- The authenticated management/history flows were not visually exercised. The local browser was signed out; no test-account credentials were supplied. T3 preview snapshots timed out twice, so the specimen was inspected in Chrome. Anonymous production SSR smoke testing does not replace authenticated end-to-end checks.
- Final checks passed: `pnpm typecheck`; `pnpm lint` (zero errors, three pre-existing shadowing warnings); `pnpm exec vitest run --maxWorkers=4` (1,331 tests across 225 files); `pnpm build:smoke` (production build and anonymous SSR routes); and `git diff --check`. The specimen's missing `matchMedia` test mock was fixed before the clean run. JSDOM emits non-failing `scrollTo` notices.

## Deployment, data review and rollback

1. Before deployment, export/back up canonical tables, grants, placements, snapshots and attachment references. Verify the target environment. Use non-production owner, editor, viewer, admin and member accounts to exercise the plan's acceptance scenarios, including reloads, direct links, recurring exceptions, transfers, return to a stable and queued email delivery.
2. Release schema/indexes and all server authorization consumers as one coherent backend revision; deploy the matching frontend. Do not temporarily retain old endpoints that grant origin-based administrator or snapshot access. Existing ambiguous legacy records remain private until deliberate review; disclose that conservative behavior to operators.
3. Run the internal read-only `sharingMigration:snapshotInventory` from cursor `null`, following returned cursors until `isDone`. Preserve every `requiresRecovery` row and attachment. A canonical row's existence alone does not prove its full contents match the snapshot. Compare and recover sole-source content before any separately approved cleanup. This implementation deletes no snapshots or blobs as part of migration.
4. Review `sharingMigration:duplicateCandidatesForHorse` output against actual IDs, results, attachments and authorship. Similar titles/dates are review hints only. No automatic merge exists. A future verified merge must preserve references and usable old links; leave ambiguous candidates untouched.
5. Backfill only after reviewing provenance: invoke internal `sharingMigration:backfillPage` separately for `eventsHorses`, `horseHealthIssues`, `horseMedicationRecords`, `horseWeightRecords`, `horseNutritionLogs`, `stableDocuments` and `careReminders`, starting each at cursor `null` and following cursors until `isDone`. Record granted/withheld counts per table. The mutation grants only current placement-matched stable-origin records, skips nonconfirmed participation, preserves existing explicit grants/opt-outs, and safely repeats. Legacy rows without reliable placement provenance remain withheld for owner selection. Never infer sharing solely from current horse placement.
6. Re-run connected acceptance after backfill and inspect direct downloads, notifications and aggregates from each role. Keep email delivery in test/console mode while using fixtures. Do not use development reset/seed helpers on real customer records.
7. Roll back UI changes only with compatible authorization. If server rollback is necessary, retain the current fail-closed capability checks and disabled former-stable snapshot access, or disable the affected feature. Restoring old blanket administrator access is not an acceptable rollback. Preserve grants/jobs and exports for recovery; do not delete new tables to undo a release.

## Outstanding release evidence

The original authenticated mismatch reproduction and signed-in multi-role browser acceptance are not complete. Development snapshot/duplicate/provenance review is complete as recorded below; no grants were eligible. Production data review remains a release prerequisite. The tools and implementation supporting those tasks are present. These limitations are explicitly unchecked in the implementation plan; no production readiness claim is made without them.

## Connected verification attempt (2026-10-24)

The configured target is the development deployment `aware-llama-765`. A read-only inline inventory of horses, snapshots, grants and event participation was attempted with an explicit deployment selector, without `--push`, identity impersonation or mutations. The Convex CLI rejected it: “You don't have access to the selected project.” No inventory data was returned and no remote data was changed. Selecting a different project would not verify this project's records.

Repository inspection found only synthetic browser fixture bypasses, not a documented authenticated multi-account E2E setup. The existing signed-out browser and fixture routes cannot prove Clerk identity, live subscriptions or persisted role behavior. Completing the remaining gates requires restored access to the intended development project and non-production signed-in test roles (owner, editor carer, viewer, administrator and ordinary member). The user has been asked for that existing setup; credentials must not be pasted into chat.

## Restored development access and inventory (2026-10-25)

After the user restarted Convex and Node, the configured `dev:aware-llama-765` deployment accepted a read-only query. The earlier project-access blocker is resolved. No production target was used and no remote mutations were performed.

The complete development inventory contains 30 horses, 285 events, 319 event participation rows, zero snapshots and zero sharing grants. The deployed `sharingMigration:snapshotInventory` returned an empty completed page. A duplicate-candidate scan across all 319 participation rows found zero groups sharing horse/title/type/date/time; no merge is warranted under that heuristic. This does not prove that differently titled or dated records are semantically distinct.

| Source              | Total rows | Horse-linked rows lacking matching placement provenance | Eligible backfill grants |
| ------------------- | ---------: | ------------------------------------------------------: | -----------------------: |
| Event participation |        319 |                                                     319 |                        0 |
| Health              |         28 |                                                      28 |                        0 |
| Medication          |         25 |                                                      25 |                        0 |
| Weight              |         61 |                                                      61 |                        0 |
| Nutrition           |         30 |                                                      30 |                        0 |
| Documents           |         24 |                                                      19 |                        0 |
| Care reminders      |         28 |                                                      23 |                        0 |

Each read was bounded at 1,001 rows and every table returned fewer than that limit, so none of these counts is truncated. Rows without a horse are excluded from horse-sharing eligibility. The deliberate migration decision is to withhold all ambiguous legacy horse records, not manufacture placement provenance or grant access based on current stable assignment. With no eligible rows, no backfill mutation was necessary. Owners must explicitly select history after valid placement is established. Production data must be reviewed independently at release.

The supplied LAN onboarding URL on port 9091 was reloaded after the restart and still displayed “Sign in to continue setup.” T3 preview snapshots again timed out twice; Chrome confirmed the signed-out state. Live owner/carer/member flows and the original completion mismatch still require authenticated non-production sessions. The restart restored CLI access, not browser authentication.

## Authenticated owner/admin browser pass (2026-10-25)

The user signed in on the LAN origin. The session belongs to the owner of the development stable “Test” and also owns the synthetic QA horse. This verifies owner/admin workspace behavior for one account, not independent carer/member identities.

Created only these clearly named QA records through the UI:

- Horse `Sharing QA 2026-10-25` — `jn757tk3g60qvxptke9qxa6m0d8gwq2r`.
- Personal-origin appointment `Sharing QA appointment` — `js7d4jxe2kyehqf919xs8csyns8gw11r`.
- Personal-origin session `Sharing QA training` — `js76d8mz8jw6vh2pk3xgzrhsrh8gxvqw`, on 2026-10-25 at 10:00.
- Its canonical result — `j57ct0gnagvgykzyvxtp06fqb18gw9bh`.

Connected the QA horse to Test, continued onboarding with that existing horse, skipped invitations and opened the stable. No invitations or external messages were sent. Existing horse records were not edited. The QA records remain available for follow-up verification; no deletion was performed.

Live verification exposed and corrected three missed issues:

1. LAN HTTP lacks `crypto.randomUUID`, crashing history sharing after connection. `createRequestId` now uses native UUIDs when available and cryptographic `getRandomValues` otherwise; event/reminder/history creation uses the helper. Regression tests exercise both branches.
2. Stable dashboard presentation still filtered authorized events/training/results/reminders by origin `stableId`, hiding personally created shared records. Dashboard callers now obtain the scoped server audience and presentation retains it. Regression tests cover shared records with absent/different origin.
3. Placement/access descriptions still promised administrators complete history. English and Polish now explain explicit sharing and private-history protection.

Verified in the authenticated UI: essential horse creation, connection without copying the horse, named stable sharing checked by default on personal appointment/training creation, the same appointment ID in the stable calendar, and both personal-origin records on the corrected stable dashboard. Completed training from the stable dashboard, observed “Completed” in personal details, then reopened from personal details. A read-only database query confirmed exactly one result row for that event/horse/date, status `planned`, and unchanged focus text “QA notes preserved across completion”. The reopened UI screenshot is `.impeccable/review/sharing/authenticated-reopened.jpg`.

The original historical mismatch is not retrospectively reproduced; this pass directly reproduced the remaining origin-filter dashboard omission and verified its correction. Separate editor-carer, viewer-carer, ordinary-member and non-owner-administrator browser sessions are still needed for independent-role E2E acceptance. Automated role fixtures remain supporting evidence rather than a substitute. The user was asked for the existing non-production account workflow without requesting passwords.

After these live fixes, final verification passed again: TypeScript; lint with zero errors and the same three pre-existing shadowing warnings; 1,333 tests across 226 files; production build/anonymous SSR smoke; and `git diff --check`. The earlier 1,331-test result remains historical evidence, superseded by this run.

A subsequent read-only role inventory confirmed that Test currently has no `stableMembers` rows (its owner has owner access independently), and the QA horse has no `horseCarers` rows. Consequently, the current setup contains none of the independent member/viewer/editor roles needed for the outstanding browser checks. No role grants or invitations were created during this inventory. The pending user question requests an existing non-production account workflow, not credentials.

## Explicit event destinations and invitation recovery (2026-10-25)

The event/training creation screens now use one top-level Personal / named stable selector. It filters horse choices, explains visibility, preserves the draft, and requires confirmation before removing horses incompatible with a destination change. Provider suggestions follow the destination. Training is also available in event creation. New UI submissions carry an explicit `destination`: Personal is private to owners/carers; stable creation is shared. Creation without a stable destination is private even when an older client omits `destination` or supplies obsolete sharing overrides. Owners can deliberately share afterward. Existing records and other care forms are not reclassified.

Administrators and owner/editor carers add permitted horses directly. Ordinary members still need at least one owned horse and may invite others to planned events/training. The picker marks Requires approval and shows direct/invited counts. Completed training cannot include invitation-only horses. Home and event/training detail pages expose pending approval actions, including administrator approvals, and details retain participant states rather than making invited horses disappear. Invitation titles link to the review page. Pending rows are retained in organizer edit projections; changing a title cannot silently withdraw invitations. Personal edits require personal editing authority for every selected horse.

Invitation email creation already grouped horses by recipient. Delivery now rechecks that recipient's current pending invitations, rebuilds their summary, and does not require clinical access to the other participants. It suppresses sends with no eligible pending invitations. No real emails were resent during this work.

A read-only production outbox query inspected all seven delivery rows present (bounded at 1,000), including two horse-invitation emails: one skipped with `Recipient no longer has access to this event.`, and one accepted by Resend. Provider acceptance is not proof of inbox delivery; neither record had a returned delivered timestamp. No recipient addresses or private event contents were needed for this inspection. No production mutation, deployment, or migration was performed.

Independent code review identified and verified fixes for the private-update authorization and pending-edit projection issues. Automated coverage includes destination privacy, editor/viewer/admin distinctions, three-horse invitations, per-recipient email aggregation and stale suppression, approval, completed-log rejection, destination switching with draft retention, and event-to-training selection. T3 preview snapshots timed out twice. The repository WebKit workflow subsequently passed desktop English (1280px) and mobile Polish (390px) checks against the local Page Lab: destination filtering, cancel/confirm draft preservation, keyboard horse selection, training selection, submit clickability and no horizontal overflow. Screenshots were inspected. The development-only TanStack launcher was hidden for these checks because it covered the mobile submit control; its unrelated router inspector error is retained separately in the report. Reproduce with `node scripts/check-event-destinations.mjs` against the local dev server; evidence is in `.impeccable/review/event-destinations/`. This is fixture browser evidence plus backend role tests, not authenticated cross-role browser acceptance or proof of email inbox delivery.

Final checks for this revision passed: `pnpm typecheck`; lint with zero errors and the same three pre-existing shadowing warnings; 1,342 tests across 227 files; production build and anonymous SSR smoke; scoped Prettier checks; and `git diff --check`. The static design detector found no issues in the changed creation/invitation components. Independent follow-up review marked both identified code issues resolved and found no further scoped code blockers. Its mobile-submit verification gap was traced to the development-only launcher and closed with the clickability check above.

## Workspace clarity and account inbox — 2026-10-25

The navigation now includes an account-wide notification bell in expanded and collapsed navigation, including mobile. Its inbox separates pending decisions from updates, supports unread filtering and persistent per-user read state, and keeps read invitations actionable. Existing pending stable membership, horse carer, ownership claim/transfer, and event participation invitations are discovered without requiring email links. Event participation can be accepted or declined in the inbox; ownership and membership decisions retain their existing review flows and safeguards.

Membership and event notifications are recorded alongside new email enqueue operations, independently of provider delivery success. They are not backfilled from historical email deliveries. The inbox shows the latest 100 of these updates plus up to 30 history-sharing jobs and 30 moves. Job status changes have distinct read keys. Invitations are sourced from current state, filtered by verified recipient addresses, expiry, placement, ownership, deletion and current permissions. Event updates resolve live authorized data rather than storing clinical snapshots; membership-ended/archive notices retain only the historical stable label. Deleted accounts have their notices and read markers removed.

The workspace picker explains Personal versus Stable and that switching views does not grant access. Private audience labels now explicitly identify the owner and carers. Restricted roster cards explain that stable membership alone does not open a horse's records and direct the member to ask the horse owner for a carer invitation. English and Polish copy are included.

Verification includes backend tests for recipient isolation, verified secondary addresses, expired/revoked/stale invitations, durable idempotent reads, event access revocation, deduplicated updates, participation decisions and job status changes. UI tests cover grouping, unread filters, review links, failure/retry and loading/empty states. The real notification component was also exercised in the T3 browser with local fixtures at 390px and 1280px, including marking all read without losing pending decisions. This is component-browser evidence, not authenticated end-to-end acceptance.

Final verification for the inbox pass: 1,361 tests across 231 files passed; typecheck passed; lint passed with only the same three existing shadowing warnings; production build and anonymous SSR smoke checks passed; `git diff --check` passed. Temporary browser fixture files and their preview server were removed.
