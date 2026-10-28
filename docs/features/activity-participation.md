# Activity participation and combined calendars

This local first release extends the existing canonical events, horse participation links, and training records. It supports an occasional rider without requiring horse-carer access. Existing records and history remain intact; no migration of existing records is required.

## Invitations and access

- An owner, editor carer, or custodian can invite a person by email as **rider** or **instructor** for a confirmed horse and an existing occurrence date. Stable membership alone is insufficient. The horse must be active and outside an ownership transition.
- Invitations appear on the recipient’s Events and Training pages when their signed-in account matches the invitation email. No email is sent. Acceptance binds the invitation to the account; legacy free-text rider/instructor names do not create grants.
- `activityParticipants` stores the event, horse, exact `eventsHorses` link, occurrence date, normalized email, optional accepted account, role, inviter, timestamps, status, and a limited session snapshot. States are `invited`, `accepted`, `declined`, and `revoked`. A fresh invitation after decline/revocation creates a new row.
- Pending invitations and acceptance require a still-valid session and an inviter who remains authorized. Accepted participation gives a narrow schedule and own-report view, not the horse profile, other horse records, or private owner notes. Existing activity sharing continues to govern stable visibility.
- Authorized horse managers can remove access. The server also permits the bound participant to revoke their own grant; this release has no participant-facing leave button. Revocation removes the participant view and reporting rights but preserves the canonical training report.
- Accepted participation can remain as limited personal history after membership or session changes. It is not automatically revoked when the inviter loses access. Reporting requires the original confirmed horse link and a still-existing occurrence; ended/replaced participation, horse deletion/transition, or a changed session can disable reporting without deleting history.

## Ride reports

Only an accepted **rider** on a **training** occurrence can submit a completed report. Instructors and non-training participants have schedule access without this report action. The form captures work types, format, optional duration, and outcome; it initializes from the rider’s own report or the permitted planned work types, format, and duration. The server supplies the rider’s account display name.

Reports use the existing `trainingRecords` entry keyed by event, horse, and date. The owner sees the same result through existing authorized horse history. A rider may create a report or update one they recorded; they cannot overwrite another person’s report. The narrow view exposes only their own report details, plus whether another report exists and its status. Participant-only dates disable ordinary horse-level completion controls. The calendar can display the rider’s canonical report as read-only; edits use the dedicated participant report form. The interface enables reporting on or after the scheduled local day; the server also rejects future dates using its date-boundary allowance.

## Calendar scope

Events and Training always include **My calendar**, shown checked and non-clickable, and can add accessible named stables. Each source is authorized before merging. Selecting a calendar changes discovery, never sharing or grants. Personal sources include owned/carer horses and accepted activity participation; the latter remains a minimal session projection. Merging preserves horse-specific and historical projections while avoiding duplicate current training entries. Authorized sources are combined by union: a shared calendar’s restriction does not cancel a separate personal grant. Accepted participation adds visibility only for its exact horse and occurrence, including when merged into a shared recurring series.

Selections persist in tab-session storage separately for Events/Training and each workspace context. Defaults are My calendar on general pages and My calendar plus the current stable on stable pages. Restoring older saved filters also includes My calendar. Removed memberships are excluded from the request. Deselecting all stables leaves the personal calendar active; the server allows up to 30 stable calendars. Calendar results stay visible while a changed selection loads, and the displayed source context stays with those results. Scope or membership changes discard retained results. Selectors sit below the month heading; the horse colour legend follows the calendar.

Global navigation has fixed Home, Events, Training and Horses destinations, plus a Stables entry. The global workspace picker is removed. Stable pages retain a local switch to open another stable and local stable overview, roster and management links; opening a stable does not retarget the daily navigation. Combined page headings omit the workspace suffix. Other horse/care pages retain their explicit URL scope. The Home dashboard uses the same selectors under its heading, with a separate remembered selection and My calendar always active. Its events, training, care/reminder summaries and horse roster come from one server-authorized snapshot. Changing sources retains that snapshot until the replacement arrives; membership or day changes discard retained data.

`dashboard.view` composes the same activity sources as Events and Training and the existing care overview rules. It deduplicates shared events, training reports, horses and reminders. Personal care stays visible; a selected stable adds its shared clinical details only where the viewer has detail access, and its authorized reminder schedules. Stable roster membership adds basic horse identity, not private profile access: rows without profile permission are not links. Accepted activity participation can supply a training card without adding the horse to the user’s roster. Pending horse invitations remain an account-level inbox rather than being hidden by source filters.

## Multi-stable activity sharing

Creation forms reuse the calendar source checkbox component. **My calendar** is automatic: it stays selected for personally editable horses; entries involving horses that require stable-based permission use the selected stable. Owners and authorized carers retain their existing access. Selecting no stables creates a private activity. Selecting multiple stables shares one canonical activity and its linked training results with those audiences. Each selected stable requires current membership, and sharing outside a horse’s existing stable requires owner/editor access to every selected horse. Stable custodians and members using the existing horse invitation flow remain limited to that horse’s stable; completed training still requires recording permission.

