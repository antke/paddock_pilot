# Horse family audit — 18 September 2026

Method: dual-agent (A: `/root/horse_design_audit`; B: `/root/journal_evidence_check`). Parent implemented changes and verified the rendered result.

The shared journal design transfers well to horse lists and identity headers. The main remaining weaknesses were nested profile panels and editing safeguards, rather than a need for another visual redesign.

## Findings and disposition

| Priority | Finding | Result |
| --- | --- | --- |
| P1 | Multiline allergies/feeding lists stripped trailing spaces and newlines during typing | Fixed in `HorseStringListField`; raw drafts survive typing, normalized arrays reach the form, and external resets replace drafts. Three regression tests cover typing, paste/submit and reset. |
| P1 | Reset immediately discarded edits | Production edit now confirms reset when dirty, using the existing shared dialog. |
| P2 | Edit hidden in the More menu | Permission-gated neutral Edit horse action moved into the entity header. |
| P2 | Long form save controls out of reach | Enabled shared sticky actions in production edit and the new horse form specimen. |
| P2 | Ordinary profile facts remained in filled nested panels | Shared DetailPanel now defaults to flat with a divider; explicit soft/cards variants remain. Removed redundant Profile wrapper and used two columns for short mobile facts. |
| P2 | Choice group names/error associations absent | Named Sex/Shoeing groups and connected horse field errors through IDs and aria-describedby. Phone inputs now use type=tel. |
| P2 | Generic failure feedback | Edit failure now states that saving failed, preserves entries and invites retry. No optimistic success was added. |
| P2, open | Breed picker silently clears unmatched text on blur | Existing intentional controlled-list behavior needs a separate interaction decision. No breed-policy change made. |

## Baseline design assessment

The initial independent visual/source review scored 25/40. This is a provisional design assessment, not a usability success rate or a post-fix score.

| Heuristic | /4 | Initial concern |
| --- | --- | --- |
| System status | 3 | Clear selections/pending states |
| Real-world match | 3 | Familiar vocabulary; mixed lineage/routine group |
| User control | 2 | Immediate reset |
| Consistency | 3 | Filled detail panels diverged from flat direction |
| Error prevention | 2 | Discard protection absent |
| Recognition | 3 | Edit hidden |
| Efficiency | 2 | Long-form save reach |
| Minimalist design | 3 | Unnecessary fact containers |
| Error recovery | 2 | Generic save failure |
| Help | 2 | Limited recovery guidance |

Strengths: concise whole-row horse links; readable serif identity and sans records; four meaningful form groups. Cognitive load is modest. The lab toolbar is review infrastructure, not app navigation. The initial emotional friction was finding Edit and risking lost work after a long entry session. Those matters affect new members, keyboard users and interrupted mobile users more than ornamental design.

## Verification and limits

- 238 tests across 44 files passed, including three new multiline regressions.
- TypeScript, scoped ESLint, production build, anonymous SSR smoke and diff whitespace checks passed.
- Desktop and 390px mobile inspection covered the list, profile and actual horse form fields. Mobile standard/detailed profiles and a 50-horse roster had no page-level horizontal overflow. Long names, long identifiers, sparse read-only profiles, an empty stable and filtering 50 records down to one were checked. The fixture controls remain available for repeatable review.
- Browser checks: no-result search and recovery, keyboard focus, invalid name save focusing the field, error association, cancel-reset preserving entries, local successful save, and typing Enter plus a multiword second allergy.
- List/profile labs render production components. The pre-existing Forms lab renders an event form; a separate horse form lab was added with real schema validation and explicitly local-only save/reset.
- No live uploads or mutations were performed. Authenticated end-to-end navigation, backend failure recovery and every horse subpage remain unverified. Fixture links still point to authenticated production routes; that limitation is not a proven production defect.
- Existing form sections retain their useful accordion boundaries. Leaving the page with dirty values remains a separate navigation-protection review.

## Run notes

Target: `src/components/horses/HorseDetail.tsx`; slug: `src-components-horses-horsedetail-tsx`. No ignore list was present. Assessments were independent; detector output was withheld until A completed. B's narrow source scan returned zero findings; browser access failed in that agent, so it used source inspection and a pure typing-transform reproduction. Parent and A performed browser review. No detector overlay was injected because the browser evaluation surface is read-only; no overlay server started. The existing Wi-Fi preview remains running at the user's request. Temporary screenshots are outside the repository; viewport overrides were reset.

Questions skipped: one unresolved priority issue remains; the user had already authorized this audit and the bounded fixes.
