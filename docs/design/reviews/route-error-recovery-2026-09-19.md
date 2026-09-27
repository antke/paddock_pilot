# Route error recovery — 19 September 2026

Scope: default route rendering/loading failure recovery and existing shared query-error retry. Impeccable harden and the craft floor apply. No route-specific copy, authentication policy, backend mutation, provider architecture, global styling or coverage inventory changed.

## Confirmed problems

1. `src/router.tsx` registered a global pending component but no `defaultErrorComponent`. Unhandled route failures therefore fell back to TanStack's implementation rather than the application's shared recipes and recovery actions. The installed fallback contains a Show/Hide Error control and displays `error.message`; the application should not expose backend details as user-facing recovery copy.
2. `RouteQueryErrorAlert` called the React Query reset boundary and then TanStack's `reset()` only. In the installed router, `CatchBoundary.reset()` clears its React error state, but `MatchInner` throws again when the loader match still has `status === 'error'`. A real failing loader regression confirmed this: clicking retry left loader call count at one, even after its next invocation was configured to succeed.

## Installed implementation inspected

Version: `@tanstack/react-router` 1.170.32.

- `src/CatchBoundary.tsx`: `reset()` clears the boundary's `error`; default `ErrorComponent` renders error details.
- `src/Match.tsx`: route `errorComponent` takes precedence over the router default; a client match with error status throws the match error. The boundary reset key is the match, so invalidation may replace/remount boundaries.
- Installed `@tanstack/router-core/src/router.ts`, `invalidate()`: marks matching routes invalid, transitions errored load-bearing matches to pending, retires prior loader work and invokes `load()`. Therefore recovery must invalidate the loader state, not just reset the render boundary.
- React Query's `QueryErrorResetBoundary` and `errorBoundaryUtils`: reset permits a failed suspense query to retry on remount; it is retained alongside router invalidation.

## Shared correction

`src/router.tsx` now sets `defaultErrorComponent: RouteError`. The new component uses `DashboardPage`, `RouteQueryErrorAlert`, and normal shared buttons. Its title is a semantic h1, “This page couldn’t load”, with a plain retry instruction and Go home escape. It does not inspect/render the error object, assert that data was saved, or claim that earlier operations made no changes. Existing inline `RouteStatusAlert` titles remain unchanged; no global heading promotion or custom h1 CSS was introduced.

`RouteQueryErrorAlert` now:

- synchronously guards duplicate activation and exposes disabled/busy “Trying again…” feedback;
- resets the query boundary, then awaits actual `router.invalidate({ sync: true })`;
- resets the old React boundary only if its component epoch and original history entry still match;
- catches unexpected invalidation rejection with generic inline retry feedback;
- suppresses post-unmount/navigation state changes and old-boundary reset;
- accepts optional additional recovery actions so the default error can offer home while preserving explicit-route content.

Ordinary loader failures may cause the installed router to replace the error boundary during invalidation; tests exercise that real lifecycle rather than assuming a local ref survives. A renewed error boundary remains retryable. Global `Button` sizing replaces the old local `min-h-11` override, matching the default home action. All colors, surfaces, focus recipes and motion remain global.

`RouteStatusAlertProps` now omits the native HTML `title` before defining its existing ReactNode title contract; previously the native string intersection unintentionally rejected rich semantic title content.

## Exact existing consumers

The default is inherited by routes without an explicit error component. Explicit error component precedence is unchanged. These six existing routes continue to supply their original titles/descriptions to the now-hardened `RouteQueryErrorAlert`:

- `src/routes/profile.tsx`
- `src/routes/stables/_layout/$stableId/index.tsx`
- `src/routes/stables/_layout/$stableId/edit.tsx`
- `src/routes/stables/_layout/$stableId/members.tsx`
- `src/routes/stables/_layout/$stableId/settings.tsx`
- `src/routes/stables/_layout/$stableId/horses/index.tsx`

`src/routes/invitations/$token.tsx` has a separate invitation-specific query error view and reset callback; it remains unchanged. Entity-not-found alerts, sign-in prompts and inline user-state alerts retain their existing semantics. No individual route file was edited.

## Verification

Before correction, the actual installed-router loader recovery test failed: expected two loader calls after retry, received one.

