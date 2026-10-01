# English/Polish release readiness

Branch: `polish-translation`. Date: 2026-09-29.
Code coverage is implemented; authenticated browser and print-pagination sign-off
remain pending. No production deployment, commit, or real test email was performed.

## Rollout

1. Run `pnpm verify` and `pnpm exec tsc --noEmit -p convex/tsconfig.json`.
2. Deploy the backward-compatible Convex schema/functions before publishing the new
   frontend. The existing `pnpm build:vercel` flow builds/smokes the frontend inside
   Convex's deployment command; Vercel publishes after that command succeeds. Retain
   that flow, and do not separately publish a new frontend against old functions.
3. New optional fields: account language, queued-delivery locale, audit details and
   generated analysis/training-history display metadata. No backfill is required.
   New `errorFormat: 'structured'` arguments are optional. Old frontend clients retain
   their string-error contract; old queues render English. Unknown invitation
   recipients use the sender's explicit invitation language; known recipients use
   their saved language. A webhook-first welcome defaults to English if unknown.
4. Check account preference persistence and language changes in the deployed preview
   with a signed-in development account, then complete the browser checks below.
5. A frontend rollback can retain the new backend. Do not roll back schema validators
   to versions that reject optional fields already stored in users, queues or audits.

## Remaining integration checks

Development bootstrap was repaired on 2026-09-29: the running backend still rejected
`syncCurrentUser({locale})` with its old empty argument validator. A successful
`convex dev --once --typecheck enable` synchronized the development schema/functions.
Retrying in the signed-in browser then opened the Polish dashboard. Keep the local
Convex development process running when changing backend contracts; Vite alone does
not update Convex. This was a development sync, not a production deployment.

- Signed-in account bootstrap, dashboard loading, account-language persistence after
  a Chrome reload, live validation translation with input retention, and authenticated
  horse creation/editing, care record creation/completion and event creation are
  verified. The temporary extension-popup blocker cleared. Cross-browser preference
  persistence remains unverified because the user's Google account is unavailable
  in the independent in-app browser. That unused sign-in tab has been closed; no
  Google connection is required for continued development. Chrome reload and backend
  preference/auth tests provide partial evidence, not second-browser sign-off.
  The QA records and exact journey evidence are recorded in progress.md.
  Onboarding/invitation/mobile passes used production components with fixtures;
  no additional real-account membership changes were performed.
- Polish print output is verified through Chrome's native **Save as PDF** workflow:
  nine A4 pages from `/page-lab/care-summary` with “Multipage records and long body”.
  All pages were rendered and visually inspected without clipping/broken glyphs;
  extracted text includes every numbered line (1–80) and document entry (1–24).
  `care-summary-pl-print.pdf` and the rendered contact sheet are retained in the
  thread's visualization directory. English PDF output remains pending because the
  active native Chrome window changed during control. Use a normal Chrome tab and
  native print-button click for that check; extension-controlled clicks timed out.
- Clerk widget translation is implemented. Hosted verification emails/SMS and Account
  Portal language require separate Clerk configuration; no per-recipient hosted email
  localization has been established. This limitation is also in translation-review.md.
- Native date/time pickers follow browser/OS language. Form labels and schema errors
  follow the app language. This does not affect stored date keys or timezones.

## Source audit and exclusions

The inventory scans production source, shared modules and Convex; it is a candidate
list, not a coverage percentage. The final pass classified the remaining English:

- Developer exceptions/logs, enum IDs, CSS, keyboard keys, content types and proper
  names (Paddock Pilot, Premium, BCS, example people/horse names) are not UI messages.
- User-created names, descriptions, training focus/outcome, dosage, instructions,
  documents and custom breeds remain verbatim. Seed and lab fixture prose is sample
  data. Lab-only navigation and tooling labels remain English.
- Shared validation defaults and legacy exported label maps remain English for
  compatibility; production rendering uses locale factories/catalogs. No production
  caller uses the old English `formatCountLabel` helper.
- `LandingAppPreview`, `LandingProductProof` and `landingContent` are unused legacy
  landing variants, with no production route consumer. The active country landing
  renders localized copy and text-free photography. Its alt text is localized.
- Initial SSR metadata/language and RSS description remain deterministic English;
  the client updates document language/description after preference resolution.
  Multilingual SEO URLs/feed content were explicitly excluded from this release.
- Legacy queued email payloads and ambiguous audit/query prose remain readable;
  new structured metadata supports localization without guessing about user data.
- Missing-parent fallback strings in legacy backend results remain for old clients;
  normal queries obtain items from already-resolved stable/horse/event scopes.

The final audit corrected shared scroll-region accessibility text and generated
training-history “Skipped” / “Next focus” descriptions. New metadata preserves raw
focus notes; status badges distinguish skipped training from cancelled events.

## Wording feedback

The additional correctness pass checked Polish noun cases/plural families, event
recurrence ordinals, severity/status agreement, date precision, numeric formatting,
user-data preservation and generated descriptions. Domain choices still benefit from
owner feedback: kowal/podkuwacz, werkowanie/korekcja kopyt, rymarz/saddle fitter,
flatwork/praca na płaskim, BCS/ocena otłuszczenia, and the two Polish sport/warmblood
breed identifiers. See [translation-review.md](translation-review.md) for alternatives.
