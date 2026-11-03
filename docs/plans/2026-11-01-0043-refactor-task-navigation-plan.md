---
title: Make everyday tasks easier to find and reach
date: 2026-11-01
type: refactor
status: proposed
artifact_contract: ce-unified-plan/v1
product_contract_source: ce-brainstorm
execution: code
---

# Make everyday tasks easier to find and reach

## Goal Capsule

- **Objective:** Horse owners and small-stable participants can predict where a task belongs and reach it without unnecessary navigation.
- **Means:** Refine daily capture on Home and reorganize entry points within horse and stable views, using the action inventory to compare journeys.
- **Authority:** Draft for user review. The user explicitly wants to preserve the current desktop and mobile design and has confirmed the daily priorities below. Proposed placements remain recommendations, not approved implementation decisions.
- **Open blocker for implementation:** Review the proposed placements and scope. The five daily priorities are confirmed; measured task frequency is still unavailable.
- **Evidence boundary:** Current paths are source-derived minima. Proposed paths are design targets, not implemented or browser-tested results. The source audit and independent claim check used checkout `e274bd6`.

## Product Contract

### Summary

Make event creation, training logging, each calendar and horse profiles directly reachable while keeping the current application shell and visual direction. Start with direct mobile Home capture controls and preserve the existing calendar and horse entry points. Improve stable and horse-record navigation next.

### Problem Frame

The [action inventory](../design/navigation-action-inventory.md) contains several kinds of friction. Stable operations often require entering an overview and reopening navigation; medication is filed under Nutrition; independent horse edits require finding a collapsed section of the general editor. These have different remedies even when their click counts look similar.

Depth alone does not establish priority. Ownership transfers and removal confirmations can reasonably take more effort than viewing a schedule. Conversely, medication may be hard to find even when moving it does not save a click. We have no measured task frequency, first-click success or task-completion times.

Existing direction identifies inspecting and adding events and training, followed by finding horses, as the main daily jobs ([October direction](../design/reviews/dashboard-desktop-mobile-direction-2026-10-08.md)). Current code is authoritative for the shell: four desktop daily links and four mobile bottom entries, including Menu. The older direction's five-item mobile sketch is not the current navigation baseline.

### Approaches Considered

| Approach                                         | What changes                                                                            | Benefit                                                 | Cost or limitation                                                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Fix labels and isolated links                    | Correct misleading names and add a few targeted edit links                              | Least disruption                                        | Repeated stable-entry and membership-management detours remain                                                        |
| Reorganize within horse and stable views         | Improve stable gateways, place controls with their records, and retain daily navigation | Addresses shared causes without a new global task model | Some destinations move; existing links and return paths need compatibility                                            |
| Add a global task launcher or universal task hub | Search or browse actions across the application                                         | Could shorten paths for experienced users               | Adds a new interaction model and permission/scoping complexity; does not by itself make existing views understandable |

The second approach is recommended. A task launcher remains a possible later addition if testing shows a need after the existing views become easier to navigate.

### Prioritization and Action Groups

The user identified adding events, adding training logs, checking both calendars and inspecting horse profiles as the tasks that should feel quickest. Treat these as the first acceptance paths. This is an explicit product priority, not measured usage frequency.

| User-confirmed task             | Inventory ID | Proposed target from Home, desktop / mobile |
| ------------------------------- | ------------ | ------------------------------------------- |
| Add an event                    | A06          | 1 / 1                                       |
| Record a completed training log | B03          | 1 / 1                                       |
| Open the event calendar         | A04          | 1 / 1                                       |
| Open the training calendar      | B01          | 1 / 1                                       |
| Inspect a horse profile         | C03          | 1 / 1                                       |

Each calendar retains its own destination. Opening a form is separate from filling it in and saving. The horse-profile target assumes the horse is in the visible Home roster, as in the baseline.

For secondary groups, evaluate repeated navigation cost, clarity of the expected location, whether an action belongs beside displayed information, and whether extra steps serve a useful review or confirmation purpose.

| Group                                                    | Inventory coverage                           | Diagnosis                                                                                   | Proposed treatment                                             |
| -------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Priority capture, calendars and horse profile            | A04, A06, B01, B03, C03                      | Mobile capture is behind Add activity; calendar/profile entry is already direct             | P9: expose capture directly and protect calendar/profile paths |
| Other schedule and training tasks                        | A01–A03, A05, A07–A08, A10–A20, B02, B04–B11 | Existing paths remain useful                                                                | Protect entry points; P7 addresses status separately           |
| Stable operations and services                           | G01–G06, G08–G25, G30–G39                    | A stable overview and repeated menus sit between users and their destination                | P1: direct stable gateways and consistent local navigation     |
| Stable membership                                        | G26–G29                                      | Relevant controls are separated from the People directory                                   | P2: one People destination with role-appropriate controls      |
| Horse care and medication                                | D09, D11–D12, D19, D21–D22                   | Medication's location under Nutrition is difficult to predict                               | P3: medication with Care; preserve the other care paths        |
| Add horse records                                        | D02, D10, D14, D17, D20, F02                 | Mobile has a reusable horse action menu; desktop sometimes requires extra section selection | P4: a desktop Add record entry using the same record workflows |
| Independent horse edits                                  | C05–C11                                      | The relevant editor section is hidden behind a general Edit task                            | P5: focused contextual editing                                 |
| Repeat care work                                         | D05                                          | Complete-and-schedule-next is hidden in a record menu                                       | P6: an eligible secondary row action                           |
| Event status                                             | A09                                          | Status requires opening general edit and expanding Additional details                       | P7: focused status editing from event detail                   |
| Obsolete history                                         | G07                                          | The visible destination cannot return readable snapshots                                    | P8: remove the misleading entry                                |
| Other reference, account and infrequent management tasks | Remaining inventory IDs                      | No demonstrated need for promotion                                                          | Retain; appendix records every individual disposition          |

