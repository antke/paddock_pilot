# User actions and dashboard click baseline

Source audit: 1 November 2026, commit `e274bd6`. This is an inventory of the production UI, inferred from routes and rendered controls. It has not been verified in an authenticated browser session. No application behavior was changed.

Follow-up correction, 1 November 2026: G07 is an obsolete navigation entry, not a working feature. Its backend intentionally returns no departed-horse snapshots. The inventory retains its ID for traceability: 147 entries, of which 146 remain action candidates and one is a dead-end candidate for removal. G24 describes finding members; the current general directory shows name, photo and role, not general member contact details.

## How to read the counts

- Start at the signed-in **Home dashboard (`/`)**, with menus closed. Desktop means an expanded sidebar at 1280px or wider; mobile means a phone below 768px.
- Count clicks/taps to **reach the working surface**: an open creation/edit form, visible information, or a visible immediate-action control. For removal/archive actions, count through opening the confirmation. Do not count submitting, confirming, typing, choosing field values, scrolling, OS file pickers, printing, or external checkout steps. Thus “Complete reminder” measures reaching its Complete button, not completing the reminder.
- Each arrow in a path is one click unless the step explicitly says “visible”. Redirects are free. A section disclosure or overflow menu costs one click. Form section headings are included when they hide the requested control.
- Use an existing owned horse visible in Home's roster (**H**, 1 click on both devices). My calendar stays selected; stable roster entries may have different access and may not be links. If the target horse is absent, use Horses → horse: 2 desktop / 3 mobile, adding 1 / 2 to H-based paths. Stable-only horses require the appropriate stable context and permissions.
- **S** = Stables → choose stable: 2 desktop / 3 mobile (Menu → Stables → stable). Counts in stable tables include this entire journey from Home. Selecting a stable calendar filter on Home does **not** open stable management navigation.
- **E** = Events → event: 2 on both devices, assuming the event is visible in the displayed calendar. **T** = Training → session: 2 on both devices, assuming it is visible in the current week. Off-screen dates, pagination, and search/filter choices add variable clicks; counts are navigation minima, not a guarantee for every record.
- **G** = horse management: H → Manage, 2 desktop / H → More → Manage, 3 mobile. **C** = stable Contacts, 3 desktop / 5 mobile: S → Contacts (desktop header; mobile Menu → Contacts). **K** = stable Settings, 3 desktop / 5 mobile: S → Settings (mobile Menu → Settings). **R** = stable roster, 3 desktop / 4 mobile: S → View all horses. These abbreviations always include the journey from Home.
- Permissions are prerequisites, never extra clicks. “Owner/editor”, stable owner, carer, custodian and participant describe the intended eligible user; server authorization remains authoritative. Unavailable actions are not assigned an invented route through a permission barrier.
- Labels below use plain English task names; localized labels can differ. “Actions” means the record overflow menu or horse mobile action menu, as specified.

The tables deliberately separate independently motivated jobs (photo, emergency contact, feeding plan) while treating creation flows (add horse, add event) as whole features. Form fields, every calendar date, and each filter value are not separate features.

## Home, schedules and events

Evidence: [Home], [Navigation], [Events], [Event detail], [Event form], [Activity people], [Activity sharing].

