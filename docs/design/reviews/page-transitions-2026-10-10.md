# Page transitions — implementation and verification

Implemented with the installed TanStack Router native View Transitions integration. No dependency or React upgrade.

## Motion policy

- Mobile main tabs follow their visible order (Home/Today, Events, Training, Horses): incoming content travels 24 px over 240 ms, outgoing content 12 px over 140 ms. Selecting a tab to the left reverses the movement, independent of browser history. Desktop main navigation and workspace changes retain the 180 ms arrival / 140 ms exit fade.
- Mobile detail and editor navigation: incoming content travels 16 px horizontally, outgoing content 8 px in the opposite direction. History Back and returning to a parent reverse this movement. Desktop uses the same timings with no translation.
- Creation forms rise into view by 24 px over 240 ms. Cancel, save and history navigation away from a creation form reverse the vertical motion, independent of history-stack direction. This covers personal and stable event/horse creation, stable training creation and stable creation.
- Within one horse: only `horse-section-content` transitions. Primary tabs follow their visible order (Profile, Activity, Training, Care, Nutrition, Documents), with 20 px incoming movement over 220 ms and 10 px outgoing movement over 140 ms. Earlier tabs reverse direction. The identity header and section navigation remain stationary, and movement is clipped to the content snapshot. Extra sections retain a fade.
- Application header, bottom navigation, floating actions and action bars have separate stationary snapshots so they cannot travel with the page.
- Search, filters, hash changes, background invalidation, initial loading, public pages and onboarding do not request transitions.
- Open dialogs, reduced motion and browsers without the native API use ordinary navigation. Explicit `viewTransition: false` remains available on individual navigation calls.
- Fast router loads retain the current page for up to 250 ms before showing a pending state, with no minimum spinner duration. Component-level Convex queries can still produce a pending screen after route commit; CSS prevents animating that placeholder. Ready content is never artificially delayed.

## Follow-up: personal-tab transitions and spinner flash

The reported Home → Events → Training behavior exposed two gaps beyond the deliberately subtle original fade:

1. `ApplicationRouteShell` changed component ancestry when leaving `/`, rebuilding the signed-in shell. It now uses the same authentication wrapper on every route; signed-out Home still owns its public shell.
2. Personal Home, Events and Training used direct Convex hooks that released subscriptions when their route unmounted. These now use the already configured Convex/TanStack Query integration. Previously visited query results remain live in its bounded cache, including the per-horse training queries, so changing tabs does not discard and reload the same data. No new prefetch or extra horse queries were added.

The shared component loading indicator now stays visually hidden for its first 250 ms. A genuinely cold or slow request still displays loading; this does not hold back ready content. The native transition policy continues to skip pending screens. Existing data, form and permission errors still propagate to their error boundaries.

Cached account data is cleared before rendering a different identity or the signed-out state. The account boundary keeps normal route changes inside the same cache.

Additional touched components: `ApplicationRouteShell`, `RoutePending`, `PersonalHome`, `PersonalAppointments`, `usePersonalTraining`, and `AccountQueryCacheBoundary` in the Clerk provider.

### Follow-up verification

- All **846 frontend tests across 162 files** passed, plus TypeScript, targeted ESLint and the production build.
- Regression coverage verifies that six consecutive changes across the actual personal Home, Events and Training components mount no pending screens and issue no additional query reads after Home loads. Other tests verify shell element identity and cache isolation across account changes/sign-out.
- Native browser preview at 390 × 844 captured the actual animation keyframes: 240 ms arrival from +24 px toward the next tab, −24 px toward the previous tab; outgoing motion was −12/+12 px over 140 ms. Header and bottom-navigation bounds remained unchanged, with no extra pending mounts on tab changes.
- At 1440 × 900, the same installer and styles produced the 180 ms fade with zero horizontal translation.
- A 90 ms simulated component request removed its indicator before it became visible. An 800 ms request started hidden and was visibly loading at the 300 ms check.
- The preview used actual router, query-cache, shell and loading components with illustrative asynchronous data. It did not use account records. Temporary files and the preview server were removed. The user's signed-in phone session remains the final real-device check.

## Shared implementation

- `src/components/layout/pageTransitions.ts`: route classification and router lifecycle integration. Gating occurs before navigation as well as at commit because browsers with the older, untyped API do not invoke TanStack's transition-types callback.
- `src/router.tsx`: installs the policy and sets the pending threshold.
- `src/components/horses/HorseDetail.tsx`: one section-content boundary around the existing content; existing layout gap retained.
- `src/components/horses/horseDetailTabs.ts`: shared primary-tab order for the visible rail and transition direction, including canonical/stable horse aliases.
- `src/styles.css`: shared motion token, snapshot boundaries and opacity/transform keyframes, including reduced-motion and pending-state fallbacks.

## Verification

- 150 tests passed across 13 files covering layout/navigation and the existing unsaved-form guard. The new policy/integration suite contributes 27 tests: route roles, history direction, horse sections, query updates, focus retention, explicit opt-out, unsupported/older APIs, reduced motion, dialogs, blockers, short/slow loaders and superseded navigation.
- TypeScript, ESLint on touched source files and the production Vite build passed.
- An isolated browser preview used the actual installer, styles, application shell, controls, unsaved-form guard and mobile task-return hook with illustrative page content. It did not connect to a backend or bypass authentication. The temporary preview and listener were removed afterward.
- Native browser captures at 390 × 844 verified 180/140 ms animations and mobile +16/-8 px movement, reversed on Back. Header, bottom navigation and floating-action bounds were identical before/after; horse-tab transitions also preserved the identity-header bounds.
- At 1440 × 900, detail navigation used zero translation and had no horizontal overflow.
- Filter edits retained input focus and did not increase the transition count. Native browser Back displayed the unsaved-changes prompt; keeping the draft preserved the field value and confirmed discard returned to the originating page. Returning from a lower horse link restored the previous list scroll position.

## Follow-up: creation forms and directional horse tabs

Extended the existing TanStack policy without changing main navigation. Creation motion is based on entering/leaving a creation route, so Cancel, browser Back/Forward and successful-save redirects stay consistent. Horse direction uses the same ordered tab definition as the visible navigation. Stable/canonical links to the same horse retain the content-only boundary; redirects between equivalent sections do not animate.

- **75 tests across six files** passed, covering route policy/integration, horse aliases/actions, mobile task returns, dashboard navigation and unsaved changes. Coverage includes all primary horse-tab pairs, creation routes, history navigation, save/replace returns and fallback behavior.
- TypeScript, targeted ESLint, formatting and the production build passed.
- Native browser checks at **1280 × 900** and **390 × 844** captured creation arrivals from +24 px vertically over 240 ms, reversed on return. Horse content arrived from ±20 px over 220 ms with unchanged horse/header bounds. Existing main navigation retained its desktop fade and mobile ±24 px movement.
- Browser checks used the actual installer and CSS with illustrative routes and content, without accessing account records. Temporary preview files were removed. The shared horse-photo transition remains a separate follow-up.

## Limits and follow-up

The available app browser was signed out. Full signed-in personal/stable workflows and real-device smoothness remain unverified. The preview validates native integration and boundaries, not production account data or every page's loading behavior.

Native snapshots are briefly noninteractive while animating; automated follow-up actions must wait for transition completion. The short duration bounds that cost, and reduced motion skips it. See the [CSS View Transitions specification](https://drafts.csswg.org/css-view-transitions-1/#transition-pseudo-elements) for snapshot hit-testing behavior. There is no artificial wait after completion and no whole-list stagger, image morph, or additional animation library.
