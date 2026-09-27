# Documents — source audit, 18 September 2026

Initial read-only Impeccable audit of stable/horse document pages, upload/download/preview owners, their shared dependencies, routes, backend response contracts and the existing document lab. The initial source findings below retain their original line references. A subsequent authorized implementation and its tests are recorded at the end. This agent performed no browser or live file operation.

## Verdict

Document presentation already has substantial deliberate design and functional coverage. The next pass should harden upload lifecycle/error accessibility and make the existing sample honest and interactive. It should not indiscriminately flatten document rows: the style lab explicitly records a visible neutral document boundary, full filenames, legible notes and a stable primary Download action as the document-family treatment.

The detector returned `[]` for `src/components/documents` and `DocumentsPageLab.tsx`. Twelve existing tests pass across download actions, document filters, the upload schema and FileUploadField. This does not verify upload rejection, pending dismissal, deletion focus or actual lab file bytes.

## Route and ownership map

| Surface | Actual composition | Data/effects owner |
| --- | --- | --- |
| `/stables/$stableId/documents` | `StableDocumentsPage` → page header, `DocumentUploadDialog`, shared filter controls, `DocumentsCard` | `stableDocuments.listForStable`, `horses.list`, `useDocumentActions` |
| `/stables/$stableId/horses/$horseId/documents` | Horse route parent → `HorseDetail` active `documents` category → `HorseDocumentsSection` → `HorseDocumentsCard` | Horse route queries/permissions, `stableDocuments.listForHorse`, `useDocumentActions({ fixedHorseId })` |
| `/page-lab/documents` | `DocumentsPageLab` → the real upload dialog, filter controls and document rows | Currently static generated data and no-op write callbacks |
| Per document | `DocumentRow` → `DashboardItemMediaCard`, `DocumentPreview`, Open file, `DocumentDownloadAction`, optional `RecordRemoveAction` | Query-provided file state/URL/permission; callback-driven removal |

The horse child route intentionally returns null because its parent renders the active category; it is not an empty-page bug. Global pending UI is configured in the router. These routes do not add document-specific error recovery, so their actual permission/query-error rendering remains a route-verification gap, not a proven missing screen.

## Prioritized findings

### P2 — Upload can be dismissed during the outstanding request

**Source:** `DocumentsCard.tsx:65-85`; `DocumentUploadForm.tsx:65-82`; `useDocumentActions.ts:19-48`.

The upload dialog passes `onOpenChange={setIsCreateOpen}` and never uses the new shared `CreateRecordDialog.isPending` contract. Its form disables fields/submit while submitting, but Escape, Close and outside dismissal remain accepted. The callback continues through upload URL creation, binary POST and record creation after the form disappears. The code does not abort that pipeline on dismissal.

This is a real policy inconsistency rather than evidence that cancellation undoes the upload. Success already waits for `addDocument`; do not replace it with optimistic success.

**Bounded edit:** expose optional pending notification from `DocumentUploadForm`; have `DocumentUploadDialog` own a synchronous pending guard and feed `isPending` to `CreateRecordDialog`, as now used by member invitations. Catch failures in the form, preserve its file/values, and allow a retry. Keep the dialog open through pending/failure, close only after successful callback completion. Add a synchronous submit guard so repeated/keyboard submissions cannot launch two upload pipelines before disabled state settles.

**Verification:** deferred upload success/failure, Escape and Close while pending, duplicate submit, retry with preserved fields/file, and success closure/focus return. No live storage write is needed for these component tests.

### P2 — Upload rejection escapes the form and has no contextual inline recovery

**Source:** `useDocumentActions.ts:49-52`; `DocumentUploadForm.tsx:65-79`; installed `react-hook-form/dist/index.esm.mjs:3242,3259-3260`.

The real mutation owner reports an error toast and deliberately rethrows. `DocumentUploadForm.submit` awaits that callback without catching it, and its `form.handleSubmit(submit)` promise is attached directly to the native form event. The installed RHF implementation rethrows `onValidError`; it does not consume the application rejection. The production path therefore reports a toast but lets a rejected submit promise escape and supplies no form-local failure context.

Values are not reset on a thrown callback, which is good. The fix should retain that behavior and consume the error at the form boundary. A new global form recipe is unnecessary; this already callback-driven form can show a shared destructive Alert with a brief retry message. The mutation owner can retain its existing toast.

### P2 — Upload validation errors are not programmatically linked to fields

**Source:** `DocumentUploadForm.tsx:90-100,117-135,145-155,181-196,216`; `FileUploadField.tsx:184,204,258,263`.

