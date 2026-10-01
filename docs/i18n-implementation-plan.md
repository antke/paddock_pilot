# English and Polish implementation plan

Status: implementation and automated release checks complete; authenticated browser
and print-pagination sign-off pending. Evidence: `docs/i18n/progress.md`.
Branch inspected: `polish-translation` (clean before this document was added).

## Outcome and scope

Support English and Polish across the production app, with a persistent language
choice and localized dates, numbers, validation, authentication UI, and emails.
Ship incrementally by feature while retaining English as the translation fallback.

Implementation uses these recommended product defaults:

- Recommended initial language: browser preference (`pl-*` → `pl`, `en-*` → `en`,
  first supported browser language, otherwise English). Saved choices take priority.
- Recommended release scope: all production-facing app screens, public landing and
  pricing pages, and app-generated transactional emails. App/auth can be delivered
  first if landing and email translations should follow later.

Recommended boundaries:

- Keep current routes; separate `/en` and `/pl` URLs and multilingual search-engine
  indexing are a separate project. Localize document language and runtime metadata.
- Keep names, notes, uploaded documents, addresses, event titles, and custom breeds
  as entered. Translate built-in labels while preserving their stored values.
- Language does not change timezone, currency, units, permissions, or date keys.
  Existing GBP amounts remain GBP; Polish formatting does not convert them to PLN.
- Translate production components used by labs; lab-only specimens, internal docs,
  and developer diagnostics are outside release coverage.
- Clerk-generated authentication emails require a separate capability/configuration
  check; localizing Clerk widgets does not establish email coverage.

## Repository findings

- React 19, TanStack Start/Router, Clerk, Convex, and Zod; no existing i18n package.
- `src/routes/__root.tsx` sets `ssr: false`, but still supplies an HTML shell,
  metadata, and `lang="en"`. Production smoke tests exercise the server bundle.
- `src/lib/dateDisplay.ts` centralizes most date formatting with fixed `en-GB`.
- `src/lib/numberDisplay.ts` uses the runtime's default number locale, fixes GBP,
  and implements English plurals by appending `s`.
- Components, label maps, shared validation schemas, and backend errors embed
  English. Some backend results and email payloads also contain display strings.
- `convex/schema.ts` has no user language preference. `convex/users.ts` can create
  users through both browser bootstrap and Clerk webhooks and queues welcome mail.
- Email templates cover ten categories. The outbox stores structured payloads;
  older queued payloads must remain valid. Event-change payloads contain English
  strings today. A local email preview workflow already exists.

## 1. Baseline and translation foundation

- Record baseline results for `pnpm verify` and
  `pnpm exec tsc --noEmit -p convex/tsconfig.json`; distinguish existing failures.
- Inventory production strings by feature, including charts, print views, accessible
  labels, loading/empty/error states, tooltips, notifications, and metadata.
- Add compatible pinned resolutions of `i18next`, `react-i18next`, and
  `@clerk/localizations` through pnpm. No translation service account is needed.
- Add `shared/i18n/` for the locale type (`en | pl`), pure locale resolution, and
  resources needed outside React. Keep backend imports free of browser/React code.
- Add `src/i18n/` for the React provider, browser persistence, typed translation
  access, and feature catalogs. Use semantic keys grouped by feature, complete
  sentences with interpolation, and library plural rules.
- Type translation keys and check catalog completeness/interpolation parameters.
  Compare plural message families correctly: Polish and English need different
  suffix sets, so literal equality of every suffixed key is not sufficient.
- Use an explicit locale for backend translation and formatting. Avoid a mutable
  process-wide language setting that can leak between users or server requests.

Acceptance: a representative component renders both languages, unknown locales
fall back safely, and Polish count cases render correctly.

## 2. Preference, authentication, and formatting

- Add optional `users.locale` and a validated mutation scoped to the authenticated
  user. Existing users remain valid without a backfill. Profile sync/webhooks must
  preserve existing preferences.
- Resolve signed-in language from the saved account preference; use a saved guest
  choice, then browser detection, then English when no account preference exists.
  Persist the resolved language when first initializing an unset account preference.
- Apply explicit changes immediately and save them; handle save failures visibly,
  stale query responses, account switching, sign-out, and unavailable browser storage.
  Prevent one account's cached preference from overriding another account's choice.
- Place the locale provider above Clerk and account recovery UI; synchronize account
  preferences through a child bridge once Convex authentication is ready.
- Add an accessible `English / Polski` selector to public/auth navigation and account
  settings, using existing controls and design conventions.
- Synchronize Clerk widget localization and HTML `lang`. Ensure safe server imports
  and a deterministic initial shell; document any first-visit language loading state.
- Refactor display formatters to accept the active locale (`en-GB` or `pl-PL`) and
  replace ad hoc formatters. Preserve storage helpers such as `formatDateKey`.
- Replace English count concatenation; check decimal input behavior and weekday/
  month labels without changing stored numbers, recurrence rules, or timezones.

Acceptance: selection survives reload and account use on another browser, auth UI
matches the app, existing users still sign in, and forms retain input when switching.

