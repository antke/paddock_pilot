---
name: Paddock Pilot — Editorial email letter
description: The public landing identity adapted to transactional email.
colors:
  evergreen: '#263f30'
  paper: '#f7f1e5'
  supporting-copy: '#4e5547'
  rule: '#c8caba'
  clay: '#aa563e'
typography:
  wordmark:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: '26px'
    fontWeight: 700
    lineHeight: '32px'
  headline:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: '38px'
    fontWeight: 400
    lineHeight: '44px'
    letterSpacing: '-0.5px'
  body:
    fontFamily: 'Arial, Helvetica, sans-serif'
    fontSize: '16px'
    lineHeight: '26px'
  action:
    fontFamily: 'Arial, Helvetica, sans-serif'
    fontSize: '16px'
    fontWeight: 700
    lineHeight: '22px'
  note:
    fontFamily: 'Arial, Helvetica, sans-serif'
    fontSize: '14px'
    lineHeight: '22px'
  caption:
    fontFamily: 'Arial, Helvetica, sans-serif'
    fontSize: '12px'
    lineHeight: '19px'
  signature:
    fontFamily: 'Georgia, Times New Roman, serif'
    fontSize: '18px'
    lineHeight: '26px'
rounded:
  action: '4px'
spacing:
  desktop-gutter: '40px'
  mobile-gutter: '24px'
components:
  button-primary:
    backgroundColor: '{colors.evergreen}'
    textColor: '{colors.paper}'
    typography: '{typography.action}'
    rounded: '{rounded.action}'
    padding: '16px 24px'
  letter:
    backgroundColor: '{colors.paper}'
    width: '100%'
    padding: '40px 40px 32px'
---

# Design System: Paddock Pilot — Editorial email letter

## Overview

**Creative North Star: "The editorial letter"**

This email-only record captures the implemented adaptation of the
[public landing identity](../landing/DESIGN.md): warm cream paper, evergreen
type and a restrained clay accent. The text-led letter uses system fonts and
live HTML, with no external fonts or images.

The source of truth is [layout.ts](../../../convex/libs/email/layout.ts) and
[templates.ts](../../../convex/libs/email/templates.ts). This record does not
define the authenticated application or replace the landing design system.

## Colors

Evergreen is the primary color for the wordmark, heading, detail lists,
signature, links and action fill. Paper is the continuous background and
reverse action text. Supporting copy softens paragraphs, notes and footer
captions; the rule color divides the wordmark and footer from the message.
Clay is limited to the wordmark dot and keyboard focus outline.

## Typography

Georgia with Times New Roman and serif fallbacks carries the wordmark, heading
and footer signature. Arial with Helvetica and sans-serif fallbacks carries
reading copy, details, notes, captions and actions. The frontmatter records
the implemented desktop hierarchy; email does not load the landing's fonts.

The heading is regular weight and the wordmark is bold. Detail lists use the
body size and line height. At viewport widths up to 480px, the heading becomes
32px with a 38px line height. Long user-provided names and fallback URLs wrap
within the letter.

## Layout

A centered presentation table is fluid up to 560px wide, with an Outlook
conditional table supplying the same fixed desktop width. The outer paper
background continues through the letter; there is no separate card canvas.
The desktop inset is recorded by the letter component. At widths up to 480px,
the inset becomes 28px vertically and uses the mobile gutter horizontally.

Reading order is hidden preheader, wordmark and rule, one heading, message
paragraphs or a detail list, optional action, optional note, then footer.
Paragraphs have a 20px bottom margin; the heading, lists, actions and notes
use 24px separation. Detail lists have a 22px left inset and 8px spacing below
each item. The wordmark has 24px bottom padding and 32px bottom margin; the
footer begins with a rule and 24px top padding.

## Elevation & Depth

The letter is flat. Continuous paper, typography and thin horizontal rules
provide hierarchy; there are no shadows, textures or animated effects.

## Shapes

The table shell is rectangular with no visible border. Actions have the small
corner radius recorded in the frontmatter. Wordmark and footer separators are
single-pixel rules.

## Components

- **Wordmark:** live serif text reads “Paddock Pilot” followed by the clay dot.
- **Message:** one semantic heading, readable paragraphs and optional bulleted
  details. The shared helpers escape user-provided text.
- **Primary action:** a table-backed evergreen link uses the action tokens and
  Outlook padding fallback. It has no custom hover or motion treatment. Where
  supported, keyboard focus uses a 2px clay outline with 4px offset.
- **Footer:** “Good care is a shared effort.” appears as the serif signature,
  followed by a small account-or-stable-update caption. When an action exists,
  a matching underlined URL is supplied below as a copyable fallback.
- **Informational messages:** membership removal, stable archival and account
  deletion omit both the app action and its fallback URL. Other templates use
  their existing destination and action label.

## Do's and Don'ts

- **Do** preserve the cream, evergreen and clay palette within this email scope.
- **Do** keep email-safe system fonts, presentation tables, inline styles and
  synchronized HTML/plain-text content.
- **Do** review output from the production renderer before deployment using
  the [email preview workflow](../../email-templates.md).
- **Don't** introduce app links in removal, archival or account-deletion messages.
- **Don't** import landing photography, external fonts, hover animation or new
  claims into transactional messages.

The local gallery is generated by `scripts/preview-emails.mjs` at
`.email-preview/index.html`. Independent review inspected four browser captures
in `.email-preview/review` and found no changes required for the local preview.
That review does not certify Gmail, Outlook, dark-mode rendering or delivery;
the workflow records the remaining approval and rollout checks.
