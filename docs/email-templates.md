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
categories, all three participation responses, and a long-name example with
Polish characters. Choose a template, toggle desktop/mobile width, open its
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
