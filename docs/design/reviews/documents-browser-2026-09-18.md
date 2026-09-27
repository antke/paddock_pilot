# Documents — local browser verification

18 September 2026. Companion to [source findings and fixes](documents-source-2026-09-18.md). Actual shared document rows, filters, uploader and removal action were checked in the existing local Page Lab at 1280×800 and 390×844. No storage upload, live record change or authenticated backend operation was performed.

## Observed results

- Desktop rows preserve the documented neutral document boundary, full filenames, file-state explanations and primary Download action. This intentional domain treatment was not flattened into roster rows.
- Blank upload submission shows both required-file and document-name errors. The fixture file `/tmp/paddock-audit-document.txt` contains 181 bytes of fictional audit text. After selection its actual name and size appear in the uploader.
- A six-second local upload remained open after Escape, with Close absent and Uploading shown. Failed request kept the selected file and name plus persistent inline recovery text. Retry completed locally, changed the document count from seven to eight and returned focus to the visible mobile Add document button after the desktop-to-mobile breakpoint change.
- Removing that sample record remained pending after Escape. Failure kept the confirmation and inline error. Retry removed the row, returned count to seven and focused an INPUT within the surviving document group (the search control). The status explicitly says no live record or storage file changed.
- Search with no matching fixture produces zero documents and a filter-specific message; Clear all recovers. Viewer mode exposes zero Add and zero Remove controls. Horse sample scope shows four Juniper documents. Empty sample shows zero documents and an explicit empty message.
- Long filename and unavailable-file rows remain readable at 390px with `documentElement.scrollWidth === innerWidth === 390`. Unavailable Download is disabled with an accessible reason. The image specimen, metadata-only and linked-event data are present in the desktop list.

## Tool interruptions and limits

The first file chooser failed with a stale backend node after a preview reset. It was discarded as verification evidence. A subsequent stable-preview selection succeeded, but the tool stalled for several minutes; no repeated upload or real storage request was launched. All pending/retry results above were observed after source and test activity had stopped.

Opening the local sample Blob URL was explicitly blocked by the browser tool's security policy. No workaround was attempted. Browser opening and download completion therefore remain **unverified**. Valid fixture bytes and filename-preserving download behavior have source/component-test evidence; they are not an end-to-end browser result. No live storage URLs or private files were used.

The lab renders actual shared views, but stable and horse authenticated route composition, roles, storage permissions, upload cleanup on backend failure, signed URL expiry, network download errors and actual persistence still require controlled backend verification. Dark/reduced-motion/text-scaling and every other consumer of the shared FileUploadField and RecordRemoveAction changes remain open.

## Evidence

Artifacts under `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/members-care-audit/`:

- `documents-desktop.png`: real document rows and filter composition.
- `documents-long-mobile.png`: long filename, unavailable file and viewer controls.
- `document-upload-failure-mobile.png`: retained file/name and retry error.
- `document-removal-failure-mobile.png`: persistent failed confirmation and recovery action.

22 focused source/component tests are documented in the source report. Final aggregate run passed **311 tests across 62 files** and full TypeScript checking. Scoped lint passed; the static Impeccable document scan exited zero with no findings emitted; `git diff --check` and production `vite build` passed. No route is marked fully complete by these local results.
