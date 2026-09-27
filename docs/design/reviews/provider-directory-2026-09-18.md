# Provider directory audit — 18 September 2026

Scope: `StableProvidersCard`, `StableProviderForm`, `StableProviderCard`, and a new development-only `ProvidersPageLab`. This pass follows the approved journal system and Impeccable craft-floor: global flat surfaces, clear typography and state feedback, no new decorative local styles. Browser review is pending with the parent audit; this report does not claim visual completion.

## Findings and fixes

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | Rejected create promises could escape the form without local recovery; update errors were swallowed by the mutation wrapper | The form catches rejected submissions, displays an inline recovery message and keeps inputs. Mutation owners resolve after real persistence and reject failures. Success toasts remain after `await`. |
| P1 | Removal could be repeated or dismissed while pending; failed removal had only a generic toast | Confirmation now owns a synchronous duplicate guard, visible pending/disabled state, dismissal guard and inline error. Failure retains the dialog for retry. |
| P2 | Closing/removing editing controls could lose keyboard focus | Opening the inline editor focuses Name; cancel/success returns to the row Edit trigger. Removing a row returns focus to a surviving directory control using the dialog's final-focus API. No initial page focus grab. |
| P2 | Provider forms reused fixed input IDs and omitted error descriptions/type group name | Per-instance IDs connect labels and field errors; Provider type has an accessible group name. |
| P2 | Provider cards used boxed chrome and an action-like title color despite having no title link | Reused global flat card chrome and neutral static title tone. Editing uses a flat global row instead of an extra FieldPanel. |
| Verification gap | Existing settings lab has inert actions and cannot prove CRUD behavior | New sample page renders the same production view with local create/update/remove, empty/read-only, response timing and failure controls. It is gated to development fixture mode. |

## Verification

Four targeted DOM regression tests cover pending/repeated edit submission, failure retaining draft, retry and edit focus restoration; pending create Escape guard and failed draft retention; confirmed removal, failure/retry and focus after row deletion; named provider type and unique field/error associations.

Scoped ESLint passes. Whole-project TypeScript initially reported errors in concurrently edited stable form/page-lab files outside this change; the provider source files did not produce type errors. No live mutations, external emails or notifications were sent.

## Outstanding evidence

- Desktop and narrow-screen screenshots and actual browser keyboard confirmation.
- Local successful create/update/remove and long-name/email rendering through the registered sample page.
- Production settings as an authenticated owner/member, query loading/error and backend mutation failure/persistence checks.
- Existing Settings lab is unchanged; its illustrative action callbacks must not be mistaken for the new working provider specimen.
