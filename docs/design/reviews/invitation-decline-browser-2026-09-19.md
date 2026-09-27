# Invitation decline — local browser confirmation

19 September2026. Parent browser observations of the actual `InvitationPageView` in `/page-lab/invitations` at390px, using the existing development-only `InvitationsPageLab` callbacks. No invitation, membership, account or backend record was changed. No invitation source correction was needed in this pass.

## Observed interaction

From the ready state, Next sample response was set to failure with a3000ms delay. Double activation of Decline showed disabled Accept and Declining controls; focus was on the invitation region. Failure retained the decision interface with an explicit unconfirmed-response alert and Try declining again.

Enter on that retry action reached Invitation declined, displayed the local-only acknowledgement and left focus on the surviving invitation region. Continue and Create your own stable were present; neither destination was activated. This verifies the local decline branch, not real membership behavior or those destinations.

A separate pending Decline in the long-name scenario was interrupted by switching immediately to Expired. After more than three seconds, Expired remained visible and there were zero Invitation declined headings. No stale acknowledgement replaced the selected scenario. The specimen was reset to ready/pending and reloaded afterward.

## Screenshots

Real inspected viewport captures:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/invitation-decline-confirmation/failure-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/invitation-decline-confirmation/acknowledged-390.jpg`

## Evidence and limits

Owners: `src/components/invitations/InvitationPageView.tsx` and `src/components/page-lab/prototypes/InvitationsPageLab.tsx`. Existing acceptance/static-state evidence is preserved in [public/account browser confirmation](public-account-browser-2026-09-19.md); this pass adds the distinct decline and interrupted-response state. Pending UI observations do not establish exact callback counts.

This closes the bounded local decline priority. Live token/email/account rules, persisted decline, notifications, authentication switching, linked destinations, physical touch, assistive-technology speech and other unobserved configurations remain outside this pass. No new test/build result is claimed by this browser-only report. Inventory updates await the concurrent source batch freeze; no route is marked complete here.
