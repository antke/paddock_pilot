# Working navigation drawer

Mode: **Operate**. Scope: `WorkspaceNavigationShell.tsx`, `DrawerAccount.tsx`, and the drawer recipes in `src/styles.css`. Preserve the Stable journal palette, typography, route model, permissions and account operations.

## Shape

- The task path is workspace selection → daily work → supporting records → stable management → account actions. Group by responsibility and retain the established route order.
- Keep the title, workspace selector and a single icon-only close control above the scrolling content. The X has a translated accessible name and a 44px target at every breakpoint.
- Put account destinations and actions directly in the drawer. A username/avatar popup must not cover the navigation. Keep Clerk's compact account menu in the header and expanded desktop sidebar.
- Use one vertical scroll region for navigation and account actions. Tracks must size to their content, so short viewports scroll instead of compressing groups into each other. Long identity text wraps; long workspace names remain available in the accessible label and the bounded selector menu.
- Preserve the full-width phone drawer and narrower tablet/collapsed-desktop drawer. Keep safe-area insets, native keyboard handling, Escape, focus containment and opener restoration. No new destinations or permission rules.

## Interaction ownership

Base UI owns drawer and workspace-menu presence, focus and keyboard behavior. Clerk owns authentication, account management and sign-out. Preferences and Clerk account management open only after the drawer's close lifecycle has committed, avoiding competing focus traps. A reopened drawer discards a deferred action; route changes clear it. These callbacks sequence presentation only, never business operations.

Sign-out starts immediately, prevents repeated requests while pending, and uses the existing translated failure/retry copy. The shared `FormSubmissionError` reveals and focuses the local error. Late failures after unmount do not move focus or update the old view. Manage stables stays in the personal workspace group and appears among account destinations in stable workspaces, avoiding duplicate direct rows.

## Verification — 16 October 2026

A DEV-only `/page-lab/navigation` fixture renders the production shell and account view with fictional identity/workspaces and local account callbacks. It cannot alter a real account. The route returns not-found in production.

The batched Chromium inspection and one confirmation covered 390×844, 800×900, 1280×800, 320×568 and 812×390 CSS viewports, light/dark themes, English/Polish, long identity text and twelve workspaces. It found and corrected compressed grid tracks and the desktop expand target. Confirmation measured no group overlap or horizontal overflow, a fixed close-control position while scrolling, and a minimum target height of 44px in every scenario. Workspace menus stayed within the viewport; Escape restored the picker, Tab/Shift+Tab stayed within the drawer, and closing Preferences restored the menu opener.

The sign-out failure control subsequently adopted the existing shared error-reveal primitive; its focus behavior is asserted by the focused component test. No additional visual-polish round was performed.

`node scripts/check-navigation-drawer.mjs` reproduces the local browser scenarios with the dev server on port 9090. It stores captures under `.browser-checks/drawer/`. Component tests exercise direct account links, a single named X control, route/resize focus restoration, closing before an account-dialog handoff, one-time callbacks, duplicate sign-out prevention and failure/retry. Existing preference tests cover language/theme controls.

Real Clerk account management, live sign-out, authenticated workspace switching, physical mobile devices and screen-reader speech were not exercised. The browser evidence is fixture verification, not a claim of authenticated live-flow coverage.

Release checks passed: `pnpm verify` (typecheck, lint, 217 test files / 1,278 tests, production build and anonymous SSR smoke). Lint retains three existing backend `no-shadow` warnings. The final focused shell/preferences run passed 18 tests, including focused sign-out failure feedback; scoped lint and formatting checks passed. The initial layout detector and subsequent edit hooks reported no deterministic design findings; no new suppressions were added.
