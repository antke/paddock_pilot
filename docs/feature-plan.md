# Feature Plan

## Product goal

Paddock Pilot should help regular horse owners and stable admins replace scattered text messages, notebooks, whiteboards, and memory-based care tracking with one shared place for horse records, care planning, stable events, and upcoming service coordination.

The target user is not a large professional sport stable with dedicated staff. The target user is a horse owner who needs to remember and coordinate vet visits, farrier or hoof trimming, deworming, feeding needs, injuries, shared stable appointments, and the details that service providers ask for.

## Current system baseline

The project already has:

- User accounts and personal subscriptions.
- Stables and stable memberships.
- Stable invitations.
- Horses with basic profile data.
- Events with recurrence and multi-horse participation.
- Horse event invitations and approval flow.
- A signed-in dashboard and a basic public landing page.

Current main schema areas:

- `users`
- `stables`
- `stableMembers`
- `stableInvitations`
- `userSubscriptions`
- `horses`
- `events`
- `eventsHorses`

## Feature priorities

1. Expand horse profiles with nutrition and health information.
2. Add structured health issues so individual issues can be added, resolved, or removed.
3. Add missing practical details to horses, stables, members, and events.
4. Improve the landing page for demo use.
5. Plan care coordination, reminders, and analytics for later premium tiers.

## Phase 1: Horse profile care data

### Nutrition requirements

#### Goal

Each horse should have a clear nutrition profile that can be used by the owner, stable admin, or anyone feeding the horse.

The profile should answer:

- What should this horse eat?
- What should this horse avoid?
- What is the current meal routine?
- Are there supplements, minerals, or special requirements?
- Are there food intolerances or health-related feeding warnings?

#### MVP schema

Add lightweight profile-level fields to `horses`:

```ts
nutritionNotes?: string
nutritionRecommended?: string[]
nutritionAvoid?: string[]
feedingRoutine?: string
```

These should live directly on the horse initially because they are reference information rather than time-series records.

#### UI

Horse create/edit form:

- Add a dedicated nutrition section or tab.
- Include a textarea for freeform feeding routine and nutrition notes.
- Include a green recommended/required list.
- Include a red avoid/cannot-eat list.

Horse detail page:

- Add a separate nutrition card.
- Show feeding routine, notes, recommended items, and avoid items.
- Use a simple green check and red X comparison-style layout.

#### Future analytics extension

Nutrition profile fields are not enough for analysis by themselves. For the data analysis centre, add nutrition change logs later so the app can compare health or weight changes against feeding changes over time.

Possible later records:

```ts
horseNutritionLogs {
  horseId
  stableId
  changedAt
  summary
  recommendedSnapshot?
  avoidSnapshot?
  feedingRoutineSnapshot?
  createdBy
  createdAt
}
```

### Health issues

#### Goal

Every horse should be assumed to have care-relevant health context, even if it is minor. Previous injuries, hoof issues, food intolerances, strained muscles, dental problems, and small recurring problems should be visible in the horse profile.

The information must be itemized so a single issue can later be resolved or removed without editing one long text field.

Example suggestions for users:

- Chipped hoof
- Strained muscle
- Food intolerance
- Previous tendon injury
- Sensitive back
- Laminitis risk
- Dental issue
- Medication sensitivity

#### MVP schema

Add a separate `horseHealthIssues` table:

```ts
horseHealthIssues {
  horseId
  stableId
  title
  description?
  status: 'active' | 'resolved'
  severity?: 'low' | 'medium' | 'high'
  notedAt
  resolvedAt?
  createdBy
  createdAt
  updatedAt
}
```

Indexes:

```ts
by_horse_id
by_stable_id
by_horse_id_status
```

#### Backend API

Create a feature-specific Convex module, for example:

- `convex/horseHealthIssues.ts`

Functions:

- `listForHorse({ horseId })`
- `add({ horseId, title, description?, severity? })`
- `update({ id, title?, description?, status?, severity? })`
- `resolve({ id })`
- `remove({ id })`

Permissions:

- Users who can view the stable can view a horse's health issues.
- Stable owners and horse owners can add, update, resolve, or remove issues.
- Reuse the existing stable and horse permission model.

#### UI

Horse detail page:

- Add a health issues card.
- Show active issues first.
- Allow adding a new issue.
- Allow resolving or removing an issue.
- Include example placeholder text so users know what belongs there.

Keep the horse detail component mostly compositional. Health issue state, mutations, and rendering should live in feature-local components.

## Phase 2: Fill in missing practical details

The app should collect optional details that are often needed by vets, farriers, stable admins, and other horse care providers. These fields should remain optional unless they are critical for the current workflow.

### Horse details

Add the most practically useful horse fields first:

```ts
sex?: 'mare' | 'gelding' | 'stallion'
color?: string
dateOfBirth?: string
passportNumber?: string
emergencyNotes?: string
vetName?: string
vetPhone?: string
farrierName?: string
farrierPhone?: string
```

`passportNumber` is important because vets, farriers, and other providers may use it to identify the horse or complete care-related paperwork. It should be included in the first horse detail expansion.

Possible later fields:

```ts
height?: string
microchipNumber?: string
insuranceProvider?: string
insurancePolicyNumber?: string
```

### Stable details

Add stable-level operational contact information:

```ts
contactName?: string
contactPhone?: string
emergencyPhone?: string
yardRules?: string
openingHours?: string
```

Do not add stable-level feeding instructions. Feeding requirements should stay horse-specific because different horses often have different diets, restrictions, and routines.

### Member details

Add optional stable member details:

```ts
displayNameOverride?: string
phone?: string
emergencyContact?: string
```

These are useful when stable admins or other owners need to contact a person quickly or identify a member by the name they use around the yard.

### Event details

Add provider and completion information first:

```ts
providerName?: string
providerPhone?: string
status?: 'planned' | 'completed' | 'cancelled'
notesAfterCompletion?: string
```

Possible later cost fields:

```ts
totalCost?: number
costPerHorse?: number
```

Cost tracking can be useful, especially for shared vet or farrier visits where travel cost is a major part of the bill, but it may be too advanced for the first event detail pass.

## Phase 3: Landing page demo update

### Goal

Replace the current minimal card-based landing page with a demo-ready public page that explains the product clearly and encourages sign-up.

### Structure

1. Hero section
   - Short headline about managing horse care without notebooks, whiteboards, and text-message chaos.
   - Minimal explanatory copy.
   - Primary sign-up CTA and secondary sign-in CTA.
   - Attractive visual, preferably a CSS/mock app preview if no real image asset is available.

2. Descriptive feature section
   - Avoid simple cards as the main structure.
   - Use explanatory text and mock product screenshots/panels.
   - Mention horse profiles, nutrition and health notes, shared stable schedules, and service coordination.

3. Final CTA section
   - Prompt the user to create an account.
   - Keep the copy short and demo-friendly.

### Likely files

- `src/components/landing/PublicLandingPage.tsx`
- Optional feature-local supporting components/content files under `src/components/landing/`

## Phase 4: Care coordination and reminders

### Goal

Help owners and stable admins coordinate recurring care and shared appointments.

High-value reminder categories:

- Hoof trimming or farrier
- Vet visit
- Vaccination
- Deworming
- Dentist
- Saddle fitting
- Physiotherapy or massage
- Weight check

### Shared service visit planning

Stable admins and members often coordinate one provider visit for several horses because travel cost is shared or expensive. The existing event and event-horse invitation model is a good foundation for this.

Future enhancements:

- Per-horse requested service notes.
- Per-horse participation status.
- Provider details.
- Travel cost notes.
- Optional cost split tracking.
- Completion notes per horse.

### Stable dashboard alerts

Add dashboard summaries later for:

- Horses with active health issues.
- Upcoming vet/farrier/deworming events.
- Overdue recurring care.
- Pending event invitations.
- Horses missing important profile details.

## Phase 5: Data analysis centre

### Product position

The data analysis centre is a strong premium feature candidate. It is most valuable for owners who want a detailed view of what is happening with their horse and are willing to log care data consistently.

This should be planned now but implemented after the app has enough structured records.

### Data points to collect first

- Health issues
- Vet visits
- Farrier or hoof trimming
- Deworming
- Dentist visits
- Nutrition changes
- Food intolerances
- Medication records
- Weight records
- Health check-ins
- Event completion notes

### Future records

```ts
horseWeightRecords {
  horseId
  stableId
  weight
  measuredAt
  notes?
  createdBy
  createdAt
}

horseHealthCheckIns {
  horseId
  stableId
  checkedAt
  overallStatus: 'ok' | 'watch' | 'concern'
  weightCondition?: 'underweight' | 'normal' | 'overweight'
  notes?
  createdBy
  createdAt
}

horseCareLogs {
  horseId
  stableId
  type
  occurredAt
  summary
  notes?
  createdBy
  createdAt
}
```

### Possible insights

- Weight trend over time.
- Health issue frequency.
- Care cadence by horse.
- Overdue service warnings.
- Timeline of what changed before a health issue.
- Possible correlations, such as weight loss after deworming or symptoms after a nutrition change.

### UI direction

Possible routes:

```txt
/stables/$stableId/analysis
/stables/$stableId/horses/$horseId/analysis
```

MVP analysis views:

- Horse timeline.
- Weight chart.
- Health issue history.
- Care frequency summary.
- Recent changes before a selected health event.

## Phase 6: Additional feature candidates

### Care history export

Generate a horse summary for a vet, farrier, dentist, new stable, buyer, loaner, or emergency contact.

Potentially premium.

### Documents

Store and link important files:

- Passport images or scans.
- Vaccination proof.
- Insurance documents.
- Vet reports.
- Farrier notes.
- Dental records.

Potentially premium depending on storage limits.

### Medication records

Track medications separately from general health notes:

- Medication name.
- Dosage.
- Start date.
- End date.
- Prescribed by.
- Notes.

This can feed into the analysis centre later.

### Care tasks

Assign small tasks to owners or stable members:

- Check leg swelling.
- Give supplement.
- Confirm farrier availability.
- Upload vet result.
- Check weight.

This is more useful after stable membership and notifications are mature.

## Approved next product roadmap

The next product direction should make Paddock Pilot feel less like static record storage and more like a horse care assistant. The highest-value improvements should help owners and stable admins answer practical questions quickly:

- What needs attention today?
- What changed recently for this horse?
- What should I tell the vet, farrier, dentist, or yard owner?
- Which horses are missing important care details?
- Are regular care routines happening on time?

The roadmap below is approved as the next product direction. Do not include `what3words`, `accessInstructions`, or `parkingInstructions` in the stable details expansion.

### Roadmap slice 1: Dashboard alerts and care visibility

#### Stable dashboard alerts

Turn the stable dashboard into a lightweight command centre. Add alert sections for:

- Horses with active high-severity health issues.
- Upcoming vet, farrier, dentist, deworming, vaccination, saddle fitting, physiotherapy, massage, and weight check events.
- Overdue recurring care once overdue logic exists.
- Horses missing important profile details.
- Events missing provider details.
- Completed events missing completion notes.
- Pending stable invitations or horse event invitations.

Some alerts can be available on the basic product, while deeper prioritisation and cross-stable summaries can become premium.

#### Horse care timeline foundation

Add a per-horse timeline that combines structured care records into one chronological view. The timeline should eventually include:

- Events.
- Health issues and resolved issues.
- Weight records.
- Medication records.
- Nutrition changes.
- General care logs.
- Completed appointment notes.

The timeline route can be:

```txt
/stables/$stableId/horses/$horseId/timeline
```

A generic timeline helper should not be created prematurely. Keep timeline aggregation feature-local until repeated use proves a shared abstraction is needed.

#### Weight and body condition records

Add structured weight tracking because it is useful on its own and gives the analysis centre meaningful historical data.

Potential schema:

```ts
horseWeightRecords {
  horseId
  stableId
  weight
  unit: 'kg' | 'lb'
  measuredAt
  bodyConditionScore?
  notes?
  createdBy
  createdAt
}
```

Useful UI:

- Horse detail summary of latest weight.
- Horse timeline entries.
- Add weight record form.
- Simple trend display in the analysis centre.

### Roadmap slice 2: Medication and nutrition history

#### Medication records

Track medications separately from general health notes so active medication is easy to see and historical courses remain available.

Potential schema:

```ts
horseMedicationRecords {
  horseId
  stableId
  medicationName
  dosage
  frequency?
  startDate
  endDate?
  prescribedBy?
  reason?
  notes?
  status: 'active' | 'completed'
  createdBy
  createdAt
  updatedAt
}
```

Active medication should be shown prominently on the horse detail page. Completed medication should appear in the horse timeline and analysis centre.

#### Nutrition change logs

The current horse nutrition fields are reference data. Add nutrition change logs so the app can analyse what changed before health or weight changes.

Potential schema:

```ts
horseNutritionLogs {
  horseId
  stableId
  changedAt
  summary
  feedingRoutineSnapshot?
  recommendedSnapshot?
  avoidSnapshot?
  notes?
  createdBy
  createdAt
}
```

Start with manual logs. Later, consider automatically creating a nutrition log when profile-level nutrition fields change.

### Roadmap slice 3: Shared service visit improvements

Existing events and event-horse participation are a strong foundation for shared stable appointments. Improve `eventsHorses` so one provider visit can capture per-horse needs and outcomes.

Potential additional fields:

```ts
eventsHorses {
  requestedServiceNotes?
  completionNotes?
  costShare?
}
```

User value:

- Stable members can say what their horse needs before the visit.
- Owners can see which horses are confirmed.
- Completed service notes can be recorded per horse.
- Shared costs can be tracked later if expense tracking is added.

### Roadmap slice 4: Care export and provider directory

#### Care export / vet summary

Generate a clean shareable or printable horse summary for vets, farriers, dentists, new stables, buyers, loaners, or emergency contacts.

The first version can be a print-friendly HTML page rather than a generated PDF.

Include:

- Horse profile and identification.
- Emergency notes.
- Vet and farrier contacts.
- Nutrition profile.
- Active health issues.
- Active medications.
- Recent events and completion notes.
- Recent weight records.
- Passport, microchip, and insurance details when present.

This is a strong premium candidate.

#### Provider/contact directory

Add a stable-level provider directory so users do not need to retype provider information on every event.

Potential schema:

```ts
stableProviders {
  stableId
  type: 'vet' | 'farrier' | 'dentist' | 'physio' | 'saddler' | 'other'
  name
  phone?
  email?
  notes?
  createdBy
  createdAt
  updatedAt
}
```

Event forms can later offer provider selection while still allowing one-off provider text.

### Roadmap slice 5: Additional profile details

Add extra optional horse details with conservative UI so forms do not become overwhelming.

Potential horse fields:

```ts
height?: string
microchipNumber?: string
insuranceProvider?: string
insurancePolicyNumber?: string
sire?: string
dam?: string
discipline?: string
shoeingStatus?: 'barefoot' | 'front_shoes' | 'full_set'
dewormingNotes?: string
allergies?: string[]
```

Potential stable address fields:

```ts
addressLine1?: string
addressLine2?: string
postcode?: string
country?: string
```

Do not add:

```ts
what3words
accessInstructions
parkingInstructions
```

### Roadmap slice 6: Richer Premium analysis

