# Horse care, activity and nutrition records — source audit, 18 September 2026

Read-only bounded audit using Impeccable's technical-audit playbook and the approved stable-journal system. No application edits, browser actions or backend mutations. This report covers `HorseCareSection`, `HorseActivitySection`, `HorseNutritionSection`, the health/medication/weight/nutrition record lists, and their four add forms. Timeline and printable summary already have a separate actual-view audit in `horse-history-2026-09-18.md`.

## Verdict and evidence limits

The family uses real global primitives and truthful server-success timing, but does not yet inherit the recent reminder family's complete interaction hardening. Three P1 and five P2 source findings remain below. No P0 was identified. Visual contrast, viewport fit, touch sizing and motion are unmeasured here; a rendered health score would imply evidence this source-only pass does not have. There was no new detector/browser/test run in this pass. These are deterministic source observations, not claimed visual failures.

## Material findings

### P1 — Nutrition list entry destroys the newline needed to enter another item

`src/components/horses/NutritionLogForm.tsx:25`, `:140`, `:166`: Recommended/Avoid textareas convert every keystroke to an array with `split`, `trim`, `filter(Boolean)`, then render that array joined by newlines. Entering `Hay\n` becomes `['Hay']`, then `Hay` immediately. A normal Enter at the end cannot start the next item. Pasting multiple complete lines can work, which masks this in fixture data.

Keep raw editing text intact and normalize at submission/schema boundary, or reuse the existing string-list field pattern. Regression: type first item, Enter, second item; preserve blank intermediate line/caret and obtain two submitted values.

### P1 — Concurrent health/medication row actions can clear each other's pending guard

`HorseHealthIssuesCard.tsx:49`, `:101`, `:116`, `:143`; `HorseMedicationRecordsCard.tsx:60`, `:108`, `:125`, `:154`: a single pending ID tracks all row operations, but only the matching row is disabled. Start resolve/complete A, then B: the ID changes to B and A becomes enabled while its request remains pending. Whichever request settles first clears the ID, enabling B prematurely too. Repeated submissions and contradictory busy indicators can follow.

Use per-record operation state with a synchronous repeated-action guard, or intentionally serialize all record operations. Do not make all cards share an unqualified boolean inadvertently. Add deferred-promise tests with A/B completion orders and a repeated A action. Weight/nutrition lists also use a single pending ID, but their remove dialogs currently serialize interaction; do not overstate the same visible reproduction there.

### P1 — Form errors and grouped choices are not programmatically associated

All four record forms set `aria-invalid` but provide no error IDs/`aria-describedby`; Required versus optional fields is also unclear in most labels. Health severity, medication status and weight unit use a visible unassociated `FieldLabel` above an unnamed `ChoiceButtonGroup`. `WeightRecordForm.tsx:72` and `:133`, medication end date at `MedicationRecordForm.tsx:160`, and nutrition list textareas omit `field.ref`, so RHF cannot focus these controls when they are the first invalid field.

Use the established unique ID/error-link pattern, named groups and actual control refs. Add invalid-submit tests for weight and end-date errors, plus accessible names/error descriptions for each form. Do not add redundant explanatory labels to already clear controls.

### P2 — All four create-dialog consumers omit pending state

`HorseHealthIssuesCard.tsx:85`, `HorseMedicationRecordsCard.tsx:91`, `HorseWeightRecordsCard.tsx:88`, `HorseNutritionLogsCard.tsx:87`: no `isPending` reaches `CreateRecordDialog`. Inputs disable while submitting, but Escape/close can dismiss the form while the server request continues. A user can assume dismissal cancelled it, or reopen and submit a second record.

Lift create pending state into the actual list/view owner and pass the shared prop; preserve the existing await-before-success behavior. The shared `CreateRecordDialog` now already provides pending close protection and responsive surviving-trigger focus return. Do not implement a second local dialog/focus mechanism. Test close/Escape during deferred save, failure retry and desktop↔mobile return focus.

### P2 — Rejected creates escape the four form submit handlers

`HealthIssueForm.tsx:45`, `MedicationRecordForm.tsx:56`, `WeightRecordForm.tsx:55`, `NutritionLogForm.tsx:55`: each awaits the callback with no catch, while each connected list catches a mutation, shows a toast, then rethrows. The form has no persistent root error and RHF does not absorb rejected submit callbacks. Reset happens only after success, so current values are retained; the missing piece is handled rejection and local retry feedback, not a claim of premature reset.

Apply the reminder form's caught rejection/root error pattern. Test failure preserves entries and a successful retry closes exactly once. Health resolve and medication complete also have toast-only failures and unchanged button copy while pending; add row-specific retry/busy feedback as part of the same operation-state owner.

### P2 — Medication date order is not validated

`shared/horses/medicationRecordSchema.ts:28`, `:45`, `:58` accepts dates by shape and does not check end date >= start date. `convex/horseMedicationRecords.ts:147` completes a record with today's date, even when its entered start date is later. The UI always labels any provided date “Ended” (`HorseMedicationRecordsCard.tsx:283`), including an active record's future scheduled end.

