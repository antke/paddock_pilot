---
target: download button in document rows
total_score: 29
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 0
timestamp: 2026-08-25T09-38-16Z
slug: rc-components-documents-documentdownloadaction-tsx
---
Method: dual-agent (A: download_button_design_review · B: download_button_detector)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Downloading text, spinner, busy state, and failure recovery are strong; completion depends on browser feedback. |
| 2 | Match System / Real World | 4 | Open, Download, and Remove are familiar file-management actions. |
| 3 | User Control and Freedom | 3 | Removal is safely confirmed, but a slow download cannot be cancelled in place. |
| 4 | Consistency and Standards | 2 | Adjacent controls use conflicting visual grammars and hierarchy. |
| 5 | Error Prevention | 4 | Duplicate downloads are blocked and unavailable files are disabled. |
| 6 | Recognition Rather Than Recall | 3 | Labels are explicit, but the disabled explanation is separated from the control. |
| 7 | Flexibility and Efficiency | 2 | Individual downloads are direct, but no batch action or cancellation exists. |
| 8 | Aesthetic and Minimalist Design | 3 | The row is clean, but Remove dominates the constructive actions. |
| 9 | Error Recovery | 3 | Failure copy supports retry and removal failures preserve the dialog. |
| 10 | Help and Documentation | 2 | The unavailable reason relies partly on an ineffective native title. |
| **Total** | | **29/40** | **Good, with an unresolved action hierarchy** |

## Design Specificity Verdict

**LLM assessment:** The document rows feel authored for Paddock Pilot through their warm ledger surfaces, yard-specific metadata, explicit file states, and restrained typography. The action cluster is the weak point. Download combines Open's transparent ghost chrome with Remove's icon grammar, while Remove alone receives a tangible resting surface and border. That makes the most generic part of the row visually louder than the useful file actions.

**Deterministic scan:** The detector returned `[]`: zero findings across `DocumentDownloadAction.tsx` and `DocumentsCard.tsx`. This is not evidence that the interaction is consistent; the mismatch is semantic and optical rather than a forbidden class or mechanical violation.

**Visual evidence:** Open and Download share `ghost`/`sm`; Remove uses `destructive`/`sm`. All are 32px high with 12px/600 text, 16px line-height, and 6px radii. Download does have hover feedback: an 8% primary wash in light mode and 15% in dark. Against the paper row and with no resting border, that change is easy to miss. Focus feedback is strong. No user-visible detector overlay exists because the available browser evaluation surface is read-only and cannot inject the overlay script.

## Overall Impression

The button is behaviorally robust but visually under-resolved. The central opportunity is to establish one intentional file-action hierarchy from existing Style Lab variants, so Download looks like a member of the same family as its neighbors without giving the destructive action first visual priority.

## What's Working

- Download preserves the filename, blocks duplicates, aborts on unmount, exposes a clear busy state, and provides recoverable failure feedback.
- Filename-specific accessible names, visible focus, coarse-pointer sizing, and responsive wrapping are solid.
- Open and Download remain available independently of Remove permission, and destructive removal retains canonical confirmation.

## Priority Issues

### [P2] Constructive/destructive hierarchy is inverted

**Why it matters:** Remove is the only action with a visible resting border and fill, so risk looks more important than opening or downloading the document.

**Fix:** Assign existing canonical variants intentionally. Use a bordered constructive treatment for the primary file action, a quieter secondary treatment for the other file action, and retain destructive styling for Remove. Do not add local Download-only classes.

**Canonical owner:** `DocumentsCard` for action hierarchy; `DocumentDownloadAction` for the specialized control; `ui/button.tsx` only if a shared variant genuinely needs revision.

**Suggested command:** `$impeccable polish`

### [P2] Hover exists but is perceptually too quiet

**Why it matters:** The ghost wash has no resting border transition and sits on a similarly toned paper surface, so users reasonably perceive no hover response.

**Fix:** Prefer an existing bordered Style Lab variant for Download. Strengthen `ghost` globally only if every ghost-button consumer should change after a shared-system review.

**Canonical owner:** `DocumentDownloadAction` variant selection, or `ui/button.tsx` for a confirmed global rule.

**Suggested command:** `$impeccable polish`

### [P2] Disabled explanation is not discoverable at the control

**Why it matters:** Disabled buttons use `pointer-events: none` and are skipped by keyboard traversal, so the native `title` cannot reliably explain the state. The distant badge creates a small memory bridge.

**Fix:** Use the shared tooltip/helper pattern around an enabled wrapper or add persistent helper copy programmatically tied to the disabled action. Remove reliance on native `title`.

**Canonical owner:** `DocumentDownloadAction` plus the canonical Tooltip/helper primitive.

**Suggested command:** `$impeccable harden`

### [P3] Pending width shifts the right-aligned action group

**Why it matters:** Download grows by roughly 28px when it becomes “Downloading…”, moving its left edge and making the cluster twitch on narrow rows.

**Fix:** Reserve sufficient inline size for the pending label or use stable action-group geometry while retaining the explicit label.

**Canonical owner:** `DocumentDownloadAction`.

**Suggested command:** `$impeccable polish`

## Persona Red Flags

**Alex, power user:** A document-heavy list has no batch download, and a stalled request cannot be cancelled and restarted in place. The inconsistent file-action hierarchy adds repeated visual parsing cost.

**Sam, keyboard or screen-reader user:** Focus feedback and accessible filenames are strong, but the disabled explanation relies on an unfocusable control's `title`; the adjacent badge is not programmatically tied to Download.

**Casey, distracted mobile user:** At 390px the actions stack at the far right, which magnifies their inconsistent chrome. Remove remains the strongest-looking action, and the unavailable badge is visually distant from the disabled button.

## Minor Observations

- Hover is under-signalled, not absent.
- Open and Download share a variant, but only Download has an icon; this needs to read as intentional hierarchy rather than accidental inconsistency.
- “Open file” and “Download file” would create more parallel copy, though the current labels are understandable.
- Remove is correctly owned by `RecordRemoveAction` and should not be locally restyled.
- A single dark-hover text-color difference exists between Open and Download despite the shared ghost variant; it is slight but deterministic.

## Questions to Consider

- Is the primary yard task to inspect a document or save a local copy?
- Why is the irreversible action the only control that looks tangible at rest?
- Should Open and Download read as one paired file-access group, visually separated from record management?
- When a file is unavailable, should the row only explain the absence or offer a replacement-file action?
