# Route compositions — direct browser confirmation

19 September2026. Parent browser observations of two previously unrendered compositions identified by [completion scope](completion-scope-2026-09-19.md). This pass inspected the actual route compositions with existing development fixtures and signed-out state. No backend write, account action or source correction was performed for these observations.

## R52 — stable layout signed-out branch

Actual `/stables` settled to Sign in to view this stable, with its alert and Sign in link. The route uses `src/routes/stables/_layout.tsx`, `AuthStateSwitch` and `SignedOutRoutePrompt`; this is direct evidence for that consumer, not a substitute status card.

The composition was inspected at390 and1280. Keyboard focus reached Sign in; the next Tab reached the footer Plans link. Sign in was not activated. This confirms the signed-out layout's visible composition and local keyboard traversal, not authentication completion or the signed-in Outlet branch.

## R02 — dashboard-lab composition and index history

Opening the actual `/dashboard-lab` index redirected to `/dashboard-lab/1`. At1280 and390, the real `DashboardLabPage` fixture rendered its `LabPageHeader` and `StableCommandCenter` within the lab route boundary. This is the separate consumer whose earlier evidence covered only the command center in Page Lab.

At390, keyboard activation of Sunday20, which had no entries, expanded its associated region and retained focus on the day control. Document width stayed390. The nested day rail scrolls intentionally; it is not page overflow. The existing internal preview's two-h1 consideration is documented in [remaining wrapper review](remaining-wrappers-source-2026-09-19.md); this pass does not reclassify it as a new production-page defect.

Native Back returned to `/stables`; Forward settled on `/dashboard-lab/1`. This confirms the dashboard-lab index's replacement-history behavior in the browser, extending [the installed-router redirect tests](lab-entry-navigation-2026-09-19.md). It does not assert the independent page-lab index was also exercised natively.

## Screenshots

Real inspected viewport captures:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-composition-confirmation/stable-signed-out-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-composition-confirmation/stable-signed-out-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-composition-confirmation/dashboard-lab-1280.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-composition-confirmation/dashboard-lab-390.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/route-composition-confirmation/dashboard-lab-day-390.jpg`

## Scope result

R02 and the R52 signed-out branch now have direct composition evidence. R03's dashboard-lab redirect has bounded native history evidence. R49's actual stable breadcrumb layout, the four route-owned create/edit forms and R05's combined signed-in dashboard remain pending until their actual views are rendered. This report does not update inventory counts or promote route statuses; concurrent source work is not yet frozen.

Authenticated query/permission integration, live stable selection, real invitations, sign-in completion, page-lab native redirect history, assistive technology, physical touch and unobserved states remain separate boundaries. No new tests/build are represented as part of this browser-only observation. Profile/file-upload changes underway elsewhere are not credited here.

## Subsequent structural and actual-view confirmation

From the actual event-list specimen, opening `/page-lab` settled on `/page-lab/stable-dashboard`; native Back returned to `/page-lab/event-list`, and Forward settled on `/page-lab/stable-dashboard`. This supplies the separate page-lab replacement-history browser check. No screenshot is needed to assert this observed URL/history behavior.

Horse index and legacy health source redirects were inspected as literal Navigate destinations with preserved stable/horse IDs: profile and care respectively. This is source evidence, not authenticated navigation or native Back/Forward confirmation.

The previously pending four form compositions now have [actual shared-view evidence](shared-form-browser-2026-09-19.md); R49 has [actual shell/breadcrumb evidence](stable-layout-browser-2026-09-19.md), and the root signed-in combination has [local home evidence](home-dashboard-browser-2026-09-19.md). Their query/auth/backend boundaries remain explicit.
