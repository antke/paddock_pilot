# Stable access-control matrix

Status: accepted MVP guideline; core enforcement and role flows implemented

## Roles

Paddock Pilot has two stable roles:

- **Stable owner/admin** — the person accountable for the stable. There is one
  owner per stable in the MVP.
- **Member** — a person who belongs to the stable and normally manages their own
  horses and activities.

`owner` should remain the stored role and **Stable admin** can be its product
label. Guests, external users, custom roles, and delegated admins are out of
scope for now.

## Permission model

A role alone is not enough to decide every permission. Access is determined
from:

1. stable membership;
2. stable role (`owner` or `member`);
3. relationship to the record (horse owner, event creator, invitee, or
   uploader); and
4. the Premium entitlement for the Analysis Centre, once billing is enabled.

Permissions are enforced on the server. The UI should hide or disable
unavailable actions, but UI checks are not authorization.

### Legend

- **All** — allowed for any record in the stable.
- **Own** — allowed only when the member owns or created the relevant record.
- **View** — read-only access.
- **Invite** — the action creates a pending invitation; it does not immediately
  add another member's horse.
- **No** — not allowed.

## Stable and membership

| Functionality                                 | Stable owner/admin | Member | Rule or scope                                                                                                 |
| --------------------------------------------- | -----------------: | -----: | ------------------------------------------------------------------------------------------------------------- |
| View stable dashboard                         |                All |   View | Both roles can see stable operations.                                                                         |
| View stable details and rules                 |                All |   View | Includes address, contacts, opening hours, and yard rules.                                                    |
| Update stable details and rules               |                All |     No | Stable-wide settings belong to the owner.                                                                     |
| Archive stable                                |                All |     No | Owner-only; records are preserved and all active access stops.                                                |
| View member roster                            |                All |   View | Members see basic identity; sensitive contact fields should be limited to the owner and the person concerned. |
| Edit own member profile/contact details       |                All |    Own | A member may maintain their own phone and emergency contact.                                                  |
| Edit another member's profile/contact details |                All |     No | Owner may correct stable records.                                                                             |
| Invite, resend, or revoke member invitation   |                All |     No | New invitations always use the `member` role.                                                                 |
| Remove a member                               |                All |     No | Define horse reassignment/removal before completing removal.                                                  |
| Change a member's role                        |                 No |     No | There are no additional assignable roles in the MVP.                                                          |
| Transfer stable ownership                     |             Future |     No | Treat as a dedicated, confirmed workflow rather than a role edit.                                             |
| Manage billing or stable subscription         |                All |     No | Billing authority is separate from ordinary stable participation.                                             |
| View audit history                            |                All |     No | Recommended for changes to membership, stable settings, and destructive records.                              |

## Horses and horse records

| Functionality                                                         | Stable owner/admin | Member | Rule or scope                                                                              |
| --------------------------------------------------------------------- | -----------------: | -----: | ------------------------------------------------------------------------------------------ |
| View active horses in the stable                                      |                All |   View | Members can see all stable horses.                                                         |
| Add a horse                                                           |                All |    Own | A member-created horse is assigned to that member. Owner may assign a horse to any member. |
| Edit horse profile                                                    |                All |    Own | Includes identity, passport, insurance, contacts, and care information.                    |
| Reassign horse ownership                                              |                All |     No | Owner-only because it changes all horse-scoped permissions.                                |
| View health, medication, weight, nutrition, and care records          |                All |   View | Stable membership implies operational visibility in the MVP.                               |
| Add or update health, medication, weight, nutrition, and care records |                All |    Own | Member can manage records only for their horses.                                           |
| Soft-delete/archive a horse                                           |                All |    Own | Member may move their horse to deleted horses; record remains recoverable.                 |
| View or restore a deleted horse                                       |                All |    Own | Same ownership scope applies while deleted.                                                |
| Permanently delete a horse and related records                        |                All |     No | Owner-only destructive action after the retention period.                                  |

If health privacy requirements emerge later, introduce a separate visibility
policy rather than overloading the `member` role.

## Events and invitations

| Functionality                                   | Stable owner/admin |       Member | Rule or scope                                                                                             |
| ----------------------------------------------- | -----------------: | -----------: | --------------------------------------------------------------------------------------------------------- |
| View stable calendar and event list             |                All |         View | Includes events for all stable horses.                                                                    |
| View event details                              |                All |         View | Pending/declined participation status may be shown where relevant.                                        |
| Create an event                                 |                All | Own + Invite | A member must include at least one of their own horses. Other members' horses are invited, not confirmed. |
| Add own horse to an event                       |                All |          Own | The member's own horse is confirmed immediately.                                                          |
| Add another member's horse                      |                All |       Invite | Owner may confirm any stable horse directly; a member creates a pending invitation.                       |
| Accept or decline a horse invitation            |                All |          Own | A member responds only for their own horse. Owner can correct any participation state.                    |
| Withdraw a horse from an event                  |                All |          Own | Horse owner can remove their horse even when they did not create the event. Notify the organiser.         |
| Edit shared event details                       |                All |          Own | Member can edit events they created. Notify all participants of material changes.                         |
| Cancel or delete an event                       |                All |          Own | Member can cancel/delete events they created; participants can only withdraw their horses.                |
| Edit horse-specific service notes or cost share |                All |          Own | Event creator may manage rows for their event; horse owner may manage the row for their horse.            |
| Mark event completed                            |                All |          Own | Member can complete an event they created.                                                                |

