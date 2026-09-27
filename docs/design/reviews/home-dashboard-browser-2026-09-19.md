# Signed-in home composition — local browser confirmation

19 September2026. Actual production-owned `AppDashboardView` rendered through the local home specimen, combining `StableCommandCenter` and `PendingHorseInvitationList`. The connected `AppDashboard` wrapper retains authentication, queries and active-stable persistence. Browser observations below were recorded by the parent; no live invitation or preference was changed.

## Observed behavior

- Cedar Ridge Barn shows two pending invitations in the combined home composition. At390 its document width stays390. Desktop1280 captures show both the combined home and separate stable-dashboard composition.
- No stables renders the defensive fallback with Get started pointing to onboarding. That link was not activated; this does not prove the normal root onboarding redirect. The no-invitations sample renders zero invitation regions.
- Cedar approval with a three-second delay disables the pending action. Switching to North before completion leaves only Meadow's row after the delay, without acknowledgement from the replaced Cedar request. Invitation contents match the selected stable.
- North's local decline failure retains an actionable alert. Enter on Decline retries, reaches the local acknowledgement and focuses the surviving region with no Pending invitation state. This is callback simulation, not a backend decline.
- Returning to Cedar resets both sample invitations. The specimen was then reset to Stable dashboard composition.

## Captures

Real parent-inspected screenshots:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/home-dashboard-confirmation/combined-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/home-dashboard-confirmation/no-stables-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/home-dashboard-confirmation/combined-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/home-dashboard-confirmation/dashboard-1280.jpg`

## Evidence and limits

Source owners: `src/components/dashboard/AppDashboardView.tsx`, `src/components/dashboard/AppDashboard.tsx`, `src/components/page-lab/prototypes/HomeDashboardSample.tsx`, and the existing actual command-center/invitation owners. Agent focused validation passed19tests/4files; this is separate from any later combined project checkpoint.

The R05 signed-in combined-view gap is bounded-addressed. Actual authentication, saved active-stable preference, normal root onboarding redirect, backend invitation permissions/notifications/persistence and real query subscriptions remain unverified. The no-stables branch is a defensive local view, not observed authenticated account bootstrap. Existing constituent-view evidence is preserved; this pass adds their composition and replacement behavior. No whole route or project completion is claimed.

## Subsequent frozen-composition checkpoint

The parent full-suite rerun passed592tests/119files after caching repeated timeline-test button lookups without weakening assertions. The initial run had590passes and two timeline-control timeouts. Full TypeScript, production Vite build,35-file scoped lint/format and detector with no findings passed. Logs use `/tmp/paddock-audit-composition-*`, with final tests at `/tmp/paddock-audit-composition-tests-final.log`. This checkpoint precedes the separate later tabs correction; it does not certify that correction or close live/backend boundaries.
