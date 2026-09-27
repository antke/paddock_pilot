# Horse removal and continuation browser confirmation

19 September 2026. Actual `HorseDeletionActionsView` and `HorseProfileForm` in `/page-lab/horse-form`, Edit mode. All mutations and route continuation use the existing local specimen callbacks. No live horse was removed, no backend mutation was called, and no authenticated destination was followed.

## Observed behavior

- At 390×844, opening the confirmation focused Cancel. Choosing the local “Move horse fails once” scenario and double-clicking Move horse showed Moving…; Escape during that pending state left the dialog open. Cancel was disabled during the separate pending-return scenario. Rejection kept the dialog open with “Moving this horse was not confirmed”; it did not claim success. Cancel closed it, focused Move to deleted horses and left Horse name enabled.
- A later failed-move retry, activated by Enter, reached the local horse-list completion state. This confirms the visible failure→retry path; exact callback counts are established separately by the existing tests.
- With “Move succeeds; returning to horses fails once”, the dialog changed to “Juniper moved to deleted horses”, explained the confirmed move and offered Retry continuing. Horse name and Save changes were disabled after acknowledgement. The continuation action used evergreen, while the unconfirmed destructive move retained its destructive treatment.
- The acknowledged error fit a320×568 viewport: dialog x0–320, y61.91–506.09, height444.19, scrollHeight442/clientHeight442, document width 320. Text and both actions were visible without horizontal overflow. The320px dialog intentionally occupies the full narrow width under the current shared recipe; this pass did not add route-specific inset styling.
- At 1280×720, the same acknowledged error was captured. Closing it kept the acknowledged error on the underlying deletion section and focus settled on its surviving Retry continuing button. The horse form stayed locked. Double-clicking Retry continuing showed Continuing… and reached “The sample returned to the horse list. No live horse was deleted.”

One initial post-close observation was invalidated when the development page reset near concurrent documentation writes. The writes were frozen and that scenario was repeated successfully on a stable page. It is not recorded as an application focus defect. A tooltip/alert locator-evaluation timeout was resolved through a fresh read-only DOM observation; no mutation was repeated just because an observation timed out.

## Source and automated evidence

Read `src/components/horses/HorseDeletionActions.tsx` and the existing local specimen. The shared owner separates acknowledgement from navigation, guards repeated requests with a ref, suppresses stale completion after unmount/horse change, and does not call onDelete again after acknowledgement. The specimen uses local 700ms stages and cancels its timers when replaced.

Current focused run: **8 tests passed across 2 files** (`HorseDeletionActions.test.tsx`, `HorseFormPageLab.test.tsx`). These cover pending dismissal/repeat guards, failure/retry, false results, already-pending form saves, acknowledged continuation retry with one removal, unmount/horse replacement, once-only connected acknowledgement toast, and specimen callbacks. Browser evidence does not claim visibility into mutation call counts; those are test assertions. Log: `/tmp/paddock-horse-removal-confirm-tests.log`.

No production code correction was needed in this pass. Full-suite/build results from prior passes were not rerun or presented as current. The same increment separately confirmed the global tooltip sizing change, with 8 tooltip/help tests, full TypeScript and scoped lint passing.

## Screenshots and cleanup

Real, unretouched captures:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/horse-removal-confirmation/move-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/horse-removal-confirmation/return-failure-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/horse-removal-confirmation/return-failure-1280.jpg`

The palm launcher is development-only. Restart sample restored the initial horse form; the viewport override was reset and light theme retained. The tab remains available for the next audit family.

## Boundaries

Backend authorization, 14-day expiry enforcement, actual list navigation and real subscription disappearance require authenticated/backend verification. Browser interruption after unmount was not newly exercised; the existing focused tests cover stale completions. This bounded pass verifies the actual component composition and local interaction, not the live deletion service.
