# Horse profile lifecycle — source audit, 19 September 2026

Read-only next-batch audit. No UI edits, tests, builds or browser operations were performed for this initial audit. This section records the source **before** the authorized lifecycle implementation; the supplements below distinguish implemented changes from first findings. Coverage inventory was unchanged at the initial audit checkpoint.

## Why this is the next family

The [initial horse audit](horse-family-2026-09-18.md) already inspected actual list/profile/form fields, 50-horse filtering, sparse/long records, invalid-name focus, confirmed reset, local successful save and multiline typing. Do not describe those entire views as unaudited merely because some component inventory rows still say unverified. The meaningful remaining gap was the **create/edit/upload/delete lifecycle**, which the existing specimen did not reproduce.

Live consumers verified from imports at the initial checkpoint:

- `src/routes/stables/_layout/$stableId/horses/create.tsx` owned create defaults, upload, `api.horses.add`, feedback and navigation.
- `src/routes/stables/_layout/$stableId/horses/$horseId/edit.tsx` owned access/not-found handling, edit defaults, upload, `api.horses.update`, feedback/navigation and `HorseDeletionActions`.
- `HorseFormFields` was reused by those two routes and `HorseFormPageLab`; the latter was a synchronous edit-like local reset/success harness, not the actual route lifecycle. It had no empty create, delayed submit, rejected upload/mutation, acknowledged-save/failed-continuation or deletion state.
- `HorseDeletionActions` had exactly one production consumer: horse edit. It is separate from the already-audited deleted-horses restore/permanent-removal view.

## Initial source-confirmed findings and bounded scope

### P1 — Horse image rejection happened after upload, without field recovery

`forms/horse/horseFormSchema.ts` accepted `profileImage` through `z.custom<FileList>().optional()` without a file type/size predicate. `HorseFormFields` passed `accept="image/*"` to `FileUploadField`, but the shared field accepted dropped files without validating that hint. The horse field did not forward image field errors or a visible-control focus ref. Both route pipelines uploaded the binary before calling add/update.

The actual backend contract in `convex/horses.ts:assertHorseProfileImageCanBeClaimed` accepts image content types with maximum **5 MiB**; invalid type/oversize could therefore consume an upload and then fail at mutation. This was an interaction/recovery defect, not evidence the server permits invalid images. Align front-end validation with the existing server contract, surface an associated error at the visible upload control and preserve all other draft values. Do not impose a new narrower type policy based only on the generic dropzone's JPG/PNG/WEBP hint.

### P2 — Create lacked safeguards already present in edit

Create used `RouteFormCard` without sticky actions and invoked `form.reset()` without confirmation. Edit had sticky actions and dirty-only reset confirmation. The long field composition was shared, so create still allowed accidental draft loss and separated its actions from later sections. Reuse the existing global contracts and confirm the dirty/pristine behavior in the actual create specimen; do not add another bespoke modal or footer.

Create also caught all submission failures with generic `showAppErrorToast()`. Edit had more useful retained-draft wording, but neither had a persistent in-form failure/retry state in its route. The shared `FormSubmissionError` pattern was available from other audited families.

### P2 — Upload, mutation and continuation were not separate retry stages

Create/edit duplicated the same pipeline: request upload URL → POST image → add/update → success toast → `nav(...)`. No acknowledged upload/storage ID was retained for a later mutation retry; the same selected file would be uploaded again. Navigation was not awaited or represented as a continuation state. A failed/rejected navigation after an acknowledged create had no continuation-only recovery contract; another submission could create another horse. Source alone did not establish that navigation failed in normal use.

Extract a shared actual form with injectable upload/save/continuation callbacks and synchronous duplicate protection. Acknowledge only successful backend stages, retain the saved horse identity, and retry continuation without repeating the mutation. Keep existing server access and image ownership checks unchanged. Preserve deliberate draft/reset behavior; do not silently re-submit a saved image.

### P2 — Soft-delete modal did not guard its pending lifecycle

`HorseDeletionActions` awaited the mutation before showing success, which was correct. However, its controlled `onOpenChange` was passed straight to `setSoftDeleteOpen`, so pending dismissal was not rejected; disabling Cancel/Move did not guard Escape/open-state changes. `runDelete` had only state-based disabled feedback, no synchronous in-flight guard. Errors became a generic toast, with no inline persistent retry explanation. `onDeleted()` was called after closing and was not a staged continuation contract.

