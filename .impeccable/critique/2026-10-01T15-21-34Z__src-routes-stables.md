---
target: "Project UX: hidden essentials, friction, strengths and bloat"
total_score: 23
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 4
timestamp: 2026-10-01T15-21-34Z
slug: src-routes-stables
---
Method: dual-agent (A: /root/ux_review · B: /root/evidence_review), with parent verification in the authenticated app.

Paddock Pilot has a strong foundation. The main gap is between storing useful information and helping members act on it. Most improvements should expose and connect existing capabilities before adding new feature areas. The visual identity is coherent and appropriate to a small stable; a visual restart is unnecessary.

Evidence: independent source reviews; actual shared-component fixtures; parent inspection of signed-in Home, Settings/Providers and Care; desktop and 390×844 phone dashboard. Member-route restrictions and notification/draft behavior are source-derived, not exercised under a member account. This is an expert review, not measured user research. No application code or stable data changed.

## Priority findings

### 1. P1 — Everyday contacts are trapped in owner administration

The live path is stable-name dropdown → Stable settings → Providers. Settings also contains operational phone numbers, opening hours and yard rules. This is the wrong durable home for information a member needs while working.

There is a functional access mismatch: the provider API supports member read access and separate edit permissions, but the settings route first loads owner-only member-management data. A member cannot use the directory page through that route. Contacts are not simply hard to discover.

Create a visible Stable destination with Contacts, People and Yard information. Keep owner administration separate and retain existing edit permissions. Offer direct Call/Email actions: directory numbers and addresses currently render as plain text while Edit/Remove are prominent. Add a small emergency-contact shortcut on Home.

Evidence: src/integrations/clerk/header-user.tsx:195; src/components/stables/StableSettingsPage.tsx:22; src/routes/stables/_layout/$stableId/settings.tsx:30; convex/stableMembers.ts:138; convex/stableProviders.ts:54; src/components/stables/StableProviderCard.tsx:35.

### 2. P1 — Dashboard hierarchy can falsely reassure and bury urgent work

The authenticated demo showed “A quieter day at the stable” and “enjoy a slower day” beside seven high-severity issues and overdue care. The empty message checks scheduled events, not outstanding work. On a 390×844 phone viewport, Health issues began around 1,637px from the top and Care reminders around 2,011px, after Today, an empty Training card, the week view and horse roster. These measurements describe this demo data, not every yard.

Place a compact Needs attention section early on every screen size, followed by Today and Upcoming. Change the empty calendar message to “No events scheduled today”; only offer an all-clear when relevant care state supports it. Keep the calm styling and capped previews.

Evidence: src/components/dashboard/command-center/TodayBriefingCard.tsx:52; src/components/dashboard/command-center/BarnBoardGrid.tsx:23; src/components/dashboard/DashboardLayoutGrid.tsx:34. Live desktop and phone observation.

### 3. P1 — Care supports closing items better than managing changing plans

The live Care page initially mixed completed/dismissed history with pending reminders, with six closed entries before the first overdue task. Pending rows offer Complete, Dismiss and Remove; closed rows offer Remove. No edit, reschedule, reopen or undo is exposed even though an update mutation already exists. Clicking an individual dashboard reminder also opens the general list, losing the selected item’s context.

Default to outstanding work, retain an explicit History/All view, and deep-link to the selected reminder. Add edit/reschedule and undo/reopen. These are small extensions of existing functionality, not a new task system. Next-due scheduling is also absent from reminder completion; offer an optional next date or repeat-after-completion for recurring care. Recurring events already exist and should not be duplicated.

Evidence: src/components/reminders/StableRemindersPage.tsx:56; src/components/reminders/CareRemindersCard.tsx:316; convex/careReminders.ts:490 and :550; src/components/dashboard/command-center/PriorityQueueCard.tsx:180; convex/schema.ts:829. Live Care observation confirmed visible actions and default mixed history.

### 4. P1 — Shared visibility does not yet provide shared responsibility

Reminders store the creator and completion time, but no responsible person or completion actor. Permissions primarily follow stable ownership, horse ownership or event creation. A helper cannot be delegated an ordinary shared task through the current model. A coordinator still needs an external conversation to answer “Who is doing this?” or “Who confirmed it?”

Add a lightweight responsible-person/claim mechanism and completed-by/time, optionally with a note. Separate permission to perform an agreed care task from permission to edit clinical or ownership records. The desired delegation policy needs a product decision; this is not a recommendation to relax all member permissions.

Evidence: convex/schema.ts:829; convex/careReminders.ts:550; shared/stables/stableAccess.ts:62.

### 5. P2 — Saved contacts do not form a reusable source of current information

Horse vet/farrier fields are free text. Selecting an event provider copies name and phone into event fields. Updating the directory does not update those other copies. The repetition creates avoidable entry work and uncertainty over which number is current.

Allow horse contacts to select saved providers while preserving one-off contacts. Distinguish current contact references from historical event snapshots; do not overwrite historical records indiscriminately. Combine this with directory Call/Email actions, not a larger CRM.