### Requirements

The R-IDs describe the recommended scope if adopted. They do not authorize implementation.

**Design and scope**

- R1. Preserve the visual language and responsive patterns in [DESIGN.md](../../DESIGN.md), including the desktop sidebar and current phone bottom navigation.
- R2. Keep global Home, Events, Training and Horses destinations fixed, with stable-specific operations tied to an explicitly named stable.
- R3. Preserve current ownership, carer, membership and record-sharing permissions; a new entry point must not reveal private records, counts or invitation data to an ineligible user.

**Priority daily tasks**

- R17. Eligible users can open Add event and Record completed training directly from Home on either device, with recording a result remaining distinct from scheduling a session.
- R18. Events and Training remain separate, directly reachable calendar destinations on both devices.
- R19. Horse rows on Home continue to open profiles directly, with the roster following the event/training sections before optional setup or updates.
- R20. Add horse remains available in the dashboard horse section on phones as well as in the floating shortcut menu, including empty-state entry points.

**Stable navigation**

- R4. Each Stables-list entry offers its overview, direct Care, People and Contacts links, and a More menu for Horses, Yard information, Documents, Analysis, Getting started and eligible Settings access.
- R5. Stable collection and management screens on phones use one consistent local rail for Overview, Horses, Care, People, Contacts and More, replacing the directory-specific rail where it would duplicate navigation.
- R6. People becomes the canonical destination for the directory and authorized membership controls, including invitations, member edits, removal review and pending invitations.
- R7. Contacts remains the canonical provider directory and management destination; existing Settings links to Members or Providers lead to the corresponding destination.

**Horse records and editing**

- R8. Horse Care contains Reminders, Health issues and Medication, while Nutrition retains feeding information, nutrition history and Weight.
- R9. Desktop horse views offer Add record for reminders, health issues, medication, nutrition logs, weight and documents, preserving the direct event/training paths and mobile horse action menu.
- R10. Contextual horse edit entries open the existing editor with the relevant section expanded and its task control reachable, preserving the normal save, validation and unsaved-change behavior.
- R11. The contextual entries in R10 remain available to eligible editors when the corresponding information or photo is missing.

**Record actions and cleanup**

- R12. Complete and schedule next is a visible secondary reminder action only for a managing user, a pending reminder and no existing follow-up; opening it does not complete or save the reminder.
- R13. Eligible event managers can open status editing from event detail with Additional details expanded, retaining the existing explicit save behavior.
- R14. Remove the obsolete departed-horse history entry without restoring former-stable access to snapshots.

**Navigation continuity**

- R15. Existing links to relocated medication or Settings sections retain their horse/stable context and resolve to the new destination without trapping browser Back.
- R16. Contextual edits and dialogs return users to their originating task, with focus restoration and relevant filters or scroll position preserved.

### Proposed Navigation and Placement

P9. **Make the five priority tasks the first pass.** On mobile Home, show Add event and Record completed training directly in the Events and Training section headers. Keep the floating Add activity button as a bottom-right shortcut to the same forms (user decision, 2026-11-02). Use the existing action styling and compact layout; both controls open the existing forms without saving anything. Keep Add horse with the horse section rather than removing its entry point. Apply the same capture pattern to the stable dashboard, retaining its explicit stable context. Desktop already has direct creation actions, so preserve them.

Keep Events and Training as separate bottom-navigation destinations on phones and sidebar destinations on desktop. Retain the dashboard's separate previews and direct horse-row links. Do not merge the calendars, add a new task grid or move the horse roster below optional stable content. The exact control layout is a design refinement for review; the one-action entry targets are the recommendation.

P1. **Use the Stables list as the gateway.** The stable name continues to open its overview. Care, People and Contacts are separate direct links beside that stable's identity. More contains the less frequent destinations listed in R4. These are stable-specific destinations, so selecting a calendar on Home never changes their meaning. This is the main improvement to initial access; it does not require adding controls to Home.

On phones, R5 also shortens movement between common stable sections after entry. Its More menu contains Yard information, Documents, Analysis, Getting started and eligible Settings. Nested horse and event/session detail pages retain entity navigation and a meaningful return path; substantial create/edit forms retain their own task controls rather than another navigation rail. Desktop keeps the existing sidebar. The rail uses established labels, overflow and focus behavior; it does not add a second local rail above the directory.

