# Horse breed input — 19 September 2026

Bounded Impeccable audit/harden follow-up to the explicitly open breed finding in the horse-family and horse-lifecycle reports. Current source, form resolver, shared schema and actual create/edit consumers were inspected. No backend policy, record migration, visual identity or unrelated horse-field layout changed.

## P1: unresolved input can be silently discarded during a save

The picker kept its own query while the form retained the last committed breed. Only known item selection or an empty query updated the form. On blur, unmatched text became an empty string. A submission without blur instead used the earlier committed value. Either path could save a breed different from the visible draft without presenting a validation error. The earlier exact-match/unknown-clearing tests codified this behavior rather than proving it was usable.

Three actual `HorseProfileForm` regressions failed before correction, while eight existing lifecycle tests passed. They cover submitting unresolved text with and without blur and editing an existing legacy value. Reproduction log: `/tmp/paddock-breed-before.log`.

## Correction and policy boundary

- `HorseBreedAutocomplete` now treats the form value as the visible draft. Every input change reaches the resolver; unknown text stays visible on blur. A known exact name is canonicalized without erasing an unresolved draft. Controlled resets immediately update the input.
- `horseBreedSelection.ts` is the shared, non-UI source for suggestion options and normalized matching. Both picker and resolver use it, preventing drift between displayed suggestions and accepted values. Matching trims surrounding whitespace and ignores case.
- The client form schema now validates the controlled-list contract that the existing picker was trying to enforce. Invalid input gets the existing shared `FieldError` treatment: “Choose a breed from the list, or clear this field.” Validation happens on submission even without blur, before uploads or save callbacks. An empty optional breed remains valid.
- Edit forms explicitly allow their original stored breed, including a legacy name absent from the current list. That exception is supplied to both suggestions and schema; it does not make every newly typed unknown name valid. The shared/backend string schema stays unchanged for existing data compatibility. There is no migration or claim that server validation now enforces a list.
- The actual input receives the React Hook Form ref, allowing normal invalid-field focus. Existing invalid/described-by wiring and form-section expansion remain at their shared owners. No local style override or new wrapper was added.

The relevant product decision remains a controlled suggestion list with retained legacy values. This correction makes that existing contract explicit instead of erasing data to enforce it. It does not change the UI into unrestricted free-text entry.

## Exact consumers

`HorseBreedAutocomplete` → `HorseFormFields` → `HorseProfileForm` → real horse create and edit routes (`src/routes/stables/_layout/$stableId/horses/create.tsx` and `src/routes/stables/_layout/$stableId/horses/$horseId/edit.tsx`) and the safe `/page-lab/horse-form` specimen. The new schema factory is local to the profile form; initial onboarding uses a different first-horse schema and has no breed picker.

## Verification and limits

**21 tests / 3 files passed:** picker, real shared profile form and existing horse schema suite. Cases cover draft retention on blur, submit without blur, no upload/save for invalid input, an associated visible error and focused input, case/space normalization before save, existing legacy retention, rejecting a different unknown value, explicit clear, controlled reset/new legacy props, and ArrowDown/Enter suggestion selection followed by blur. Existing image/save/navigation lifecycle cases remain included. Log: `/tmp/paddock-breed-tests.log`.

The keyboard test explicitly opens suggestions with ArrowDown. A synthetic `change` event by itself did not open the installed Base UI popup; that harness behavior was not treated as an application defect. The test does not establish native typing, touch, popup geometry or assistive-technology output.

No live record was saved. Browser confirmation remains pending: repeat input/blur/clear/reset and keyboard selection in the actual safe specimen, inspect narrow wrapping and focus visibility in both themes, and verify real route/backend behavior with authorized test data. Earlier horse screenshots do not prove the new validation states. The pending browser-choice question remains unanswered; no new browser attempt or screenshot is credited in this increment.

## Combined checkpoint

After the form-control, breed and navigation sources froze, the full suite passed **536 tests across 108 files**. TypeScript, production Vite build, scoped ESLint/Prettier and whitespace checks passed. The Impeccable source detector returned `[]` for the nine touched component owners. These source checks do not replace native browser/assistive-technology or authenticated/backend verification.

Logs: `/tmp/paddock-form-nav-final-tests.log`, `/tmp/paddock-form-nav-final-types.log`, `/tmp/paddock-form-nav-final-build.log`, `/tmp/paddock-form-nav-final-lint.log`, `/tmp/paddock-form-nav-final-format.log`, `/tmp/paddock-form-nav-detector.json`.