### Shared-event flow

1. A member creates an event with at least one horse they own.
2. Their horses are immediately `confirmed`.
3. Each horse belonging to another member is added as `invited`.
4. The invited horse's owner accepts or declines.
5. Only confirmed horses appear as participating in schedules, reminders, and
   final cost totals.
6. The event organiser and invited horse owner are notified when invitation
   state or material event details change.

An invitation concerns a **horse**, not merely a person. If one member owns
three horses, they may accept one and decline the other two.

## Reminders, documents, providers, and reporting

| Functionality                                | Stable owner/admin | Member | Rule or scope                                                                                            |
| -------------------------------------------- | -----------------: | -----: | -------------------------------------------------------------------------------------------------------- |
| View stable-wide reminders                   |                All |   View | Members need visibility of stable operations.                                                            |
| Create/update/complete stable-wide reminders |                All |     No | Examples: yard closure, inspection, or shared maintenance.                                               |
| Manage horse reminders                       |                All |    Own | Member manages reminders for their own horses.                                                           |
| View stable and horse documents              |                All |   View | Documents are part of the core product and are not subscription-gated.                                   |
| Add documents                                |                All |    Own | Member may add documents for their horse or an event they created; stable-wide documents are owner-only. |
| Update/delete documents                      |                All |    Own | Member may change only documents they uploaded within their allowed scope.                               |
| View service-provider directory              |                All |   View | Vet, farrier, dentist, physio, saddler, and other shared contacts.                                       |
| Add/update/delete service providers          |                All |     No | Shared reference data is owner-managed.                                                                  |
| View stable analysis                         |                All |   View | Open during testing; this is the only planned Premium boundary when billing is enabled.                  |
| View horse analysis                          |                All |   View | Open during testing; write permissions remain ownership-scoped.                                          |
| Export all stable data                       |                All |     No | Bulk export can expose every member's records.                                                           |

## Cross-cutting rules

- Default to **deny** when no explicit rule matches.
- Every stable-scoped query and mutation must verify active membership.
- A member never gains write access merely because they can view a record.
- `horse.ownerId` is the source of truth for horse-scoped authority.
- `event.createdBy` is the source of truth for organiser authority.
- Record creator and horse owner are separate concepts; store both where needed.
- Stable access and operational permissions never depend on a subscription.
- During testing, the Analysis Centre is also open to everyone. When Premium
  enforcement is deliberately enabled, its entitlement check remains
  cumulative with the normal stable permission check.
- Hiding a button is a usability measure. The corresponding server mutation
  must perform the same permission check.
- Prefer named capabilities such as `canManageStable`,
  `canManageHorse(horse)`, and `canManageEvent(event)` over scattered role
  comparisons.
- Log membership changes, ownership changes, stable setting changes, and
  permanent deletion.

## Implementation status

The backend now enforces the core role and relationship rules:

- only the stable's `ownerId` receives owner authority;
- only `member` membership rows grant stable access;
- new stable invitations are member-only;
- stable-wide settings, members, providers, reminders, documents, horse
  reassignment, and permanent horse deletion are owner-managed;
- members manage their own horse records and the events they organise;
- a member-managed event must retain at least one horse owned by that member;
- other members' horses enter member-created events as invitations;
- a confirmed horse can be withdrawn by its owner or the stable owner;
- members may edit their own stable contact details; and
- member removal is blocked until their horses are reassigned or removed.

Legacy `guest` and membership-level `owner` values remain in stored validators
temporarily so an existing deployment can migrate without a failing schema
push. They grant no runtime access. Re-inviting a legacy guest as a member
promotes the existing membership row.

The role flows now include an owner-managed member and invitation page,
delivery-aware invitation links with resend/revoke/copy actions, public
invitation preview and auth return, a basic stable roster, member self-profile,
horse reassignment during member removal, and role-specific onboarding after
stable creation or invitation acceptance.

Onboarding now separates the global account profile from each user–stable
connection. A person completes their shared name, phone, image, and time-zone
profile once. Every stable they own or join then receives independent,
role-aware onboarding progress. Optional operational details, member details,
the first horse, and team invitations may be marked “Do this later” without
blocking completion; those tasks remain discoverable from the stable's
getting-started checklist.

Stable, horse, and event edit routes now consume their capability queries before
showing write controls. Horse owners can withdraw confirmed horses from the
event detail flow, and organisers receive email updates when an invited horse is
approved, declined, or withdrawn. Material event changes notify participating
horse owners. Stable removal archives the full graph behind a confirmed
owner-only settings action, and account deletion keeps a referentially safe
tombstone while archiving owned stables. Sensitive stable, membership,
invitation, and event changes are recorded in an owner-only activity log.

Explicit ownership transfer and a richer in-app notification centre remain
future product work. The 14-day horse retention cleanup is handled by the
scheduled purge job.
