# Implementation evidence and remaining work

Status: implementation and automated release checks complete; final authenticated
browser and print-pagination checks remain pending. Branch: `polish-translation`.
Product defaults: first supported browser language, English fallback, saved account
preference first; all production UI/public pages and app-generated transactional mail.

## Implemented

- Typed paired English/Polish feature catalogs, isolated locale instances, complete
  plural/interpolation validation and an authoring guide.
- Browser/guest/account preference precedence, account authorization, bootstrap and
  webhook preservation, optimistic selection with visible failure/retry, account
  switching and stale-response protection. Clerk widgets, HTML language and runtime
  metadata follow the selected language; server shell stays deterministic English.
- Navigation, shared controls, route states, profile, onboarding, invitation handling,
  public landing/pricing, stable dashboards/settings/members/specialists/documents,
  horse profiles/care/health/medication/nutrition/weight/history/print summaries,
  events/recurrence, training/calendars, reminders and analysis/charts.
- Explicit localized dates/numbers/GBP and built-in breed display/search. Raw names,
  notes, prescriptions, custom breeds, enum IDs, currency, units, routes, recurrence
  rules, date keys and timezone behavior are preserved.
- Localized schema factories retain default English backend exports. Existing errors
  retranslate with dirty forms intact. Acknowledged save continuations do not repeat
  writes. Known event/training failures use opt-in structured codes with old-client
  string compatibility; other failures use localized recovery messages.
- Structured audit/query display metadata localizes generated event changes, training
  records and medication/weight analysis details. Ambiguous legacy prose is preserved.
- All ten app email categories in English/Polish, snapshot locale per queued delivery,
  recipient-language precedence and explicit invitation language, old-queue/event-change
  compatibility, browser-first/webhook-first welcome and deletion handling.
- Fraunces Latin-ext subset and a scoped Base UI autocomplete dismissal-label adapter.

## Final automated verification — 2026-09-29

- **`pnpm verify` passed**, including app TypeScript, ESLint, **719 tests across 149
  files**, Vercel production build and anonymous server-bundle smoke requests for
  `/`, `/sign-in`, `/sign-up`, `/pricing`, then `/` again. Smoke also asserts the
  deterministic `<html lang="en">` shell.
- **Convex TypeScript check passed** with `tsc --noEmit -p convex/tsconfig.json`.
- `git diff --check` passed.
- Initial baseline was 630 passing / four failing tests. Obsolete accessible-tab
  assertions were corrected; DashboardTabbedCard now composes the canonical section
  card. The final suite has no known failing baseline tests.
- Tests cover locale precedence/auth races, save failure/retry, unavailable storage,
  authorization, independent email languages and retries/legacy payloads, Polish
  plurals/date cases, dirty forms/live validation, retained uploads, immutable stored
  values, calendar period/focus/filter/zoom state, actionable structured errors, and
  legacy-compatible training history/audit localization.
- Twenty-six local email previews were generated, including Polish diacritics and long
  names. No live test messages were sent.

## Browser and wording review

Impeccable hardening/craft guidance was applied in bounded desktop/mobile passes.
The context script was run once; its stale `.impeccable/design.json` sidecar warning
was recorded and left outside this task.

Reviewed at 1280px and/or 390px: Polish landing/sign-in, onboarding with validation and
failed-continuation recovery, invitation cards, specialist form, month calendar/agenda
and Escape focus return, horse profile/breed selection, health and medication dialogs,
advanced recurrence controls, training calendar, analysis timeline/horse selection,
care-summary profile/contact/long-heading layout, and a Polish invitation email at
375px. The inspected mobile pages had no horizontal overflow. The lower medication
form's long labels, notes and submit button fit a 324px dialog at a 390px viewport.
The autocomplete's two hidden close controls displayed “Zamknij” in the browser.

These are real production components with local fixture data; they do not prove
Clerk/Convex authenticated journeys. English fixture text remains intentionally raw.

The extra correctness pass reviewed Polish inflections, severity/status agreement,
recurrence gender, precise dates, decimal/GBP formatting and generated descriptions.
It corrected an awkward missing-notes empty state and changed “zalecana częstotliwość”
to “oczekiwana częstotliwość” to avoid implying a treatment recommendation. Domain
alternatives are recorded in [translation-review.md](translation-review.md).

## Original plan acceptance audit

| Plan area                   | Evidence / remaining boundary                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation/catalogs         | Implemented; completeness, plural and interpolation checks pass.                                                                                            |
| Preference/auth/formatting  | Implemented and tested; live authenticated cross-browser persistence still needs a signed-in development session.                                           |
| Production UI migration     | Implemented; source audit and representative desktop/mobile checks completed.                                                                               |
| Validation/backend messages | Schema factories and live errors tested; structured mutation opt-in preserves old clients.                                                                  |
| App email                   | Ten categories, recipient snapshots, legacy compatibility and local previews tested. Clerk-hosted mail is a separately documented configuration limitation. |
| Release verification        | Full release command and Convex check pass. Authenticated critical journeys and actual print pagination remain pending.                                     |

