# Directory removal and route recovery browser confirmation

19 September 2026. Bounded verification of remaining local interaction gaps, preserving the global design language. All writes/removals below use local sample callbacks. No live provider, horse, file or associated record was changed.

## Provider removal

Actual `StableProvidersView` in `/page-lab/providers`,390×844. Selected the six-second local delay and Failure, then retry. Opened removal for North County Equine Dental and Preventive Care. Double activation showed Removing…; Escape left the pending dialog open and Cancel was disabled. Rejection kept the record and confirmation present with “Could not remove provider” and explicit unconfirmed-removal copy. The long name, explanation, error and both actions fit the screenshot.

Enter on Remove provider retried. The six-second request outlasted the tool's default three-second observation deadline; a second wait on the same dialog observed completion, without another action. Only the selected row disappeared. Focus settled on the surviving Add provider button, and document width stayed390. Reset sample records restored the local directory.

## Deleted-horse retry

Actual `DeletedHorsesView` in `/page-lab/deleted-horses`,390×844. The local fixture explicitly simulates permanent deletion and performs no server request. Chose Failure, then retry for the long registered-name sample. Pending deletion retained the dialog after Escape. Failure kept the row and displayed “Could not permanently delete horse” with unconfirmed-deletion copy.

Enter retried from that same confirmation. The previous error disappeared while Deleting… was visible. Acknowledgement removed the sample row and closed the dialog; focus remained on a surviving button rather than the body. This observation did not identify that button's exact name. Document width stayed390. Reset sample records restored all sample horses.

A first attempt was interrupted by development-page reloading near source/report writes. No failure/retry result from that reset was counted. The complete scenario was repeated after source and documentation writes were frozen.

## Generic route recovery

A new developer-only `/page-lab/route-recovery` fixture supplies the actual shared RouteError and RoutePending to an isolated memory-history router. Its first local loader deliberately rejects. Later attempts read the explicit sample outcome/delay controls. Real Try again and Go home actions are exercised, without invalidating the outer app router or invoking a backend. Production error components and styling are unchanged. Implementation/test details are in `route-error-recovery-2026-09-19.md`.

At 320×568, the shared error had readable copy and both actions in view; document width stayed320. Tab from Try again reached Go home. With Fail again selected, double activation showed Loading page… and returned to the same actionable error. Focus was observed on the app main-content landmark after the retry transition. Selecting Load successfully and using Enter on Try again showed pending feedback before “Sample page loaded”. The outer URL stayed `/page-lab/route-recovery`.

Restart sample restored the deliberate error. Starting a retry and choosing Open sample home interrupted it; Sample home remained after the delayed loader would have finished. At 1280×720, the error composition was captured and the actual Go home link was activated by Enter. It reached Sample home inside the fixture and kept the same outer URL. Restart sample reset the preview; the viewport override was removed and light theme retained.

No production correction was needed in these three browser passes. Existing global controls, status surfaces and dialogs provided the observed behavior. The only new source here is a safe registered recovery specimen and its isolation/lifecycle tests.

## Screenshots

Real, unretouched captures:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/directory-removal-confirmation/provider-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/directory-removal-confirmation/deleted-horse-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-recovery-confirmation/error-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-recovery-confirmation/error-1280.jpg`

The palm overlay is the development-only TanStack launcher.

## Verification boundary

Focused tests establish request counts, lifecycle and router isolation; browser observations establish the rendered behavior described above. Neither substitutes for authenticated/backend permissions, actual deletion cascades or real failed production service recovery. The new memory-router specimen is a representative shared-owner consumer; it does not credit every app route with a live error-path check. Physical mobile touch, screen-reader speech and real print pagination remain separately recorded boundaries.

## Final combined validation

The combined affected-owner run passed **31 tests across 8 files**: Tooltip, FormHelpTooltip, HorseDeletionActions, HorseFormPageLab, StableProvidersCard, DeletedHorsesCard, RouteError and RouteRecoveryPageLab. Production `vite build` passed after registering the new recovery specimen. Logs: `/tmp/paddock-recovery-confirm-tests.log` and `/tmp/paddock-recovery-confirm-build.log`. The historical full-suite total is not a current full-suite run.
