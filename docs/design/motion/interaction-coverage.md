# Working application interaction and motion pass

Scope: authenticated working application, onboarding and recovery; public marketing and historical studies excluded. Existing uncommitted work was retained and audited. This inventory records implementation, not a claim of authenticated end-to-end verification.

## Direction and ownership

The focal moment is the journal check settling after confirmed care recording. A final outstanding item earns a small drawn ring; failure never earns a check. Routine interactions express continuity, not celebration.

- Motion for React owns bounded collection layout/presence, measured disclosures, local feedback and shared selection surfaces.
- Base UI owns overlay mounting, placement and focus; existing CSS state transitions own their entrance/exit. Sonner owns toast presence and swipe dismissal.
- Native router View Transitions own route snapshots and persistent chrome. No Motion route wrapper or second horse-image transition competes with them.
- CSS owns stationary-target press feedback, colors, focus, checkbox/radio/switch marks and native details. Native selects remain native.
- No stagger, scroll reveal, artificial request delay, invented progress or animation-dependent mutation.

## Inventory and implementation plan

1. Audit existing motion foundation and mutation/presence behavior.
2. Complete shared policy, primitives and representative care/submission/list patterns.
3. Carry patterns through collections, recovery, ownership, calendar, upload and onboarding families.
4. Test failure/retry, focus/removal, rapid reversal and reduced motion; run repository checks.
5. Batch desktop/mobile browser inspection, fix together, confirm at most once; record fixture versus live boundaries.

## Coverage ledger

| Family                        | Implementation / deliberate boundary                                                                                                                                                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Buttons and floating controls | Shared stationary targets; interior press response; color, focus, disabled and pending feedback. Mobile action menus retain Base UI source anchoring.                                                                                                                                                                                                     |
| Selection                     | Checkbox/radio marks, switch thumb, toggle/chip colors, Base UI tab indicator and Motion shared segmented selection. Keyboard semantics stay with Base UI.                                                                                                                                                                                                |
| Overlays                      | Existing menus, autocomplete, combobox, tooltips, dialogs, alerts and mobile sheets use library presence with faster CSS exits. No duplicate AnimatePresence.                                                                                                                                                                                             |
| Disclosure                    | Measured MotionDisclosure for optional forms and filters, including content resize and retained drafts; native details use progressive CSS with immediate fallback.                                                                                                                                                                                       |
| Collections                   | Shared filtered records cover horse care, nutrition, weight, medication, training, events, members and horse collections. Direct lists cover care, documents, updates, contacts, providers, member administration, invitations, calendar agendas and deleted-horse recovery. Initial data does not stagger; background changes get quiet continuity only. |
| Forms                         | Shared stable-width ActionFeedback, pending disabling, existing mutation locks and acknowledged-save recovery; errors remain local and drafts retained. Field errors get a quiet appearance, not keystroke choreography.                                                                                                                                  |
| Care completion               | Server acknowledgement before row confirmation/receipt; final ring requires complete outstanding count at zero; undo/reopen stays server-authoritative with retry and collection continuity.                                                                                                                                                              |
| Calendar                      | Month/week/view changes animate only the working calendar region; header controls and day focus remain mounted. Date selection and event surfaces use quiet color feedback; agendas use keyed presence for live changes and a stable minimum height across empty/single-event dates. Dense grids deliberately avoid per-event FLIP.                       |
| Horse/navigation              | Router-owned transitions, stable identity header across horse sections, active nav feedback. Cross-route photo morph deliberately omitted: multiple horse identity instances and async loading make unique capture unreliable.                                                                                                                            |
| Documents                     | File-selection feedback, drag acceptance, truthful pending spinner, preserved file on failure, retry; confirmed document inserted through MotionList. No simulated percentage or cross-dialog file morph.                                                                                                                                                 |
| Loading/empty/live            | Stable existing loading/skeleton geometry; no page entrance replay on query updates. Empty/list changes use presence; counters change in place without duplicated announcements.                                                                                                                                                                          |
| Milestones                    | Confirmed onboarding step status and successful create/navigation use existing copy and progression. No celebration on resumed onboarding, background sync, access changes or deletion.                                                                                                                                                                   |
| Existing dragging             | File dropzone acceptance and analysis-window pickup/movement/release; no new drag workflow.                                                                                                                                                                                                                                                               |

## Verification

