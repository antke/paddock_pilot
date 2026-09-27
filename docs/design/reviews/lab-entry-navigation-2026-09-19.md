# Lab entry navigation — 19 September 2026

Bounded Impeccable audit/harden increment for the two lab index routes and their layout owners. The layout routes correctly delegate to `Outlet`; the index routes choose the intended default samples. No visual identity, sample content, authentication policy or shared styles changed.

## P2: Back returns to the redirect instead of the preceding page

Both `/page-lab/` and `/dashboard-lab/` rendered `Navigate` without `replace`. In the installed TanStack router, a visit from a preceding page appended the sample route, leaving the index route behind it. Back revisited that index and immediately navigated forward again. This obstructed ordinary navigation out of the labs.

The reproduction uses the real exported index and layout components with the installed memory router and lightweight destination stand-ins. Both tests failed before the fix: the previous page could not be reached by Back. The initial history assertion independently showed three entries instead of two. Logs: `/tmp/paddock-lab-redirect-before.log`.

Both indexes now pass `replace` to `Navigate`. The same tests pass for landing on the correct sample, going Back to the preceding page and Forward to the sample without an extra entry. Test owner: `src/components/lab/LabEntryNavigation.test.tsx`.

## Coverage and limits

- `src/routes/page-lab.tsx`: actual Outlet composition exercised by the memory-router test.
- `src/routes/page-lab/index.tsx`: redirect corrected; default remains `stable-dashboard`.
- `src/routes/dashboard-lab.tsx`: actual Outlet composition exercised by the memory-router test.
- `src/routes/dashboard-lab/index.tsx`: redirect corrected; default remains version `1`.

This is route-history evidence only. Destination rendering, native browser history and authenticated application composition are not certified by the lightweight targets. No new screenshots were captured. The existing IAB tab 7 was rechecked this turn; selecting it timed out after 20 seconds and reset the control session. The pending user choice about switching browsers has not been answered; no browser switch or server restart was performed.

A read-only attempt to inspect the same Codex window through `cua.getApp('com.openai.codex')` was explicitly denied by the computer-control tool for safety reasons. No alternative mechanism was used to access the denied app. This produced no screenshot or UI evidence.

No visual polish is appropriate for these two prop changes. Existing typography, surfaces, controls and sample defaults are preserved. Browser confirmation remains part of the project-wide audit.

## Combined checkpoint

After the filter, route-recovery, print and lab-navigation owners froze, **516 tests across 105 files passed**. Full TypeScript, production Vite build, scoped ESLint/Prettier and whitespace checks passed. The first aggregate typecheck caught a missing HTMLSelectElement generic in the new print specimen test; adding that type annotation fixed it without changing runtime behavior. Logs: `/tmp/paddock-recovery-final-tests.log`, `/tmp/paddock-recovery-final-types.log`, `/tmp/paddock-recovery-final-build.log`, `/tmp/paddock-recovery-final-lint.log`, `/tmp/paddock-recovery-final-format.log`.

The Impeccable detector scan of nine touched component owners and global CSS reported only one advisory: the existing 9999px radius of the native calendar-picker indicator at `src/styles.css:343`. `DESIGN.md:211` explicitly retains functional circular geometry for compact icon controls. This picker rule was untouched by the current batch; no waiver or design-record change was added. No component-owner finding was reported. Source detector output: `/tmp/paddock-recovery-detector.json`. Neither detector output nor passing tests proves visual correctness.