| ID  | User wants to…                                      | Desktop | Mobile | Path / endpoint and conditions                                                                                                         |
| --- | --------------------------------------------------- | ------: | -----: | -------------------------------------------------------------------------------------------------------------------------------------- |
| A01 | See today's events and training                     |       0 |      0 | Visible on Home; mobile previews at most two of each.                                                                                  |
| A02 | See this week's upcoming events                     |       1 |      1 | Home → This week disclosure.                                                                                                           |
| A03 | Choose which stable calendars appear on Home        |       0 |      0 | Calendar source controls visible when the user belongs to a stable; changing a checkbox is task execution.                             |
| A04 | Open the full event calendar                        |       1 |      1 | Events navigation or Home's full-calendar link.                                                                                        |
| A05 | View events as a list                               |       2 |      2 | Events → List view; assumes default Calendar view.                                                                                     |
| A06 | Add an event                                        |       1 |      2 | Desktop Home Add event; mobile Add activity → Add event. Requires a recordable horse for the Home shortcut; Events → Add also takes 2. |
| A07 | Read an event's details                             |       2 |      2 | E. A visible Home event shortcut reduces this to 1.                                                                                    |
| A08 | Edit/reschedule an event                            |       3 |      3 | E → Edit. From a visible Home event: 2.                                                                                                |
| A09 | Change an event's status                            |       4 |      4 | E → Edit → Additional details; status control is in the collapsed section.                                                             |
| A10 | Change an event's repeating schedule                |       4 |      4 | E → Edit → Repeat schedule; counts reach the recurrence editor.                                                                        |
| A11 | Read an event's provider and cost details           |       2 |      2 | E; only applicable when those details are recorded and accessible.                                                                     |
| A12 | Record/edit a horse's service result for an event   |       3 |      3 | E → Edit on the horse's service-notes row.                                                                                             |
| A13 | Withdraw a horse from an event                      |       3 |      3 | E → Withdraw on horse service row, opening confirmation; only eligible participation.                                                  |
| A14 | See which horses are confirmed or awaiting approval |       2 |      2 | E; participation summary is visible.                                                                                                   |
| A15 | Invite a rider or instructor to an activity         |       2 |      2 | E; Activity people invitation form is inline for authorized users.                                                                     |
| A16 | Revoke a rider/instructor invitation                |       2 |      2 | E; Remove control is inline when an invitation exists.                                                                                 |
| A17 | Change which stables can see an activity            |       2 |      2 | E; Sharing controls are inline, when permitted. Origin-stable horse sharing is managed separately.                                     |
| A18 | Respond to a horse's activity invitation            |       0 |      0 | Home horse-invitation inbox has inline response controls, when pending. Also available from notification center.                       |
| A19 | Find personal rider/instructor invitations          |       1 |      1 | Events or Training → invitation list is visible when pending.                                                                          |
| A20 | Accept/decline a rider/instructor invitation        |       1 |      1 | Same inline list as A19; stops before pressing response.                                                                               |

## Training

Evidence: [Training], [Training calendar], [Event detail], [Activity people].

| ID  | User wants to…                                        | Desktop | Mobile | Path / endpoint and conditions                                                                                                                                                              |
| --- | ----------------------------------------------------- | ------: | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B01 | Browse training sessions                              |       1 |      1 | Training navigation or Home View training.                                                                                                                                                  |
| B02 | Schedule a training session                           |       2 |      2 | Training → Add session.                                                                                                                                                                     |
| B03 | Record a completed training session                   |       1 |      2 | Home Record completed; mobile Add activity → Record completed.                                                                                                                              |
| B04 | Read a session's results                              |       2 |      2 | T; a session visible on Home takes 1.                                                                                                                                                       |
| B05 | Edit a training session                               |       3 |      3 | T → Edit; subject to schedule/result permissions.                                                                                                                                           |
| B06 | Mark a session/horse's training complete or reopen it |       2 |      2 | T → completion controls visible for eligible dates and users. Calendar/preview shortcuts may be shorter.                                                                                    |
| B07 | View one horse's training history                     |       2 |      2 | H → Training.                                                                                                                                                                               |
| B08 | Filter training by horse/type/status                  |       2 |      2 | Training → Filters; counts opening the filter panel.                                                                                                                                        |
| B09 | Switch training to the month view                     |       2 |      2 | Training → Month (default is Week).                                                                                                                                                         |
| B10 | Submit/edit a training report as an invited rider     |       3 |      3 | T → Record/Edit report on the activity's participant view. Requires accepted rider invitation and report eligibility; pending-only invitation lists no longer include accepted invitations. |
| B11 | Read additional service notes attached to training    |       3 |      3 | T → Service notes disclosure.                                                                                                                                                               |

## Horse profile and identity

Evidence: [Home], [Horse detail], [Horse form], [Horse fields], [Personal horses].

