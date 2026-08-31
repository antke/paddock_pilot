# Stable Invitations and Member Permissions Plan

> **Decision update (August 2026):** stable participation is no longer gated by
> a personal subscription. Invitations activate membership immediately after
> acceptance. The `accepted_pending_subscription` state and Personal Plus
> checks remain only for migration compatibility with existing data. During the
> testing phase every feature is available without billing. If monetization is
> enabled later, only the Analysis Centre is planned as a premium feature.

## Goal

Support stable invitations so an admin can invite stable members while keeping billing personal, permissions safe, and event participation explicit.

This plan is intentionally launch-focused. It keeps Clerk as the auth and billing provider, Convex as the app data source of truth, and avoids stable/team seat billing for now.

## Product decisions

- Stable admins can invite users to a stable.
- Invited users must have their own active personal subscription to fully use the product.
- Stable admins do not pay for member seats at launch.
- Members can view all horses in their stable.
- Members can create, edit, and delete only their own horses.
- Members can create events for their own horses.
- Members can invite other stable members' horses to events, but those horse owners must approve before the horses become confirmed participants.
- If several horses owned by the same user are invited to one event, send one email to that owner, not one email per horse.

## Services

### Clerk Auth

Use Clerk for sign-up, sign-in, and identity.

### Clerk Billing

Use Clerk Billing for personal subscriptions. Clerk Billing wraps Stripe payment processing, but Clerk plans/subscriptions are the billing source of truth for the app.

Important implementation note: Clerk Billing is currently beta, so Clerk SDK and Clerk JS versions should be pinned when this is implemented.

### Convex

Use Convex for:

- stable memberships
- stable invitations
- permission checks
- subscription entitlement snapshots from Clerk Billing webhooks
- event horse participation and approval state

### Resend

Use Resend for transactional emails:

- stable invitation emails
- event horse approval invitation emails

Start on the free plan and upgrade only if volume requires it.

## Billing and entitlement model

Billing remains user-owned, not stable-owned.

Add a Convex subscription snapshot table, updated from Clerk Billing webhooks:

```ts
userSubscriptions {
  userId
  clerkSubscriptionId?
  plan: 'free' | 'personal_plus' | 'personal_pro'
  status: 'active' | 'past_due' | 'canceled' | 'incomplete'
  currentPeriodEnd?
  createdAt
  updatedAt
}
```

Initial entitlement rule:

- `personal_plus` unlocks full stable member usage.
- Free users can sign up and reach the invite/paywall flow, but cannot fully activate stable membership features.

Backend mutations must enforce entitlements. Frontend paywalls are helpful but not sufficient.

## Stable invitation flow

1. Admin enters an email and role in stable settings.
2. Convex verifies the admin can manage stable members.
3. Convex creates a pending invitation.
4. Convex schedules a Resend email action.
5. Invitee clicks the invite link.
6. If not signed in, invitee signs up or signs in with Clerk.
7. Convex validates:
   - token is valid
   - invitation is pending
   - invitation is not expired
   - signed-in user email matches invited email
8. If the user has an active `personal_plus` entitlement:
   - create the stable membership
   - mark invitation accepted
   - redirect to the stable
9. If the user does not have an active `personal_plus` entitlement:
   - mark invitation `accepted_pending_subscription`
   - send user to Clerk Billing checkout or upgrade UI
   - activate the membership after Clerk Billing webhook confirms the paid plan

Invitation statuses:

```ts
'pending'
'accepted_pending_subscription'
'accepted'
'revoked'
'expired'
```

## Stable roles

Use these roles in app-owned Convex data:

```ts
'owner'
'member'
'guest'
```

For launch:

- `owner`: full stable access and management.
- `member`: view stable, view all stable horses, manage own horses, create events, invite other horses to events.
- `guest`: read-only if needed later.

Keep `stables.ownerId` as the canonical stable owner. Do not allow invitations or member management APIs to create arbitrary `owner` memberships.

## Horse permissions

Owners/admins can:

- view all horses in the stable
- create horses
- edit any stable horse
- delete any stable horse

Members can:

- view all horses in the stable
- create their own horses
- edit their own horses
- delete their own horses

Members cannot:

- edit another member's horse
- delete another member's horse
- change horse ownership through update payloads

## Event permissions

### Admin-created events

Admins can:

- create events
- add any stable horse directly
- remove any horse from the event
- edit/manage the event

Admin-added horses do not require approval.

### Member-created events

Members can:

- create events
- add their own horses directly
- invite other members/admins to add their horses
- remove their own horses from the event

