---
target: Analysis experience persona review
total_score: 26
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
timestamp: 2026-10-02T16-36-19Z
slug: src-components-analysis-analysiscentre-tsx
---
Method: dual-agent (A: /root/persona_design · B: /root/persona_evidence), with parent verification in signed-in Chrome.

The persona review found useful issues, and the bounded fixes are implemented. This was simulated task-based testing, not interviews with real users.

| Persona | Journey | Result after fixes |
|---|---|---|
| Stable manager | Scan yard changes, choose a horse, return to stable | Complete horse list, accurate zero-training wording, preserved comparison, usable keyboard focus |
| Horse owner | Inspect a measurement, open source, return, refresh | Horse, period, comparison and selected evidence retained in this browser tab; weight/medication source tabs corrected |
| Keyboard/mobile user | Select subject/marks, inspect records, recover invalid dates | Keyboard selection and announcements work; 390px inspector/return controls move focus and scroll; no horizontal overflow in tested view |

Fixed findings:
- Browser Back and refresh discarded the investigation. Tab-local state now preserves controls and selected IDs, with stable/horse isolation, safe storage fallback and SSR coverage. Record descriptions and values are not stored.
- Revisiting a horse reset its comparison; per-horse comparison state now survives scope changes.
- Scope buttons discarded keyboard focus; focus now moves to the persistent subject selector.
- Weight and medication sources opened the Nutrition tab; links and validated route search now select the matching section.
- Training sources omitted occurrence date; links now include the selected date, with a recurring-event regression assertion.
- Zero completed sessions were described as missing duration; they now say no completed training was recorded. Existing incomplete sessions retain their missing-duration explanation.
- Body-condition scores lacked an explanation; EN/PL help now defines the recorded 1–9 body-fat scale without interpreting health.

Authenticated verification used existing demo records through live queries: annual Feeding changes → weight point → Weight source tab → Back retained all context; around-date zoom → refresh retained dates, selection and Return to previous range; stable → horse retained comparison and focused selector. A dated training source opened its matching 3 November session. A medication source opened Medication. Body-condition help was visible. No care records or account settings were changed. Browser viewport overrides were reset.

One remaining priority issue (P2): non-event sources open the correct horse record list but do not focus the exact row. A long list still requires searching for the selected record. A future focused-record handoff would remove that step. This is an efficiency improvement, not an unresolved wrong-tab failure.

Design specificity: the warm stable-journal layout, dated care context and shared calendar fit the product. The review found no reason for cosmetic redesign. Strengths include reversible date exploration, source details, a table alternative, and explicit separation of missing duration from recorded zero. Cognitive load is moderate: the original frustration came from reconstructing a lost investigation; the fixes remove that interruption cost. Small remaining friction includes finding a row in a destination list and mentally calculating endpoint weight changes.

Independent Assessment A baseline, before fixes (judgment scores, not measured user outcomes):

| Heuristic | Score / 4 |
|---|---:|
| Visibility of status | 3 |
| Match to real world | 3 |
| User control and freedom | 2 |
| Consistency and standards | 3 |
| Error prevention | 3 |
| Recognition over recall | 2 |
| Flexibility and efficiency | 2 |
| Aesthetic and minimalist design | 3 |
| Error recovery | 3 |
| Help and documentation | 2 |
| Total | 26 / 40 |

No post-fix rescore is claimed: verification repeated the affected journeys rather than running another independent critique.

Validation: 64 tests passed across 14 analysis/backend/route test files. Full TypeScript, repository ESLint, production build, anonymous SSR smoke and diff whitespace checks passed. Additional route tests cover malformed nutrition search and real HorseDetail tab synchronization. Recurring-date behavior is regression-tested; the live training example itself was not demonstrated to be a recurring series.

Limits: independent reviewers used production-component fixtures; parent checked the signed-in route with existing demo data. Loading/retry code was inspected but network failures were not injected. No physical touchscreen, screen-reader speech session, alternate permission-role session, 200% zoom or full contrast audit was performed.

Questions skipped: one remaining priority issue; the bounded fixes were already authorized.