P2. **Bring membership work into People.** A stable owner sees Invite member, pending invitations and permitted member controls on the People page. A member keeps the directory and their own yard-details editor. Owners' membership data and invitation email addresses remain restricted per R3. Removal retains the review of consequences for associated horses. The current generic directory only shows name, photo and role; a general member contact directory is not being added.

P3. **Put medication with Care.** Preserve Reminders as Care's default and add Medication alongside Health issues. Keep Nutrition and Weight together. Reading medication still takes three clicks from Home through the horse; the expected category becomes clearer. Existing links and creation intents follow R15, and no additional nested tab level is introduced.

P4. **Extend the horse record shortcut to desktop.** Add record exposes the six record tasks in R9 from any horse section. Mobile retains its existing horse action menu and per-section form ownership. Existing desktop section Add controls remain useful alternatives. Direct Add event and Record completed training remain governed by P9 and R17.

P5. **Edit information where users read it.** Proposed entries are Change photo beside horse identity, Edit profile for optional profile details and calendar colour, Edit identification for identification/insurance, Edit care information on Care, and Edit feeding plan on Nutrition. Each opens the existing editor at the right section under R10–R11. These are task entry points, not separate competing editors. Editing the horse's copied vet/farrier information remains distinct from changing a provider directory entry.

P6. **Expose the next-care-date workflow beside the reminder.** Retain Complete and overflow actions. Add the eligible Complete and schedule next trigger under R12, opening the current next-date editor in one step. Keep clear wording that distinguishes this from immediately completing the record.

P7. **Provide a focused event-status entry.** Place a Change status entry with the event's status information. It opens the existing editor at Additional details, removing one disclosure step. This proposal applies to event status; training completion continues through its existing horse/session result controls.

P8. **Remove the empty history detour.** The old stable Horse history link points to a query that intentionally returns an empty page. R14 removes that affordance. Old URLs may show a truthful explanatory empty/unavailable state; they must not become an access path to departed-horse records.

### Proposed Task Journeys

