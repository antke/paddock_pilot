# Horse health and medication implementation — 18 September 2026

Follow-up to `horse-records-source-2026-09-18.md`. Scope: health/medication forms and card owners, thin actual-view samples, shared medication date-order validation and completion boundary. Approved global typography, colors and status semantics preserved. Parent owns section composition and browser evidence; nutrition/weight findings are handled separately.

## Changes

- `HorseHealthIssuesCardView` and `HorseMedicationRecordsCardView` export pure renderers used by production connected wrappers and local samples. Query/mutation hooks remain in wrappers. Each view accepts horse, records/issues, canManage, Promise-returning action callbacks and optional onCreateActionChange.
- Row operations now have independent per-record state and synchronous guards in the view owner. Starting B cannot unlock A, and filtering A out/back does not discard its pending/error state. Resolve/complete failures show persistent inline retry feedback; busy buttons show their operation and identify the target record accessibly.
- Both create forms have unique field/error IDs, linked descriptions, named grouped choices, accurate optional labels, required-state annotations and first-error control refs. Rejections are caught without resetting entries. Pending callbacks protect the shared create dialog against close/Escape until the request settles; success resets/closes only after acknowledgement.
- CreateRecordDialog's global responsive focus return is reused. RecordRemoveAction's global removal handling is reused with a surviving, named focusable list-region target. No duplicate modal implementation or local destructive styling was added.
- Record rows use the global flat variant. Medication's active/planned summary remains visible while filtering history, with flat summary rows rather than nested filled panels. Meaningful status/severity badges remain.
- Medication form and server add schemas reject end dates earlier than start dates at `endDate`. Server completion explicitly rejects an end before the record's start. UI prevents completing a future-start course; dates read “Starts” and “Planned end” when appropriate, and “Ended” only for completed records.
- `HorseHealthRecordsSample.tsx` exports memoized `HealthIssuesSample` and `MedicationRecordsSample` with `{ horse, onCreateActionChange? }`. The memo boundary prevents parent header-action state from triggering an effect/render loop. Populated/empty/read-only scenarios, local failure/retry, delayed acknowledgement and sample interruption guards exercise the real views/forms without live mutation hooks.

## Verification

Eight tests pass across:

- `src/components/horses/HorseHealthRecords.test.tsx` — five DOM regressions: header-mounted local create pending/Escape/failure/retry; health validation and retained failed entries; medication end-date focus/error association; concurrent resolve operations with filtering interruption; actual local samples' failure/retry, read-only state and future-course behavior. A live-mutation-hook guard protects sample isolation.
- `shared/horses/medicationRecordSchema.test.ts` — two form/server schema regressions for reversed/equal/absent end dates.
- `convex/horseMedicationRecords.test.ts` — one isolated convex-test regression proving invalid completion leaves a future course active and same-day valid completion succeeds. This uses an in-memory test database, not a live backend.

Full project TypeScript and scoped ESLint passed. Source was frozen before the parent browser pass. No screenshots or native keyboard/mobile results are claimed by this subtask.

## Remaining limits

Parent still needs actual desktop/narrow inspection of long medication forms, field-error scrolling, reduced motion, create return focus and post-removal focus. The supplied list focus target is source/test-compatible; real browser confirmation matters when a successful mutation unmounts the removed row. Authenticated permissions, live persistence and backend subscription behavior were not exercised.

Date-order enforcement does not redesign the medication model or migrate existing records. Native date input/calendar validation and previously stored impossible date keys remain a separate contract question; this pass specifically enforces chronological order. Completion deliberately has no invented undo or unsaved-state success animation. Local sample outcomes are visibly labeled and never stand in for live saves.