After correction, **6 tests pass across 2 files**: five new `RouteError.test.tsx` cases and the existing `RoutePending.test.tsx` case. New tests use actual memory-router routes, loaders, CatchBoundary lifecycle, and an actual QueryClient/suspense query:

1. Existing explicit message + real failed loader successfully reloads.
2. Default generic h1 hides private details; duplicate retry invokes one deferred loader; a second failure remains retryable; a third attempt succeeds. Pending UI appears during the deferred loader.
3. Deferred retry interrupted by navigation does not reset the previous boundary or overwrite the destination page after late completion.
4. Failed suspense query retries after reset and preserves the explicit route-specific message rather than replacing it with the default.
5. Persistent render error supports retry and working home navigation without rendering private error text.

Scoped ESLint and full TypeScript checking pass. Files changed: `src/router.tsx`, `src/components/layout/RouteStatusAlert.tsx`, new `RouteError.tsx`, new `RouteError.test.tsx`, and this report. No build, browser, network-backed query, backend write or real authentication action was run by this worker.

## Boundary and evidence limits

The installed `Match` renders the root `shellComponent` outside its route `CatchBoundary`. This application puts `ConvexProviderWithClerk`, `AppUserStateProvider`, `TooltipProvider`, and `ApplicationRouteShell` in that shell. Exceptions originating in that shell/provider layer are **outside this route fallback's catch boundary**. This change is not a universal application crash boundary and must not be reported as covering provider initialization/authentication failures.

The default home link cannot repair a failing root shell. Browser/native focus and responsive inspection remain open. For a safe browser confirmation, use a local controllable failing loader/query, repeat retry, navigate away while retry waits, and confirm that generic recovery and pending feedback remain legible at narrow widths and under reduced motion. Do not use live mutations to manufacture a failure.

## Developer-only rendered recovery specimen

`page-lab/prototypes/RouteRecoveryPageLab.tsx` is registered as **Route recovery** at `/page-lab/route-recovery`. It requires both development mode and the existing development sample bypass. Connected/production access renders a plain unavailable-sample message; no authentication or route policy changes were made.

The specimen embeds an isolated TanStack memory-history router, using the actual `RouteError` and `RoutePending` owners. Its initial `/sample` loader rejects locally. Actual “Try again” invalidates that memory router; no application loader, backend failure, saved record or external destination is manufactured. A separate QueryErrorResetBoundary keeps query resets local. The actual “Go home” link reaches the specimen’s `/` destination, labeled “Sample home,” without changing the application URL. No shared recovery styling, API or production behavior was changed for the fixture.

Controls above the boundary:

- **Next sample retry** (`#sample-route-outcome`): **Load successfully** (`success`, default) or **Fail again** (`failure`). The loader snapshots the outcome per attempt, so changing it mid-attempt applies to the next attempt.
- **Sample load delay** (`#sample-route-delay`): **1.5 seconds** (`1500`, default) or **Immediate** (`0`). This exposes the real pending owner without contacting a server.
- **Restart sample**: replaces the isolated router and restores its deliberate initial failure/default controls.
- **Open sample home**: provides a local escape while the pending owner has replaced the error view, allowing interrupted-navigation inspection.
- The actual error view’s **Try again** and **Go home** remain unchanged. Successful local load shows “Sample page loaded.”

Outstanding loader delays clear on abort/restart/unmount and reject as cancellation. A restart regression verifies that an old attempt cannot replace the new error view. Three specimen tests exercise the actual nested installed router: repeated failure followed by acknowledged local success, home isolation and no outer-router invalidation; delayed restart safety; guard behavior outside sample mode. Combined with the existing five recovery tests, **8 tests pass in 2 files**. These are behavioral tests, not reset-only mocks or styling assertions.

Scoped formatting/ESLint and full TypeScript checking pass. Subsequent browser confirmation at 320×568 and 1280×720 is recorded in `directory-route-recovery-browser-2026-09-19.md`: repeated failure, successful retry, keyboard action order, local home navigation and interrupted load were observed. Reduced-motion and physical screen-reader verification remain outside that browser pass. This fixture does not add coverage for failures outside the route boundary (root shell/providers), physical screen-reader output, live authentication, or real backend outages. No ledger update is part of this implementation.