Use the structured data above to make the premium analysis centre more valuable.

Future insights:

- Horse weight trend over time.
- Body condition changes.
- Health issue frequency by horse.
- Care cadence by horse and by service type.
- Overdue service warnings.
- Recent changes before a selected health issue.
- Nutrition changes near weight or health changes.
- Medication history and active medication summaries.
- Completion-note coverage for care events.

Potential premium split:

- Core users: the complete stable coordination product, including profiles,
  care records, documents, printable care summaries, schedules, reminders,
  invitations, and shared stable participation.
- Premium users: the Analysis Centre and its future analytical views.
- During testing, premium enforcement remains disabled so the pilot stable can
  exercise every feature without a subscription.

## Implementation order

1. Implement nutrition fields on horse profiles.
2. Implement health issues table, API, and horse detail UI.
3. Add selected phase 2 detail fields.
4. Refresh the public landing page.
5. Add reminder and shared-service enhancements.
6. Add structured logs needed by the analysis centre.
7. Build premium analytics once enough source data exists.

Next recommended implementation order after the completed first pass:

1. Add stable dashboard alerts.
2. Add the horse care timeline foundation.
3. Add weight and body condition records.
4. Add medication records.
5. Add nutrition change logs.
6. Improve shared service visits with per-horse notes and outcomes.
7. Add care export / vet summary.
8. Add provider/contact directory.
9. Add extra horse and stable profile details.
10. Expand the Premium analysis centre using the new structured data.

## File and architecture notes

### Backend

Likely files for the first implementation pass:

- `convex/schema.ts`
- `convex/horses.ts`
- `convex/horseHealthIssues.ts`
- `shared/horses/horseSchema.ts`
- `shared/horses/healthIssueSchema.ts`

### Frontend

Likely files for the first implementation pass:

- `src/components/forms/horse/HorseFormFields.tsx`
- `src/components/forms/horse/horseFormSchema.ts`
- `src/routes/stables/_layout/$stableId/horses/create.tsx`
- `src/routes/stables/_layout/$stableId/horses/$horseId/edit.tsx`
- `src/routes/stables/_layout/$stableId/horses/$horseId.tsx`
- `src/components/horses/HorseDetail.tsx`

Add feature-local components instead of growing large mixed files:

- `src/components/horses/HorseNutritionCard.tsx`
- `src/components/horses/HorseHealthIssuesCard.tsx`
- `src/components/horses/HealthIssueForm.tsx`

### Permissions

Use existing stable and horse permission rules:

- Stable viewers can view horse care information.
- Stable owners can manage horses and health records.
- Horse owners can manage their own horses and health records.
- Guests should remain read-only unless a later feature explicitly changes that.

### Monetization

Good premium candidates:

- Data analysis centre.
- Care history export.
- Advanced reminders.
- Document storage beyond small limits.
- Medication and advanced care logs.
- Cross-stable owner dashboard.

Keep basic horse profile, nutrition notes, and active health issues available enough for the app to be useful during launch/testing.

## Verification checklist

For the first implementation pass:

- Horse create and edit forms accept nutrition fields.
- Horse detail shows nutrition information.
- Empty optional nutrition fields do not clutter the UI.
- Health issues can be added for a horse.
- Health issues can be resolved or removed individually.
- Health issue permissions match horse management permissions.
- Horse list and horse card behavior remain unchanged unless explicitly updated.
- Existing event and invitation flows still work.
- Type checking, linting, and relevant tests pass.

## Open questions

- Should health issues be deletable permanently, or should the main action be resolving with deletion reserved for mistakes?
- Should nutrition recommended/avoid items be simple string lists, or should each item later have notes and severity?
- Should passport number be shown prominently on the horse detail page or only inside an expanded details section?
- Should cost tracking be included in event details now, or postponed until expense tracking is planned properly?
- Which analytical views belong in the initial Premium launch versus a later
  Premium expansion?
