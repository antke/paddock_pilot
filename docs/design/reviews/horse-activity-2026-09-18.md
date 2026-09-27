# Horse activity — bounded implementation and source tests

18 September 2026. Impeccable hardening pass for the data-only `HorseActivitySection`, following the findings in [horse record source audit](horse-records-source-2026-09-18.md). The approved typography, colors, filters and global flat row treatment remain intact. No browser or live mutation was performed by this subtask.

## Event contract and behavior

The actual event status contract is `planned | completed | cancelled` (`shared/events/eventSchema.ts`). Convex stores the field as optional for older records; the existing event comparison in `convex/events.ts` defaults absent status to planned. The new activity grouping helper follows that convention without mutating inputs, so legacy records also appear when the Planned filter is selected.

- Upcoming: planned events with a date today or later, in ascending date/time order.
- History: all completed and cancelled events regardless of date, plus earlier-dated planned events, in descending date/time order.
- Every supplied event appears in exactly one group. Grouping uses the event's date, not completion timestamp; no artificial completion date is invented. The History description explicitly explains why a future cancelled event is present.
- The app's existing `useLocalDateContext` updates the bucket at local midnight. Search results retain chronological order rather than relevance order.

`HorseActivitySection` now resets its local tab/filter state when the horse identity changes. The same real section, existing filters, Add event link and EventRow links serve production and the sample. Rows use the shared `flat` treatment. Constrained lists carry the horse's name and activity-group name and remain keyboard-focusable through the existing shared ScrollableList; Expand increases visible space without slicing away records.

## Safe local specimen

New `HorseActivityPageLab({ data: DashboardLabData })` is gated to development sample routes. Parent registration target: `/page-lab/horse-activity`.

The specimen provides mixed statuses (completed today, cancelled in the future, earlier planned, and legacy status), 40 long events, empty, and missing-horse cases. Search produces a real no-result state and Clear all recovery. The missing scenario is a labelled fixture alert because the production parent route owns entity availability. It is not evidence of authenticated missing-horse routing.

The specimen explicitly explains that Add event and event links leave for the real app and may require sign-in; sample IDs are not saved records. No Convex mutation hook is mounted and no local state pretends to save events. Existing Add event behavior still requires selecting the horse on the destination form.

## Verification and limits

Five tests pass in `HorseActivitySection.test.tsx`:

1. Exhaustive one-bucket membership, status normalization, chronological order and no input mutation.
2. Actual local-midnight date hook moves a prior-day planned event into History.
3. Actual shared UI displays truthful History and retains route links; sample mounts no live mutations.
4. Planned filtering includes legacy records; no-match search recovers through Clear all.
5. Named focusable long-list regions preserve all 20 rows in each bucket, compact/expanded history, and empty versus missing sample state.

Scoped ESLint and formatting pass. The full TypeScript run during concurrent work reported two unrelated in-progress errors: unused `horse` in `HorseWeightRecordsCard.tsx` and missing `HorseNutritionRecordsSample` imported by `HorseRecordsPageLab.tsx`. No TypeScript success is claimed for this aggregate run; parent owns final validation after those files settle.

Source is frozen for the parent's browser pass. Desktop/mobile appearance, native keyboard PageDown, text scale, dark/reduced motion, midnight behavior in a real browser and authenticated routes/permissions remain open. DOM focusability tests do not establish actual browser scrolling. No inventory update is included in this activity implementation task.