Document name, type, horse and notes use `aria-invalid` but no `aria-describedby` pointing to their conditional FieldError. IDs are bare names such as `fileName`, `type` and `notes`, so multiple form instances are not isolated. The shared file-upload control likewise renders its error without an id/reference on either the visible browse/replace button or the hidden native input. The field label points to the hidden input, while RHF correctly focuses the visible button via `controlRef`; its error context still needs to follow that button.

**Bounded edit:** per-instance IDs in DocumentUploadForm; linked conditional error ids. Repair the shared FileUploadField error relationship in its owner, including the visible empty dropzone, selected-file replacement trigger and native input. Do not patch each document route with accessibility selectors.

**Other direct FileUploadField consumers to verify:** `AccountProfileForm`, `HorseFormFields`, `StableDesignGuidelines`. Existing FileUploadField tests cover visible control ref, hidden input tab order, selection/drop and reset, but not error description association or two instances.

### P2 — Removal has no surviving focus destination when its row disappears

**Source:** `DocumentsCard.tsx:224-230`; `RecordRemoveAction.tsx`.

Documents delegates deletion to the canonical `RecordRemoveAction`, which guards pending Escape and catches rejection correctly. It has no caller-provided final-focus target, however. Successful removal causes the reactive document row and its trigger/dialog to unmount. This is the same structural failure mode the parent has just observed in member removal, but it has not been browser-reproduced for Documents in this pass.

**Bounded edit:** add a backward-compatible optional surviving-focus callback/ref to `RecordRemoveAction`; supply it from the persistent documents region, or a surviving Add/filter control. Retain trigger focus on Cancel when that trigger still exists. The source pattern warrants a targeted test that actually removes the row, rather than a callback that resolves while leaving the row in place. An inline removal error can be considered in the same shared owner, but the real document mutation already toasts failure; do not report silent production failure as established.

### P2 — The lab's fake success and fragment URLs cannot validate document interactions

**Source:** `DocumentsPageLab.tsx:56,70,100,112,131,161`.

The sample does render real production rows, shared filtering and the upload dialog, which is a useful base. However:

- Add resolves immediately without adding a row. The real form resets and dialog closes although the sample did nothing.
- Remove resolves immediately without removing the record. This masks both actual empty-list behavior and the deletion-focus defect.
- Four purported file URLs are `#document-*` fragments. Download calls `fetch(fileUrl)`, which resolves to the current page URL with a fragment; HTTP does not send that fragment. A successful response can therefore be the application HTML, then saved under the displayed PDF/TXT filename. Open file likewise opens the application URL/fragment, not a sample document. This is a fixture defect, not a backend download defect.
- The SVG specimen is a real local asset and is a useful valid image case. Metadata-only and unavailable states are also represented honestly.
- There is no real empty dataset option: empty stable horse data is replaced with a fabricated Juniper option and seven document fixtures are always generated.

**Bounded edit:** keep the real document composition, add local document state and clearly labeled delayed success/failure callbacks. For file-backed specimens, use valid local asset or Blob URLs containing explicitly fictional bytes with truthful filenames/types; never use hash navigation as a file fixture. Revoke object URLs on reset/remove/unmount. An uploaded local File can be turned into a preview/download Blob URL without contacting storage. Do not claim a real upload or email occurred.

## Secondary concerns — distinguish from confirmed current route defects

- `DocumentDownloadAction.tsx:27-35,63` initializes `isMounted=true` once, then only sets it false in effect cleanup. A StrictMode effect cleanup/setup replay leaves the live component flagged unmounted, so subsequent download completion cannot clear its pending state. No explicit StrictMode wrapper was found in `src`; this is a concrete lifecycle resilience issue under replay, not a claim that today's normal route is stuck. A small setup reset plus a StrictMode test would cover it.
- The download owner already uses an AbortController and duplicate-request ref. Unmount/abort behavior is not covered in the existing tests; add that alongside the lifecycle fix rather than replacing the working download flow.
- Upload automatically copies the first selected filename only while Document name is empty. Replacing the selected file preserves the old name. This may intentionally preserve the user's custom document label; before altering it, distinguish untouched automatic names from deliberately edited labels. It is not a priority defect without that product decision.
- FileUploadField shows “Ready to upload” while its disabled controls are pending; the form button says “Uploading…”. An explicit upload-stage label could improve consistency, but it is secondary to protecting the request and presenting failures.
- Storage POST can succeed before the subsequent document mutation fails. This audit did not investigate orphan cleanup or change storage authorization; do not present a UI retry improvement as proof of backend cleanup. Existing backend validation checks stable/link permissions, storage claimability, size and content type.
- No arbitrary size/type restrictions are invented here. The current schema requires a file and bounds the document name/notes; any new upload limits need an actual product/backend contract.

