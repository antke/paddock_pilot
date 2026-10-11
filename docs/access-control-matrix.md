# Access-control matrix

Status: horse-centred ownership model implemented locally; see [rollout and verification](features/horse-ownership.md).

## Horse access

An account is global. Stable membership and horse access are independent. Stable admins below mean the admin of the horse's **current** stable. A former admin has only retained snapshots, unless separately granted access by the horse owner.

| Action | Horse owner | Editor carer | Viewer carer | Current stable admin | Ordinary stable member |
| --- | --- | --- | --- | --- | --- |
| View horse profile and complete canonical history | Yes | Yes | Yes | Yes | No; basic roster only |
| Edit claimed horse profile | Yes | Yes | No | No | No |
| Add horse records | Personal origin | Personal origin | No | Current placement origin | No |
| Edit canonical horse records | Yes | Yes | No | Only own current placement's records | No |
| Manage carers, move horse, offer ownership transfer | Yes | No | No | No | No |
| Archive/restore horse | Yes | No | No | Only unclaimed horses in its custody | No |
| Permanently purge after retention | Yes | No | No | Only unclaimed horses in its custody | No |
| Read retained former-stable records | Via canonical history | Via canonical history | Via canonical history | Own stable's snapshots only | No |

Roles combine: an admin who also owns a horse has owner permissions; a stable member invited as a carer has that carer grant. Former-stable snapshots are immutable regardless of later canonical edits. A returning horse receives a new placement: old stable-origin records remain read-only to its admin.

An unclaimed horse has no user owner. Its active custodian admin can manage it and invite the owner; accepting the claim grants ownership and current-stable membership. It cannot leave its custodian before being claimed. Ownership is never reassigned by removing a member or deleting an account.

## Stable operations

Only the stable's `ownerId` grants stable admin authority. Only active `member` membership rows grant ordinary membership; legacy role values grant no authority. Active members can view the stable dashboard, roster, rules and shared calendar. Private horse details are filtered according to the table above, including analysis and dashboard aggregates.

Stable admins manage settings, membership invitations/removals, shared provider directories, stable-wide reminders/documents and the stable audit log. Members may update their own member contact details. Member removal starts a horse departure with all pending stable tasks carried personally. Archiving a stable first requires any unclaimed horses to be claimed or archived; claimed horses depart without changing owners.

## Events and training

| Scope | Read | Manage |
| --- | --- | --- |
| Shared stable scheduling | Active members; owners/carers of a participating horse see its relevant participation | Stable admin or current-member organizer |
| Private per-horse event notes, cost shares and training outcomes | Horse access required, including for organizers | Horse owner/editor, or current admin for its own placement-origin records |
| Personal event | Access through participating horses; other horses' private details are excluded | Edit access to every participating horse |
| Horse participation invitation | Horse owner/editor; current stable admin | Same authorized horse editors/admin |
| Historical participation after departure | Horse access to frozen schedule and per-horse history | Canonical horse records remain editable by owner/editor; former-stable snapshot stays immutable |

A stable member's event must include their own horse; other horses are invited. An organizer's right to change scheduling never grants access to another horse's private records. Redacted fields are preserved on schedule updates. Stable admins can confirm current-stable participation; owners and editor carers can approve, decline or withdraw their horse.

## Documents, contacts, reminders and analysis

- Horse documents and download endpoints enforce current horse access. Former-stable document snapshots use a separate stable-admin check.
- Personal contacts belong to the user. Stable provider directories belong to the stable. Historical records retain captured names/details after a move.
- Personal tasks may be assigned to the owner or an editor carer. Stable tasks may be assigned within the stable. Departure creates selected personal continuations and dismisses the former stable tasks.
- Account-wide and stable dashboards/analysis use only authorized horse data. Stable membership alone does not expose clinical aggregates.
- Subscriptions remain tied to the user's account. Existing premium checks are cumulative with data-access checks; billing never grants access to a horse.

## Server enforcement

Use `convex/libs/horsePermissions.ts` for horse access, `eventPermissions.ts` for shared/personal event access and `stablePermissions.ts` for stable operations. The UI uses returned capabilities but is never the authorization boundary. Missing grants deny access. Verified recipient emails, invitation expiry, expected ownership/placement and fresh departure revisions protect acceptance workflows. Scheduled email delivery rechecks current eligibility so revoked or transferred access does not receive new private notifications.