Counts follow the [baseline conventions](../design/navigation-action-inventory.md#how-to-read-the-counts): Home start, closed menus, eligible user, visible target record, expanded desktop sidebar. Each arrow is a click; the Home starting point is omitted. Counts stop at the working surface, not at saving or confirming. The same horse and calendar assumptions apply before and after.

| Task / IDs                                       | Current desktop / mobile | Proposed desktop / mobile | Proposed path and endpoint                                                    |
| ------------------------------------------------ | ------------------------ | ------------------------- | ----------------------------------------------------------------------------- |
| Add event, A06                                   | 1 / 2                    | 1 / 1                     | Direct Home Add event control on both devices                                 |
| Record completed training, B03                   | 1 / 2                    | 1 / 1                     | Direct Home Record completed training control on both devices                 |
| Open event calendar, A04                         | 1 / 1                    | 1 / 1                     | Events navigation opens the event calendar                                    |
| Open training calendar, B01                      | 1 / 1                    | 1 / 1                     | Training navigation opens the training calendar                               |
| Read horse profile, C03                          | 1 / 1                    | 1 / 1                     | Horse row opens its profile directly                                          |
| Read medication, D19                             | 3 / 3                    | 3 / 3                     | Horse → Care → Medication; category changes, depth does not                   |
| Add health issue, D10                            | 4 / 3                    | 3 / 3                     | Horse → Add record/Actions → Add health issue                                 |
| Add weight, D17                                  | 4 / 3                    | 3 / 3                     | Horse → Add record/Actions → Add weight                                       |
| Add medication, D20                              | 4 / 3                    | 3 / 3                     | Horse → Add record/Actions → Add medication                                   |
| Change horse photo, C05                          | 3 / 4                    | 2 / 2                     | Horse → Change photo; relevant editor section is open                         |
| Change calendar colour/optional profile, C06/C11 | 3 / 4                    | 2 / 2                     | Horse → Edit profile; Profile section is open                                 |
| Edit identification/insurance, C07               | 3 / 4                    | 2 / 2                     | Horse → Edit identification; Care section is open                             |
| Edit care contacts/emergency notes, C08/C09      | 3 / 4                    | 3 / 3                     | Horse → Care → Edit care information                                          |
| Edit feeding plan, C10                           | 3 / 4                    | 3 / 3                     | Horse → Nutrition → Edit feeding plan                                         |
| Complete and schedule next, D05                  | 4 / 4                    | 3 / 3                     | Horse → Care → Complete and schedule next editor                              |
| Change event status, A09                         | 4 / 4                    | 3 / 3                     | Events → event → Change status; editor section is open                        |
| Stable care, G09                                 | 3 / 5                    | 2 / 3                     | Stables → named stable's Care link; phone prepends Menu                       |
| Add stable reminder, G10                         | 4 / 6                    | 3 / 4                     | Stables → stable's Care → Add; phone prepends Menu                            |
| Edit stable reminder, G11                        | 5 / 7                    | 4 / 5                     | Stables → stable's Care → record Actions → Edit; phone prepends Menu          |
| Stable contacts, G13                             | 3 / 5                    | 2 / 3                     | Stables → stable's Contacts link; phone prepends Menu                         |
| Add provider, G14                                | 4 / 6                    | 3 / 4                     | Stables → stable's Contacts → Add; phone prepends Menu                        |
| Edit provider, G15                               | 5 / 7                    | 4 / 5                     | Stables → stable's Contacts → record Actions → Edit; phone prepends Menu      |
| Stable people, G24                               | 3 / 5                    | 2 / 3                     | Stables → stable's People link; phone prepends Menu                           |
| Invite/edit/remove member, G26–G28               | 5 / 7                    | 3 / 4                     | Stables → stable's People → relevant editor/confirmation; phone prepends Menu |
| Pending stable invitations, G29                  | 4 / 6                    | 2 / 3                     | Stables → stable's People; controls visible; phone prepends Menu              |
| Stable documents/analysis, G33/G37               | 3 / 5                    | 3 / 4                     | Stables → stable's More → Documents/Analysis; phone prepends Menu             |
| Stable settings, G30                             | 3 / 5                    | 3 / 4                     | Stables → stable's More → Settings; phone prepends Menu                       |

Stable-local navigation is a separate benefit: once a collection screen is open, Care, People and Contacts become one local selection on phones instead of opening the global Menu and then choosing the destination. The table does not subtract that improvement again from journeys that already use a direct Stables-list entry.

### Key Decisions and Rationale

- **Keep the current design direction.** User directive; governs R1. Changes to information architecture do not require a new visual identity.
- **Prioritize capture, both calendars and horse profiles.** Explicit user priority; governs R17–R19. The one-action targets and direct mobile controls in P9 are proposed means of meeting it.
- **Use contextual changes before a new global launcher.** Recommended; governs R4–R13. Users should be able to find work by browsing its existing context.
- **Treat unchanged counts as possible improvements.** Recommended for R8. The medication change is justified by category clarity, not a promised numerical gain.
- **Keep rare actions in their relevant context.** Recommended; governs R14 and the retained appendix entries. Transfers, restore, archive, billing and account management do not need new dashboard promotion.

### Acceptance Examples

| ID   | Covers       | Given / when                                                            | Expected result                                                                                             |
| ---- | ------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AE1  | R1–R4        | A personal owner with no stable opens Home                              | Existing event/training/horse paths remain; no irrelevant stable destinations appear                        |
| AE2  | R2–R4        | A user belongs to two stables and follows the second stable's Care link | The destination visibly names that stable; Home calendar selections do not retarget the link                |
| AE3  | R3, R6       | An ordinary member opens People                                         | They see permitted directory/own-detail controls, without owner-only invitation or member-management data   |
| AE4  | R3, R6, R16  | A stable owner opens People and starts member removal                   | The existing consequence review is preserved and cancel returns focus to that member                        |
| AE5  | R8, R15      | A carer follows an old medication link                                  | It reaches Medication under Care for the same authorized horse and stable scope; Back returns normally      |
| AE6  | R10–R11, R16 | An eligible editor opens a horse with no photo or care contacts         | Relevant edit entries are available; the correct editor section opens without searching through disclosures |
| AE7  | R9, R16      | A desktop user adds a health record from the horse's Documents section  | The correct horse's health form opens; closing it restores focus and does not create a record               |
| AE8  | R12          | A reminder already has a follow-up or the user can only complete it     | The shortcut does not offer an unauthorized or duplicate next-date workflow                                 |
| AE9  | R13, R16     | An event manager uses Change status and cancels                         | Status remains unchanged and they return to the event detail                                                |
| AE10 | R3, R14      | A former stable follows a departed-horse history URL                    | No private horse record or recovery snapshot becomes readable                                               |

Priority-task examples under R17–R20:

- AE11. An eligible phone user opens Add event or Record completed training directly from Home; no creation menu intervenes, and cancel leaves no saved record.
- AE12. The user opens either calendar in one navigation action, with events and training retaining separate destinations and remembered source selections.
- AE13. The user opens a visible horse's profile in one action, while Add horse remains available in the horse section after the capture-menu change.

### Success Criteria

- S1. The adopted journey targets are reached on both device classes under the baseline assumptions; record navigation and saving are measured separately.
- S2. A04, A06, B01, B03 and C03 each take one action to reach from Home on both devices under the baseline assumptions; other existing fast and empty-state paths do not regress.
- S3. A task-based usability check starts with the five confirmed priority tasks and records first destination chosen, time to reach the working surface, wrong turns and whether help was needed; medication, membership, provider and photo tasks follow as secondary checks.
- S4. The usability check supports the proposed grouping; repeated attempts to find medication under another category or invitations outside People require revising that grouping before claiming improved findability.
- S5. Desktop and phone checks cover light/dark themes, English/Polish, long names, keyboard focus, closed/open navigation, empty records, permission-limited users, personal-only use and multiple stables under R1–R3 and R15–R16.

S1–S5 are proposed acceptance signals, not completed checks. Source arithmetic establishes navigation targets only. Actual usability improvement needs implemented journeys and observation; there is no claimed percentage improvement in task time or success rate.

### Scope Boundaries and Suggested Order

The proposed scope is navigation and access to existing tasks. No new clinical record types, messaging system, global search, subscription changes or access grants are included. No new dashboard sections or task grid are proposed. The public website is outside this work.

Start with **P9**: direct event/training capture on mobile and verification of both calendars and horse-profile entry on both devices. Next address **P1/P2/P3/P4/P8**: stable access, canonical People/Contacts destinations, medication grouping, desktop record entry and the obsolete history link. Follow with **P5/P6/P7**: focused edits, next-care scheduling and event status. This order follows the confirmed daily priorities; the order among secondary changes remains provisional.

Retain existing infrequent actions where the inventory provides no clear reason to move them. Preserve removal/archive review steps and sharing semantics rather than optimizing those confirmations out of the journey.

### Outstanding Questions and Assumptions

| ID  | Classification          | Current proposal / decision needed                                                                                                   |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Q1  | Resolve Before Planning | Review this draft's proposed placements and scope; the five daily priorities are user-confirmed                                      |
| Q2  | Deferred to Planning    | Measured task-frequency data is absent; follow the confirmed five daily priorities and treat the secondary ordering as provisional   |
| Q3  | Deferred to Planning    | Refine labels and rail overflow within the existing design, including Polish translations, while retaining the destinations in R4–R8 |
| Q4  | Deferred to Planning    | Choose implementation and browser-verification details for focused section entry and return behavior under R10–R16                   |

### Evidence and Verification Notes

- The [source inventory](../design/navigation-action-inventory.md) owns current click assumptions. It now retains G07 as an obsolete entry and describes G24 as finding members, without claiming a general contact-details directory.
- Current [dashboard capture menu](../../src/components/dashboard/DashboardCreateMenu.tsx) confirms that mobile Add event and Record completed training each require opening a menu. P9 proposes direct entry; the source baseline remains unchanged.
- [Global navigation](../../src/components/layout/workspaceNavigation.ts), [phone bottom navigation](../../src/components/layout/MobileNavigation.tsx) and [route scope](../../src/components/layout/WorkspaceContext.tsx) establish the protected daily/stable distinction.
- [Stable list](../../src/components/stables/StableListPage.tsx) and [stable card](../../src/components/stables/StableCard.tsx) currently offer a single overview link. R4 requires separate destination controls rather than task buttons nested inside that link. Current list data does not itself establish owner eligibility for Settings.
- [Stable People](../../src/components/stables/StableMembersPage.tsx), [member management](../../src/components/stables/StableMembersSettingsCard.tsx) and [member permissions/data](../../convex/stableMembers.ts) establish the distinction between the public-to-members directory, own details and owner-only member/invitation data. R3 applies to fetching as well as rendering.
- [Stable Contacts route](../../src/routes/stables/_layout/$stableId/stable.tsx) already mounts the [provider controls](../../src/components/stables/StableProvidersCard.tsx), with owner management enforced by [stable permissions](../../convex/libs/stablePermissions.ts). The proposal does not create new provider privileges.
- [Horse Care](../../src/components/horses/HorseCareSection.tsx) and [Nutrition](../../src/components/horses/HorseNutritionSection.tsx) confirm current categories. [Horse actions](../../src/components/horses/HorseActionMenu.tsx) and [horse detail](../../src/components/horses/HorseDetail.tsx) confirm the mobile shortcut and desktop gap.
- [Horse form](../../src/components/horses/HorseProfileForm.tsx), [fields](../../src/components/forms/horse/HorseFormFields.tsx) and [disclosure defaults](../../src/components/forms/FormLayout.tsx) confirm collapsed sections. Focused section entry is proposed behavior; it is not already available on the current edit route.
- [Reminder actions](../../src/components/reminders/CareRemindersCard.tsx) confirm the current overflow action and its eligibility. [Event form](../../src/components/forms/event/EventFormFields.tsx) confirms status in Additional details and the separate training edit rules.
- [Stable history query](../../convex/horseTransitions.ts#L433) intentionally returns no snapshots. [Sharing policy](../personal-stable-sharing-implementation-plan.md) confirms that the former stable loses horse-record access.
- An independent source-only claim check confirmed these baselines and the proposed path arithmetic. It identified the G24 wording, empty care-card condition, owner-only member data and future Settings-eligibility needs; the proposal accounts for each. It did not validate a running future UI.

## Appendix

### Complete Inventory Treatment

Every original ID appears once below. **Keep** preserves its baseline; **P3** changes category without promising fewer clicks; **P1–P7** refer to contextual changes; **P8** retires an obsolete entry; **P9** prioritizes daily capture and protects calendar/profile entry. Some P4 entries already take three clicks and gain a consistent cross-section entry rather than a numerical reduction. G entries with unchanged counts remain reachable through the new gateway or existing overview path. The matrix is a proposal, not a new measured baseline.

| ID  | Task                                                             | Current D / M | Proposed D / M | Treatment                 |
| --- | ---------------------------------------------------------------- | ------------- | -------------- | ------------------------- |
| A01 | See today's events and training                                  | 0 / 0         | 0 / 0          | Keep                      |
| A02 | See this week's upcoming events                                  | 1 / 1         | 1 / 1          | Keep                      |
| A03 | Choose which stable calendars appear on Home                     | 0 / 0         | 0 / 0          | Keep                      |
| A04 | Open the full event calendar                                     | 1 / 1         | 1 / 1          | P9: protect calendar      |
| A05 | View events as a list                                            | 2 / 2         | 2 / 2          | Keep                      |
| A06 | Add an event                                                     | 1 / 2         | 1 / 1          | P9                        |
| A07 | Read an event's details                                          | 2 / 2         | 2 / 2          | Keep                      |
| A08 | Edit/reschedule an event                                         | 3 / 3         | 3 / 3          | Keep                      |
| A09 | Change an event's status                                         | 4 / 4         | 3 / 3          | P7                        |
| A10 | Change an event's repeating schedule                             | 4 / 4         | 4 / 4          | Keep                      |
| A11 | Read an event's provider and cost details                        | 2 / 2         | 2 / 2          | Keep                      |
| A12 | Record/edit a horse's service result for an event                | 3 / 3         | 3 / 3          | Keep                      |
| A13 | Withdraw a horse from an event                                   | 3 / 3         | 3 / 3          | Keep                      |
| A14 | See which horses are confirmed or awaiting approval              | 2 / 2         | 2 / 2          | Keep                      |
| A15 | Invite a rider or instructor to an activity                      | 2 / 2         | 2 / 2          | Keep                      |
| A16 | Revoke a rider/instructor invitation                             | 2 / 2         | 2 / 2          | Keep                      |
| A17 | Change which stables can see an activity                         | 2 / 2         | 2 / 2          | Keep                      |
| A18 | Respond to a horse's activity invitation                         | 0 / 0         | 0 / 0          | Keep                      |
| A19 | Find personal rider/instructor invitations                       | 1 / 1         | 1 / 1          | Keep                      |
| A20 | Accept/decline a rider/instructor invitation                     | 1 / 1         | 1 / 1          | Keep                      |
| B01 | Browse training sessions                                         | 1 / 1         | 1 / 1          | P9: protect calendar      |
| B02 | Schedule a training session                                      | 2 / 2         | 2 / 2          | Keep                      |
| B03 | Record a completed training session                              | 1 / 2         | 1 / 1          | P9                        |
| B04 | Read a session's results                                         | 2 / 2         | 2 / 2          | Keep                      |
| B05 | Edit a training session                                          | 3 / 3         | 3 / 3          | Keep                      |
| B06 | Mark a session/horse's training complete or reopen it            | 2 / 2         | 2 / 2          | Keep                      |
| B07 | View one horse's training history                                | 2 / 2         | 2 / 2          | Keep                      |
| B08 | Filter training by horse/type/status                             | 2 / 2         | 2 / 2          | Keep                      |
| B09 | Switch training to the month view                                | 2 / 2         | 2 / 2          | Keep                      |
| B10 | Submit/edit a training report as an invited rider                | 3 / 3         | 3 / 3          | Keep                      |
| B11 | Read additional service notes attached to training               | 3 / 3         | 3 / 3          | Keep                      |
| C01 | Browse all personal/carer horses                                 | 1 / 2         | 1 / 2          | Keep                      |
| C02 | Add a horse                                                      | 1 / 2         | 1 / 1          | P9: retain horse entry    |
| C03 | Read a horse's profile                                           | 1 / 1         | 1 / 1          | P9: protect profile       |
| C04 | Edit basic horse details                                         | 2 / 3         | 2 / 3          | Keep                      |
| C05 | Change a horse's photo                                           | 3 / 4         | 2 / 2          | P5                        |
| C06 | Change a horse's calendar colour                                 | 3 / 4         | 2 / 2          | P5                        |
| C07 | Update identification or insurance details                       | 3 / 4         | 2 / 2          | P5                        |
| C08 | Change the horse's vet/farrier contact details                   | 3 / 4         | 3 / 3          | P5                        |
| C09 | Update emergency care instructions                               | 3 / 4         | 3 / 3          | P5                        |
| C10 | Update the horse's feeding plan/recommended or avoided foods     | 3 / 4         | 3 / 3          | P5                        |
| C11 | Update allergies or other optional profile details               | 3 / 4         | 2 / 2          | P5                        |
| C12 | Copy a passport or microchip number                              | 1 / 1         | 1 / 1          | Keep                      |
| C13 | Read the horse's event/activity list                             | 2 / 2         | 2 / 2          | Keep                      |
| C14 | Read the horse's combined timeline                               | 2 / 3         | 2 / 3          | Keep                      |
| C15 | View the timeline as a calendar                                  | 3 / 4         | 3 / 4          | Keep                      |
| C16 | Read the horse's care summary                                    | 2 / 3         | 2 / 3          | Keep                      |
| C17 | Print/export the care summary through the browser                | 2 / 3         | 2 / 3          | Keep                      |
| C18 | Open horse analysis/comparison                                   | 2 / 3         | 2 / 3          | Keep                      |
| D01 | Read a horse's care reminders                                    | 2 / 2         | 2 / 2          | Keep                      |
| D02 | Add a horse care reminder                                        | 3 / 3         | 3 / 3          | P4                        |
| D03 | Edit an existing reminder                                        | 4 / 4         | 4 / 4          | Keep                      |
| D04 | Mark a reminder complete                                         | 2 / 2         | 2 / 2          | Keep                      |
| D05 | Complete a reminder and schedule the next one                    | 4 / 4         | 3 / 3          | P6                        |
| D06 | Dismiss a reminder                                               | 3 / 3         | 3 / 3          | Keep                      |
| D07 | Reopen a completed/dismissed reminder                            | 2+ / 2+       | 2+ / 2+        | Keep                      |
| D08 | Remove a reminder                                                | 4 / 4         | 4 / 4          | Keep                      |
| D09 | Read health issues                                               | 3 / 3         | 3 / 3          | P3: clarify category      |
| D10 | Add a health issue                                               | 4 / 3         | 3 / 3          | P4                        |
| D11 | Mark a health issue resolved                                     | 3 / 3         | 3 / 3          | P3: clarify category      |
| D12 | Remove a health issue                                            | 4 / 4         | 4 / 4          | P3: clarify category      |
| D13 | Read current feeding plan and nutrition history                  | 2 / 2         | 2 / 2          | Keep                      |
| D14 | Add a nutrition-history log                                      | 3 / 3         | 3 / 3          | P4                        |
| D15 | Remove a nutrition-history log                                   | 3 / 3         | 3 / 3          | Keep                      |
| D16 | Read weight records                                              | 3 / 3         | 3 / 3          | Keep                      |
| D17 | Record a weight measurement/body condition                       | 4 / 3         | 3 / 3          | P4                        |
| D18 | Remove a weight record                                           | 4 / 4         | 4 / 4          | Keep                      |
| D19 | Read active/past medication records                              | 3 / 3         | 3 / 3          | P3: clarify category      |
| D20 | Add a medication record                                          | 4 / 3         | 3 / 3          | P4                        |
| D21 | Mark a medication course complete                                | 3 / 3         | 3 / 3          | P3: clarify category      |
| D22 | Remove a medication record                                       | 4 / 4         | 4 / 4          | P3: clarify category      |
| D23 | Find the horse's vet/farrier number or emergency instructions    | 2 / 2         | 2 / 2          | Keep                      |
| E01 | See owner, carers and stable access                              | 2 / 3         | 2 / 3          | Keep                      |
| E02 | Invite a horse carer                                             | 2 / 3         | 2 / 3          | Keep                      |
| E03 | Change a carer's access level                                    | 2 / 3         | 2 / 3          | Keep                      |
| E04 | Revoke a carer's access                                          | 3 / 4         | 3 / 4          | Keep                      |
| E05 | Cancel a pending horse-access invitation                         | 2 / 3         | 2 / 3          | Keep                      |
| E06 | Transfer horse ownership                                         | 2 / 3         | 2 / 3          | Keep                      |
| E07 | Invite an owner to claim a custodied horse                       | 2 / 3         | 2 / 3          | Keep                      |
| E08 | Connect a personal horse to a stable                             | 2 / 3         | 2 / 3          | Keep                      |
| E09 | Move a horse to another stable or leave its current stable       | 3 / 4         | 3 / 4          | Keep                      |
| E10 | Read a horse's placement history                                 | 2 / 3         | 2 / 3          | Keep                      |
| E11 | Share/stop sharing a record with the current stable              | 2 / 3         | 2 / 3          | Keep                      |
| E12 | Set an individual occurrence's sharing exception                 | 3 / 4         | 3 / 4          | Keep                      |
| E13 | Share selected categories of existing horse history              | 2 / 3         | 2 / 3          | Keep                      |
| E14 | Archive/delete a horse                                           | 3 / 4         | 3 / 4          | Keep                      |
| E15 | Find deleted personal horses / reach Restore                     | 2 / 3         | 2 / 3          | Keep                      |
| F01 | Browse a horse's documents                                       | 2 / 2         | 2 / 2          | Keep                      |
| F02 | Upload a horse document                                          | 3 / 3         | 3 / 3          | P4                        |
| F03 | Find a horse document to open/download                           | 2 / 2         | 2 / 2          | Keep                      |
| F04 | Remove a horse document                                          | 3 / 3         | 3 / 3          | Keep                      |
| F05 | Find personal care-provider contacts                             | 1 / 1         | 1 / 1          | Keep                      |
| F06 | Add a personal care-provider contact                             | 1 / 1         | 1 / 1          | Keep                      |
| F07 | Edit a personal contact                                          | 2 / 2         | 2 / 2          | Keep                      |
| F08 | Remove a personal contact                                        | 2 / 2         | 2 / 2          | Keep                      |
| F09 | Call a personal provider                                         | 1 / 1         | 1 / 1          | Keep                      |
| G01 | Browse/manage their stables                                      | 1 / 2         | 1 / 2          | Keep                      |
| G02 | Create a stable                                                  | 2 / 3         | 2 / 3          | Keep                      |
| G03 | Open a stable dashboard                                          | 2 / 3         | 2 / 3          | Keep                      |
| G04 | Browse the stable horse roster                                   | 3 / 4         | 3 / 4          | Keep                      |
| G05 | Add a horse directly to a stable                                 | 3 / 5         | 3 / 4          | P9: retain horse entry    |
| G06 | Find/add an unclaimed stable horse                               | 4 / 5         | 4 / 5          | Keep                      |
| G07 | Read departed-horse snapshots (obsolete entry)                   | — / —         | — / —          | P8: remove obsolete entry |
| G08 | Find deleted stable horses / reach Restore                       | 4 / 5         | 4 / 5          | Keep                      |
| G09 | Read stable-wide care reminders                                  | 3 / 5         | 2 / 3          | P1                        |
| G10 | Add a stable care reminder                                       | 4 / 6         | 3 / 4          | P1                        |
| G11 | Edit a stable care reminder                                      | 5 / 7         | 4 / 5          | P1                        |
| G12 | Complete a stable care reminder                                  | 3 / 5         | 2 / 3          | P1                        |
| G13 | Find the stable provider directory                               | 3 / 5         | 2 / 3          | P1                        |
| G14 | Add a stable provider                                            | 4 / 6         | 3 / 4          | P1                        |
| G15 | Edit a stable provider                                           | 5 / 7         | 4 / 5          | P1                        |
| G16 | Remove a stable provider                                         | 5 / 7         | 4 / 5          | P1                        |
| G17 | Call/email a stable provider                                     | 3 / 5         | 2 / 3          | P1                        |
| G18 | Read yard details, rules and emergency contacts                  | 3 / 5         | 3 / 4          | P1                        |
| G19 | Edit stable profile, yard rules or emergency contacts            | 4 / 6         | 4 / 5          | P1                        |
| G20 | Read stable updates/announcements                                | 3 / 5         | 3 / 4          | P1                        |
| G21 | Post a stable update                                             | 4 / 6         | 4 / 5          | P1                        |
| G22 | Edit a stable update                                             | 4 / 6         | 4 / 5          | P1                        |
| G23 | Remove a stable update                                           | 4 / 6         | 4 / 5          | P1                        |
| G24 | Find stable members                                              | 3 / 5         | 2 / 3          | P1                        |
| G25 | Update own yard name/phone/emergency contact                     | 4 / 6         | 3 / 4          | P1                        |
| G26 | Invite a member to the stable                                    | 5 / 7         | 3 / 4          | P2                        |
| G27 | Edit another member's yard details                               | 5 / 7         | 3 / 4          | P2                        |
| G28 | Remove a stable member                                           | 5 / 7         | 3 / 4          | P2                        |
| G29 | Review pending stable invitations / reach cancel                 | 4 / 6         | 2 / 3          | P2                        |
| G30 | Open stable settings                                             | 3 / 5         | 3 / 4          | P1                        |
| G31 | Review the stable activity/audit log                             | 4 / 6         | 4 / 5          | P1                        |
| G32 | Archive a stable                                                 | 4 / 6         | 4 / 5          | P1                        |
| G33 | Browse stable documents                                          | 3 / 5         | 3 / 4          | P1                        |
| G34 | Upload a stable document                                         | 4 / 6         | 4 / 5          | P1                        |
| G35 | Find a stable document to open/download                          | 3 / 5         | 3 / 4          | P1                        |
| G36 | Remove a stable document                                         | 4 / 6         | 4 / 5          | P1                        |
| G37 | Open stable analysis                                             | 3 / 5         | 3 / 4          | P1                        |
| G38 | Read the stable welcome/getting-started guide                    | 3 / 5         | 3 / 4          | P1                        |
| G39 | Edit stable welcome/arrival information                          | 4 / 6         | 4 / 5          | P1                        |
| H01 | Read notifications                                               | 1 / 1         | 1 / 1          | Keep                      |
| H02 | Filter notifications to unread                                   | 2 / 2         | 2 / 2          | Keep                      |
| H03 | Mark a notification/all notifications read                       | 1 / 1         | 1 / 1          | Keep                      |
| H04 | Open an invitation or item from a notification                   | 2 / 2         | 2 / 2          | Keep                      |
| H05 | Approve/decline a horse participation request from notifications | 1 / 1         | 1 / 1          | Keep                      |
| H06 | Update personal profile details                                  | 2 / 2         | 2 / 2          | Keep                      |
| H07 | Change daily digest email preference                             | 2 / 2         | 2 / 2          | Keep                      |
| H08 | Change interface language                                        | 2 / 2         | 2 / 2          | Keep                      |
| H09 | Change light/dark/system appearance                              | 2 / 2         | 2 / 2          | Keep                      |
| H10 | Manage sign-in/account security                                  | 2 / 2         | 2 / 2          | Keep                      |
| H11 | View plans and billing                                           | 2 / 2         | 2 / 2          | Keep                      |
| H12 | Sign out                                                         | 1 / 1         | 1 / 1          | Keep                      |