## Shared style ownership — preserve intentional differences

`DocumentsCard` owns document-family composition and the deliberate `DashboardItemMediaCard chrome="cards"` plus neutral `border-border` boundary. `StableDesignGuidelines` explicitly describes this document treatment. It differs from flat people/provider rows for a documented reason; do not mechanically remove its border based on the new roster defaults.

The full filename is already unclamped with `line-clamp-none` and anywhere wrapping. This avoids the invitation-title truncation found in the previous family. Document preview size, object containment, empty-alt decorative image treatment, lazy loading and failed-image fallback belong in `DocumentPreview`. `DocumentDownloadAction` owns stable pending width, spinner, unavailable reason/tooltip and preserved download filename. These local classes implement domain layout or functional state, not rogue brand colors/fonts.

The warm app typography, colors, alerts, buttons, filters and forms already come from shared owners. No new font/palette or decorative-layer update is justified by this source audit. Check real mobile overflow and the document card hierarchy before any visual refinement.

## Smallest safe specimen plan

No new mutation seam is needed for `DocumentUploadForm`, `DocumentUploadDialog`, or `DocumentsCard`: they already accept effect callbacks. The current lab can become a real local specimen by owning an array of DocumentListItems, valid local URLs, pending outcome controls and local add/remove callbacks.

1. Preserve stable-wide mode using the real horse-scope/type/file filters. Add a horse mode with `fixedHorseId`, a single horse's documents and the actual horse-title/description; keep stable-wide and horse permission claims explicit sample settings. If exact page composition must be shared, extract thin query-free page/card views later rather than importing the lab into production.
2. Cover available valid text/PDF asset, valid image, image preview failure, metadata-only, unavailable, long filename/notes, linked horse/event, manager and viewer rows, empty dataset and filtered-empty state.
3. Exercise local add → new visible row → valid local download; delayed add failure/retry; delayed remove failure/retry → actual row disappearance → surviving focus; reset after pending completion. Include full keyboard and mobile checks in the parent's browser pass.
4. Test real backend access/storage/delivery separately. Local samples cannot prove permissions, signed URL validity, storage MIME checks or cleanup.

## Verification performed

Ran existing tests only:

`vitest run src/components/documents/DocumentDownloadAction.test.tsx src/components/documents/documentListFilters.test.ts shared/stables/stableDocumentSchema.test.ts src/components/forms/FileUploadField.test.tsx`

Result: 4 files, 12 tests passed. They cover successful filename-preserving download/object URL cleanup, duplicate download prevention, recoverable download errors, unavailable controls, filter behavior, file-required validation, and the shared uploader's basic selection/focus-ref/reset behavior. They do not cover the findings above. The source detector returned no findings; no numeric visual score or whole-route verification is claimed.

Recommended implementation order: upload lifecycle/error/accessibility → honest stateful local files → deletion focus → download effect replay/abort test → bounded browser polish. Preserve the documented document-specific boundary and current colors/type throughout.


## Authorized implementation follow-up

The parent authorized a bounded hardening pass and an honest local document fixture. The findings above describe the pre-fix source; the changes below are now implemented. The document-family visual treatment remains intact.

### Upload lifecycle and accessible errors

`DocumentUploadForm` now owns a synchronous request guard, an independent pending flag, optional `onPendingChange`, and an inline shared Alert for a rejected callback. It consumes the rejection, preserves the selected file and field values on failure, and resets them only after successful acknowledgement. Reset explicitly clears the file field. Repeated submits cannot initiate a second callback or make the controls appear idle while the first request is pending.

`DocumentUploadDialog` forwards pending state into the already-shared `CreateRecordDialog.isPending` contract and synchronously rejects dismissal through its open-state callback while uploading. It closes after `onAdd` resolves, preserving the production mutation owner's awaited success/error toasts. `useDocumentActions` required no backend or behavioral rewrite.

Per-instance form IDs now link document name, type, optional horse and notes to their errors. `FileUploadField` owns the corresponding error relationship on the visible dropzone/replacement control and native input, while preserving caller-provided descriptions. Its controlled file reset also clears the native input value so choosing the same file again can trigger a fresh selection.

### Removal and download ownership

