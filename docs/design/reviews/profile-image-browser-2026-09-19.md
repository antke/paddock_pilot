# Profile image — local browser confirmation

19 September2026. Parent browser observations of `AccountProfileFormView` and the actual shared `FileUploadField` through `/page-lab/profile`. Files were selected locally; the specimen uses simulated save callbacks. No actual upload, storage request or profile mutation occurred.

## Observed interaction and correction

An invalid text file remained selected while validation blocked submission. Replacing it with a valid palomino image allowed the local save attempt; simulated save failure retained the selected image. Replacing that selection with a portrait and retrying by Enter reached local success and cleared the file selection. This is actual chooser/selection and local form lifecycle evidence, not a completed upload.

The shared field previously displayed Ready to upload beneath a selected invalid file. That generic caption has been removed at `src/components/forms/FileUploadField.tsx`, so selection does not contradict validation or imply a confirmed upload readiness state.

After correction at320, the selected invalid TXT file displayed61B and Choose an image file feedback, with no Ready to upload caption. Focus was on Replace and the document had no horizontal overflow. The specimen was reloaded/reset afterward.

## Screenshots

Real parent-inspected captures. The before image deliberately records the misleading caption; it is not the corrected state.

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/profile-image-confirmation/invalid-before-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/profile-image-confirmation/save-failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/profile-image-confirmation/invalid-after-320.jpg`

## Validation and boundaries

The caption correction's earlier focused run passed10tests/3files. This is a focused checkpoint, not a current full-suite or production-build claim. The browser confirmation supplies the actual invalid-file/replacement/failure-retention state missing from [public/account browser evidence](public-account-browser-2026-09-19.md).

The profile-image local priority is bounded-addressed. Actual storage/upload/persistence, authenticated identity/permissions, network failure and orphan-file cleanup, every MIME/size/chooser-cancel/drag-drop variant, assistive-technology speech, physical-device software keyboard and OS motion remain unverified. Local selection and simulated save success must not be reported as a server upload. Inventory reconciliation awaits the concurrent source batch freeze.

## Subsequent frozen-composition checkpoint

The parent full-suite rerun passed592tests/119files after caching repeated timeline-test button lookups without weakening assertions. The initial run had590passes and two timeline-control timeouts. Full TypeScript, production Vite build,35-file scoped lint/format and detector with no findings passed. Logs use `/tmp/paddock-audit-composition-*`, with final tests at `/tmp/paddock-audit-composition-tests-final.log`. This checkpoint precedes the separate later tabs correction; it does not certify that correction or close live/backend boundaries.