Members cannot:

- directly add another person's horse
- approve an invitation for another person's horse
- remove another owner's approved horse from the event

## Event horse participation model

The current `events.horseIds` array is too limited for approvals. Move participation rules into `eventsHorses` as the canonical source of truth.

Expand `eventsHorses` with fields like:

```ts
eventsHorses {
  eventId
  horseId
  status: 'confirmed' | 'invited' | 'declined'
  invitedBy?
  approvedBy?
  invitedAt?
  approvedAt?
  declinedAt?
  createdAt
  updatedAt
}
```

Rules:

- Admin adds horse: `confirmed`.
- Member adds own horse: `confirmed`.
- Member invites another owner's horse: `invited`.
- Horse owner approves: `confirmed`.
- Horse owner declines: `declined`.

The UI should show confirmed participants separately from pending invitations.

For transition, `events.horseIds` can temporarily be kept in sync with confirmed horses only. Long term, derive event horses from `eventsHorses` and remove reliance on `events.horseIds`.

## Event invitation emails

When inviting horses to an event:

1. Validate that all invited horses belong to the stable.
2. Split horses into:
   - current user's horses, which become confirmed immediately
   - other owners' horses, which become invited
3. Group invited horses by `ownerId`.
4. Create invitation rows/participation rows.
5. Send one email per owner, listing all invited horses for that owner.

Example: if three horses owned by the same member are invited to one event, that member receives one email containing all three horses.

## Backend implementation checklist

### Schema

- Add `users.by_email` index.
- Add `stableMembers.by_stable_id_user_id` compound index.
- Add `stableInvitations` table.
- Add `userSubscriptions` table for Clerk Billing entitlement snapshots.
- Expand `eventsHorses` for participation status and approval fields.

### Permission helpers

Create `convex/libs/stablePermissions.ts` for canonical checks:

- current user lookup
- stable role lookup
- stable view access
- stable management access
- member management access
- horse management access
- event management access
- event horse add/remove/approve access

Create `convex/libs/entitlements.ts` for subscription checks:

- current plan lookup
- `personal_plus` check
- stable member feature access check
- horse limit checks if free limits are enforced

### Clerk Billing integration

- Add Clerk Billing webhook handling.
- Update `userSubscriptions` from Clerk Billing subscription/subscription item events.
- Treat Clerk Billing, not Stripe Billing, as the source of truth.
- Check the active paid plan/item, not only the top-level subscription status, because free/default plans may also be active.

### Stable invitations

- Create invitation.
- Revoke invitation.
- List stable invitations.
- Accept invitation.
- Activate pending accepted invitation after subscription becomes active.
- Send stable invitation email through Resend action.

### Horses

- Require stable view access for list/get.
- Require stable membership and entitlement where appropriate for member usage.
- Allow members to mutate only own horses.
- Allow owners/admins to mutate all stable horses.
- Prevent update payloads from changing `ownerId` or `stableId`.

### Events

- Replace owner-only event access with role-aware stable access.
- Use `eventsHorses` participation state for confirmed/invited/declined horses.
- Allow admins to add/remove any horse.
- Allow members to add/remove own horses.
- Allow members to invite, but not directly add, other owners' horses.
- Allow invited horse owners to approve/decline.
- Batch event invite emails by owner.

## Frontend implementation checklist

- Add stable invite form in stable settings.
- Add pending invitation list and revoke action.
- Add invitation accept route.
- Add unpaid accepted invite/paywall state that links into Clerk Billing checkout/upgrade UI.
- Show member horse permissions clearly in horse create/edit flows.
- Update event create/edit UI to separate:
  - confirmed horses
  - pending invited horses
  - declined horses if useful
- Add approval/decline UI for invited horse owners.

Prefer feature-local files instead of growing large route/component files:

- invitation form component
- invitation list component
- event horse participation component
- feature-local schemas/constants
- focused hooks/composables for mutation/query state where needed

## Verification checklist

- Admin can invite a new user.
- Invited unpaid user can sign up but is routed to subscription/paywall before stable membership activates.
- Invited paid user can accept and access the stable.
- Member can view all stable horses.
- Member cannot edit/delete another user's horse.
- Member can create/edit/delete own horse.
- Admin can manage all horses.
- Admin can add/remove any horse from an event.
- Member can add own horse to own event.
- Member inviting multiple horses owned by the same person sends one email.
- Invited owner can approve/decline event horse invite.
- Member cannot remove another owner's approved horse from an event.
- Backend mutations reject unauthorized actions even if called directly.
