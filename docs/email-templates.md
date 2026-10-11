# Email templates and local previews

Transactional emails are authored in code, not in the Resend template editor.
`convex/libs/email/templates.ts` owns subjects, body copy and plain text;
`convex/libs/email/layout.ts` owns the shared email-safe HTML shell. The existing
Resend adapter sends the resulting HTML and text without a template ID.

## Preview before deployment

Run from the project root (no credentials or running backend required):

```sh
pnpm email:preview
```

Open `.email-preview/index.html` in a browser. The gallery includes all ten email
categories in English and Polish, all three participation responses, and a long-name example with
Polish characters. Preview filenames begin with `en-` or `pl-`. Choose a template, toggle desktop/mobile width, open its
standalone HTML, or inspect/download its plain-text alternative.

The gallery and individual `.html`/`.txt` files are generated from the production
renderer, not separate mockups. Re-run the command after changing a template.
All fixture names and tokens are fictional and all action URLs use the reserved
`paddock.example` domain. The command does not load `.env`, send mail, or deploy.
Generated files are gitignored and outside the application's public directory.

If your browser restricts local file previews, serve only the generated folder:

```sh
python3 -m http.server 9095 --bind 127.0.0.1 --directory .email-preview
```

Then open `http://127.0.0.1:9095`. Stop the server with Ctrl+C when finished.

## Editing safely

- Keep the existing template payloads compatible with already-queued messages.
- Use `paragraph` and `detailList` for user-controlled values. The shared layout
  escapes headings, preheaders, notes, action labels and URLs. Its `body` argument
  accepts trusted HTML only; never interpolate raw user content into it.
- Keep plain text, subjects and action destinations in sync with the HTML.
- Keep removal, archival and account-deletion emails informational: no links to
  records the recipient can no longer access.
- Keep expiry wording relative to issue time; the current invitation payload
  does not carry an exact expiry date or inviter name.
- Update `scripts/email-preview/fixtures.ts` when adding an email category.
- Use the email-scoped design record in `docs/design/email/DESIGN.md`; do not
  change the global app styling for email-client limitations.

## Approval and rollout

1. Review the generated HTML locally and approve the visual design and wording.
2. Run tests, both application and Convex typechecks, lint, and the app build.
3. Deploy the Convex template changes through the project's existing deployment
   flow only after approval. A frontend-only deploy does not update these emails.
4. Trigger a fresh invitation to an authorized test recipient. Previously sent
   messages will not change or automatically resend.
5. Check Gmail and Outlook on desktop/mobile, including dark mode, subject and
   preview text, action link, delivery events and authentication results.

Browser previews do not emulate email-client CSS rewriting or prove inbox
placement. No live email-client or deliverability certification is implied.
This styling change does not alter provider selection, API keys, DNS, webhooks,
retry handling or which application events enqueue email. Sender display name
and reply-to remain configured in the production Convex environment.

## Language selection

App email copy lives in `shared/i18n/email.en.ts` and `email.pl.ts`. The outbox stores
an optional locale for each delivery. Known recipients use their saved account
language; new invitees use the language chosen in the invitation form, defaulting
to the sender's language. Retries retain the original delivery locale. Older queued
messages without one remain English, and legacy event-change descriptions remain
readable. See `docs/i18n/README.md` for implementation conventions and
`docs/i18n/translation-review.md` for wording decisions and Clerk-auth-email limits.

## Daily care summaries

Care reminder email is off by default. Profile → Email reminders enables one
summary per account/local calendar day across its active stables. The saved
IANA timezone is captured from the account or browser when enabling. A 30-minute
job checks after 09:00 local time, including DST. Only pending reminders due
today or earlier for active horses are counted; a stable with no due care does
not appear. Ownership and current `member` memberships authorize recipients.

The transactional outbox handles deduplication, leases, retries and provider
webhooks. Daily scheduling also records the last queued date on the account.
Before sending or retrying, the worker rechecks opt-in, email address, active
account, memberships, archived stables and current due care. An empty or
previous-day digest is skipped. Unsubscribing happens through the Profile
preference. Invitations and event updates are unaffected.

The `care-reminder-digest` preview fixture uses fictional data. Automated tests
exercise queueing and preparation with the console provider and do not send to
real recipients. Runtime delivery still requires the existing provider setup;
console delivery only logs locally.