`activityCalendarShares` stores the event, selected stable, sharing author and explicitly granted horse IDs. It does not grant horse profile access. Reads revalidate both the recipient’s and sharing author’s stable membership, the author’s current horse editing authority, active horse state and the horse’s continued inclusion in the event. New horses added later are not automatically included in an old grant. Ordinary members receive scheduling data and result status; stable owners may read shared activity details. Explicit calendar sharing never grants editing rights. Deleting/revoking a grant preserves the event and training reports.

An owner/editor with access to every horse can change explicit stable audiences from the activity detail page using the same source controls. Legacy sharing to the original stable remains governed by per-horse placement/occurrence sharing; the original stable is a read-only choice in this control, with its actual all-horse visibility shown. The existing audience disclosure includes explicit activity calendars so a shared activity is not mislabeled private. Stable-only recipients open a narrow, read-only activity detail; their access does not extend to other horse records.

## Whole-day scheduling

Event and training forms offer a **Whole day / Cały dzień** switch beside Time. `time` stores either a validated `HH:mm` wall-clock value or the reserved `all-day` value; it never substitutes a fake midnight time. Calendar/list/detail labels localize that value, whole-day entries precede timed entries on the same date, and date badges use a date-only machine value. Training duration can still be recorded but does not invent a start/end range for a whole-day session. Existing time values and recurrence dates require no migration.

## Local interface extension

The established `DESIGN.md` identity remains authoritative. This extension reuses its cards, buttons, inputs, and semantic colors without defining a new visual system.

- Calendar and work-type groups use fieldsets, legends, labeled checkboxes, and wrapping choices with generous interaction height.
- Invitation and report forms use associated labels and full-width field containers; invitation fields become two columns where space allows. Participant rows and action groups wrap, and long email addresses can break within the line.
- English and Polish copy distinguishes invitation, acceptance, removal, limited access, and existing stable sharing. In-app delivery is stated explicitly.
- Calendar regions expose loading through `aria-busy`; mutation controls disable while saving. Success feedback uses status announcements and mutation failures use alerts. Invitation sections render only when data is available and relevant.

Desktop and 390px mobile browser checks inspected the controls and confirmed full-width invitation fields. Bounded code review cleared the identified fixes. These checks are not screenshot-based visual certification; final verification is tracked by the implementation task.

## Implementation references

- `convex/activityParticipants.ts`: invitation lifecycle and narrow report access.
- `convex/activities.ts`, `shared/events/activitySources.ts`: authorized calendar composition and detail routing.
- `convex/dashboard.ts`, `convex/userCareOverview.ts`: coordinated dashboard source aggregation and care metrics.
- `src/components/dashboard/useDashboardData.ts`, `DashboardHorseList.tsx`: retained dashboard snapshots and permission-aware roster rows.
- `convex/activitySharing.ts`, `convex/libs/activitySharing.ts`: explicit activity audiences, live authorization and narrow projections.
- `convex/schema.ts`: participant and activity calendar grant schemas alongside existing canonical records.
- `src/components/events/ActivityPeople.tsx`, `ActivityCalendarFilter.tsx`, `CalendarSourceChoices.tsx`, `ActivitySharing.tsx`, `SharedActivityDetail.tsx`, and `activityCopy.ts`: semantic controls, persistence integration, and bilingual copy.
- Personal and stable Events/Training route integrations retain existing horse-based detail access and add the participant-specific view.

## People selected in the activity form

Events and training have a separate **People / Osoby** card selector beside the horse selection. Selecting a horse preselects its owner when that account is available; the owner can be deselected without removing the horse. Existing attendance is preserved on edit. People can be selected without owning a participating horse. Removing a horse keeps selected people so it does not silently cancel their attendance.

Available accounts are fellow members/owners of the creator's active stables, the creator, and owners of their editable horses. This list is independent of selected calendar audiences. Server validation checks new attendees against those accounts. Previously selected attendees can be retained or removed after membership changes.

`events.peopleIds` and the indexed `eventAttendees` links are written together in the authorized create/update transaction. Attendance adds the activity, including its recurrence, to My calendar immediately. It is an attendance list, not the existing invitation-and-acceptance flow for rider reporting. Removing a person removes their attendance grant; separate horse, carer, stable, or accepted rider grants remain intact. Attending names are shown on the activity detail.

The attendance projection contains schedule, basic horse names and training completion status. It excludes descriptions, costs, phone numbers, training details and outcomes, and grants no horse profile, editing, completion or rider-report permission. Horse owners retain their normal horse access even when not attending. The existing per-horse rider/instructor invitation flow remains available for assigning and authorizing an occasional rider.

The People picker follows the creation form's calendar selection: personal horse owners and the current user remain available through My calendar; selected stables add their members, including members without horses. Previously selected attendees remain visible for removal. The smaller horse-name line uses only the horses available in that form scope. Horse cards resolve the linked owner's current account name, rather than relying on an older free-text owner label.
