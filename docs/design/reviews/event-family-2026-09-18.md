# Event family — 18 September 2026

Status: partial, with working production-component samples. This pass covers the event list, event detail, calendar, shared create/edit fields and per-horse service notes. It does not prove authenticated route loading, backend permissions, persisted saves or notifications.

## Findings and fixes

- **P1 — saved recurrence could be misrepresented or rewritten.** EventFormFields now derives simple presets from the actual rule. Custom rules remain advanced; reset and date edits do not silently replace the stored recurrence. Nested recurrence errors are associated with their controls. See the [form evidence](event-forms-2026-09-18.md).
- **P1 — service-note failures needed persistent recovery.** The real view now awaits mutation resolution, preserves failed drafts, prevents duplicate pending submissions, shows inline errors, and holds withdrawal confirmation open while pending or failed. Separate row editors preserve each other's drafts. The production wrapper still owns actual queries/mutations; the sample supplies local async outcomes.
- **P2 — keyboard context was lost when editors or withdrawal actions disappeared.** Opening an editor focuses Requested notes; cancel/save returns to Add/Edit. Withdrawal returns to its trigger, or to the labelled horse row when that action no longer exists.
- **P2 — provider keyboard selection did not apply the stored phone.** ProviderAutocomplete now handles item selection through the shared Base UI selection callback as well as pointer selection. Free typing does not imply a saved provider was selected.
- **P2 — event rows forced their own card styling.** Removed EventRow's redundant border/background override. Event lists and calendar agendas select global flat rows; calendar cells keep their necessary spatial boundaries. Service notes use the same global flat record component. No page-specific palette or typography was added.
- **P2 — form preview was insufficient evidence.** The event specimen now validates with the real schema, handles an empty stable, confirms dirty resets and reports local application truthfully. Resolver-normalized optional values are mapped back to input defaults so a valid local save leaves a clean form.
- Shared breadcrumb/form-heading/provider-initial typography corrections are documented in the [ownership review](shared-style-ownership-2026-09-18.md). Their other consumers remain individually pending.

## Browser evidence

Inspected production view components through existing page-lab fixtures in the in-app browser. Desktop captures are 1280px wide (720px or 900px high); mobile captures are 390×844. The lab toolbar and palm devtools button are development infrastructure, not app design. Earlier HMR/build-triggered resets were discarded as interaction evidence; final service-note recovery checks used a stable build.

| Surface | Observed evidence | Remaining |
| --- | --- | --- |
| `/page-lab/event-list` | Desktop/mobile flat rows; search no-result → Clear all recovery; completed filter reduces four records to one; no page overflow at 390px | Empty stable, dense list, dark/text scaling; authenticated list/permissions |
| `/page-lab/event-detail` | Desktop standard completed record; mobile detailed long title/identifier/provider with no page overflow; minimal record removes Edit and handles no horses; breadcrumb sentence case | Full production service-note composition; other roles and missing/deleted route states; dark/text scaling |
| `/page-lab/calendar` | Desktop month + mobile agenda; recurring and spanning records; dense day expanded by Enter; focus enters agenda; Escape returns to trigger; repeat expansion then Next clears agenda; empty next month and Today reset | Authenticated route; dark/text scaling; keyboard grid semantics require separate review (current grid contains independently tabbable links) |
| `/page-lab/forms` | Required title validation focuses title and links error; dirty reset cancel retains text; local valid save status; no-horse stable gives useful validation; simple→advanced monthly UI at 390px without overflow; saved-provider ArrowDown/Enter visually fills phone | Production create/edit routing and save/failure, dirty navigation protection; dark/text scaling |
| `/page-lab/event-service-notes` | Desktop/mobile real view; opening focuses first field; pending controls disabled and no success claim; failed save retains exact draft; retry applies sample and restores Edit focus; failed withdrawal keeps dialog/error; successful withdrawal shows Withdrawn and focuses Juniper service notes row; read-only removes all action buttons; empty state | Backend mutation/authorization/organiser notification; long service data and dark/text scaling |

Phone values were omitted by the browser's read-only DOM/AX representation. The screenshot, which visibly shows `(555) 014-1902` after keyboard selection, is the evidence for autofill. Do not treat the sanitized DOM empty value as a product bug.

## Screenshots

All are real browser captures under:
`/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/event-audit/`

- `event-list-desktop.png`, `event-list-mobile.png`
- `event-detail-desktop.png`, `event-detail-long-mobile.png`
- `calendar-desktop.png`, `calendar-expanded-desktop.png`, `calendar-mobile.png`
- `event-form-desktop.png`, `event-form-recurrence-mobile.png`, `provider-keyboard-mobile.png`
- `service-notes-desktop.png`, `service-notes-failed-save-mobile.png`, `withdraw-failure-mobile.png`

No destructive or save actions used live records. Local sample withdrawal can be reversed with Reset sample records; this does not assert that production withdrawal provides Undo.

## Technical evidence and scope

Impeccable audit/craft-floor guided the bounded source and browser pass. The narrow CLI detector run over `src/components/events` returned no findings before the service-note split; it does not prove absence of semantic or runtime defects and is not credited to the whole app. No browser detector overlay was injected (read-only evaluation). Parent reviewed rendered layout and behavior; separate agents reviewed form logic, global ownership and service async behavior. This is not a formal dual-assessment critique score.

Full suite checkpoint: 251 tests in 47 files, TypeScript and production build passed. The final withdrawal-focus regression was added afterward; final checks passed: 12 focused event/form/service regressions across 3 files, TypeScript, scoped ESLint, production build and git diff whitespace checks. Full-project scope remains open in [project coverage](project-coverage.md).

## Next work

Finish explicit open event states, then continue stable management, remaining horse subpages, account/onboarding, public pages and all shared component consumers. Record evidence against each route; do not infer route completion from these samples. Small button touch targets, motion preferences and visual dark-theme verification still need a coordinated shared-control pass. Preserve deliberate landing differences.