| ID  | User wants to…                                               | Desktop | Mobile | Path / endpoint and conditions                                                                                |
| --- | ------------------------------------------------------------ | ------: | -----: | ------------------------------------------------------------------------------------------------------------- |
| C01 | Browse all personal/carer horses                             |       1 |      2 | Horses; mobile Menu → Horses. Home already shows the selected dashboard roster.                               |
| C02 | Add a horse                                                  |       1 |      2 | Home Add horse; mobile Add activity → Add horse. Empty Home has a direct Add horse action (1).                |
| C03 | Read a horse's profile                                       |       1 |      1 | H; default horse route redirects to Profile.                                                                  |
| C04 | Edit basic horse details                                     |       2 |      3 | H → Edit; mobile H → Actions → Edit. Basic details are open by default.                                       |
| C05 | Change a horse's photo                                       |       3 |      4 | H → Edit → Profile section; mobile inserts Actions before Edit. Stops at image-upload control.                |
| C06 | Change a horse's calendar colour                             |       3 |      4 | Same Profile section as photo.                                                                                |
| C07 | Update identification or insurance details                   |       3 |      4 | H → Edit → Care section; mobile inserts Actions.                                                              |
| C08 | Change the horse's vet/farrier contact details               |       3 |      4 | H → Edit → Care section; separate from editing provider directories.                                          |
| C09 | Update emergency care instructions                           |       3 |      4 | H → Edit → Care section.                                                                                      |
| C10 | Update the horse's feeding plan/recommended or avoided foods |       3 |      4 | H → Edit → Nutrition section. This is the current profile plan, separate from adding a nutrition-history log. |
| C11 | Update allergies or other optional profile details           |       3 |      4 | H → Edit → Profile section.                                                                                   |
| C12 | Copy a passport or microchip number                          |       1 |      1 | H; copy control beside the recorded identifier is visible.                                                    |
| C13 | Read the horse's event/activity list                         |       2 |      2 | H → Activity.                                                                                                 |
| C14 | Read the horse's combined timeline                           |       2 |      3 | H → Timeline; mobile H → More → Timeline.                                                                     |
| C15 | View the timeline as a calendar                              |       3 |      4 | Timeline path → Calendar mode (default Log).                                                                  |
| C16 | Read the horse's care summary                                |       2 |      3 | H → Care summary; mobile H → More → Care summary.                                                             |
| C17 | Print/export the care summary through the browser            |       2 |      3 | Same as C16; Print button visible. Pressing Print and the OS print dialog are excluded.                       |
| C18 | Open horse analysis/comparison                               |       2 |      3 | H → Analysis; mobile H → More → Analysis.                                                                     |

## Care, health, feeding, weight and medication

Evidence: [Horse care], [Horse nutrition], [Horse actions], [Care reminders], [Health records], [Nutrition records], [Weight records], [Medication records].

| ID  | User wants to…                                                | Desktop | Mobile | Path / endpoint and conditions                                                                          |
| --- | ------------------------------------------------------------- | ------: | -----: | ------------------------------------------------------------------------------------------------------- |
| D01 | Read a horse's care reminders                                 |       2 |      2 | H → Care (default Reminders).                                                                           |
| D02 | Add a horse care reminder                                     |       3 |      3 | Desktop H → Care → Add reminder; mobile H → Actions → Add reminder opens the form directly.             |
| D03 | Edit an existing reminder                                     |       4 |      4 | H → Care → reminder Actions → Edit.                                                                     |
| D04 | Mark a reminder complete                                      |       2 |      2 | H → Care; Complete button visible. Home reminder summaries link to records rather than completing them. |
| D05 | Complete a reminder and schedule the next one                 |       4 |      4 | H → Care → reminder Actions → Complete and schedule.                                                    |
| D06 | Dismiss a reminder                                            |       3 |      3 | H → Care → reminder Actions; Dismiss control visible.                                                   |
| D07 | Reopen a completed/dismissed reminder                         |      2+ |     2+ | H → Care; Reopen is inline when the record is included in current filters. Filter changes add clicks.   |
| D08 | Remove a reminder                                             |       4 |      4 | H → Care → reminder Actions → Remove confirmation.                                                      |
| D09 | Read health issues                                            |       3 |      3 | H → Care → Health issues. A visible Home health-issue link can take 1.                                  |
| D10 | Add a health issue                                            |       4 |      3 | Desktop H → Care → Health issues → Add; mobile H → Actions → Add health issue.                          |
| D11 | Mark a health issue resolved                                  |       3 |      3 | H → Care → Health issues; Resolve button visible on active records.                                     |
| D12 | Remove a health issue                                         |       4 |      4 | H → Care → Health issues → Remove confirmation.                                                         |
| D13 | Read current feeding plan and nutrition history               |       2 |      2 | H → Nutrition (default Nutrition subtab).                                                               |
| D14 | Add a nutrition-history log                                   |       3 |      3 | Desktop H → Nutrition → Add; mobile H → Actions → Add nutrition.                                        |
| D15 | Remove a nutrition-history log                                |       3 |      3 | H → Nutrition → Remove confirmation on a log.                                                           |
| D16 | Read weight records                                           |       3 |      3 | H → Nutrition → Weight.                                                                                 |
| D17 | Record a weight measurement/body condition                    |       4 |      3 | Desktop H → Nutrition → Weight → Add; mobile H → Actions → Add weight.                                  |
| D18 | Remove a weight record                                        |       4 |      4 | H → Nutrition → Weight → Remove confirmation.                                                           |
| D19 | Read active/past medication records                           |       3 |      3 | H → Nutrition → Medication.                                                                             |
| D20 | Add a medication record                                       |       4 |      3 | Desktop H → Nutrition → Medication → Add; mobile H → Actions → Add medication.                          |
| D21 | Mark a medication course complete                             |       3 |      3 | H → Nutrition → Medication; Complete visible on active records.                                         |
| D22 | Remove a medication record                                    |       4 |      4 | H → Nutrition → Medication → Remove confirmation.                                                       |
| D23 | Find the horse's vet/farrier number or emergency instructions |       2 |      2 | H → Care; visible if recorded. Initiating a call adds 1.                                                |

