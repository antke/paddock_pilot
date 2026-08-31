---
target: style lab page
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
timestamp: 2026-08-19T13-30-01Z
slug: src-components-design-stabledesignguidelines-tsx
---
# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 2/4 | The page does not expose a persistent current-section or review-progress state. |
| 2 | Match System / Real World | 4/4 | The noticeboard metaphor, stable language, care examples, and horse imagery closely fit the product. |
| 3 | User Control and Freedom | 2/4 | There is no evident persistent table of contents, search, filter, or rapid movement between distant sections. |
| 4 | Consistency and Standards | 3/4 | Real production primitives provide consistency, but a large manually maintained catalogue and many type exceptions can drift. |
| 5 | Error Prevention | 3/4 | Canonical ownership rules discourage one-off patterns, but automated coverage or enforcement is not evident. |
| 6 | Recognition Rather Than Recall | 2/4 | Live specimens help recognition, while the 22,215-pixel unindexed page makes readers remember where rules appeared. |
| 7 | Flexibility and Efficiency | 2/4 | The lab lacks evident search, category filters, task entry points, or persistent deep navigation for repeat users. |
| 8 | Aesthetic and Minimalist Design | 2/4 | The visual language is coherent, but foundations, 98 controls, templates, inventory, and governance all compete in one linear surface. |
| 9 | Error Recovery | 2/4 | Alerts and states are demonstrated, but implementation mistakes are not mapped to corrective guidance. |
| 10 | Help and Documentation | 3/4 | Ownership and rollout documentation are strong; retrieval and task-oriented entry points remain weak. |
| **Total** | | **25/40** | **Acceptable — strong foundation, significant operational improvements needed** |

# Design Specificity Verdict

**Authored for Paddock Pilot, not category-interchangeable.** The warm paper canvas, Stable Green, condensed noticeboard headings, serif wordmark, horse photography, stable-specific examples, and care template form a coherent product world. The deterministic detector returned zero findings in `src/components/design/StableDesignGuidelines.tsx`. Browser evidence confirmed a cream canvas, dark-green primary action, 72px/900 uppercase hero heading, Manrope body type, descriptive hero-image alt text, and meaningful semantic structure.

The weakness is not generic styling. It is that a highly specific system has been packed into one oversized reference surface. The lab is approximately 22,215 pixels tall and exposes 1 h1, 17 h2s, 11 h3s, 98 buttons, 8 links, 4 navigation landmarks, 1 table, 3 alerts, and 1 status region. It looks like a trustworthy system, but it does not yet behave like a fast design-system tool.

No detector false positives were present because the CLI result was clean. Mutable browser injection was unavailable, so no reliable user-visible overlay was produced; DOM, screenshot, semantic-count, accessible-name, and computed-style evidence were used instead.

# Overall Impression

The style lab is absolutely the right leverage point. It renders real production primitives and records canonical ownership, so central fixes can propagate to production. Its biggest opportunity is to become an indexed, task-oriented contract rather than a long exhibition page. That change would save more time than another pass over individual button borders or card padding.

# What's Working

- **Real shared primitives:** buttons, tables, fields, dashboard panels, filters, calendars, timelines, and domain components are imported from their production owners rather than recreated as static mockups.
- **Distinct product character:** the tack-room noticeboard direction survives in color, typography, examples, imagery, and care-oriented composition without falling into decorative rustic styling.
- **Unusually strong governance content:** the 22-group component inventory and rollout rules explain where patterns belong, not merely how they look.

# Cognitive Load

The surface fails six of eight cognitive-load checks: single focus, chunking, one thing at a time, minimal choices, working-memory relief, and progressive disclosure. Grouping and broad visual hierarchy are sound.

Decision points above four visible options include the 17 type sizes, six specialist sub-12px sizes, 22 canonical component groups, and the large specimen/state catalogue. The root page also asks readers to alternate between brand interpretation, token selection, component comparison, screen-template review, and governance policy.

# Emotional Journey

