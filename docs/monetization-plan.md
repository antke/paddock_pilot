# Monetization Plan

## Product context

Paddock Pilot is a horse and stable management platform: a shared workspace for horse owners to manage vet visits, nutrition, care events, reminders, documents, and the many recurring tasks involved in keeping horses healthy.

The long-term product can support both individual horse owners and stable/team workspaces. For launch, monetization should start with personal subscriptions only.

## Current testing decision

The first pilot stable is not charged and every owner and member can use all
available functionality. Core stable participation must never depend on a
Personal Plus entitlement.

If billing is introduced after testing, use two tiers:

- **Core:** every current operational feature except the Analysis Centre.
- **Premium:** Core plus the complete Analysis Centre.

`personal_plus` remains in stored subscription data as a compatibility name for
the future Core plan; `personal_pro` represents Premium. Only the Analysis
Centre may enforce the Premium entitlement.

## Previous recommended starting model

Start with a **personal subscription model**, while keeping the product architecture ready for future stable-level billing.

The initial paid customer is the individual user. Their subscription unlocks premium capabilities across their own account and horses, regardless of which stables they belong to.

## Why not stable/team billing at launch

Stable billing is likely useful later, but it introduces extra complexity too early:

- Seat management
- Admin-paid member access
- Multiple users belonging to multiple stables
- Questions around who pays when a member has horses in several stables
- More complex permissions and billing ownership

For launch, avoid charging per invited stable member and avoid team-seat logic.

## Proposed launch tiers

### Free

For casual users, early testers, and low-commitment adoption.

Possible limits:

- 1 horse
- Basic calendar/events
- Basic reminders
- Limited care history
- Limited document/file storage, if document uploads exist

### Personal Plus

For committed horse owners who need reliable care management.

Possible features:

- More horses, or unlimited horses within a fair-use limit
- Full event and care history
- Vet, farrier, dentist, nutrition, medication, and general care records
- Advanced reminders
- Document storage
- Exportable horse health summaries
- Sharing horses or stable access with other users
- Cross-stable personal dashboard

### Optional future Personal Pro

Only add this if usage shows a clear need for a higher tier.

Possible features:

- Advanced reporting
- Expense tracking
- Care task assignments
- AI-generated care summaries/checklists, if AI features are added
- Higher document/storage limits
- Power-user workflows for owners with many horses

## Future stable billing

The preferred future expansion is a **hybrid model**:

- Individuals pay for premium capabilities across their own account.
- Stable admins can optionally pay for premium stable workspace features.

Stable billing should be priced by horse count or stable size rather than per seat, to avoid member-billing complexity.

Potential stable plan features:

- Shared stable calendar
- Unlimited invited members within fair-use limits
- Role permissions
- Horse care assignments
- Stable-wide records
- Team activity/history
- Higher horse limits

## Product architecture principle

Even though launch billing is personal-only, keep these concepts separate:

- User account
- Horse
- Stable
- Stable membership
- User-owned subscription

This makes it possible to add stable-owned subscriptions later without rebuilding the core data model.

## Guiding rule

Charge individuals for managing their own horses. Add stable billing later for shared stable operations. Do not introduce seat-based billing until there is a proven need.
