# Deleted horses audit — 18 September 2026

Scope: real `DeletedHorsesCard` / shared `DeletedHorsesView`, safe `DeletedHorsesPageLab`, and restore/permanent-removal state transitions. Impeccable craft-floor used with the approved global journal design. Browser screenshots and authenticated checks remain pending; no live destructive actions were taken.

## Findings and fixes

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | Permanent-delete dialog could be dismissed using Escape while the request remained pending | The controlled dialog now rejects dismissal while its synchronous request guard is active. Confirm/cancel and row actions are disabled during pending; repeat requests are ignored. |
| P1 | Failures offered only generic toast feedback | Restore failures remain beside the record; deletion failures remain in the confirmation dialog with clear retry/cancel guidance. No error is converted into success. |
| P2 | Removing/restoring a row could leave keyboard focus on the page body | Successful restore focuses the surviving Deleted horses section. Dialog close uses the existing delete trigger or the surviving section/its first control after row removal. No initial focus grab. |
| P2 | Copy implied a guaranteed deletion date and suggested restoration was impossible afterwards | Source inspection of `convex/horses.ts` confirms 14 days is permanent-removal eligibility. Restore still works while a deleted record exists, including after the window. UI now states eligibility and uses server-provided `canPermanentlyDelete` for destructive action availability. |
| P2 | Deleted rows used nested card chrome | Rows now use the global flat variant. Empty state is flat as well. No local color/typography overrides introduced. |
| Verification gap | Prior settings lab represented deleted horses with an inert record | New development-fixture-only specimen uses the actual view with local restore/delete callbacks, pending/failure controls, recent/expired windows, long name, owner/horse-owner permissions and empty state. |

## Verification

- Full TypeScript check passed after the implementation.
- Three targeted DOM regression tests passed: permanent-delete capability hiding while restore remains available; repeated/pending restore, failure/retry and focus after success; required permanent-delete confirmation, pending Escape/repeat guard, failure/retry and focus after successful removal.
- Scoped ESLint passed. No new dependencies or local styling system added.
- Production mutation wrappers still await Convex before showing success; view callbacks reject failures. Fixture callbacks change local sample state only.

## Remaining checks

Desktop/mobile browser composition, keyboard behavior in the actual preview, no-overflow long-name rendering, empty and horse-owner views, and reduced-motion behavior need captured evidence. The parent audit will register the specimen and verify these. Authenticated owner/horse-owner access, real restore/delete failures, purge races and actual linked-record deletion remain backend verification gaps. The safe sample does not prove backend cascade semantics; its confirmation text follows the existing implementation contract.