## Remaining work and concrete blockers

Account bootstrap follow-up, 2026-09-29: the first authenticated attempt exposed an
outdated development backend (`syncCurrentUser` rejected the new `locale` argument).
Synced the configured **development** deployment with `convex dev --once --typecheck
enable`; it completed successfully. Retried account setup in the user's signed-in
Chrome tab and verified the Polish dashboard loaded. The sign-in/bootstrap blocker
is resolved; cross-browser preference persistence and full create/edit journeys
are still not claimed as verified. No production deployment was performed.

Authenticated follow-up: English account selection saved and survived a full reload
in Chrome. Switching back to Polish preserved an entered horse name and translated
the already-visible validation errors. Created the development test horse
`I18N QA — Żuraw` (ID `jn77rxxksvcp75f9p6m71a07qs8fb304`) and verified its saved
Polish profile, owner label, sex and birth year. Existing horse records were untouched.
An extension popup temporarily blocked Chrome automation. After access returned,
edited the QA horse name to `I18N QA — Żuraw (edited)`, switched the dirty form to
English, saved, and verified the updated English profile.

Also verified authenticated care/event writes:

- Created `I18N QA — kontrola danych` in English, displayed it in Polish, completed
  it in Polish, and checked the localized status and success notification.
- Created `I18N QA — wpis testowy` as a health record in Polish; its explicitly
  synthetic notes stayed verbatim in English. Resolved it in English and verified
  the date/status/notification changed correctly.
- Prepared `I18N QA — próba wydarzenia` in English, switched to Polish, checked the
  translated time-validation error, and saved the completed event for only the QA
  horse. Verified its Polish detail view, 28 September 2026 date, 12:00 time and
  completed status. Event ID: `js7edmgeyx4sb2m4jj4yygq8bx8fass7`.

These QA records remain in the development demo yard and have not been deleted.
No existing horse records were changed, and the event's single own-horse selection
does not enqueue invitations. Account language is back to Polish. Screenshots were
saved as `qa-horse-edit.png`, `qa-care-polish.png` and `qa-event-polish.png` in the
thread's visualization directory. The event screenshot has no clipped labels or
buttons. Native date/time entry required the browser's native input controls;
the automation fill helper did not commit those values to the React form.

The live pass also exposed two undefined Polish labels in Clerk's upstream resource.
Added local overrides for opening/closing the account menu; the browser now exposes
“Otwórz menu konta”. App TypeScript, targeted ESLint and formatting checks passed.

1. **Authenticated browser checks:** sign-in/bootstrap now works after the development
   backend sync described above; same-browser reload persistence and authenticated
   horse create/edit, care and event journeys are verified as described above.
   Cross-browser persistence remains unverified: the user cannot use their Google
   account in the independent in-app browser. Closed that unused sign-in tab; do not
   require connecting Google there to continue development. The existing evidence is
   authenticated Chrome reload persistence plus backend preference/auth tests, not
   a completed second-browser journey. No credentials were requested in chat.
   Prior onboarding/invitation/mobile checks used fixtures;
   they are not evidence of additional real-account membership changes.
2. **Print pagination:** Polish multipage output is now verified. Opened a normal
   Chrome tab through native UI, selected “Multipage records and long body”, invoked
   the native print button and chose **Save as PDF** (no physical printing). Chrome
   154/Skia produced a nine-page A4 PDF, `care-summary-pl-print.pdf`, retained in the
   thread's visualization directory. Rendered and visually inspected all nine pages:
   no clipping or broken Polish glyphs; the oversized record continues across pages
   3–4 and the document entries continue across pages 6–9. Extraction additionally
   confirmed all 80 numbered body lines, the end marker, all 24 document entries,
   “Żuraw”, and “Łucja Kowalska”. The apparent fragmented text in Chrome's PDF
   accessibility tree was not a rendering defect. Page images/contact sheet are also
   retained. English PDF output remains pending: native control was interrupted by
   changes to the active Chrome window. App language was restored to Polish.
   Extension-controlled print actions alone still time out; the normal-tab/native
   print-button workflow is the verified route for the remaining English check.

Do not describe all original acceptance criteria as complete until those two checks
are completed or explicitly deferred. Clerk-hosted verification mail and native
browser picker language are documented limitations, not hidden application coverage.

## Source audit and delivery

Final inventory: **1214 candidates / 133 files**, manually classified; counts are
not a coverage percentage. Remaining English includes technical diagnostics, CSS,
proper names, lab/seed data, unused landing variants, compatibility defaults and
ambiguous historical user data. See release-readiness.md for exclusions and rollout.

No commit, production deployment or live email has been performed. Use the existing
Convex/Vercel deployment process with compatible backend changes available before the
new frontend. A frontend-only rollback can retain the new backend schema.