Completed 2026-10-16 using `/page-lab/motion`, an explicit DEV-only local fixture built from production primitives. Desktop CSS viewport 1440×1000 and mobile 390×844 were inspected in one batched round, including light/dark appearance. One performance fix followed: hidden responsive calendar grids no longer schedule change animations. The single confirmation round verified zero active animations on the hidden grid at both widths, while the visible grid retained its directional transition and navigation focus.

Observed in the browser:

- Care pending disables repeated input and shows no receipt; rejection retains retry. Acknowledgement shows the local receipt/final ring; removal makes outgoing rows inert and aria-hidden. Restore reverses the collection state.
- Care button width stayed 159.01px through pending/failure; the submission button stayed 153.55px across idle/pending/error/success. The successful label was the only accessible label slot.
- Failed submission retained the notes and focused its local error. Retry reached confirmed state without a forced delay.
- Rapid disclosure reversal retained typed notes. After file selection resized the disclosure, measured outer/inner heights both settled to 238.55px with visible overflow, avoiding clipped content.
- Removal moved focus to the surviving list; restore/sort maintained a single instance per record. Initial content was visible.
- Dialog Escape restored the trigger; the production reminder editor opened at mobile viewport width and restored its action-menu trigger. Exiting dialogs had no pointer interception.
- Calendar navigation preserved focus on its control, used the six-pixel directional treatment, and retained readable mobile geometry. Segmented selection and tabs remained keyboard/library controlled.
- File selection displayed the real name/size and “Selected · not saved yet.” No upload percentage was fabricated. This was selection verification, not a live upload.
- No horizontal document overflow at either CSS viewport. No application console errors were observed; Clerk emitted its expected development-key warning.

Reduced-motion policy changes, pending label authority, sorting identity, exit focus/inertness, interrupted restoration, retained disclosure drafts and late upload rejection after unmount are covered by automated tests. Real browser OS-level reduced-motion emulation was not available through the preview tool; no claim of that live check is made.

Initial motion-pass validation (before the combined release):

- `pnpm typecheck`: passed.
- `pnpm lint`: passed with three existing backend `no-shadow` warnings and no errors.
- Focused component run: 19 files / 90 tests passed. After the hidden-calendar fix, the affected motion/calendar/upload confirmation run passed 4 files / 28 tests.
- Full `pnpm test`: 215 files / 1,271 tests passed; two existing unrelated failures remain: `designSystemConformance.test.ts` flags a raw button in the pre-existing landing-lab work, and `AppUserStateProvider.test.tsx` expects a footer that the pre-existing application-shell change no longer renders. Neither behavior was changed for this motion pass.
- `pnpm build:smoke`: passed, including anonymous SSR for `/`, `/sign-in`, `/sign-up`, and `/pricing`. No deployment was performed.
- `git diff --check`: passed.

Live persistence, authorization, account switching, email, multi-user synchronization, physical mobile Safari and authenticated route/back-forward/scroll restoration remain unverified here. Existing route behavior and tests were retained. No bundle-size regression threshold exists in the repository.

Screenshots from the collaborative browser are host captures (the host raster contains duplicate compositor tiles at device scale 2; DOM viewport/overflow measurements above are authoritative):

- Desktop controls: `/Users/antek/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvb2nh7i-c12facf9.png`
- Mobile light: `/Users/antek/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvb2nu5s-87329645.png`
- Mobile dark calendar: `/Users/antek/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvb2p7um-027a910c.png`

[Chrome confirmation addendum](verification/chrome-confirmation.md) records the additional local-browser evidence, the final indicator/agenda fixes, and upload-control limitations of that browser.

## Combined release validation

On 16 October 2026 the user authorized deploying all current workspace work together, including the landing studies, shared icons and dark palette. Release preparation replaced the landing gallery's raw archive toggle with the shared Button, retained the router exports in its test mock, and aligned the account-loading test with the existing authenticated footer policy. The two failures above are resolved in this release.

- Full suite: **217 files / 1,274 tests passed**.
- Typecheck and lint passed; lint reports the same three backend `no-shadow` warnings.
- Production build and anonymous SSR smoke checks passed for `/`, `/sign-in`, `/sign-up`, and `/pricing`.
- The design sidecar was refreshed from the current tokens and motion contract. The archived overdrive study's intentional `4.5rem` responsive headline maximum has a file/value-specific detector exception; no global rule was disabled and no unresolved hook finding remains from release preparation.

These release checks do not extend the authenticated live-flow verification claims above.