## Horse ownership, access and stable placement

Evidence: [Horse management], [Sharing], [History sharing], [Personal horses]. These are owner/custodian workflows unless the access result permits otherwise.

| ID  | User wants to…                                             | Desktop | Mobile | Path / endpoint and conditions                                                                                                     |
| --- | ---------------------------------------------------------- | ------: | -----: | ---------------------------------------------------------------------------------------------------------------------------------- |
| E01 | See owner, carers and stable access                        |       2 |      3 | G; access summary is visible.                                                                                                      |
| E02 | Invite a horse carer                                       |       2 |      3 | G; inline email/access-level form.                                                                                                 |
| E03 | Change a carer's access level                              |       2 |      3 | G; inline Viewer/Editor control.                                                                                                   |
| E04 | Revoke a carer's access                                    |       3 |      4 | G → Revoke opens confirmation.                                                                                                     |
| E05 | Cancel a pending horse-access invitation                   |       2 |      3 | G; Cancel control visible beside pending invitation.                                                                               |
| E06 | Transfer horse ownership                                   |       2 |      3 | G; inline transfer invitation form. Requires recipient acceptance after submission.                                                |
| E07 | Invite an owner to claim a custodied horse                 |       2 |      3 | G; inline claim form, custodian only.                                                                                              |
| E08 | Connect a personal horse to a stable                       |       2 |      3 | G; stable selector and Connect control visible. Assumes an eligible stable exists.                                                 |
| E09 | Move a horse to another stable or leave its current stable |       3 |      4 | G → Review departure; selecting destination is excluded as form input. Stops at review/checklist.                                  |
| E10 | Read a horse's placement history                           |       2 |      3 | G; history visible when placements exist.                                                                                          |
| E11 | Share/stop sharing a record with the current stable        |       2 |      3 | G; record-sharing controls visible. Group activity withdrawal opens a further confirmation (+1).                                   |
| E12 | Set an individual occurrence's sharing exception           |       3 |      4 | G → Individual occurrence exception disclosure. Date input is excluded.                                                            |
| E13 | Share selected categories of existing horse history        |       2 |      3 | G; Share existing history category controls visible for a placed horse's owner. Review and confirmation are later execution steps. |
| E14 | Archive/delete a horse                                     |       3 |      4 | G → Archive opens confirmation.                                                                                                    |
| E15 | Find deleted personal horses / reach Restore               |       2 |      3 | Horses → Deleted horses; mobile Menu → Horses → Deleted horses. Restore control is inline.                                         |

## Documents and personal contacts

Evidence: [Documents], [Personal contacts], [Horse actions].