Use the same guarded acknowledgement/failure/focus approach as the deleted-horses view. Test pending dismissal and repeated requests, failure retaining the dialog/horse, acknowledged success and navigation recovery. Use local callbacks only; do not soft-delete a real horse to audit this state. Shared AlertDialogAction is a plain Button and does **not** auto-close on click; do not report that as the defect.

## Prior issue to preserve, not silently redesign

Breed selection is intentionally a controlled list. `HorseBreedAutocomplete` commits exact known names on blur, clears unmatched text, and preserves an initially supplied legacy value. Its two existing tests cover exact matching and unknown-text clearing. The earlier horse report explicitly left the silent clearing as an unresolved interaction decision. There is no reason to broaden server breed policy in this lifecycle batch. If addressed, keep the draft understandable, explain controlled-list selection and test keyboard selection/blur/legacy reset rather than silently accepting arbitrary breeds.

Dirty route departure also remained unreviewed: the inspected create/edit sources contained no blocker/beforeunload contract. This is distinct from reset confirmation; do not claim navigation protection exists because the reset dialog works.

## Proposed safe specimen and verification contract

The new specimen should render the actual shared form, with explicit create/edit mode and local-only callbacks. Include invalid/valid image, pending upload, upload failure, mutation failure after successful upload, failed continuation after acknowledged save, repeated submit, reset/cancel and long content. Keep clear local acknowledgement and stable source IDs; no storage POST, horse mutation or authenticated route navigation should occur from the sample.

Meaningful source tests should assert call counts/stage reuse, retained values, no early acknowledgement, synchronous duplicate rejection, focused/associated errors and continuation retry. For soft delete, test pending dismissal and surviving focus. Existing multiline/breed/schema tests remain relevant and should not be replaced by class-string assertions.

After sources freeze, a bounded browser batch can inspect the real create/edit form at desktop/narrow widths, native file control/error return, sticky actions, pending/failure/retry and continuation. Browser unavailability must not be converted into a fabricated visual pass. Real storage/backend timing remains separate even after local callbacks pass.

## Other concrete remaining batches, in priority order

1. **Shared input-choice/help controls in actual forms.** `ChoiceButtonGroup` is consumed by event/horse/health/medication/weight/reminder/provider forms, AnalysisCentre and Style Lab. `RadioGroup` has actual EventFormFields and Style Lab consumers; `ToggleGroup` is used by ChoiceButtonGroup and EventFormFields. Existing page reviews cover selected states, but no dedicated owner review establishes keyboard group behavior across wrapped/card layouts and disabled/error cases. `FormHelpTooltip` is active in EventFormFields, StableFormFields, FileUploadField and Style Lab; help availability/keyboard dismissal and whether any essential instructions exist only on hover need an actual owner pass. These are concrete states, not a reason to re-audit every basic field.
2. **Filter disclosure and sticky positioning.** `ListFilterBar` has direct consumers Style Lab and ListFilterControls; the latter feeds active filtered lists. EventList enables `stickyFilters`, which at this checkpoint uses fixed `lg:top-24` rather than the measured header contract. This is a source alignment risk when header height changes, not a measured overlap. Prior family reviews established search/no-results and some chip operations; remaining bounded owner cases are panel keyboard open/close, active facet removal/Clear all focus, long facet values, hidden controls and sticky behavior with changed header clearance. Do not relabel all previously tested filtering as unverified.
3. **Theme control state, not another colour redesign.** `ThemeToggle` is active in Header. Light/dark clicking has incidental browser evidence, but stored invalid/denied access, auto-mode media-change cleanup, remount consistency and interaction with temporary capture theme ownership have no dedicated control report/tests. Unlike root initialization, the toggle's storage access is unguarded; blocked storage could throw during initialization or after a click. Test supported failure handling locally. This is independent of the already assigned reduced-motion work.
4. **Print output.** `PrintSummary` is actively imported by `HorseCareSummaryPage`; source/DOM identity and print-specific styling already have evidence. The missing state is actual multi-page print output: long history, page breaks, clipped records and print-only action suppression. This is not a zero-source-audit component and should wait for an appropriate print preview/artifact path rather than ordinary viewport screenshots.

