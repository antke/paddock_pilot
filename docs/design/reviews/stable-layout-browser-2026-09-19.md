# Stable route layout and breadcrumbs — browser confirmation

19 September2026. Actual `StableRouteLayoutView` and query-free `StableBreadcrumbs` presentation rendered through the DEV fixture `/page-lab/stable-layout`. The production stable route consumes the same layout/view; its query/auth wrapper remains connected. The body in this specimen is deliberately a placeholder: this pass audits the shell and breadcrumbs, not every child page.

## Finding and shared correction

At320, an unbroken entity name made breadcrumb NAV/LI/A elements699px wide, ending at x715. The document itself still measured320px because the outer layout clipped the content. Page-width checks alone concealed unreadable breadcrumb text.

The correction lives in the shared breadcrumb and `DashboardPage` minimum-width rules. After correction, the breadcrumb nav measured288px ending at x304. The long link wrapped to64px high and the full unbroken text was readable. Home and Horses targets measured44×44px; exactly one Care item was exposed as the current page.

The source extraction also corrected exact active-ancestor matching, with route-ID/DOM regressions. Parent browser observations confirm the current item; other literal destination contracts remain source/test evidence.

## Additional actual-view states

- Unavailable entity labels fall back to Horse.
- With the standard Juniper name, Enter on its local breadcrumb destination shows the Horse profile body and makes Juniper the current item.
- Long multiword Edit event trails wrap at320 and fit the1280 desktop composition. Overview has the proper breadcrumb.
- Enter on Dashboard reports the intended local destination without navigating the outer application.
- The fixture was reset/reloaded, viewport override removed, and the retained preview left for handoff.

## Captures

Real parent-inspected viewport captures. The before image shows the clipped/unbroken defect; it is not final evidence.

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/stable-layout-confirmation/unbroken-before-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/stable-layout-confirmation/unbroken-after-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/stable-layout-confirmation/long-event-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/stable-layout-confirmation/event-1280.jpg`

## Validation and boundaries

Source owners: `src/components/layout/StableRouteLayoutView.tsx`, `src/components/layout/StableBreadcrumbs.tsx`, `src/components/layout/stableBreadcrumbTrail.ts`, shared `src/components/ui/breadcrumb.tsx`, `src/components/dashboard/DashboardPage.tsx`, and `src/components/page-lab/prototypes/StableLayoutPageLab.tsx`. Focused agent checkpoint:28tests/2files, full TypeScript and scoped lint/format passing. Exact late shared-layout correction validation belongs to the parent's final combined checkpoint; earlier results are not silently relabelled as post-correction tests.

The R49 unique shell-composition gap is bounded-addressed, without crediting placeholder body content as child-page coverage. Actual authenticated route mounting, query-derived labels, backend permissions, every child composition, assistive-technology speech, physical touch, enlarged text, OS reduced motion and full contrast remain explicit limits. No live navigation or backend write occurred.

## Subsequent frozen-composition checkpoint

The parent full-suite rerun passed592tests/119files after caching repeated timeline-test button lookups without weakening assertions. The initial run had590passes and two timeline-control timeouts. Full TypeScript, production Vite build,35-file scoped lint/format and detector with no findings passed. Logs use `/tmp/paddock-audit-composition-*`, with final tests at `/tmp/paddock-audit-composition-tests-final.log`. This checkpoint precedes the separate later tabs correction; it does not certify that correction or close live/backend boundaries.
