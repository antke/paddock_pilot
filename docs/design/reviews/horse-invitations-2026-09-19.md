# Pending horse invitations — 19 September 2026

Implemented the invitation finding from `dashboard-analysis-source-2026-09-18.md`, applying Impeccable's hardening and craft floor within the approved flat, warm global design. Scope is the AppDashboard invitation area, its extracted pure list, sample and tests. Auth, permissions and backend invitation behavior were not modified. No real invitation was approved, declined or sent.

## Production contract inspected

`events.listPendingHorseInvitations` returns pending event-horse links for the current user's active horses in accessible, unarchived stables. AppDashboard retains its event-stable filter. Approve/decline accept `{ eventHorseId }`, verify the link is invited, the horse is active and in the event's stable, then enforce owner/admin management permission. Successful mutations patch participation, notify the organizer and write audit entries. Approval also synchronizes confirmed horse IDs. These are meaningful external effects, so the browser sample never calls them.

Event editing can re-invite a declined horse by reusing its existing eventsHorses ID with a fresh invitedAt timestamp. Acknowledged UI state is therefore versioned by invitation timestamp (updatedAt/creation time fallback for legacy links), rather than permanently hiding an accepted ID.

## Changes

- `PendingHorseInvitationList` is the actual query-free view used by AppDashboard. Connected code passes the existing mutation callbacks; the view owns awaited acknowledgement, inline failure/retry and accessibility. No false successful toast is emitted on failure.
- Independent per-invitation synchronous guards prevent repeated or conflicting decisions while another row remains usable. Busy buttons name both the action and horse/event. Failed rows retain their data and link both controls to their inline explanation.
- Successful rows disappear only after the action callback resolves, or when the authoritative query removes them. Local acknowledgement does not assume a server save before that boundary. A later re-invitation remains visible.
- Flat record rows reuse shared components, fonts, selection colors and action treatments. The parent H2 section/H3 invitation hierarchy is preserved. No decorative icons or local palette was introduced; spinners convey actual pending work.
- Focus follows a removed, previously focused row to the next available row action, then to the surviving named region when the final invitation disappears. Delayed responses do not move focus away from another control the user has chosen. An initially empty production section remains absent; a processed-to-empty section retains its acknowledgement/empty state so focus has a destination.
- `HorseInvitationsPageLab({ data: DashboardLabData })` exposes populated, long-content and empty local scenarios, failure-then-retry and 3-second response controls. Changing the sample/stable invalidates pending local updates. Missing horses/events do not fabricate an eligible real invitation. All sample text identifies its local-only behavior. The entire sample is gated by import.meta.env.DEV and useDevAuthBypassEnabled before any passed horse names are cloned; outside that boundary an explanatory empty state replaces simulation controls.

## Verification

Eight DOM tests in `src/components/dashboard/PendingHorseInvitationList.test.tsx` pass:

1. Independent approve/decline pending states, duplicate-action guards, no premature acknowledgement, failed decline then retry.
2. Focus after first and final acknowledged row removal.
3. Query removal before callback acknowledgement, without later stealing unrelated focus.
4. Re-invitation using a previously acknowledged link ID.
5. Initially hidden production empty versus explicit sample empty.
6. Local failure/retry, interrupted sample outcomes and a guard against mounting live mutation hooks.
7–8. The sample does not mount outside development or when the development fixture hook is off; no actual horse names or simulated actions appear.

Scoped ESLint and full project TypeScript passed. Earlier aggregate errors belonged to concurrent analysis fixture work and had cleared by the final check. Source was frozen before the parent browser pass.

## Limits

No screenshots, native mobile/keyboard result, production permission check or backend mutation is claimed here. Parent browser review should confirm narrow long-name wrapping, busy/error rendering, native focus behavior when rows disappear, and the retained empty region. The tests assert DOM focus and asynchronous contracts, not browser layout or real persistence. Sample records illustrate pending invitations; they do not extend the backend query's authorization scope.