The hero begins warmly and confidently: it feels like a stable's shared working place. The principles reinforce purpose. The extensive typography and specimen middle shifts into scrutiny and eventually fatigue. The care template restores relevance by showing actual stable work. The inventory finishes with authority, but can feel more like policy to search through than help offered at the moment of need.

# Priority Issues

## [P1] Operational findability

**Why it matters:** A 22,215-pixel surface with 98 controls makes repeat lookup slow and turns recognition into recall.

**Fix:** Add a sticky, keyboard-accessible section navigator with active-section state, stable anchors, component search, category filters, and task entry points such as “Choose a component,” “Check a token,” and “Review a template.”

**Suggested command:** `$impeccable layout`

## [P1] The manual catalogue can drift from the implementation

**Why it matters:** The page uses real primitives, but its typography arrays, 22-group inventory, descriptions, and ownership rules are manually maintained inside a 2,172-line component. A polished specimen can become inaccurate without production code visibly failing.

**Fix:** Treat shared primitive implementations as the source of truth; colocate or generate specimen metadata where practical, add an explicit coverage/status matrix, and test that canonical exports and required states remain represented. Pages should import primitives, never copy specimen markup or class recipes.

**Suggested command:** `$impeccable harden`

## [P1] Typography presents exceptions as ordinary choices

**Why it matters:** Seventeen sizes, including six below 12px, imply a much larger everyday decision space than the semantic hierarchy actually needs and can normalize illegible outdoor/mobile UI.

**Fix:** Lead with a small default semantic ladder. Move specialist micro sizes behind an “Exceptional roles” disclosure, identify their exact component owners, and state legibility/accessibility constraints.

**Suggested command:** `$impeccable typeset`

## [P2] Four different reading modes share one linear page

**Why it matters:** Foundations, component comparison, complete page templates, and governance answer different questions and require different navigation behavior.

**Fix:** Separate the experience into Foundations, Components, Templates, and Governance routes or persistent views. Preserve deep links and cross-link each specimen to its canonical owner and relevant real template.

**Suggested command:** `$impeccable distill`

## [P2] Specimens show options without a consistent decision framework

**Why it matters:** A comprehensive state matrix does not automatically tell an occasional contributor which option is the default or which pattern is wrong for their task.

**Fix:** Give each family a consistent header: default recommendation, “Use when,” “Do not use when,” accessibility note, required states, canonical source, and production example. Put exhaustive variants after the recommendation.

**Suggested command:** `$impeccable clarify`

# Persona Red Flags

**Alex — implementation-focused power user:** Canonical ownership is valuable, but lack of search, filters, deep navigation, and source adjacency makes common lookups unnecessarily slow. The current page does not support a sub-minute path from “I need a record action” to the correct primitive and example.

**Sam — keyboard, screen-reader, or low-vision user:** Ninety-eight controls create a potentially long sequential navigation path without an evident persistent section index. Six sub-12px roles risk legitimizing low-legibility text. The system needs skip links, active navigation semantics, zoom checks, and explicit focus/contrast specimens.

**Mae — small-yard owner/member advocate:** The care template and language feel credible, but abstract system sections do not consistently prove performance with long horse names, urgent care copy, one-handed mobile use, outdoor contrast, loading, empty, and recovery states. Those conditions should be part of the contract, not left to later page audits.

# Minor Observations

- The three opening principles are constrained and understandable; overload begins after the introduction.
- The care template is the strongest bridge between abstract primitives and real work and should be linked from relevant component families.
- A visible version, last-updated date, and concise change summary would strengthen the page's status as a contract.
- The detector's clean result is evidence of mechanical discipline, not proof of usability or coverage completeness.

# Questions to Consider

- Is the lab primarily for first-time teaching, daily implementation lookup, or audit/governance—and should those jobs have separate entry points?
- If a type size requires specialist justification, should it be a public design token or remain private to its owning component?
- Could the canonical inventory become the navigation model, with specimens and production examples attached directly to each owner?
- Should every new shared primitive be required to ship with a style-lab specimen, required-state checklist, and regression test?