| ID  | User wants to…                         | Desktop | Mobile | Path / endpoint and conditions                                                                      |
| --- | -------------------------------------- | ------: | -----: | --------------------------------------------------------------------------------------------------- |
| F01 | Browse a horse's documents             |       2 |      2 | H → Documents.                                                                                      |
| F02 | Upload a horse document                |       3 |      3 | Desktop H → Documents → Add; mobile H → Actions → Add document.                                     |
| F03 | Find a horse document to open/download |       2 |      2 | H → Documents; Open and Download controls visible for available files. Activating a control adds 1. |
| F04 | Remove a horse document                |       3 |      3 | H → Documents → Remove confirmation.                                                                |
| F05 | Find personal care-provider contacts   |       1 |      1 | Home Contacts link (also available through navigation).                                             |
| F06 | Add a personal care-provider contact   |       1 |      1 | Home → Contacts; new-contact form is inline.                                                        |
| F07 | Edit a personal contact                |       2 |      2 | Contacts → Edit row.                                                                                |
| F08 | Remove a personal contact              |       2 |      2 | Contacts → Delete opens confirmation.                                                               |
| F09 | Call a personal provider               |       1 |      1 | Contacts; phone link visible if recorded. Initiating the call adds 1.                               |

## Stable operations, people and administration

Evidence: [Stable entry], [Stable dashboard], [Stable directory], [Stable settings], [Stable people], [Stable providers], [Stable ownership], [Documents], [Stable care]. Counts start at personal Home, not the stable dashboard.