Shared `RecordRemoveAction` gained a backward-compatible optional `removalFocusTarget`, a synchronous pending guard, inline failure feedback and final-focus handling. The caller can supply a surviving region/control after the record disappears; Cancel retains its connected original trigger. `DocumentsCard` provides a persistent named Documents region for both supported outer compositions and supplies this callback to each row. The actual local test removes the last row and verifies focus remains on the now-empty Documents region rather than BODY.

`DocumentDownloadAction` resets its mounted marker during effect setup, making pending completion safe under StrictMode effect replay. Abort detection also checks its own request signal, so canceled requests do not depend on a cross-realm DOMException passing `instanceof Error` before suppressing the error toast. Download width, filename, primary styling, unavailable tooltip, preview and document-card boundary remain unchanged.

### Real local document sample

`DocumentsPageLab` keeps the real `DocumentUploadDialog`, `DocumentUploadForm`, shared filters and `DocumentsCard`. It now owns local document state behind the existing development sample gate.

- Four fragment “file URLs” were replaced with Blob URLs containing actual nonempty fictional `text/plain` bytes. Their names now truthfully end in `.txt`; they are not presented as fake PDFs. The real local SVG mark remains a valid image specimen. File-backed fixture sizes that did not represent their actual bytes were removed rather than displaying invented sizes.
- Selecting a File and successfully adding it creates a Blob URL for that exact File and a local row. No generateUploadUrl, POST, Convex mutation or live storage hook is used.
- Add/remove have delayed success or a rejected request followed by retry. Changes apply only after acknowledgement. Failed upload preserves the form; failed removal preserves the row/dialog and exposes the shared inline error.
- Remove revokes the local file URL and actually removes its row. Empty/reset controls revoke owned URLs and change the dataset. Unmount revokes remaining owned URLs.
- A mount epoch guards delayed completion. Leaving the sample or switching its stable before completion prevents later state changes and creation of an orphan Blob URL after cleanup.
- Stable/first-horse scope and manager/viewer controls expose the existing permissions and fixed-horse form contract without claiming live authorization. Controls that replace the sample or change outcomes disable during outstanding sample mutations.
- Open and Download operate on real local sample files. The page explicitly states that Download saves the sample to the viewer's device; the agent did not execute a real browser download. Test downloads use mocked fetch/object URLs/anchor activation.

The sample is still a query-free composition, not an authenticated route. It cannot verify real storage URLs, database permissions, MIME claim validation, storage cleanup or network throughput. No new PDF renderer, file policy, MIME restriction, image asset generation or backend cleanup behavior was invented.

### Shared consumers requiring regression awareness

`FileUploadField`: `DocumentUploadForm`, `AccountProfileForm`, `HorseFormFields`, `StableDesignGuidelines`. The generic control's existing selection/drop/ref/reset tests were rerun; full account/horse route behavior is not credited as verified.

`RecordRemoveAction`: `DocumentsCard`, `CareRemindersCard`, `StableDesignGuidelines`, plus the `HorseRecordRemoveAction` alias used by `HorseHealthIssuesCard`, `HorseWeightRecordsCard`, `HorseNutritionLogsCard`, `HorseMedicationRecordsCard`. Documents opts into the new surviving focus target. Other consumers preserve the compatible default; they must pass a target during their own family audit if their trigger can disappear. Shared pending/error handling improves in all consumers, but their routes were not visually verified here.

### Validation and remaining browser work

22 tests pass across seven files: `DocumentUploadForm.test.tsx`, `DocumentDownloadAction.test.tsx`, `documentListFilters.test.ts`, `stableDocumentSchema.test.ts`, `FileUploadField.test.tsx`, `DocumentsPageLab.test.tsx`, and `designSystemConformance.test.ts`.

New meaningful coverage includes unique/error-associated fields and visible file control; repeated upload, rejected values and fixed-horse acknowledgement/reset; StrictMode download completion; abort without toast; valid local Blob URL/type/bytes metadata; viewer/empty sample; pending invite-style upload dismissal; acknowledged local file creation; remove failure/retry and Cancel/surviving focus; and no late Blob URL after unmount. All existing download/filter/schema/file-field checks still pass. Scoped ESLint and full `tsc --noEmit` pass. An unsupported lint-rule suppression was removed after lint exposed it; no runtime rule was disabled.

UI source was frozen and handed to the parent for browser verification. Pending browser checks: desktop/mobile upload failure/retry with actual file selection, row removal/focus, long filenames and errors at narrow/short viewport, keyboard progression, reduced motion, dark theme, download/open behavior with local bytes if explicitly exercised. This report does not claim those browser outcomes before the parent's evidence is recorded.
