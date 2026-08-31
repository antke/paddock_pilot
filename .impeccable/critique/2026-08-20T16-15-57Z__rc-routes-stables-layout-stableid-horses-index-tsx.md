---
target: src/routes/stables/_layout/$stableId/horses/index.tsx
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
timestamp: 2026-08-20T16-15-57Z
slug: rc-routes-stables-layout-stableid-horses-index-tsx
---
# Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2/4 | The roster had no count or result announcement. |
| 2 | Match system / real world | 4/4 | Horse, owner, breed, and stable language were domain-appropriate. |
| 3 | User control and freedom | 3/4 | Search and facets were available, but the archive action competed with creation. |
| 4 | Consistency and standards | 2/4 | Production and Page Lab maintained divergent page compositions. |
| 5 | Error prevention | 3/4 | Whole-card links were clear, but query failure had no scoped recovery. |
| 6 | Recognition rather than recall | 3/4 | Records were legible, while identifier matches could appear unexplained. |
| 7 | Flexibility and efficiency | 2/4 | Very wide single-column rows wasted scan space for a small roster. |
| 8 | Aesthetic and minimalist design | 2/4 | An anonymous wrapper card and nested surfaces weakened hierarchy. |
| 9 | Error recovery | 2/4 | Empty states existed, but query errors fell through generic handling. |
| 10 | Help and documentation | 2/4 | The Style Lab did not document the production roster composition. |
| **Total** | | **25/40** | **Acceptable foundation; canonical composition and hardening required** |

# Design Specificity Verdict

The horse terminology and warm noticeboard system are specific to Paddock Pilot, but the initial roster composition was structurally generic: a large untitled panel containing three full-width identity rows. The strongest product-specific opportunity was to expose calm, useful horse context without turning the roster into a care dashboard.

# Overall Impression

The page already had a clear title, useful filtering, and whole-card navigation. Its main weakness was ownership drift: the route, filter surface, records, and Page Lab specimen were composed independently, producing redundant card chrome, weak page status, and an unreliable review surface.

# Priority Issues

## [P1] Roster records lacked operationally useful context

Show existing discipline and shoeing data as restrained metadata and badges. Preserve the identity-first reading order and do not invent care state that the query does not supply.

## [P1] The rare archive action competed with the primary creation action

Keep “Add horse” primary and render “Deleted horses” with low emphasis in the canonical page-header action rail.

## [P2] Page orientation and density were weak

Add the horse count to the top-right header rail, remove the anonymous wrapper panel, and use a responsive two-column roster on wide layouts with single-column cards at intermediate and mobile widths.

## [P2] Page Lab diverged from production

Extract an injected-data Horses page component and use it in both the route and Page Lab. Make fixture stable selection functional so empty-state review is possible.

## [P2] Accessibility and failure states needed canonical hardening

Provide polite result announcements and list semantics, prevent sticky-filter overlap at zoom-like widths, make avatars decorative beside visible names with failed-image fallback, allow long titles to wrap, and add a retryable query error state.

# Persona Red Flags

- A stable owner needs the roster count and useful horse context without scanning oversized blank rows.
- A regular member needs identifier searches to explain why a result matched.
- A keyboard, screen-reader, or low-vision user needs result feedback, list semantics, visible focus, readable long names, and filters that do not obscure content at 200% zoom.

# Questions Skipped

The request already fixed the scope, named the style lab as the source of truth, and explicitly authorized implementation of the findings.