| ID  | User wants to…                                        | Desktop | Mobile | Path / endpoint and conditions                                                                                                                                                                                                                                   |
| --- | ----------------------------------------------------- | ------: | -----: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G01 | Browse/manage their stables                           |       1 |      2 | Stables; mobile Menu → Stables.                                                                                                                                                                                                                                  |
| G02 | Create a stable                                       |       2 |      3 | Stables → Create stable.                                                                                                                                                                                                                                         |
| G03 | Open a stable dashboard                               |       2 |      3 | S.                                                                                                                                                                                                                                                               |
| G04 | Browse the stable horse roster                        |       3 |      4 | R. Assumes nonempty roster; empty state offers horse creation.                                                                                                                                                                                                   |
| G05 | Add a horse directly to a stable                      |       3 |      5 | Desktop S → Add horse; mobile S → Add activity → Add horse.                                                                                                                                                                                                      |
| G06 | Find/add an unclaimed stable horse                    |       4 |      5 | R → Unclaimed horses; creation form inline for custodian.                                                                                                                                                                                                        |
| G07 | Read departed-horse snapshots (obsolete entry)        |       — |      — | The legacy Horse history page is reachable in 4 desktop / 5 mobile clicks, but its endpoint intentionally always returns an empty page. There is no supported snapshot-reading action; remove the misleading entry rather than promote it. See [History access]. |
| G08 | Find deleted stable horses / reach Restore            |       4 |      5 | R → Deleted horses; restore controls depend on access.                                                                                                                                                                                                           |
| G09 | Read stable-wide care reminders                       |       3 |      5 | S → Care; mobile S → Menu → Care. A due-reminder shortcut can reduce mobile to 4.                                                                                                                                                                                |
| G10 | Add a stable care reminder                            |       4 |      6 | Stable care path → Add reminder.                                                                                                                                                                                                                                 |
| G11 | Edit a stable care reminder                           |       5 |      7 | Stable care path → reminder Actions → Edit.                                                                                                                                                                                                                      |
| G12 | Complete a stable care reminder                       |       3 |      5 | Stable care path; Complete control visible for eligible records.                                                                                                                                                                                                 |
| G13 | Find the stable provider directory                    |       3 |      5 | C. On desktop the stable dashboard has a Contacts shortcut.                                                                                                                                                                                                      |
| G14 | Add a stable provider                                 |       4 |      6 | C → Add provider. No need to go through Settings → Providers.                                                                                                                                                                                                    |
| G15 | Edit a stable provider                                |       5 |      7 | C → provider Actions → Edit.                                                                                                                                                                                                                                     |
| G16 | Remove a stable provider                              |       5 |      7 | C → provider Actions → Remove confirmation.                                                                                                                                                                                                                      |
| G17 | Call/email a stable provider                          |       3 |      5 | C; contact controls visible if recorded. Initiating contact adds 1.                                                                                                                                                                                              |
| G18 | Read yard details, rules and emergency contacts       |       3 |      5 | S → Stable/Yard; mobile S → Menu → Stable.                                                                                                                                                                                                                       |
| G19 | Edit stable profile, yard rules or emergency contacts |       4 |      6 | Yard path → Edit. Settings → Edit has the same count; stable form groups are open.                                                                                                                                                                               |
| G20 | Read stable updates/announcements                     |       3 |      5 | Yard path. Dashboard preview can show the newest three: S on desktop; mobile S → Updates and setup (4).                                                                                                                                                          |
| G21 | Post a stable update                                  |       4 |      6 | Yard path → Add update.                                                                                                                                                                                                                                          |
| G22 | Edit a stable update                                  |       4 |      6 | Yard path → Edit update (when permitted).                                                                                                                                                                                                                        |
| G23 | Remove a stable update                                |       4 |      6 | Yard path → Remove opens confirmation.                                                                                                                                                                                                                           |
| G24 | Find stable members                                   |       3 |      5 | S → People; mobile S → Menu → People.                                                                                                                                                                                                                            |
| G25 | Update own yard name/phone/emergency contact          |       4 |      6 | People path → Edit my details.                                                                                                                                                                                                                                   |
| G26 | Invite a member to the stable                         |       5 |      7 | K → Members → Invite member. Stable owner.                                                                                                                                                                                                                       |
| G27 | Edit another member's yard details                    |       5 |      7 | K → Members → Edit details. Stable owner.                                                                                                                                                                                                                        |
| G28 | Remove a stable member                                |       5 |      7 | K → Members → Remove opens review/confirmation. Stable owner; associated horse departures may need further steps.                                                                                                                                                |
| G29 | Review pending stable invitations / reach cancel      |       4 |      6 | K → Members; pending invitations and their controls visible.                                                                                                                                                                                                     |
| G30 | Open stable settings                                  |       3 |      5 | K. Stable owner.                                                                                                                                                                                                                                                 |
| G31 | Review the stable activity/audit log                  |       4 |      6 | K → Activity log. Stable owner.                                                                                                                                                                                                                                  |
| G32 | Archive a stable                                      |       4 |      6 | K → Archive confirmation. Stable owner; prerequisites can prevent proceeding.                                                                                                                                                                                    |
| G33 | Browse stable documents                               |       3 |      5 | S → Documents; mobile S → Menu → Documents.                                                                                                                                                                                                                      |
| G34 | Upload a stable document                              |       4 |      6 | Stable documents path → Add.                                                                                                                                                                                                                                     |
| G35 | Find a stable document to open/download               |       3 |      5 | Stable documents path; Open and Download controls visible for available files. Activating a control adds 1.                                                                                                                                                      |
| G36 | Remove a stable document                              |       4 |      6 | Stable documents path → Remove confirmation.                                                                                                                                                                                                                     |
| G37 | Open stable analysis                                  |       3 |      5 | S → Analysis; mobile S → Menu → Analysis.                                                                                                                                                                                                                        |
| G38 | Read the stable welcome/getting-started guide         |       3 |      5 | S → Getting started; mobile S → Menu → Getting started.                                                                                                                                                                                                          |
| G39 | Edit stable welcome/arrival information               |       4 |      6 | Getting-started path → Edit details (where permitted).                                                                                                                                                                                                           |

## Account, preferences and notifications

Evidence: [Account], [Preferences], [Profile], [Notifications]. Clerk-owned account screens and external billing have separate, unmeasured internal flows.

