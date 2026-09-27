# Stable invitation access — bounded implementation

19 September 2026. Implements the invitation-token findings from [public/account source review](public-account-source-2026-09-19.md), using Impeccable harden and the craft floor. Scope is the existing public token route, its actual query-free view and a development-only specimen. No backend token/email/status policy, authentication policy, membership record or notification behavior was changed. No live invitation was accepted, declined or sent.

## Contract and ownership

`stableInvitations.preview` already returns `not_found` or a found stable invitation with effective status and a server-derived viewer. Accepted/declined ownership, verified invited-email match, account preparation and legacy activation remain server-derived. `accept` validates the token/stable/role/status/expiry/email, activates membership, updates onboarding and invitation state, records the audit event and queues membership email before returning. Its successful response therefore truthfully means active membership. `decline` retains its existing checks and updates.

The route keeps Clerk sign-in/sign-up/switch-account controls and both Convex mutations. The query now uses the existing `convexQuery`/`useSuspenseQuery` convention with route pending/error components and the standard query-boundary reset before retry. A query exception has an owned recovery page instead of the framework's default error presentation. There is no fabricated authentication form or local permission decision.

`components/invitations/InvitationPageView.tsx` exports backend-derived `InvitationPreview`, `FoundInvitationPreview`, the actual `InvitationPageView`, and `InvitationQueryErrorView({onRetry})`. The main view accepts preview, signed-in state, injected asynchronous accept/decline callbacks, account-action slots, and an optional sample marker. Remount it when the token changes; the production route keys its connected/signed-out view by token.

## Behavior and design

- Found, missing and query-error pages have an actual H1. Static response sections use ordinary globally styled H2 sections rather than urgent alert semantics. Summary details retain readable labels and values without nested framed boxes.
- Acceptance/decline have a synchronous shared guard, disabled opposing action, named pending state, retained inline failure and explicitly labelled retry. Error text reports that the choice was not confirmed, without asserting an ambiguous request could not have reached the server.
- Success appears only after the injected mutation callback resolves or the authoritative query changes status. Acknowledged production acceptance continues to say that stable membership is active. Acknowledged local acceptance explicitly says that no real access was granted. Authoritative non-pending states take precedence over the temporary acknowledgement projection.
- The surviving named response region is programmatically focusable. If the focused action is removed by acknowledgement or a reactive query result, focus moves to that region; delayed completion does not steal focus from an unrelated control. The missing-invitation state also retains a focus destination. No initial-mount focus grab was introduced.
- Signed-out, preparing-account, wrong/no-verified-email, expired/revoked, declined, accepted-by-self/other and legacy accepted-pending-subscription branches retain their policy distinctions. Sign-in/up and switch-account preserve the existing invitation return path. Legacy activation reuses the real accept operation; it does not add a subscription requirement.

## Safe specimen integration

`components/page-lab/prototypes/InvitationsPageLab.tsx` exports **`InvitationsPageLab({data: DashboardLabData})`**. Parent owns Page Lab registration; this module does not edit registration. It is separate from horse-event invitations.

The specimen checks both `import.meta.env.DEV` and `useDevAuthBypassEnabled` before mounting the local sample. Seventeen scenarios cover the actual discriminated branches, including long names and query failure. Controls choose quick/3-second pending responses and failure-then-retry. Callback acknowledgement only updates view state; it cannot invoke a Convex query, mutation, membership change, upload or notification. Scenario/stable remount invalidates pending local responses. Authentication buttons explain the sample boundary instead of opening a fake login. Profile/stable links retain real destination URLs and may leave the sample.

## Verification

**20 DOM tests in one file pass** (`InvitationPageView.test.tsx`): conflicting repeated actions, pending state without premature success, failed accept/decline and retry, error association, acknowledged focus, reactive response before callback, unrelated-focus preservation, later not-found focus, all status/auth branches, H1 presence, legacy activation, query retry callback, delayed sample failure/retry/interruption, and development/fixture boundary exclusion. The sample suite makes live query/mutation hooks throw if accidentally mounted.

Scoped ESLint and diff whitespace checks pass. A full TypeScript run passed after the initial implementation; the final run has no invitation-source errors but reports concurrent `OnboardingPageLab.tsx` fixture errors (deferredSteps inferred as never[] and unsupported owner field). These were reported to the parent; this bounded report does not claim that unrelated work passed. No build or browser was run by this subtask.

## Remaining evidence

Parent browser pass must verify desktop/390px layout, long-name wrapping, native keyboard focus, pending/error presentation, source/fixture query recovery and interrupted state. Unit tests do not establish real query subscription recovery, Clerk behavior, verified-email/token security, real accept/decline acknowledgements, membership navigation, notification delivery or account bootstrap. Those require safe authenticated/backend testing, not changes to real invitations merely for a visual audit. Route error reset callback wiring is source-reviewed; a live failing Convex query was not induced.

## Existing route-test harness correction

The parent's aggregate run exposed six existing `stables/InvitationPage.test.tsx` failures because that harness still mocked the removed `useQuery` call and mounted the new suspense-query route without QueryClientProvider. The harness now seeds the real `convexQuery` key in a local QueryClient with infinite stale time, preventing network requests while exercising the actual route adapter. All six existing cases are retained. The accept case now verifies both choices before clicking and the acknowledged membership result afterward, rather than requiring obsolete response buttons to remain after success. No route or recovery behavior was reverted to accommodate the test.

**26 tests across both invitation files pass** after this test-only correction; scoped ESLint passes. This adds no browser, live mutation or final aggregate claim. Source is frozen for the parent browser pass.