The later implementation pass should distinguish planned versus actual end wording and enforce chronological validity in the shared schema/server contract, with tests. A schema/backend change needs explicit ownership in that pass; this audit does not silently alter stored records or clinical meaning.

### P2 — Nutrition add-flow wording can imply the current plan will change, but it only adds history

`NutritionLogForm.tsx:111` says “Updated plan” / “Capture the complete feeding plan after this change.” `HorseNutritionCard` reads the current routine/recommendations directly from the horse. `convex/horseNutritionLogs.ts:95` only inserts a history entry and does not update that horse. A newly logged plan can therefore disagree with the “current feeding plan” shown immediately above it.

Clarify whether this action is a historical snapshot or a current-plan change. For a history-only action, explicitly identify that boundary and provide the actual current-plan editing path if appropriate. Do not automatically patch the horse as a visual fix.

### P2 — Activity tab membership disagrees with its labels

`HorseActivitySection.tsx:46–53` partitions only by date. A completed event dated today remains Upcoming; a cancelled future event also remains Upcoming; the Past description promises “Completed or earlier activity.” The date key is read at render rather than through the app's midnight-updating date context.

Choose the intended status/date policy and align filtering/copy. Add today-completed, future-cancelled and midnight rollover cases. The existing “select this horse” empty copy accurately reflects that Add event does not preselect it; this is extra work, not a falsely wired add action.

## Shared style ownership and flattening candidates

- Tokens, buttons, field grids, typography and badges come from shared owners; no new palette or icon family is warranted.
- Health, medication, weight and nutrition rows explicitly force `chrome="cards"`; their inline fallback wrappers also use cards. The approved global default is flat. Switch at these list consumers after actual-view screenshots establish the appropriate boundaries, preserving genuine status accents.
- Medication renders active records both in an “Active medication” nested panel and in the full list. Keeping current medication visible independent of filters can be useful; do not simply delete it. Test whether one compact, clearly named summary suffices without another panel around each course.
- Weight's latest-record summary likewise duplicates one list item but provides useful quick context. Flatten its shared panel treatment rather than removing the data.
- Current nutrition Recommended/Avoid uses shared DetailPanel and semantic check/X icons. These are meaningful care indicators rather than random section decorations. Assess visual weight in the real composition before removing them.
- Record H3 headings correctly sit under HorseDetailSectionTabs' H2. The shared record content now supports `headingLevel`, but these consumers should not blindly inherit the standalone reminders page's H2 adjustment.
- Activity's constrained ScrollableList already receives the parent's global keyboard-focus/scrollbar correction. It still uses the generic default accessible region name; pass a meaningful activity label when this consumer is edited.

## Safe actual-view fixture plan

The existing HorseDetailPageLab hard-codes `category="profile"` and exercises profile only. Timeline/care-summary labs use actual views, but do not exercise these record mutations or add forms. Clicking real horse subsection routes is not an isolated sample: health/nutrition render connected Convex hooks.

Extract thin exported view components from each connected record-list owner. Keep queries, permission lookups, server mutation adapters and success toasts in connected wrappers. Feed the exact view local arrays, real `canManage`, and Promise-returning local action callbacks; keep the real form/schema/dialog/list renderers. Sections can accept their renderer or explicit view slots to compose the actual care/nutrition tabs safely. HorseActivitySection is already a data-only renderer and can receive sample events directly.

Required sample states:

- Health: multiple active/resolved issues, long description, mixed severity, empty/read-only, failed resolve and concurrent actions.
- Medication: active/completed courses, current-plan summary, future start/planned end, sparse optional data, read-only, filtered no results, failed complete.
- Weight: empty and many mixed-unit records, optional BCS, add validation/failure and local-only removal.
- Nutrition: empty current plan with/without history, long snapshot lists, multi-line typing, local addition that accurately models history-only behavior, failed save/removal.
- Activity: upcoming/past empty states, completed today, cancelled future, long list with keyboard-scrolling, native filters and no-result recovery.
- Every mutation fixture: clearly labeled sample data, delayed acknowledgement, failure then retry, scenario/horse switch while pending, no live mutation hooks. For true delete confirmations, use the shared RecordRemoveAction updates already underway, including successful-removal focus recovery; do not introduce competing local fixes.

One bounded implementation/verification pass should prioritize the three P1 causes, then pending/error wiring and fixtures, then global flattening. Run actual desktop/narrow browser flows only once the shared source is frozen; existing generic filter tests are useful but do not prove these form interactions, permissions, responsive layouts or persistence.

## Weight and nutrition implementation supplement

The initial findings above are the source-audit baseline. This bounded implementation addresses weight/nutrition only; health/medication/activity have separate owners and verification. No server schema, mutation behavior, horse current plan, or live data was changed by this pass.

### Changes and actual consumers

