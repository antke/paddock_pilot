---
target: current landing page
total_score: 16
max_score: 28
na_heuristics: 5,7,9
p0_count: 0
p1_count: 4
timestamp: 2026-09-17T20-08-09Z
slug: src-components-landing-publiclandingpage-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/evidence_review)

Target: src/components/landing/PublicLandingPage.tsx, public signed-out home route, plus its landing components and shared header/footer.

The main failure is editorial judgment. The page keeps repackaging the same three ideas instead of selecting one persuasive story. Its horse-specific imagery and vocabulary sit inside an interchangeable SaaS layout. The small-yard differentiator—owners and members sharing responsibility—is barely demonstrated.

## Evidence

Independent browser inspections covered desktop 1280×720 and mobile 390×844. A reviewed the naturally loaded dark appearance; B also switched through the actual UI to inspect light and restored dark. Desktop height was 3893px; mobile height 5697px. The rendered page contains 14 headings, 5 account-creation links and 4 pricing links. These counts are descriptive, not automatic failures. The main problem is repetition without additional proof.

The deterministic detector scanned src/components/landing once and returned []: zero findings, no rule/file locations and no false positives. It cannot judge this narrative failure, mobile screenshot legibility, or the demonstrated anchor obstruction. Both independent assessments were complete before synthesis; A did not see detector results.

## Priorities

1. [P1] The repeated slide structure is the primary design failure. Outcome rail, screenshot captions, workflow trio and closing pitch largely repeat planning, recording and handoff. Eyebrow + slogan + paragraph, numbered tiles, icon boxes and nested panels make almost every fact demand presentation. Remove the duplicated outcome/workflow sections, decorative numbering, nonfunctional eyebrows and marketing card wrappers. Develop one story: the yard problem, readable product proof, practical adoption reassurance, invitation. Sources: PublicLandingPage.tsx:72,75,94,216; landingContent.ts:36,88. Commands: distill, shape.

2. [P1] The actual audience is missing from the main promise. Hero copy addresses owners and stable admins; contributing members are directly discussed only in the third collapsed FAQ. The horse-centred hero record could sell a solo tracker. The strongest truthful differentiator is that the people in a small yard can find shared care context instead of relying on one person's memory. Show one supported completed-care handover between people; do not invent assignment, messaging, realtime collaboration or notification capabilities. Sources: PublicLandingPage.tsx:48–51; landingContent.ts:127; PRODUCT.md. Commands: clarify, shape.

3. [P1] Product proof stops proving anything on a phone. The 1440px overview image renders only 314px wide; its small source text becomes approximately 3.5px, and no zoom is available. The horse-record image loses about 28% of its right side to cropping. The overview caption names a calendar and care board absent from the image; the visit caption names cost and attached horses absent from that image. These are proof/caption mismatches, not evidence of missing capabilities. Replace the gallery and duplicate miniature hero dashboard with one readable, current, accurately captioned demonstration. Source: LandingProductProof.tsx:24–56, LandingPrimitives.tsx:287–307, landingContent.ts:66,84. Commands: shape, adapt.

4. [P2] Future packaging interrupts the present decision. Two plan cards and repeated pricing invitations give future billing too much space before users understand starting now. The current testing/premium wording is supported by docs/monetization-plan.md and src/routes/pricing.tsx; it is not established as fabricated. Move confirmed current-offer reassurance near signup; retain a quiet pricing link. Clarify owner setup versus member invitations without creating a new choice funnel. Sources: PublicLandingPage.tsx:140–199,231–236; landingContent.ts:127–134. Commands: distill, clarify.

5. [P1] Responsive chrome weakens the page at its most constrained size. The 390px sticky header is 162px tall. The proof anchor targets a 96px offset and places the title under it. The signup label wraps, and the header shortens Create account to Create. A also visually observed low-legibility final CTA labels in dark appearance; no contrast ratio was measured. Compress the signed-out header, fix the anchor offset, keep meaningful labels, and verify both themes' final CTA colors. No horizontal overflow was observed at either tested width. Sources: Header.tsx:49–55,84; AppShell.tsx:44–63; LandingPrimitives.tsx:85; PublicLandingPage.tsx:216–236. Commands: adapt, harden.

