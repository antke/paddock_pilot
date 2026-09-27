# Shared filter controls — 19 September 2026

Scope: source audit, local DOM reproduction, and bounded correction in `ListFilterBar` and `ListFilterChips`. Impeccable audit/harden and the craft floor apply. No route overrides, palette changes, new motion, browser actions, or live records were involved.

## Findings and corrections

| Priority | Before | Shared-owner correction |
| --- | --- | --- |
| P2 | Removing a focused facet chip detached its button and left focus on BODY. Clearing all retained a focused but disabled, hidden button during the 200ms exit. | Remember focus within the chip row. On removal use the next surviving chip, then previous; when no chips survive use the search input. Clear all returns to search immediately. Recovery runs only if the affected control still owns focus or its removal dropped focus to BODY. An unrelated focused control is preserved. |
| P2 | The sticky bar used fixed `lg:top-24`, independent of the live application header's measured height. A wrapping or enlarged header could overlap the bar. | Consume `--app-header-scroll-clearance`, with `1rem` fallback when no application header is mounted. Keep the existing large-screen-only sticky breakpoint and stacking level. |
| P2 | If the focused facet panel or toggle disappeared because the facet configuration changed, focus dropped to BODY. | Restore the surviving toggle, or search if no facets remain. Escape closes an open panel and returns to its toggle. |
| Defensive hardening | Native facet selects were already disabled and the panel was already aria-hidden when closed. However, a synthetic change could still invoke its callback. Exit chips likewise remained mounted for animation. | Add `inert` to closed panel/chip row and guard callbacks while hidden. Keep native disabled controls, aria-hidden, and current exit timing. This is defense in depth, not a claim that native disabled selects were normally keyboard-operable. |

Focus memory is local to each mounted owner and its document listeners clean up on unmount. The optional `ListFilterChips.fallbackFocus` callback is backward compatible; `ListFilterBar` supplies its own search input. No feature-level component needs a styling or focus patch.

## Header clearance contract

`AppShell.tsx` owns `--app-header-scroll-clearance`. It publishes the maximum mounted sticky application header height plus `1rem`, observes resize, excludes static lab specimens, and restores the previous root value when the last header unmounts. The filter bar now consumes that value rather than independently estimating the header. Existing `AppShell.test.tsx` tests exercise that contract. Actual sticky positioning still requires browser geometry checks; jsdom does not calculate CSS layout.

## Exact consumer inventory

`ListFilterChips` is consumed only by `ListFilterBar`. `ListFilterBar` is consumed by `ListFilterControls` and the controlled `FilterSpecimen` in `StableDesignGuidelines`.

| Consumer path from `src/components/` | Sticky behavior |
| --- | --- |
| `events/EventList.tsx` via `FilteredDashboardItemList` | Enabled |
| `horses/HorseList.tsx` via `FilteredDashboardItemList` | Enabled |
| `horses/HorseHealthIssuesCard.tsx` via `FilteredDashboardItemList` | Off |
| `horses/HorseMedicationRecordsCard.tsx` via `FilteredDashboardItemList` | Off |
| `horses/HorseNutritionLogsCard.tsx` via `FilteredDashboardItemList` | Off |
| `horses/HorseWeightRecordsCard.tsx` via `FilteredDashboardItemList` | Off |
| `reminders/StableRemindersPage.tsx` via `ListFilterControls` | Enabled |
| `reminders/FilterableCareRemindersCard.tsx` via `ListFilterControls` | `pageLayout` |
| `reminders/HorseCareRemindersCard.tsx` via `ListFilterControls` | Off |
| `horses/HorseTimelinePage.tsx` via `ListFilterControls` | Off |
| `horses/HorseActivitySection.tsx` via `ListFilterControls` | Off |
| `documents/HorseDocumentsCard.tsx` via `ListFilterControls` | Off |
| `documents/StableDocumentsPage.tsx` via `ListFilterControls` | Enabled |
| `page-lab/prototypes/DocumentsPageLab.tsx` via `ListFilterControls` | Stable scope only |
| `design/StableDesignGuidelines.tsx` controlled `FilterSpecimen` | Off |

This is source impact, not a claim that every consuming page has been visually reverified. The whole-bar `ListFilterControls.hideWhenEmpty` issue found during this first increment is addressed in the separate second increment below.

## Verification

Before correction, the initial regression suite produced **4 failures and 1 pass**: chip removal, Clear all, disappearing panel and hidden callback dispatch failed; unrelated focus preservation passed.

After correction: **17 tests passed across 2 files** — 8 filter tests and 9 existing application-header tests. Filter tests cover successive middle/last removal, Clear all during retained exit, a remaining search query, unrelated focus preservation, Escape and immediate reopen, hidden callback suppression, removed facet configuration, interrupted exit with new selection, and timer cleanup on unmount. Scoped ESLint and full TypeScript checking pass.

Files changed: `ListFilterBar.tsx`, `ListFilterChips.tsx`, new `ListFilterBar.test.tsx`, and this report. No build or browser verification was run by this audit worker.

## Bounded browser confirmation

