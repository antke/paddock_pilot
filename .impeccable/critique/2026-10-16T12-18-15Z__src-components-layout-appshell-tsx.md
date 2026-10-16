---
target: shared dark theme
total_score: 28
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-10-16T12-18-15Z
slug: src-components-layout-appshell-tsx
---
Method: dual-agent (A: /root/dark_design_review · B: /root/dark_evidence_review)

# Dark theme review — 16 October 2026

Scope: shared application dark mode, represented by AppShell and the stable dashboard. Bright mode, type, layout and product behaviour are retained. The requested deliverable is several reviewable alternatives before adopting a production theme.

## Design specificity and overall impression

Paddock Pilot's Alegreya headings, readable sans-serif records and horse-care language are specific to a small stable's working journal. Its dark surface palette is less successful: olive canvas, green-black paper, khaki selection, sage actions and green-tinted text repeat the outdoor association across nearly every element. This plausibly produces the user's military impression. Preserve the authored type and composition; neutralize the large dark surfaces.

The independent 11-file source detector returned zero findings. It does not judge this emotional mismatch or certify accessibility. Browser evidence confirmed production root dark works, and isolated a separate inherited-white-card error in the old nested palette workshop.

## Provisional design health

| Heuristic | Score | Evidence / limit |
|---|---:|---|
| Visibility of status | 3 | Named care status, dates and overdue indicators; live mutations not audited. |
| Match to real world | 4 | Clear yard terminology and familiar daily tasks. |
| User control | 3 | Reset, cancel and draft protection; fixture can become dirty without intentional edits. |
| Consistency | 3 | Shared tokens and primitives; older palette preview misrepresents them. |
| Error prevention | 3 | Required fields, optional groups and draft protection. |
| Recognition | 3 | Named navigation groups and contextual records. |
| Efficiency | 2 | Keyboard/skip support; advanced accelerators not demonstrated. |
| Aesthetic minimalism | 2 | Strong composition; broad olive tint and weak panel separation. |
| Error recovery | 3 | Fixture retry and recoverable deletion; live recovery not exercised. |
| Help | 2 | Useful inline form help; wider help unverified. |
| Total | 28/40 | Provisional, bounded inspection; not an end-to-end certification. |

## What works

- Warm typography gives the product its identity without extra decoration.
- Semantic colour roles allow a dark-only change without touching the bright theme.
- Status words and record context supplement colour, helping scan care exceptions.

## Priority issues

1. **P1: Olive occupies the neutral surfaces.** Canvas, cards, sidebar, selection and secondary text repeat yellow-green hues. This creates the tonal mismatch. Use charcoal, warm ink or blue slate for large surfaces; retain green primarily for actions. Impeccable colorize.
2. **P2: Dark surface depth is weak.** Current cards are darker than the canvas and differ by only 1.07:1. Give the canvas the darkest role, working panels a lighter role and rows a quiet intermediate tone. This is a hierarchy judgement, not a WCAG violation. Impeccable polish.
3. **P2: Action and selection share too much colour.** Sage actions and khaki selections blur semantic roles. Keep green actions, neutral selections, pink destructive feedback and amber warnings. Impeccable colorize.
4. **P1, review tooling: Old nested preview inherits light component aliases.** The old palette workshop can render paper-white panels with nearly white text despite reporting a passing token contrast. Root-derived app aliases resolve before nested overrides. The new lab must own its document theme so component backgrounds and portalled dialogs use the same palette. Impeccable harden.

## Cognitive load and emotional journey

Grouping and optional form disclosures are strengths. Hierarchy and single focus are partial failures: similar olive surfaces make working-group boundaries less immediate, while several dashboard groups compete. Do not restructure the app to solve a colour problem. The owner arriving after evening chores should feel that care is manageable; neutral surfaces let human names and warm type provide reassurance. Completion feedback was not comprehensively exercised.

## Persona red flags

- Evening yard owner: the current colour mass feels stern rather than welcoming.
- Distracted mobile carer: subtle panel/row differences increase scanning effort; outdoor readability needs contextual testing.
- Low-vision reader: inspect actual computed colours, including placeholders and overlays, rather than trusting isolated swatches or a three-pair contrast counter.

## Evidence and best practices

The current production theme's sampled core text pairs range from 6.35:1 to 13.90:1; readability is not the main reason to replace it. Input/card contrast is 4.74:1. Decorative panel boundaries do not inherently need 3:1.

- [Material dark-theme guidance](https://codelabs.developers.google.com/codelabs/design-material-darktheme): retain product identity, adapt elevation and limit accent saturation deliberately.
- [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4.5:1 for normal text; 3:1 for qualifying large text.
- [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): 3:1 where visual control/state information is necessary for identification.
- [Apple Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode): adaptive semantic colours and foreground/background contrast.

## Alternatives prepared

- **Charcoal & pine:** closest companion to bright mode; reuses its paper colour as the main dark-mode text and lifts pine into a readable green accent.
- **Warm ink:** brown/plum-black surfaces, parchment text, muted eucalyptus actions.
- **Midnight slate:** cooler blue-slate surfaces, pale stone text, sea-green actions.

All are isolated previews at `/page-lab/dark-mode`. Current dark and current bright references consume the existing stylesheet without replacement values. Real dashboard, calendar, horse form and control/dialog specimens use fictional records. The current production palette remains unchanged.

The user's stated scope already resolves priority, intent and constraints. The remaining decision is which of these three palettes to take forward after comparison.
