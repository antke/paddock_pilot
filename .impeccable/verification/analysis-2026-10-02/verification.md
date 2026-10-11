# Analysis implementation verification — 2 October 2026

## Delivered behavior

Stable: identity and selected history → factual coverage/training overview and complete horse rows → filtered activity overview → selected-period records → optional appointment timeline and current care. Horse: identity/latest dated measurement/current recorded care → four presets and compact range → factual coverage → aligned evidence and record inspector → supporting detail. History is retained when changing subjects. Customization, other training statuses and long supporting lists are disclosed on demand.

Annual training is grouped into explicitly labelled calendar months (weekly for intermediate ranges); every aggregate keeps contributing source IDs. Weight observations remain on their true dates. At 390px, date-selection cells measured 54px wide with nonoverlapping horizontal bounds. The plotted marks remain separate from hit areas. Linked date focus, mobile inspector/return buttons and reversible event-centered ranges preserve exploration context. The existing record table remains available.

Current care means recorded status as of today, not a health assessment. Selected historical activity, counts and appointment lists share filters; care records explicitly include all categories. Completed training requires recorded outcomes. Unknown duration is not zero. Period weight changes normalize units consistently with the horse query; dated latest measurements retain their recorded unit. The backend returns complete horse-scoped summary data and uses IANA timezone conversion across DST.

## Live development verification

Synced Convex functions with backend typechecking to the configured **development** deployment `aware-llama-765`. No production deployment, seed, record reset, or horse-record write was performed.

Read-only authenticated development query calls verified:

- `stableAnalysis:getForStable`: 23 complete horse summaries; 20 weight trends (previously 8); 198 recorded training outcomes. Final query included Europe/Warsaw timezone.
- Thistle Run `getHorseComparisons`, **1 October 2025–30 September 2026**: 302 source records, including 36 weight observations and 198 training entries. The completed-only comparison contains 178 completed sessions; 171 have duration, totalling 7,095 recorded minutes. Weight endpoints display 582 kg on 1 October and 587 kg on 23 September; stable and horse show the same +5 kg change after conversion/display rounding.
- Clover Drift, outside the former first eight weight summaries: latest weight 498 kg dated 26 April 2026, one open health record, five annual comparison source records. Sparse default comparison shows one actual measurement and explicitly no completed training.
- Umami: empty comparison query; no measurement is represented as a measurement of zero.

## Browser evidence and its limits

The screenshots use the actual production components with freshly returned development-query snapshots in a temporary local review harness. They are **not proof of a signed-in live browser query subscription**. The live query path was exercised separately through the authenticated Convex CLI. The snapshot JSON, temporary component and temporary scenario were removed before final checks/build; raw yard data is not included in this evidence directory.

Confirmed desktop (1440×1000) and mobile (390×844): annual Thistle plots, contributing-record selection, original pounds shown in inspector, stable-to-horse range preservation, Around/Return recovery, sparse Fit/Return, English/Polish and light/dark presentation. No document horizontal overflow (390px viewport and document width). Mobile detailed timeline: full day 272px inside its 324px viewing region, including date and today marker. Fixture-only checks covered the populated short example, 50-horse crowded yard (all 50 rows, no page overflow), empty stable and access-limited rendering (automated).

Loading/error/retry and access behavior also received source/automated coverage; network failure and a signed-in production session were not induced. Reduced motion continues to use existing shared policy; new navigation does not request animation. Keyboard focus/selection remains native button behavior with visible focus, and chart/table alternatives remain present.

## Checks

- Application TypeScript: passed (`tsc --noEmit`).
- Backend TypeScript: passed (`tsc --noEmit --project convex/tsconfig.json`).
- Repository ESLint: passed.
- Focused tests: **49 passed across 10 files**, covering analysis components, complete summaries, filters/counts/details, recurrence, timezones, mixed units, annual aggregation, unknown duration, drilldown, inherited/custom ranges, empty states and mobile timeline widths.
- Vercel-target production build: passed.
- Anonymous production SSR smoke checks: passed for home, sign-in, sign-up and pricing.
- `git diff --check`: passed.

Used installed project binaries directly because pnpm's package-manager bootstrap attempted a sandbox-blocked global lockfile write. No package installation was needed.

Independent implementation reviews examined data completeness and cross-view scope, and chart/stable behavior. Corrections included recurring occurrence counts, filtered coverage, empty-history controls, inherited compact presets, mixed-unit endpoints and complete reminder details.

## Screenshots

- [Stable desktop](stable-desktop.jpg)
- [Horse desktop, annual records and inspector](horse-desktop.jpg)
- [Horse annual mobile](horse-mobile-year.jpg)
- [Mobile inspector](horse-mobile-inspector.jpg)
- [Horse desktop, Polish dark theme](horse-desktop-dark-pl.jpg)
- [Horse mobile, Polish dark theme](horse-mobile-dark-pl.jpg)
- [Stable mobile, Polish dark theme](stable-mobile-dark-pl.jpg)
- [Complete mobile timeline day](stable-mobile-day-dark-pl.jpg)