| ID  | User wants to…                                                   | Desktop | Mobile | Path / endpoint and conditions                                                                                                 |
| --- | ---------------------------------------------------------------- | ------: | -----: | ------------------------------------------------------------------------------------------------------------------------------ |
| H01 | Read notifications                                               |       1 |      1 | Notification bell → dialog.                                                                                                    |
| H02 | Filter notifications to unread                                   |       2 |      2 | Bell → Unread.                                                                                                                 |
| H03 | Mark a notification/all notifications read                       |       1 |      1 | Bell; relevant read controls visible.                                                                                          |
| H04 | Open an invitation or item from a notification                   |       2 |      2 | Bell → item destination. Depends on notification kind and existence.                                                           |
| H05 | Approve/decline a horse participation request from notifications |       1 |      1 | Bell; response controls inline when the notification contains an event-horse invitation.                                       |
| H06 | Update personal profile details                                  |       2 |      2 | Desktop account avatar → Profile; mobile Menu → Profile. Inline form.                                                          |
| H07 | Change daily digest email preference                             |       2 |      2 | Profile path; notification preference visible.                                                                                 |
| H08 | Change interface language                                        |       2 |      2 | Avatar/Menu → Account preferences, or Profile's language section. Counts reach selector.                                       |
| H09 | Change light/dark/system appearance                              |       2 |      2 | Avatar/Menu → Account preferences; theme controls visible.                                                                     |
| H10 | Manage sign-in/account security                                  |       2 |      2 | Desktop avatar → Manage account; mobile Menu → Manage account. Stops at Clerk account UI; internal security screens uncounted. |
| H11 | View plans and billing                                           |       2 |      2 | Avatar/Menu → Billing (`/pricing`). Choosing a plan and external checkout uncounted.                                           |
| H12 | Sign out                                                         |       1 |      1 | Avatar/Menu; Sign out control visible. Activating it adds 1.                                                                   |

## Conditional shortcuts and scope boundaries

- Home event and training links can cut one click from E/T paths. Home's week disclosure costs a click before a future event link. Mobile truncates today's event/training previews to two items.
- Home health/reminder summaries are conditional on data and selected calendars. Desktop health links can jump straight to Health issues in 1 click. Mobile health/reminder disclosures can add a click before following a record link. These are shortcuts, not reliable entry points for every horse or record.
- Stable roster previews show five horses on desktop and three on mobile; use the full roster for arbitrary stable horses. Do not treat a non-clickable basic roster card as profile access.
- From an already-open stable dashboard, subtract 2 desktop / 3 mobile from the G-table counts. Mobile stable navigation often still requires Menu → destination; subtracting the entry cost does not remove that menu.
- Desktop with collapsed sidebar adds one click whenever a path relies on a sidebar link. Tablet layouts were not assigned a separate baseline.
- Stable care supports the same reminder record actions as horse care: once its list is reached (G09), opening Actions costs 1, Edit/next-date/Remove dialog costs a further 1. Complete/Reopen controls are inline when eligible. Record availability depends on list filters and permissions.
- Event/training creation includes choosing horses, attendees, type, provider, schedule and audience. These are not inflated into separate “add” features. Editing an existing schedule/status/repetition is a distinct return task.
- Invitation acceptance for stable membership, horse carer access, claims and ownership transfers also has token-entry routes (`/invitations/$token`, `/horse-invitations/$token`). They are conditional email/notification entry flows. H04 counts opening an available notification destination; a universal Home route to every token flow cannot be assumed.
- First-run onboarding, signed-out authentication/recovery, public marketing/blog pages, and development/design labs are outside this signed-in navigation baseline. General direct messaging, deleting an event, and freely editing existing health/weight/medication/nutrition log records were not found as user-facing controls in the inspected production surfaces; do not count backend functions as discoverable UI features.
- Search, filtering, date navigation, chart drill-downs and comparing selected horses are supporting exploration within an opened feature. The table counts the feature entry; arbitrary combinations have data-dependent interaction costs. Permissions, loading, errors and empty states still need live validation.

## What to examine first

Click depth is a measure of navigation effort, not importance by itself. We have no usage-frequency or task-success evidence here. Keep this baseline alongside future measurements of frequency, time to find, wrong turns, completion rate, and mobile usage; do not assign invented usage scores.

1. **Medication is under Nutrition.** Reading medication requires H → Nutrition → Medication (3). Desktop creation takes 4; mobile creation has a 3-click shortcut. Test whether owners look under Care first.
2. **Stable destinations appear only after entering a stable.** Reaching stable care, people, documents or analysis generally takes 3 desktop / 5 mobile. Calendar selection and entering stable management look related but have different effects.
3. **Mobile navigation pays repeated menu costs.** Inviting a stable member or editing a provider takes 7 taps from personal Home. Check whether common yard tasks deserve stable-dashboard shortcuts.
4. **Horse profile edits hide independent tasks inside sections.** Photo and calendar colour take 3 desktop / 4 mobile. Consider contextual entry points that open the relevant edit section directly.
5. **Care actions are spread across Care, Nutrition, Manage and summary pages.** Validate a task-based grouping before adding more navigation links. Mobile's horse Actions menu already provides useful direct creation paths worth preserving.
6. **Shallow paths can still be hard to find.** Personal contact creation is just 1 click because its form is inline. Invitations and alerts can take 0 clicks to reach when present. These need comprehension testing, not further click reduction by default.

