---
target: Horse profile reference details
total_score: 26
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 0
timestamp: 2026-10-09T09-46-09Z
slug: src-components-horses-horseprofilesection-tsx
---
Method: dual-agent (A: /root/profile_design_review · B: /root/profile_evidence_review)

The main problem is the information structure. Keep Paddock Pilot's typography, palette and calm paper surface; replace the scattered property grid with three clearly separated reference groups.

**Design specificity and evidence**

The visual identity fits a stable journal. The layout does not yet reflect the owner's tasks: understand the horse, check standing care information, and retrieve administrative details. Both independent reviewers confirmed the sparse desktop composition and misplaced shoeing information in the running interface. The deterministic detector returned zero findings for HorseProfileSection.tsx and DetailBlocks.tsx. The manual review caught grouping and semantic weaknesses outside that detector's coverage.

**Design health: 26/40 — acceptable, with clear structural weaknesses.** This is a heuristic assessment, not a usability-test result.

| Heuristic | Score /4 | Main finding |
|---|---:|---|
| System status | 3 | Active profile and copy feedback exist. |
| Real-world match | 2 | Shoeing is filed with lineage. |
| Control and freedom | 3 | Editing and navigation remain accessible. |
| Consistency | 3 | Shared fields; inconsistent note emphasis. |
| Error prevention | 3 | Identifier copying helps avoid transcription. |
| Recognition | 2 | Related facts are separated. |
| Efficiency | 3 | Copy works structurally; scanning is inefficient. |
| Minimalist design | 2 | Space and emphasis do not follow content. |
| Error recovery | 3 | Copy failure has a manual fallback in source. |
| Contextual help | 2 | Broad headings provide weak orientation. |

**Preserve**

- The established Alegreya typography, palette and open paper treatment.
- Selectable identifiers, accessible copy controls, pending feedback and failure recovery.
- Readable mobile text. The current real record had no horizontal overflow at 390px.

**Priority issues**

1. **P2 — Categories do not predict their contents.** Shoeing alone creates a “Lineage and routine” section, while allergies and deworming sit in “Notes.” Insurance lives under “Identification.” Checking care requires searching unrelated groups. Move shoeing, allergies and deworming together; show parentage only when sire or dam exists. Evidence: HorseProfileSection.tsx:88, :160, :209, :240. Lens: shape.
2. **P2 — The layout spreads short facts across too much space.** Four desktop columns place six facts in a four-plus-two arrangement, separate age from birth date, and give one shoeing value half a row. Use compact related pairs inside independently sized groups. Evidence: HorseProfileSection.tsx:100 and DetailBlocks.tsx:87. Lens: layout.
3. **P2 — Boundaries and text hierarchy do too little work.** Group gaps resemble internal gaps; green bold labels and bold values repeat throughout. Introduce a consistent group boundary and quieter labels, with semantic label/value associations. The existing spans are readable in the accessibility tree, but definition-list semantics would express the relationship better. Evidence: DetailBlocks.tsx:88, :204, :274. Lens: typeset and polish.
4. **P3 — Different formats add emphasis without helping interpretation.** The one-word deworming note occupies a tinted panel, measured at 324×68px on mobile; a free-text “none” becomes an allergy badge. Use a list for multiple allergies and ordinary prose for notes, aligned to the same label/value pattern. Reserve attention styling for supported status meaning. Evidence: HorseProfileSection.tsx:243 and DetailBlocks.tsx:613. Lens: distill and polish.

**Cognitive load and user impact**

Moderate load: chunking, grouping and hierarchy fail three of eight review checks. These are reference facts, not a six-way decision; their number alone does not justify hiding them. Entry feels calm, scanning becomes work, and the oversized final note makes the record feel unfinished.

- A returning owner can copy a passport quickly but must search for related care facts.
- A first-time carer cannot predict that shoeing belongs under “Lineage and routine.”
- A screen-reader user gets headings and copy names, but broad headings and weak label/value semantics provide less useful structure.

**Recommended shape**

Use one paper section with three open groups, separated by restrained rules and consistent group spacing. On desktop, give each group a compact heading column and a bounded fact area. On phones, put each heading above its content. Keep the same reading order in the DOM.

| Current content | Proposed home |
|---|---|
| At a glance | Horse details: age beside birth date; breed/sex, colour/height, discipline |
| Sire and dam | Parentage subgroup within Horse details, only when populated |
| Shoeing, allergies, deworming notes | Care information, immediately after Horse details |
| Passport and microchip | Identification and insurance, identifiers together |
| Insurer and policy | Identification and insurance, insurer/policy together |

Desktop structure:

```text
Horse details        Age              Date of birth
                     Breed            Sex
                     Colour           Height
                     Discipline / parentage when recorded
────────────────────────────────────────────────────────
Care information     Allergies        Shoeing status
                     Deworming notes
                     Readable prose with preserved line breaks
────────────────────────────────────────────────────────
Identification       Passport [copy]  Microchip [copy]
and insurance        Insurer          Policy number
```

Mobile structure:

```text
Horse details
Age                 Date of birth
Breed               Sex
Colour              Height
─────────────────────────────────
Care information
Allergies
Shoeing status
Deworming notes
─────────────────────────────────
Identification and insurance
Passport [copy]
Microchip [copy]
Insurer
Policy number
```

**Display policy and reusable pattern**

- Group heading first; neutral, restrained field labels; readable values. Green remains meaningful for actions and focus.
- Short facts can share a row. Identifiers and prose use the available width on mobile and wrap safely.
- Allergies remain visible as recorded text or a list. Missing allergy data reads “Not recorded”; it never becomes “none.” Do not infer a confirmed clinical status from free text.
- Deworming notes use the same label hierarchy, with normal prose and a readable line length. No oversized shaded box for ordinary text.
- Omit wholly empty optional administrative or parentage groups. Keep sparse profiles compact and keep missing care information explicit.
- Preserve the entered height exactly. The current schema cannot justify appending a unit to “15.”

Extend the shared detail primitives with an opt-in reference-group/definition-list pattern. It should own spacing, heading alignment, fact pairs, long-content wrapping and semantics. HorseProfileSection should own the domain grouping and formatting. Do not change all DetailField consumers globally or migrate other pages in this first pass.

**Implementation and polish plan**

1. Add the opt-in shared pattern alongside DetailBlocks; reorganise HorseProfileSection; update English and Polish group labels.
2. Preserve permissions, age calculation, copy behavior and data values; add meaningful tests for sparse profiles, zero age, explicit-none versus missing allergies, parentage visibility, semantic pairs and copy recovery.
3. Inspect desktop, intermediate and phone layouts with short and long content; fix the observed defects in one batch and confirm once. Then stop.

**Acceptance criteria**

- Shoeing, allergies and deworming are findable in one named group before administrative details.
- Age and birth date stay adjacent; shoeing never creates a parentage heading.
- No clipped facts or horizontal page overflow at 390px, intermediate widths or desktop; long permitted values and note line breaks remain readable.
- Unknown and explicitly entered “none” remain distinct; no invented height units or rewritten facts.
- Each value has a semantic label; copy controls retain names, keyboard focus and success/failure handling.
- English and Polish, sparse profiles and populated profiles use the same shared pattern.

**Design decisions to confirm**

1. Place care before administration as recommended, or retain administration before care?
2. Keep all deworming notes expanded as recommended, or allow long notes to collapse behind a readable preview? Allergies remain visible in either case.
