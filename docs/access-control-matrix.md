# Access-control matrix

Status: explicit audience implementation in the local checkout (2026-10-24). See [delivery, rollout and verification](personal-stable-sharing-delivery.md). Production rollout is separate.

## Horse access

An account, horse ownership, personal carer grants, stable membership and record audience are independent. Origin and authorship are provenance, not authorization. Current placement is required for every stable grant.

| Action | Owner | Editor carer | Viewer carer | Current stable admin | Ordinary member |
| --- | --- | --- | --- | --- | --- |
| Read personal canonical history | Yes | Yes | Yes | Only explicitly shared records | No |
| Read shared schedule/status | Yes | Yes | Yes | Yes | Yes |
| Read shared clinical/training details | Yes | Yes | Yes | Yes | No |
| Edit claimed horse profile | Yes | Yes | No | No | No |
| Create records | Yes; sharing choice | Yes; sharing choice | No | Fixed shared for another owner's horse | No |
| Edit/complete a record | Yes | Yes | No | Shared records only | No |
| Manage sharing | Yes | Yes | No | Only through independent owner/editor role | No |
| Move/transfer/manage carers | Yes | No | No | No | No |
| Read former-stable snapshots | Canonical history instead | Canonical history instead | Canonical history instead | No | No |

Roles combine. An administrator acting on their own horse follows owner rules. An independently invited carer retains that grant after departure. An unclaimed horse's custodian manages its records until an owner accepts the claim. Horse deletion/restoration remains owner-controlled (or custodian-controlled for unclaimed horses).

Care-profile sharing includes allergies, feeding routines, nutrition guidance and emergency notes. It does not include personal provider directories, insurance identifiers or contact phone directories. Basic roster fields never imply clinical access.

## Activities and results

Every participant has an audience bound to its current placement. An exact occurrence rule overrides a series rule; a history grant may end at a fixed date. A missing occurrence cannot widen a bounded grant. Stable calendars filter participants and occurrences before display; training notes and outcomes require detail access. Whole-event edits require all participants to be editable and cannot overwrite unshared occurrences. Per-horse completion uses one event/horse/date result and status changes preserve current notes.

Event and training creation now starts with an explicit Personal / named stable destination. Personal permits only owner/editor horses and is private to owners and authorised carers; stable creation is shared to that stable. Stable administrators and owner/editor carers add permitted horses directly. Ordinary members must include an owned horse and invite other horses, labelled Requires approval. Pending invitations never count as confirmed participants or completed training results. Approval/decline is available on Home and event/training details to owners, editor carers and current-placement administrators. Edits do not reset sharing and preserve pending invitations unless deliberately removed. Personal edits cannot add admin-only horses.

The new frontend sends `destination` on every event/training creation. The backend also defaults creation without a stable destination to private, including older requests with obsolete `sharing` / `shareWithStable` overrides. Later sharing is explicit; this is not a data migration. Other care-record forms retain their existing audience controls. No existing record is reclassified by this release.

## Lifecycle, documents and derived data

Leaving, moving, membership removal, archive and ownership transitions revoke obsolete placement grants. Rejoining creates a new placement and never revives old grants. The horse retains canonical history and attachment references; recovery snapshots are retained but provide no former-stable audience.

Document downloads, direct links, summaries, clinical timelines, comparisons, stable counts and queued deliveries recheck current capabilities. Stable projections require an explicit destination grant even when the viewer personally owns the horse. Combined personal overviews deduplicate canonical records. Audit payloads involving inaccessible participants are withheld.

Stable-wide settings, rules, provider directories and records without a horse retain stable-operation permissions. Only the stable owner administers the stable. Subscription checks remain cumulative with access checks.

## Enforcement

recordCapabilities.ts is the record-level capability layer; recordSharing.ts checks current stable/placement and recurrence rules. Horse and stable permission helpers control their respective containers. UI capabilities are feedback, never authorization. Migration withholds ambiguous legacy provenance and never merges similar activities automatically.
