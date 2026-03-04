# Paddock Pilot - Horse Stable Management SaaS

## Overview

A SaaS stable manager for horse owners to track horses, events, and stable operations.

## Core Features

- Create and manage stables
- Add horses to stables
- Track events (medical, training, maintenance, competitions)
- Calendar and list views for events
- Multi-user support with role-based access

## Tech Stack

- **Frontend**: TanStack Start + React + Tailwind CSS + Shadcn UI
- **Backend**: Convex (serverless database + functions)
- **Auth**: Clerk
- **Analytics**: PostHog

## Data Model

### Tables

#### `stables`

- `name`: string
- `description`: string (optional)
- `location`: string (optional)
- `ownerId`: string (Clerk user ID)

#### `stableMembers`

- `stables`: Array(Id<"stables">)
- `userId`: string (Clerk user ID)
- `role`: "owner" | "member"

#### `horses`

- `stableId`: Id<"stables">
- `ownerId`: string (Clerk user ID - the horse owner)
- `name`: string
- `age`: number
- `breed`: string (optional)
- `createdAt`: number

#### `events`

- `horseId`: Id<"horses">
- `type`: "medical" | "training" | "maintenance" | "competition"
- `tags`: string[] (e.g., ["dental", "vaccination"])
- `title`: string
- `description`: string (optional)
- `date`: number (timestamp)
- `time`: string (optional, e.g., "14:30")
- `status`: "scheduled" | "completed" | "cancelled"
- `recurrence`: optional object
  - `pattern`: "daily" | "weekly" | "monthly" | "yearly"
  - `interval`: number (every X days/weeks/months)
  - `endDate`: number (optional)
  - `daysOfWeek`: number[] (optional, for weekly: [0,1,2,3,4,5,6])
- `createdAt`: number

## User Roles & Permissions

### Stable Owner (Admin)

- Full access to stable settings
- Can add/remove members
- Can see all horses in stable
- Can manage all events

### Horse Owner (Member)

- Can only see their own horses
- Can add/edit their horses
- Can create events for their horses
- Can see other horses in stable (read-only)

## Example Scenario

```
Stable: "Sunset Ranch"
Owner: Alice (admin)

Members:
- Bob (owns 2 horses: Thunder, Lightning)
- Carol (owns 1 horse: Spirit)
- Dave (owns 3 horses: Shadow, Storm, Blaze)

Alice can see/manage everything
Bob can only edit Thunder & Lightning
Carol can only edit Spirit
Dave can only edit Shadow, Storm, Blaze
```

## Event Types & Tags

### Event Types

- **Medical**: Vet visits, vaccinations, treatments
- **Training**: Riding lessons, groundwork, exercise
- **Maintenance**: Grooming, shoeing, dental care
- **Competition**: Shows, races, events

### Predefined Tags per Type

- **Medical**: vaccination, dental, checkup, injury, medication
- **Training**: riding, groundwork, lunging, jumping
- **Maintenance**: grooming, shoeing, feeding
- **Competition**: show, race, event

### Custom Tags

Users can add their own tags beyond the predefined ones.

## Implementation Phases

### Phase 1: Core Schema & Auth (Week 1)

- [] Update Convex schema with new tables
- [ ] Set up role-based access control
- [ ] Create stable membership system
- [ ] Basic CRUD operations

### Phase 2: Stable Management (Week 1-2)

- [ ] Create stable (auto-assign owner role)
- [ ] Invite members to stable
- [ ] Member management UI
- [ ] Stable settings

### Phase 3: Horse Management (Week 2)

- [ ] Add horse (assign to current user as owner)
- [ ] Horse owner can edit their horses
- [ ] View all horses in stable (with owner info)
- [ ] Horse detail page

### Phase 4: Events with Tags & Recurrence (Week 2-3)

- [ ] Event form with:
  - [ ] Type selection
  - [ ] Tag input (multi-select or free text)
  - [ ] Recurrence pattern (daily/weekly/monthly/yearly)
  - [ ] End date for recurrence
- [ ] Generate recurring event instances
- [ ] Color-code by tags in calendar
- [ ] Tag filter in list view

### Phase 5: Calendar & Dashboard (Week 3)

- [ ] Calendar view with tag badges
- [ ] List view with tag filters
- [ ] Dashboard showing:
  - [ ] Your horses
  - [ ] Your upcoming events
  - [ ] Stable overview (for owners)

## File Structure

```
src/
  routes/
    stables/
      index.tsx              # List user's stables
      $stableId.tsx          # Stable detail page
      $stableId.settings.tsx # Members & permissions
      new.tsx                # Create stable
    horses/
      $horseId.tsx           # Horse detail page
      new.tsx                # Add horse (with stableId param)
    events/
      calendar.tsx           # Calendar view
      list.tsx               # List view
      new.tsx                # Create event (with horseId param)
  components/
    stable/
      StableMemberList.tsx
      InviteMemberForm.tsx
    horse/
      HorseCard.tsx
      HorseForm.tsx
    events/
      EventCard.tsx
      EventForm.tsx
      RecurrencePicker.tsx
      TagInput.tsx
      Calendar.tsx
      EventList.tsx
  convex/
    stables.ts
    stableMembers.ts
    horses.ts
    events.ts
```

## Recurrence Implementation Strategy

- Store recurrence pattern on parent event
- Generate instances up to X months ahead
- Allow editing single instance or all future instances
- Handle exceptions (modified/cancelled instances)

## Future Features (Post-MVP)

- [ ] Email/push notifications for upcoming events
- [ ] File attachments (vet reports, photos)
- [ ] Event reminders
- [ ] Photo galleries for horses
- [ ] Health records tracking
- [ ] Financial tracking (expenses, boarding fees)
- [ ] Export/import data
- [ ] Mobile app

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start Convex backend
pnpm dlx convex dev

# Run tests
pnpm test

# Lint & format
pnpm check
```

## Environment Variables

Required in `.env.local`:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `VITE_POSTHOG_KEY` (optional)

## Notes

- This is a learning project for TanStack Start
- Focus on clean architecture and best practices
- Implement features incrementally
- Test each phase before moving to the next
