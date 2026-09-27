# Horse form: validation and recovery confirmation

19 September 2026. Actual shared HorseProfileForm, HorseFormFields, HorseBreedAutocomplete, RouteFormCard/RouteFormActions, FormSubmissionError and FileUploadField exercised through `/page-lab/horse-form`. The specimen explicitly simulates upload, save and navigation; no live record, file upload or deletion occurred.

This closes specific rendered-state gaps after the earlier source corrections. It is not a claim that authenticated create/edit routes, permissions or backend persistence have been verified.

## Confirmed issue and bounded fix

**P2 — Multiline placeholder examples printed literal `\n`.** The rendered allergy textarea showed `One item per line\nPenicillin\nBee stings`, and the two nutrition-list placeholders had the same defect. The three JSX string attributes in `forms/horse/HorseFormFields.tsx` now use JavaScript string expressions, producing real line breaks. HorseStringListField already passed the placeholder through correctly and was unchanged. The 390px screenshot confirms the readable allergy example; both nutrition placeholders were read from their rendered fields and contain actual newlines.

No typography, color, surface, layout, lifecycle or global-control recipe was changed. All three instances were corrected together; no extra cosmetic pass followed.

## Validation and keyboard behavior

- At 1280×720, entered `Unlisted sample breed xyz` into Breed and pressed Enter without blurring. Saving did not start. The draft remained, focus stayed on Breed, `aria-invalid` became true and `aria-describedby="breed-error"` resolved to “Choose a breed from the list, or clear this field.”
- Typed `Arab`, opened suggestions with ArrowDown and selected Arabian with ArrowDown/Enter. The selected value became Arabian, the popup closed and the invalid state cleared.
- Repeated unresolved-breed submission at 390×844. The focused field was within x33–357 and y468.55–508.55, below the sticky header. The error and action bar remained readable; document width stayed 390px.
- The real autocomplete popup consumed focus while open; background controls temporarily omitted from the snapshot's accessible names were not mistaken for permanently unlabeled fields.

## Save acknowledgement and recovery

- Selected “Save fails once.” Submit immediately displayed the local pending status and disabled Saving horse/Reset. On failure, the explanation received focus and Arabian remained in the form. No saved acknowledgement appeared before success.
- Retried using “Save succeeds; opening profile fails once.” The form showed both “Sample horse saved locally. No live record changed.” and the distinct opening error. Breed was disabled after acknowledgement; the UI offered Open horse profile instead of another Save.
- The continuation retry showed `Sample open pending` and a disabled Opening profile button. It then reported local profile opening. The browser sequence observed no new save stage; existing focused tests establish callback-count/idempotency behavior more directly than a screenshot can.
- Double-clicked Save on a changed sample. A pending state appeared and Reset was disabled. Restarted while that operation was pending. The replacement form retained its original Juniper value and, after the previous delay elapsed, had no saved acknowledgement or Open horse profile action. This verifies local unmount cleanup, not server-side cancellation.

## Reset and responsive actions

- At 390px, Keep editing closed the discard dialog, retained `Keep this draft` and returned focus to Reset form.
- With all form sections collapsed, Discard changes restored Juniper and focused the available Horse details section button. It did not focus an inert field.
- With Horse details collapsed and Profile & health open, confirming reset restored Dutch Warmblood and focused the visible Breed input.
- The mobile discard dialog fit within the viewport and initially focused Keep editing.
- At 320×568, a save failure produced a 288px-wide alert at y404.875–504. Both Reset and Save were fully visible at y512–552. The document remained 320px wide. This is viewport evidence; it does not simulate a physical touch device or a software keyboard.

## Photo selection and failure

Used the supported file-chooser flow to select the existing repository sample `/public/landing-lab/juniper-palomino-480.jpg`. The UI displayed its filename, JPG type, 48 KB size, preview and named Remove/Replace controls. The chooser tool call returned slowly; that elapsed tool time is not evidence of application upload latency.

“Photo upload fails once” showed a local upload-pending status followed by the focused upload error. The selected-file controls remained present and enabled. Reset → Keep editing retained the selection. Retrying showed the upload stage again and reached the explicitly local saved/opened acknowledgements. No file was sent to storage because this specimen's upload callback only simulates a delay and returns a sample ID.

The replacement-file chooser path, drag/drop and invalid file types were not exercised in this browser pass; their existing unit/source evidence remains separate. No permanent or recoverable deletion button was activated.

## Artifacts and checks

Screenshots are real browser captures under `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/horse-form-confirmation/`:

- `breed-validation-1280.jpg`
- `save-failure-1280.jpg` — also records the pre-fix literal placeholder
- `reset-dialog-390.jpg`
- `breed-validation-390.jpg`
- `multiline-placeholder-390.jpg` — corrected example
- `save-failure-320-short.jpg`
- `local-saved-320-short.jpg`

The palm overlay is the development-only TanStack Devtools control, not product decoration. No screenshot was retouched. The sample was restarted to clear the selected photo and saved state; the browser was restored to Light and its normal 1280×720 viewport, on the horse-form lab.

Scoped lint, formatting, whitespace and Impeccable detection passed (no detector findings). All 29 existing focused tests pass across HorseProfileForm, RouteFormCard, HorseBreedAutocomplete, FileUploadField and HorseFormPageLab; full TypeScript checking passes. No new tests were added for a placeholder-only change. The prior full-suite checkpoint and production build are not represented as rerun here.

## Remaining verification

Authenticated create/edit routing and loaded record identity, backend permissions and persistence, real storage/network failures, server idempotency, dirty-route departure, native screen-reader output, physical touch/software keyboard, enlarged text and OS reduced motion remain unverified by this pass. Existing long-form grouping is retained; its sections contain substantial data, so the accordion is not treated as gratuitous nesting.