- `WeightRecordForm` and `NutritionLogForm` now use unique field/error IDs, linked validation feedback, registered manual-input refs, explicit optional labels, synchronous submission guards, retained failed drafts and contextual inline rejection feedback. Weight units have the accessible group name “Weight unit.” Optional `onPendingChange` props connect actual form state to shared dialog protection.
- Nutrition list fields keep raw text during editing, including trailing/blank newlines. The form resolver normalizes at validation/submission without rewriting the controlled draft, using the shared list constraints. List-item errors attach to the textarea field so its error description and first-invalid focus work. The form and dialog explicitly identify a historical snapshot that does not update the current feeding plan.
- `HorseWeightRecordsCard` and `HorseNutritionLogsCard` remain the connected owners of queries, permissions and mutation/toast adapters. They now export `HorseWeightRecordsView` and `HorseNutritionLogsView`; live wrappers and isolated samples use the same dialog/form/list composition. Their create dialogs prevent dismissal while awaiting an acknowledged save. Successful removals use the existing shared `RecordRemoveAction` focus-target API and surviving named “Weight records” / “Nutrition history” regions.
- Those two view consumers use the global flat section and row treatment. The latest-weight summary remains useful and now uses the shared flat panel treatment; latest selection is by measurement timestamp rather than assumed input ordering. Meaningful current feeding-plan `DetailPanel`/care indicators in `HorseNutritionCard` remain unchanged.
- Added `page-lab/prototypes/HorseNutritionRecordsSample.tsx`, exporting `WeightRecordsSample` and `NutritionLogsSample` with `{ horse: HorseDetailHorse, onCreateActionChange? }`. Both use real pure views/forms, stable callback identities for parent-owned header actions, local arrays, acknowledged delays, failure-then-retry, empty/long histories, manager/viewer permissions and horse-keyed lifetime protection. Late requests cannot add records after a horse switch/unmount. The sample labels fictional data and history-only behavior and never invokes live mutation hooks.

Production consumers requiring verification are the weight/nutrition tabs composed by `HorseNutritionSection` in horse detail, including both standalone/fallback create actions and parent-owned section actions. The parent owns the section's view injection and page-lab route registration; these changes do not imply every horse-detail consumer is browser-verified.

### Bounded verification

- Scoped ESLint for both forms, both record owners, new sample and two new test files: passed.
- Whole-project TypeScript `tsc --noEmit`: passed at the implementation snapshot.
- Six meaningful regressions in `HorseNutritionForms.test.tsx` and `HorseNutritionRecordsSample.test.tsx`: passed. They cover isolated form IDs, invalid numeric/list focus and linked errors, raw multiline editing and normalized submitted arrays, duplicate submission protection, rejected-save preservation/retry, delayed dialog dismissal protection, actual header-action composition, successful removal focus after the last row disappears, history addition without altering current horse feeding values, read-only/long history states, and stale completion across horse changes.
- This agent did not perform browser verification or any live mutation. Parent browser review remains responsible for actual wide/narrow layouts, responsive focus, contrast, keyboard flow and visual rhythm. UI source was frozen before that pass; this supplement is evidence of tested implementation, not a claim that all routes/states are verified.

### First browser correction batch: submission visibility and same-date weight ordering

Parent's first actual mobile pass found that nutrition request failure feedback appeared above the current scroll position. This was an interaction defect despite the draft/retry tests passing. The bounded correction introduces `forms/FormSubmissionError`, used just above submit actions in NutritionLogForm, WeightRecordForm, HealthIssueForm and MedicationRecordForm. It retains the shared destructive Alert semantics, focuses each newly shown failure with `preventScroll`, then reveals it using immediate nearest-edge scrolling. There are no timers, smooth scrolling or global Alert behavior changes; ordinary rerenders with the same error do not steal focus. Field-level validation continues to focus the first invalid control separately. Nutrition's historical-snapshot group is now the sole owner of the current-plan disclaimer; the dialog introduction is shortened.

The same browser pass exposed sample dates at UTC midnight mixed with submitted local-midnight values. Weight/nutrition fixtures now derive dates through the same local date-key conversion as the actual forms. Source inspection also found a distinct production bug: equal measured dates retained query input ordering, so an older entry could remain the “Latest record” after a second same-day measurement. `shared/horses/weightRecordOrder.ts` now supplies one descending comparator (measurement timestamp, creation timestamp, then Convex creation time), reused by the actual weight query, view/list/latest summary and local sample. This changes deterministic read ordering only; no stored record, schema or mutation payload changes.

Correction verification: 18 tests across seven files passed, scoped ESLint passed, and full TypeScript passed. New regressions cover repeated failures, focus retention during ordinary rerenders, rejection after unmount, equal-date ordering regardless of input order, and adding a second same-date record through the actual sample form so both the latest summary and first list row update. Existing four-form, actual-section composition and design conformance tests remain green. Source was frozen before the parent's bounded browser confirmation; no live mutations were executed.

Touched files in this correction batch (13 source/test files, plus this report): `forms/FormSubmissionError.tsx`, `forms/FormSubmissionError.test.tsx`; four horse forms; `horses/HorseWeightRecordsCard.tsx`, `horses/HorseNutritionLogsCard.tsx`; `page-lab/prototypes/HorseNutritionRecordsSample.tsx` and its test; `shared/horses/weightRecordOrder.ts` and its test; `convex/horseWeightRecords.ts`. Component inventory gains exactly one non-test component file, FormSubmissionError.