1. On a populated event/horse or stable-document sample, focus a middle chip and remove it; continue through the last chip. Verify the visible focus ring follows the next/previous chip and then search. Repeat with a remaining query and with Clear all.
2. Open filters by keyboard, focus a select, press Escape and immediately reopen. Confirm closed controls cannot receive keyboard focus throughout the collapse.
3. At a wide viewport with the real header, scroll the sticky filters beneath the header, enlarge text or change the header width, and confirm a consistent one-rem gap without overlap. Confirm a standalone specimen has the one-rem fallback.
4. Repeat at a narrow viewport and with reduced motion. The bar should remain non-sticky on narrow screens; state and focus changes should be immediate regardless of collapse animation.

No new visual polish is recommended for this batch: existing global surfaces, type, selection colors and motion are retained.

## Second increment: source records become empty

The first increment intentionally did not change `ListFilterControls`. A follow-up reproduction used the actual `useListFiltering` hook with source records changing from `['Maple']` to `[]`, keeping the component mounted. Two of four tests failed before correction: a focused search disappeared to BODY, and an active query lost its search and Clear all controls. Two controls already behaved correctly: an untouched bar hid without stealing unrelated focus, and zero search results did not hide controls when source records still existed.

`useListFiltering.totalCount` is `items.length`, distinct from `resultCount` (`filteredItems.length`). The paginated `useListQueryState` does not provide totalCount; unknown totals must not be treated as zero.

Correction: `ListFilterControls` now hides only when `hideWhenEmpty`, known source total zero, no active filter, and no focus inside the bar all hold. A minimal optional `ListFilterBar.onFocusWithinChange` reports focus entering/leaving its existing root. No wrapper, route styling, timer, or imperative focus jump was added. When the user clears an active filter after the source empties, the first increment's Clear all → search recovery keeps the bar available until the user moves outside. Source records arriving later show an untouched bar again without moving focus.

Exact hide-on-empty consumers are the four horse history cards (`HorseHealthIssuesCard`, `HorseMedicationRecordsCard`, `HorseNutritionLogsCard`, `HorseWeightRecordsCard`) through the default `FilteredDashboardItemList` policy; `HorseCareRemindersCard`; `FilterableCareRemindersCard` when `!pageLayout`; `HorseActivitySection`; `HorseDocumentsCard`; `StableDocumentsPage`; and the local `DocumentsPageLab`. `StableRemindersPage` and `HorseTimelinePage` do not opt in. The controlled style-lab specimen uses the bar directly.

`HorseList` and `EventList.EventTable` also inherit the default policy, but each had its own upstream empty-source return that unmounted the entire filtered list. That separate route/list-owner transition cannot be repaired by a guard inside an already-unmounted child. These two owners were not edited in this second increment; the third increment below addresses this discovered dependency.

Second-increment files: `ListFilterControls.tsx`, minimal `ListFilterBar.tsx` API, new `ListFilterControls.test.tsx`, and this report. **21 tests pass across 3 files** (8 first-increment filter tests, 4 new actual-hook integration tests, 9 existing AppShell tests). Scoped ESLint and full TypeScript pass. No browser or live source updates were performed.

Additional browser scenario: with search focused in a document or horse-history sample, remove all source records through a safe local reactive fixture update. Search must remain focused; clearing its query must not hide it; moving to an unrelated control should permit the empty inactive bar to disappear without changing that outside focus. Upstream `HorseList`/`EventTable` early returns need separate handling before this scenario can be considered covered there.

## Third increment: horse and event list owners

The actual `HorseList` and query-free `EventTable` were mounted with the existing fictional dashboard fixture and real router context. Changing their source arrays to empty reproduced **4 failures / 2 passes**: both lists lost focused search and active Clear all controls; genuine initial-empty prompts already passed.

Both owners now keep their `FilteredDashboardItemList` composition mounted across source changes. A backward-compatible `emptyState?: ReactNode` slot in that shared composition accepts the complete unfiltered empty state, replacing the default empty surface rather than nesting another surface inside it. Horse lists reuse the exact `NoHorsesPrompt`; event lists reuse the original `DashboardEmptyState` with caller-provided title, description and chrome. Existing callers without the optional slot retain their previous behavior. Filtered zero-result copy still appears while a query/facet is active; clearing restores the genuine empty prompt. No local styles or new focus machinery were needed.

Exact upstream consumers:

- `HorseList` → `HorseListPage` → `src/routes/stables/_layout/$stableId/horses/index.tsx` and `page-lab/prototypes/HorseListPageLab.tsx`.
- `EventTable` → connected `EventList` → `src/routes/stables/_layout/$stableId/events/index.tsx`; `page-lab/prototypes/EventListPageLab.tsx` also uses `EventTable` directly.
- The optional slot is defined in `FilteredDashboardItemList`; only `HorseList` and `EventTable` opt in. Other shared consumers retain the default.

Third-increment files: `horses/HorseList.tsx`, `events/EventList.tsx`, `list-filtering/FilteredDashboardItemList.tsx`, new `list-filtering/ListSourceTransitions.test.tsx`, and this report. **27 tests now pass across 4 files**: 18 filter/list tests plus 9 existing AppShell tests. The six actual-owner integration cases cover genuine initial empty copy, focused source disappearance and restoration, outside-focus preservation, zero filtered results, active source-empty clearing, and prompt restoration. Scoped ESLint and full TypeScript pass.

This closes the two upstream gaps described in the second increment at source/test level. Browser geometry, native interaction, and live reactive data were not tested by this worker; the earlier browser scenarios still apply, now also to these two owners. No live queries, saves, deletes or navigation destinations were exercised in the tests.