Suggested next exercise: choose ten frequent owner/member tasks, test them on phone and desktop with realistic data, and record first-click choice, completion time and wrong turns. Then propose navigation changes and compare the same task paths against this baseline. No redesign is included in this audit.

## Source index

These links identify the production components that supply the paths and controls. Routes that only redirect do not add clicks.

Responsive path evidence: [mobile navigation](../../src/components/layout/MobileNavigation.tsx), [shared sidebar/drawer](../../src/components/layout/WorkspaceNavigationShell.tsx), [mobile dashboard creation menu](../../src/components/dashboard/DashboardCreateMenu.tsx), [mobile stable dashboard](../../src/components/dashboard/command-center/MobileStableDashboard.tsx), [stable roster preview](../../src/components/dashboard/command-center/HorseRosterCard.tsx), [form disclosure defaults](../../src/components/forms/FormLayout.tsx), [drawer account controls](../../src/integrations/clerk/DrawerAccount.tsx).

[Home]: ../../src/components/ownership/PersonalHome.tsx
[Navigation]: ../../src/components/layout/workspaceNavigation.ts
[Events]: ../../src/components/ownership/PersonalAppointments.tsx
[Event detail]: ../../src/components/ownership/PersonalEvents.tsx
[Event form]: ../../src/components/forms/event/EventFormFields.tsx
[Activity people]: ../../src/components/events/ActivityPeople.tsx
[Activity sharing]: ../../src/components/events/ActivitySharing.tsx
[Training]: ../../src/components/ownership/PersonalTraining.tsx
[Training calendar]: ../../src/components/training/TrainingCalendar.tsx
[Horse detail]: ../../src/components/horses/HorseDetail.tsx
[Horse form]: ../../src/components/horses/HorseProfileForm.tsx
[Horse fields]: ../../src/components/forms/horse/HorseFormFields.tsx
[Personal horses]: ../../src/components/ownership/PersonalHorses.tsx
[Horse care]: ../../src/components/horses/HorseCareSection.tsx
[Horse nutrition]: ../../src/components/horses/HorseNutritionSection.tsx
[Horse actions]: ../../src/components/horses/HorseActionMenu.tsx
[Care reminders]: ../../src/components/reminders/CareRemindersCard.tsx
[Health records]: ../../src/components/horses/HorseHealthIssuesCard.tsx
[Nutrition records]: ../../src/components/horses/HorseNutritionLogsCard.tsx
[Weight records]: ../../src/components/horses/HorseWeightRecordsCard.tsx
[Medication records]: ../../src/components/horses/HorseMedicationRecordsCard.tsx
[Horse management]: ../../src/components/ownership/HorseManagementView.tsx
[Sharing]: ../../src/components/sharing/HorseSharingManager.tsx
[History sharing]: ../../src/components/sharing/HistorySharing.tsx
[Documents]: ../../src/components/documents/DocumentsCard.tsx
[Personal contacts]: ../../src/components/ownership/PersonalContacts.tsx
[Stable entry]: ../../src/components/stables/StableListPage.tsx
[Stable dashboard]: ../../src/components/dashboard/command-center/BarnBoardGrid.tsx
[Stable directory]: ../../src/routes/stables/_layout/$stableId/stable.tsx
[Stable settings]: ../../src/components/stables/StableSettingsPage.tsx
[Stable people]: ../../src/components/stables/StableMembersSettingsCard.tsx
[Stable providers]: ../../src/components/stables/StableProvidersCard.tsx
[Stable ownership]: ../../src/components/ownership/StableOwnershipTools.tsx
[History access]: ../../convex/horseTransitions.ts
[Stable care]: ../../src/components/reminders/StableRemindersPage.tsx
[Account]: ../../src/integrations/clerk/header-user.tsx
[Preferences]: ../../src/components/layout/AccountPreferencesDialog.tsx
[Profile]: ../../src/routes/profile.tsx
[Notifications]: ../../src/components/notifications/NotificationCenter.tsx
