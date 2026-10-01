# Adding translations

The supported locales are `en` and `pl`. Browser detection selects the first supported
browser language, falling back to English. A saved account preference wins after
sign-in. Guest preferences are stored separately, so signing out does not expose the
previous account's preference as another account's setting.

## React UI

Messages live in paired feature files under `src/i18n/locales/`, composed by
`en.ts` and `pl.ts`. Use `useT()`
from `src/i18n/LocaleProvider.tsx` inside a component:

```tsx
const t = useT()
return <Button>{t('profile.save')}</Button>
```

Keys are typed. Add both translations together. Use complete sentences and named
parameters instead of concatenating translated words. Use i18next `count` plurals;
Polish needs `one`, `few`, `many`, and `other`, while English uses `one` and `other`.
Catalog tests compare message families and interpolation parameters across languages.

Call `useLocale()` for the active locale. Date and number display helpers accept it
explicitly. Storage date keys, timestamps, units, and currency remain independent of
language. Include locale/translation dependencies in memoized display data. Never
translate user-entered data or stored enum IDs.

A form can use a localized schema factory plus `useLocalizedValidation(form)` to
update existing validation errors without resetting unsaved fields or exposing new
errors. Store submission error keys rather than resolved translations when messages
must change with the language.

The React integration uses immutable English and Polish i18next instances. Do not
call `changeLanguage()` on those shared instances or make backend requests depend on
browser state. A component without the provider renders English, useful for isolated
component tests and specimens.

## Backend and email

Pure locale helpers live in `shared/i18n`. Convex validators accept only `en | pl`.
The account language is optional for compatibility with existing users. Profile
synchronization initializes an unset language but never overwrites a saved choice.

Email copy is in `shared/i18n/email.en.ts` and `email.pl.ts`; Polish is checked against
the English function signatures. These modules have no browser or React dependency.
The renderer receives the locale explicitly and escapes user values through the
existing email layout helpers. Do not interpolate unescaped data into HTML.

The outbox snapshots locale at enqueue time, preferring a known recipient's saved
language over the sender's invitation choice. Old queued deliveries without a locale
render in English. Event-change codes are translated at render time; legacy free-form
changes remain readable. Browser-first account creation can queue a localized welcome;
webhook-first creation uses English if no preference exists and never queues another
welcome solely because the user later selects Polish.

Run `pnpm email:preview` for English and Polish versions of every fixture. This renders
locally without sending messages. Use the existing app/backend release process for
rollout; frontend deployment alone does not update Convex email rendering.

## Coverage work

`node scripts/i18n-inventory.mjs /tmp/i18n-inventory.json` writes production text
candidates with source locations. It excludes tests, generated code, translation
catalogs, and lab-only files. The list needs human classification; it is not a complete
proof of coverage, and absence of candidates is not a release gate by itself.

Track wording decisions in `translation-review.md` and implementation evidence in
`progress.md`. The original implementation plan remains the scope of completion.

## Structured failures and compatibility

`shared/i18n/errors.ts` defines stable actionable codes. The event/training mutation
callers opt in with `errorFormat: 'structured'`; `convex/libs/userFacingError.ts`
keeps the exact old string payload for callers without that argument. The frontend
accepts known structured codes and exact known legacy Convex data strings. Arbitrary
error prose is never shown or interpreted; use a localized recovery fallback and
keep technical details in diagnostics.

For locale-reactive submission failures, retain the code or raw failure and resolve
its translation during render. `useAcknowledgedFormSave` accepts `formatSaveError`;
its continuation retry does not repeat a completed write. New schema factories keep
default English exports for existing backend callers.

Generated query/audit descriptions carry optional structured display data alongside
legacy strings. Translate that metadata at the UI boundary. Never translate historical
prose by guessing whether it resembles a user-entered title.

See [release-readiness.md](release-readiness.md) for rollout and outstanding checks.