## Avoid work on stale labels and unused sources

These source files had **zero static production import consumers** in the initial `src` scan: `AppDashboardNavigation`, `DashboardCareOverview`, `DashboardInlineField`, `StableDashboardAlerts`, `StableHorseCards`, `StableUpcomingEvents`, and `ui/item`. That does not authorize deletion; record them as currently unreferenced and avoid spending browser time searching for nonexistent pages. `DashboardTable` has only the Style Lab consumer, so it needs a specimen-level review rather than an invented production route.

Several unverified inventory labels hide existing substantive evidence: HorseStringListField/horse forms in the first horse report; RecordDialog helpers through CreateRecordDialog's responsive focus tests and member/reminder browser pass; FeatureAccessPrompt through the locked analysis specimen; EventList and horse list/profile through their family passes. Before the next coverage update, reconcile those exact inherited observations, retaining untested exports/states. Do not restart their audits simply to make every filename acquire a new report.

---

# Photo validation and lifecycle test supplement — 19 September 2026

Bounded Impeccable hardening of photo validation and executable lifecycle verification for the new shared create/edit form. Preserved the approved stable-journal components, layout and colors. This is source and local DOM evidence, not browser or backend certification.

## Confirmed correction

`src/components/forms/horse/horseFormSchema.ts` previously accepted any optional `z.custom<FileList>()` value without validating the selected photo. The native `accept` attribute does not constrain drag-and-drop. The schema now rejects a first selected file whose MIME type is not `image/*` or whose size exceeds 5 × 1024 × 1024 bytes, matching `assertHorseProfileImageCanBeClaimed` in `convex/horses.ts`. Exactly 5 MiB remains accepted. Missing and explicitly cleared photos are accepted; cleared `null` becomes `undefined` in validated values. Malformed input lacking an item accessor fails validation without throwing.

`src/components/forms/horse/HorseFormFields.tsx` now forwards that error into the shared `FileUploadField`, associates it with the native input and visible browse/replacement control, and gives the photo input a unique per-instance ID. React Hook Form's focus ref targets the visible control rather than the visually hidden file input. The existing help tooltip states the 5 MB limit. Other field styling and structure are unchanged.

## Lifecycle verification

`src/components/horses/HorseProfileForm.test.tsx` renders the actual form and shared fields without mocking their implementation. Eight cases verify:

- Both create and edit reject rapid repeated submissions while upload/save is pending. The UI disables fields and shows the actual uploading/saving phase; no navigation occurs before acknowledgement.
- A failed mutation preserves the draft and selected photo; retry reuses the already acknowledged upload.
- Replacing the file after a failed mutation uploads the replacement and submits its new storage ID.
- Failed upload preserves the draft and permits removing the photo, then saving without another upload.
- Successful save followed by failed profile opening exposes truthful saved/error state; retry only invokes opening, even with repeated submit during the opening phase.
- Unmount during upload prevents a later mutation and navigation, and clears the reported pending state.
- Invalid horse details, a dropped non-image and an oversized photo prevent upload/save. The photo error is linked to both controls and receives focus through the visible replacement button.
- Dirty reset requires confirmation; cancel retains draft/photo, confirmation restores original details and clears the selected attachment.

No new defect was reproduced in the parent-owned `HorseProfileForm.tsx` lifecycle. Its implementation was not edited in this subtask.

`horseFormSchema.test.ts` adds the inclusive size boundary, MIME/malformed-input rejection and cleared-photo cases. `horseProfileValues.test.ts` checks the parent-owned upload helper: the selected image and MIME type are sent to the supplied upload endpoint; a successful response must contain a nonempty storage ID; failed HTTP responses and missing/empty identifiers reject. The upload helper was not changed. Existing `FileUploadField.test.tsx` also remains passing.

## Checks and limits

Focused run: **23 tests passed across four files**. Scoped ESLint, Prettier and full TypeScript verification passed. Logs are `/tmp/paddock-horse-profile-final-tests.log` and `/tmp/paddock-horse-profile-types.log`.

