# Project delight — 10 October 2026

## Direction

The intended feeling is: **“That detail is taken care of; I can get back to the horse.”**

Build on the existing interaction and page-transition work with brief, earned confirmation at the point of action. Keep the established typography, palette, layout and permissions. Use the existing success animation and reduced-motion rules; no new animation library or global motion layer.

## Findings and implemented changes

| Everyday interaction                          | Friction                                                                                                  | Change                                                                                                                                                                                                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copying horse identifiers or invitation links | Confirmation was detached from the control used.                                                          | The control shows pending feedback and a brief check or “Copied” only after clipboard success. Duplicate pending operations are prevented. Confirmation resets when the underlying value changes.                                                                     |
| Submitting shared forms                       | Pending text could resize buttons and shift adjacent actions.                                             | Shared action feedback reserves space for every label, exposes only the current label to assistive technology, and keeps the existing disabled/busy behavior.                                                                                                         |
| Selecting an attachment                       | A selected file could appear finished before the form was saved; mobile instructions emphasized dragging. | “Selected · not saved yet” distinguishes selection from persistence. Mobile uses “Choose an image/file”; desktop keeps drag guidance. The selected filename is announced, focus follows replace/remove controls, and cancelling the picker retains the selected file. |
| Downloading a document                        | Browser handoff had no explicit completion cue.                                                           | Show “Download started” and announce the filename after handoff. This does not claim the browser has saved the file to disk. Failures retain recovery feedback.                                                                                                       |
| Undoing reminder completion or dismissal      | The recovery mutation lacked visible progress and clear retry feedback.                                   | Identify the reminder, show “Restoring reminder…”, then success or an error with Retry. Prevent duplicate Undo requests. Retry only reopens the reminder; it does not repeat completion or create another follow-up.                                                  |

Existing task-specific empty states and the newly implemented navigation motion were retained. This pass concentrates on shared action behavior that benefits multiple pages.

## Shared implementation

- `src/components/ui/action-feedback.tsx`: stable-width pending/confirmed labels with accessible current state.
- `src/lib/useTransientConfirmation.ts`: brief confirmation scoped to an identity, with timer and unmount cleanup.
- `src/components/forms/FormSubmitActions.tsx`: shared form submission feedback.
- `src/components/forms/FileUploadField.tsx` and `src/components/ui/attachment.tsx`: truthful selection state, mobile guidance and focus recovery.
- `src/components/horses/HorseProfileSection.tsx` and `src/components/stables/StableInvitationsList.tsx`: clipboard feedback.
- `src/components/documents/DocumentDownloadAction.tsx`: download handoff feedback.
- `src/components/ui/sonner.tsx` and `src/components/reminders/useCareReminderActions.tsx`: promise-driven Undo feedback and retry.
- English and Polish catalogs include all new visible and announced messages.

## Verification

- Full frontend suite: **843 tests passed across 161 files**. Tests cover confirmation expiry and identity changes, pending accessible labels, clipboard failures, download handoff, attachment picker cancellation/focus, and Undo failure/retry/duplicate prevention.
- Following the final narrow-screen attachment correction, **18 focused tests across three files** passed, including attachment forms and locale parity/interpolation.
- TypeScript, targeted ESLint, formatting checks and the production Vite build passed.
- A temporary browser preview rendered the actual shared components with illustrative data in English/light and Polish/dark. It used no account records or backend mutations. The preview files and temporary server were removed afterward.
- At 390 × 844, an English submit button remained 170.85 × 44 px before and during submission. Identifier copy controls were 44 px on mobile and retained their 32 px desktop size.
- A long selected filename exposed a narrow-screen overflow caused partly by a hidden announcement inheriting automatic width. Explicit containment and a 1 px screen-reader region resolved it: zero horizontal overflow at 320, 390 and 1440 px.
- Native picker selection moved focus to Replace; copy and download confirmations appeared only after their corresponding operation succeeded.

## Limits

The available app browser was signed out. Signed-in personal/stable workflows, physical-phone keyboard behavior and real-device performance were not reverified in this pass. Browser evidence comes from shared components in isolation. Reduced-motion behavior reuses the existing CSS policy; an operating-system reduced-motion setting was not exercised manually.
