# Activity interactions: gaps and plan

Status: audit 2026-11-14 (code reading, four areas), decisions agreed 2026-11-16, all seven phases implemented locally 2026-11-16. Regression coverage: `convex/activityInteractions.test.ts`. Not yet checked in a signed-in browser session.

## Agreed rules

1. **Organizer.** The creator (while still in the event's stable; for a personal event, while still managing one of its horses), plus the stable owner for stable events, controls the shared schedule (title, date, time, location, status, cancel, delete) and per-horse event notes even after other owners' horses are confirmed. Horse owners/editor carers keep control of their own horse's participation and results. `isEventOrganizer` in `convex/libs/eventPermissions.ts`.
2. **Delete vs cancel.** `events.remove` only while no other owner's horse is confirmed, no horse has frozen history and nothing is recorded; otherwise `eventDeleteBlocked`. `events.setCancelled` (also for training) closes pending horse and rider invitations and notifies everyone with a stake.
3. **Withdraw on a recurring event** means "from today on": past occurrences stay as history (`participationEndsAt` = yesterday). A one-off event that has started cannot be withdrawn.
4. **Attendance.** Direct add stays; the person is notified and can leave (`events.leaveAttendance`). Stable-event attendance lapses when they leave the stable or it is archived.
5. **Owner edits a rider's report** → whoever changes status, details or outcome becomes the author; moving only the date keeps the author.
6. **Schedule lock.** A training schedule cannot be moved or have its recurrence rewritten while it holds results the editor cannot edit or has accepted riders (`trainingScheduleLocked`). The editor's own records can still be corrected — a blanket lock would leave a typo'd date with no fix, since delete is also blocked once recorded.
7. **UI.** Buttons and button-shaped tags/labels/chips share one height when placed side by side (`Badge size="action"` beside `sm` buttons; icon menu `size="icon"` beside default buttons).

## What was built

- **Phase 1 – leaks and bugs:** attendee access revoked with stable membership; horseless events no longer editable by invited/declined/departed owners; removed organizers stop getting emails; rider grants end with inviter access or re-add; sharing saves keep other editors' stables; rider can't overwrite owner corrections; future completion bypass closed; owner approval keeps stable sharing; edits keep declined rows and invisible invitations; re-invites show as new; from-today withdrawal; in-progress multi-day events treated as history on departure.
- **Phase 2 – lifecycle core:** organizer model (read, edit, per-horse notes), cancel/restore, delete with cascade, invitations close 7 days after the event (`invitationCutoffDateKey`), Cancel/Restore/Delete menu on event and training detail.
- **Phase 3 – self-service exits:** rejoin after own decline/withdrawal (`events.rejoinHorse`; not after an organizer removal or a from-today series withdrawal), attendee Leave, rider Leave, member Leave stable (`stableMembers.leave`, shared `endMembership` also unassigns their stable tasks), receiving stable owner removes a share (`activitySharing.removeFromStable`).
- **Phase 4 – notifications:** `convex/libs/eventNotices.ts` (`notifyUsers`, `eventFollowers`, `eventHorseKeepers`). Owners hear when someone else books/confirms/declines/removes their horse; followers (organizer, attendees, accepted riders) hear about changes, cancel, delete; participation notices carry the horse; ride invitations appear in the bell; the inbox accepts organizer/attendee/rider access; recurring invitations show the next date.
- **Phase 5 – UI consistency:** stable owner sees member-horse invitations everywhere; Withdraw on stable training detail; admin Withdraw matches the server; from-today withdrawals show as withdrawn; riders see "session changed" and changed sessions leave their calendar; stable routes show not-found instead of crashing; delete-horse copy names carers and appointments.
- **Phase 6 – lifecycle cleanup:** purge removes rider grants, calendar shares and sharing rules; account deletion removes attendance and scrubs ride invitations; a transferred horse leaves the old owner's multi-horse personal events from today on; carried tasks are edited against the horse's current care.
- **Phase 7 – recurrence:** `events.occurrenceSkips` + `events.setOccurrenceSkip`: the organizer cancels one date, a horse's owner sits one date out (non-training; training keeps per-record "skipped"). Applied centrally in `createEventOccurrences`. Calendar rows pass the clicked date to the detail page.

## Deliberately not done

- Invitation emails to editor carers and the stable owner: they already get the in-app decision item; extra email per member invite was judged noise.
- Withdraw buttons on Home cards and the horse page: the event detail one click away has it; list cards stay quiet.
- Explaining a horse mid-move on invitations, and a hint when horses are added after an activity was shared to other stables (documented behaviour).
- Departure still decides past/future by UTC date (only in-progress multi-day events were fixed).
- Rejoining after a from-today withdrawal of a series needs the organizer to re-add the horse.
- A stable owner is organizer of every event in their stable, including one a member later made private to that stable.