## 3. Migrate production UI in reviewable batches

1. Navigation, shared controls, route states, profile, onboarding, and invitations.
2. Stable dashboards, settings, members, providers, and documents.
3. Horse list/profile, care, health, medications, nutrition, history, and print summary.
4. Events, calendars, training, reminders, charts, analysis, and subscriptions/pricing.
5. Public landing copy, page metadata, and accessibility text.

- Keep feature label maps reactive to locale changes; invalidate memoized display
  strings and translate system-generated descriptions at the display boundary.
- Use stable enum/breed values as identifiers; translate built-in breed display and
  search labels without changing existing saved values or custom entries.
- Use concise, consistent Polish equestrian terminology; maintain a small glossary
  beside the catalogs and review it in actual screens.
- Review landing screenshots/product illustrations containing English separately:
  translate or replace text-bearing assets where needed for complete coverage.

Acceptance per batch: complete user journeys work in both languages, including
errors, dialogs, mobile layouts, and accessible control names.

## 4. Validation and backend-facing messages

- Localize custom Zod messages as well as built-in validation. Preserve server
  validation behavior; use message keys/parameters or locale-aware schema factories
  instead of applying a global mutable locale to shared schemas.
- Introduce structured codes and parameters for user-facing Convex failures as
  touched features migrate. Map known codes to localized messages and unknown
  failures to a helpful localized fallback; retain technical diagnostics internally.
- Audit all callers before changing error shapes. Keep compatibility with older
  clients during staged frontend/backend deployment.
- Re-render existing validation/submission errors on language change without
  clearing entered values or repeating a submission.

Acceptance: both client and server validation display in the selected language,
with unchanged permissions and validation rules.

## 5. Transactional emails

- Record an optional locale on queued deliveries. Select the recipient's saved
  preference; for unknown invitation recipients use the invitation language chosen
  by the sender (default to the sender's language), otherwise English.
- Snapshot the chosen locale when enqueueing so retries render consistently and
  account-deletion emails retain the preference after the account changes.
- Translate all subjects, preheaders, HTML, plain text, actions, and HTML language.
  Keep HTML escaping, links, deduplication, retries, and delivery policy intact.
- Replace new event-change payload prose with stable codes; retain a renderer for
  legacy queued English payloads. Old deliveries without a locale render in English.
- Pass the initial locale through browser-driven account bootstrap before welcome
  email creation where possible. Webhook-first creation may precede a browser
  preference: use English when none is known, and do not send a duplicate welcome.
  Document this behavior and verify both account-creation paths.
- Extend the local preview gallery and template tests to both languages, all ten
  categories, long names, Polish characters, and legacy queued payloads.
- Inspect Clerk's authentication-email options separately and record verified
  coverage or a concrete limitation; do not claim widget translation covers mail.

Acceptance: two recipients with different preferences receive independently
localized output; legacy deliveries and retries remain valid. Use local rendering
for verification rather than sending real messages during development.

## 6. Verification and release readiness

- Test locale precedence, persistence/auth races, invalid locale values, English
  fallback, missing messages, and Polish plurals (0, 1, 2, 5, 12, 22, 25 and decimals
  where applicable).
- Test dates/numbers without changing stored values, live language changes with
  dirty forms, translated validation, and preference mutation authorization.
- Run critical browser journeys in both languages at desktop/mobile sizes: sign-in,
  onboarding, invitation acceptance, horse editing, event creation, and a care record.
- Inspect Polish diacritics, font coverage, long labels, clipped buttons, calendar
  headings, chart tooltips, print output, and email previews.
- Extend production smoke coverage for locale-aware shell behavior as implemented;
  run `pnpm verify` and the Convex typecheck. Audit remaining production literals
  and maintain explicit exclusions for user data, proper names, and lab-only copy.
- Document how to add a message and its Polish translation. Catalog checks should
  catch omissions even though runtime English fallback remains enabled.
- Prepare deployment with backward-compatible schema/error/payload changes first,
  then the frontend. Follow the existing app/backend deployment process; production
  deployment and live test email delivery are separate from this implementation plan.

## Requirements before implementation

- Branch is ready; no new infrastructure or paid translation platform is required.
- Settle the two scope/default-language preferences above, or use the recommendations.
- Existing local Clerk/Convex configuration is needed for integrated browser checks;
  validate it through the app without printing secrets. Record any access blockers.
- Polish terminology review is useful before release and does not block foundation work.
- Run the baseline checks at implementation start; they were not run for this plan.

Rough effort remains 6–10 focused engineering days for full coverage, subject to
the string inventory, existing test baseline, and wording review. The first milestone
is foundation + persistence + app shell/auth/profile translated end to end.

## Reference documentation

- [react-i18next React integration](https://react.i18next.com/latest/using-with-hooks)
- [i18next typed resources](https://www.i18next.com/overview/typescript)
- [i18next plural messages](https://www.i18next.com/translation-function/plurals)
- [Clerk localization](https://clerk.com/docs/guides/customizing-clerk/localization)