## Heuristic scoring

| # | Heuristic | Score | Main observation |
|---|---|---|---|
| 1 | System status | 3/4 | FAQ expansion is clear; no async flows tested. |
| 2 | Real-world language | 2/4 | Concrete care terms, but member role and shared-work outcome buried. |
| 3 | Control and freedom | 3/4 | Unforced browsing and working FAQ; mobile anchor obstructed. |
| 4 | Consistency | 2/4 | Coherent tokens; decorative semantics and dark closing CTA concerns. |
| 5 | Error prevention | n/a | No relevant inputs or consequential flow tested. |
| 6 | Recognition | 3/4 | Labelled actions; proof detail unreadable on mobile. |
| 7 | Expert efficiency | n/a | No expert task workflow on this landing surface. |
| 8 | Minimalist design | 1/4 | Repeated argument, nested boxes, excess labels. |
| 9 | Error recovery | n/a | No applicable error flow tested. |
| 10 | Help | 2/4 | Working FAQ; setup and participation reassurance too late. |
| | Total | 16/28 | 57%, acceptable usability band; not a visual-quality endorsement. |

## Cognitive load, emotional journey, strengths

Moderate cognitive load: single focus, whole-page hierarchy and progressive disclosure fail the rubric. Groups are mostly manageable; this is not a giant-menu problem. The hero creates recognition, the detailed mini-record introduces administrative burden, the gallery and repeated workflow flatten momentum, and useful adoption reassurance arrives late.

Keep the concrete care vocabulary, honest product substance, working native FAQ and potentially the green/warm-neutral brand ingredients. The initial primary CTA is easy to find. Existing semantic markup, alt text, reduced-motion treatment and lazy-loaded secondary images are useful foundations; they are not a completed accessibility audit.

## Persona red flags

- First-time visitor: owners/admins language can exclude members; account creation precedes a clear explanation of shared use.
- Skeptical evaluator: screenshot captions promise unseen evidence and the example screenshots look typographically detached from the current UI.
- Distracted mobile visitor: oversized sticky header, partly hidden anchor destination, long repeated story and unreadable product proof.

## Minor observations

Arbitrary red/yellow/green rails imply status without encoding it. Repeated eyebrows contradict DESIGN.md's Earned Label Rule. Five FAQ topics are not, on their own, proof of overload. The 1.78MB hero PNG offers an optimization opportunity, but no loading failure was measured. Development-tool chrome is excluded from design findings. Existing PublicLandingPage.test.tsx locks in four figures and five FAQs; rewrite these structural expectations alongside the redesign so obsolete tests do not preserve bloat.

## Proposed plan toward the requested prompt

1. Resolve visual boundaries and references with the user. Do not silently preserve the current style or impose a replacement.
2. Reduce the content to one promise, one readable demonstration, minimal adoption reassurance and one primary action. Proposed starting copy budget: 180–250 visible marketing words excluding essential navigation/legal text and optional FAQ answers; user may revise.
3. Compare two materially different first-viewport compositions against the selected references; choose one before extending the page. This is a proposed next-stage workflow, not authorization to build during this planning task.
4. Write the final implementation prompt with exact cuts, approved narrative/copy, visual and asset direction, mobile composition, scope boundaries and a bounded review procedure. Scope signed-out landing and necessary marketing chrome; protect authenticated app behavior and existing work.
5. Define acceptance criteria: five-second comprehension, explicit owner/member relevance, readable mobile proof, no repeated section purpose, accurate claims/captions, working CTA/anchors, both themes if retained. Inspect desktop/mobile together, batch fixes, then review the result with the user. Avoid indefinite self-polishing.

## Questions for the user

1. What identity survives: keep green/warm neutrals and replace typography/layout; replace the whole visual identity; or retain the identity and simplify aggressively?
2. What earns the first screen: a clear working product example, a strong equestrian photograph, or a type-led composition? The former best addresses the current proof weakness; imagery can support any choice.
3. Which 1–3 sites/templates set the quality bar, and what specifically appeals—type, spacing, imagery, motion or composition? Were any existing landing-lab directions worth retaining? References need not be horse-related.