Evidence: src/components/forms/horse/HorseFormFields.tsx:475; src/components/forms/event/EventFormFields.tsx:617; convex/stableProviders.ts:117.

### 6. P2 — Setup completion does not mean operational readiness

Initial onboarding covers operations, horse and team; the separate Getting started checklist adds providers. That later checklist is in the stable dropdown. Operations is considered complete when any one of contact name, phone, emergency phone, rules or hours exists. Any provider satisfies the provider step, even when no vet/farrier is recorded.

Use one resumable checklist and concrete optional prompts such as Add emergency contact and Add vet/farrier. Place unfinished essentials in a dismissible Home prompt and the relevant empty page. Do not add another compulsory wizard or require every horse to share the same provider.

Evidence: src/components/onboarding/onboardingSteps.ts:22; src/components/stables/StableWelcomePage.tsx:59 and :109; src/integrations/clerk/header-user.tsx:205.

### 7. P2 — Reminder delivery expectations need to be explicit

Care reminders are currently an in-app dated list. Source review found no due-reminder scheduling/delivery path. Event invitations, participation changes and material event changes already have email delivery, so notifications are not wholly absent.

State clearly where reminders appear. If the product is expected to prompt people away from the app, add a minimal opt-in due digest using the existing delivery infrastructure. Avoid building multiple competing notification systems.

Evidence: convex/careReminders.ts; convex/crons.ts; convex/events.ts:128, :172, :221.

## Bloat and information architecture

The strongest bloat evidence is duplicated data entry and equal prominence for features with different frequency, not proof that entire features should be deleted. The main header has seven peers: Home, Horses, Care, Events, Training log, Documents, Analysis. Contacts and yard information are hidden deeper. On a phone, the header wraps into several rows.

A direction to test is Today, Horses, Care, Calendar, Stable. Stable would own Contacts/People/Yard information; training remains accessible from horse and calendar contexts; documents and analysis retain clear contextual entry points. Validate training/reporting usage before demoting them. Avoid a catch-all More menu that merely relocates hidden essentials. Empty Today’s training should take less persistent space for yards not using it.

Keep history, documents and printable care summaries. They serve distinct handover/evidence jobs. Do not add full chat, a generic task board, a CRM or more dashboards to solve these gaps.

## What should remain

- Warm, restrained visual system: readable serif headings, practical record rows, clear selected/action states and a consistent component vocabulary. It feels specific to this product.
- Horse-centred records connected to stable-wide scheduling, shared appointments, reminders and portable care summaries. Preserve multi-horse operations and recurring events.
- Save reliability and safeguards: acknowledged saves, pending states, rejected-save draft preservation, inline errors, removal confirmation, focus recovery and role-scoped permissions. Improve access without discarding these.

## Secondary gaps to validate

- A small dated yard-update feature may answer “What changed since my last visit?” Existing event-change email does not cover general yard notices. Validate this before building chat.
- Long forms preserve failed-save drafts, but no navigation/reload draft recovery was found. Prioritize a dirty-form warning or scoped draft recovery over a broad offline project. This is source-derived; no destructive navigation test was performed.
- First-time members need a durable path to contacts; mobile helpers need urgent items and callable numbers; experienced coordinators need attribution and handoff. The emotional low point is discovering useful information but being unable to act without messaging the owner.

## Provisional heuristic score

| Heuristic | /4 | Main observation |
|---|---:|---|
| Visibility of system status | 2 | Clear save states; quiet-day message conflicts with outstanding care |
| Match to real-world tasks | 2 | Useful terminology; daily contacts treated as settings |
| User control and freedom | 2 | Good cancel patterns; reminders lack edit/reopen |
| Consistency and standards | 3 | Strong shared components; split setup paths |
| Error prevention | 3 | Validation/confirmation; readiness checks too weak |
| Recognition over recall | 1 | Hidden contacts and manual repeated-care follow-up |
| Flexibility and efficiency | 2 | Multi-horse operations; weak delegation and contact reuse |
| Minimalist design | 3 | Calm visual system; uneven feature prominence |
| Error recovery | 3 | Good save failure handling; incomplete reminder recovery |
| Help and guidance | 2 | Useful onboarding; weak ongoing operational prompts |
| Total | 23/40 | Useful foundation with significant workflow friction |

Cognitive load is moderate: peer navigation choices, remembering paths/next actions, and mobile priority order are the principal problems. Counts are diagnostic, not an arbitrary rule that every list must have four items. These scores are expert judgments, not user-study measurements or release certification.

Deterministic detector: zero findings in src/routes/stables (39 files) and src/components/stables (38 files); no false positives to reconcile. This detector evaluates source patterns, not workflow completeness. Its clean result does not contradict the access, navigation and task-lifecycle findings.

Suggested sequence: expose usable shared contacts; fix dashboard priority/empty-state truthfulness; finish reminder correction/history navigation; then define delegation and reminder delivery. Validate broader navigation changes with actual usage.

Decision prompts: Start with (a) contacts/navigation, (b) dashboard/reminder usability, or (c) responsibility/delegation? For Training/Analysis prominence, (a) keep main links until usage is measured, or (b) explore a simpler task-oriented navigation now?