No real file upload, horse mutation, route navigation, browser session or production build was performed here. Fetch and save/navigation callbacks are local test doubles. The DOM focus assertion does not certify native file-picker behavior, sticky-footer clearance or narrow-screen rendering. The actual create/edit routes and safe page-lab integration remain the parent pass's responsibility. Server MIME/size validation remains authoritative; this change does not inspect or certify image pixel contents. Broader horse-page coverage is not claimed complete.

## Shared route, deletion and specimen implementation supplement

`src/components/horses/HorseProfileForm.tsx` now owns the actual create/edit lifecycle. Both routes delegate to it and keep their existing mutation APIs, edit permission/not-found checks and destinations. `forms/horse/horseProfileValues.ts` centralizes defaults, validated payload conversion and acknowledged upload-ID parsing. The form uses shared sticky actions, dirty reset confirmation and FormSubmissionError. Synchronous guards separate uploading, saving and opening; a retained upload ID is reused only for the same File object after mutation failure. Replacement files upload afresh. Acknowledged horse IDs lock further saves and drive continuation-only retry. Unmount suppresses late next-stage work. No new global type/color recipes were introduced.

`HorseDeletionActionsView` is the query-free owner shared by the connected deletion wrapper and the specimen. Pending blocks duplicate invocation and open-state dismissal. False/rejection remains unconfirmed; acknowledgement is retained across failed continuation and closing/reopening, so retries never repeat deletion or its success toast. Final focus goes to the original trigger before deletion or the surviving named deletion section after acknowledgement. `onAcknowledged` fires once before continuation. The actual edit composition and specimen disable the form as soon as deletion is acknowledged, including while return navigation is still failing; save and deletion pending states also disable one another.

`HorseFormPageLab` now renders that actual shared create/edit form, plus the real deletion view for edit. Empty data still permits the create specimen. All sample upload/save/open/delete/return callbacks are local delayed stages with clearly fictional acknowledgement; no upload helper or real mutation hook is invoked by those callbacks. Failure-once choices, mode changes, Restart and timer cleanup support interruption checks. This is now an actual lifecycle specimen rather than the original synchronous edit-only substitute. Its presence is source evidence; native/browser state verification remains pending.

Deletion and actual-sample focused run: **8 tests / 2 files passed** (five deletion tests and three sample integration tests), with scoped lint, full TypeScript and whitespace checks. Assertions include pending dismissal/repetition, false/rejected response recovery, once-only acknowledgement/connected mock mutation/toast, failed continuation with Close and retry, key-change/unmount suppression, create validation/save/open failure, post-delete form lock and sample restart/mode interruption. No live mutation, fetch, navigation or browser action was performed in those tests. This supplements, rather than replaces, the 23-test photo/form/helper checkpoint above.

## Consolidated source checkpoint and remaining verification

After all source changes froze, the parent reported **463 tests / 95 files passed**, full TypeScript, production Vite build, scoped ESLint and `git diff --check` passed. Logs: `/tmp/paddock-lifecycle-final-tests.log`, `/tmp/paddock-lifecycle-final-build.log`, `/tmp/paddock-horse-lifecycle-types.log`, `/tmp/paddock-lifecycle-final-lint.log`. Impeccable source detector returned `[]` for the targeted shared horse form/deletion/fields/specimen files (`/tmp/paddock-horse-lifecycle-detector.json`); that is not visual or accessibility proof. The separate [motion implementation supplement](motion-source-2026-09-19.md) is included in this source checkpoint.

**No new browser or screenshot evidence.** Tab7 snapshot and a diagnostic read timed out again; the latter reset the browser-control session. The temporary application Dark preference still awaits UI restoration. These source/test results do not confirm native file picking, responsive sticky actions, current focus visibility, corrected landing contrast/layout, actual OS reduced motion or live persistence/navigation. Authenticated route and backend timing remain unverified. Breed controlled-list blur behavior and general dirty-route departure remain outside this correction. No route or project goal is complete.

Material persistence limit: In-flight upload/mutation is not undone on unmount; only subsequent local work/continuation is suppressed. Guards cover the mounted request and acknowledged continuation retry, not server idempotency, lost-response reconciliation or orphan-storage cleanup. Dirty route departure remains open.
