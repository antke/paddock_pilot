# Soft-section rollout — 25 September 2026

The consolidated dashboard candidate is the application baseline. One paper working section sits on an oat canvas; ordinary record rows use shared alternating fills. Health issues and Care reminders are independent dashboard sections. This supersedes the earlier flat-section/bottom-divider rule.

## Shared ownership

- `src/styles.css`: application canvas, section surface/border/inset/gap and record inset/alternate/hover tokens; mobile values; expanded-note boundary.
- `dashboardChrome.ts`, `DashboardSection`, `DashboardSectionCard` and `ui/card`: shared containment. Flat remains the explicit embedded-subsection option.
- `DashboardPage` and `DashboardLayoutGrid`: shared page and column rhythm.
- `DashboardItemCard`, `DashboardItemList`, `ScrollableList` and `Table`: open rows, semantic-wrapper-safe alternating fills, and preserved interaction states.
- `DashboardRecordDetails`: optional notes with native keyboard disclosure. Identity, due dates, status and actions remain visible. Used by care records, the candidate and the component catalog.
- `ListFilterBar`: one quiet filter area within the owning section.
- `BarnBoardGrid`: independent main and attention stacks; no cross-column row stretching. Three initial health/reminder items, health expansion and reminder navigation preserved.

Feature changes select the shared composition: horse/stable lists and horse profile get one owning section, care contacts remain an embedded subgroup, document rows use the common record treatment, and timeline/medication rows use the common record surface. Other forms, settings, invitations, onboarding, account and recovery pages inherit the shared defaults.

## Scope and exceptions

Calendar/time-grid boundaries, form expansion controls, sticky action bars, input/overlay boundaries, profile fact dividers and print rules retain their functional geometry. Public landing pages keep their own design brief. Historical dashboard studies retain scoped CSS for comparisons and are never imported by production components. The candidate’s Current UI view now displays the promoted components.

## Validation

- Full suite: 122 test files, 604 tests passed. Before migration, the sole baseline failure was two raw controls in ReferenceStudiesPage; both now use canonical components.
- Final focused suite: design-system conformance, dashboard attention and horse-record composition — 8 tests passed.
- TypeScript, full ESLint and whitespace checks passed.
- Vercel-targeted production build and anonymous SSR smoke checks passed. No deployment performed.
- Browser layout audit: all 32 page-lab families at 1280px and 390px; no document-level horizontal overflow. Scheduling grids and navigation rails keep their intended internal scrolling. Screenshots and DOM measurements are saved under `.impeccable/review/soft-system/`.
- Visual sampling covered dashboards, reminders, horse lists/profiles/records, documents, forms, settings, directories, calendars, timelines, summaries, onboarding, account and recovery surfaces.
- Interaction checks: keyboard-opened Details retains its focus ring and gives the record a neutral boundary; simulated failed completion remains recoverable; retry completes successfully; empty reminder list remains clear; a 50-horse dashboard keeps long records readable; health expansion exposes all ten sample horses. Light and dark theme reviewed. Preview actions use local fictional data.
- Impeccable static check: no blocking findings; one existing advisory for the circular native date-picker indicator radius.

## Further tuning

Start with the `--app-section-*` and `--app-record-*` tokens, then shared density/layout props. Do not copy candidate CSS into feature routes. The approved typography, evergreen action color, oat selection, semantic states, permissions and confirmation flows remain the application contract.
