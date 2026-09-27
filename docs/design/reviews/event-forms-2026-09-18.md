# Event form family audit — 18 September 2026

Scope: production event create/edit routes, shared `EventFormFields` and `ProviderAutocomplete`, and the `/page-lab/forms` sample. Impeccable audit/craft-floor guidance applied in Operate mode. Approved typography, semantic colors, and existing section structure retained; no route-specific CSS introduced.

## Findings and fixes

- **P1 — Saved recurrence could be mislabeled and silently rewritten.** The editor initialized every rule as “Simple / Every week,” including saved daily or custom monthly rules. A monthly synchronization effect could also rewrite the rule after date changes or a reset. Simple presets now derive from the actual rule; custom rules open in Advanced. Opening, resetting, and changing the event date do not mutate the schedule. Switching explicitly to a simple preset is the point at which a user requests a new pattern.
- **P1 — Validation feedback was not associated with inputs.** Added named event type/status/recurrence groups, field error IDs and descriptions, and focus refs for provider/cost/recurrence number/date inputs. Recurrence end date/count now register their leaf paths, making nested schema errors visible beside the relevant input.
- **P1 — Sample submit did nothing and an empty stable crashed.** The lab now uses the production resolver, safe empty-roster defaults, stable-keyed form state, local-only apply feedback, and reset confirmation when dirty. Optional normalized values are converted back to input defaults after a sample apply so a successful validation does not immediately mark the form dirty again. Empty rosters explain that a horse must be added and fail validation without a false success.
- **P1 — Keyboard provider selection omitted contact details.** Autofill was attached only to the option click handler. Saved-provider selection now handles Base UI’s item-press event for keyboard and pointer, using the highlighted provider identity; free text remains a supported manual entry.
- **P2 — Reset discarded edits immediately.** Production create/edit forms now use shared dirty-reset confirmation and sticky actions. Failed mutations give a specific recovery message and retain entered data; success remains after the awaited mutation.
- **P2 — Nested recurrence panels added unnecessary framing.** Replaced inner panel wrappers with global `FieldGroup` spacing and removed the local box around the recurrence switch. Controls remain shared design-system primitives. Provider initials use the UI typeface rather than an unrelated monospaced treatment.

## Verification

- `EventFormFields.test.tsx`: four behavioral regressions covering a saved daily preset, preservation of a custom monthly rule across date changes/reset, required plus recurrence-leaf error associations, and an empty horse roster rejecting submission.
- `FormsPageLab.test.tsx`: three integration regressions covering invalid-to-valid sample apply/clean reset, switching to an empty stable without retaining a stale horse, and keyboard provider selection filling its saved phone number.
- Seven tests pass; whole-project TypeScript and scoped ESLint pass.
- Root audit browser verification, fresh reload: invalid title focuses and exposes its linked error; dirty reset cancellation retains edits; valid sample apply shows truthful local success; advanced monthly recurrence has no horizontal overflow on mobile; the empty stable renders its explanatory message and required-horse validation without crashing. Final screenshots and broader event-family browser evidence are recorded by the root audit.

## Explicit gaps

- Production authenticated create/edit navigation and actual backend success/failure were not exercised. No live records were saved.
- No claim of real screen-reader or physical-device testing. DOM associations and automated interaction tests complement the browser checks.
- This pass adds reset protection, not a new navigation-away guard.
- Final provider keyboard visual confirmation is owned by the root browser pass; source/tests alone do not certify the complete visual interaction.

Parent browser confirmation: saved-provider selection through native typing, ArrowDown and Enter visibly fills `(555) 014-1902`; screenshot `event-audit/provider-keyboard-mobile.png` in the visualization root. Read-only browser representations omit this phone value; the screenshot resolves the discrepancy. See event-family report for other desktop/mobile evidence.
