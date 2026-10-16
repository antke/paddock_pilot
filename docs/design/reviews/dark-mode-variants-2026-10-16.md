# Dark mode studies

User brief: remove the military/olive feel from dark mode, preserve bright mode, explore a few alternatives before adopting one. Impeccable critique, colour refinement and polish workflow. Operate mode; existing app identity, typography, layouts and behaviour are the visual authority.

## Adoption

The user selected **Charcoal & pine** on 16 October 2026. Its 56 semantic colour roles are now applied to the application `.dark` block in `src/styles.css`; all CSS outside that block is byte-for-byte unchanged. DESIGN.md records the approved dark palette. The lab's current-dark reference now shows the adopted theme without candidate overrides. The sections below retain the initial study history.

Adoption validation: 28 focused tests passed, plus the conformance test for canonical surface owners. The other broad conformance test reports an existing raw `<button>` in `src/components/landing-lab/LandingLabPage.tsx:84`, unrelated to this theme change and left untouched. TypeScript, scoped ESLint, formatting, whitespace checks and the production build passed. Rechecked the actual stylesheet's current-dark reference on desktop and at 390 × 844; the portalled dialog resolves to the approved raised surface and foreground. No new detector exceptions were added during adoption.

## Review

Independent assessments: `/root/dark_design_review` and `/root/dark_evidence_review`. [Archived critique](../../../.impeccable/critique/2026-10-16T12-18-15Z__src-components-layout-appshell-tsx.md), provisional 28/40. First run for the AppShell target; no trend yet.

The current dark palette puts olive/green into canvas, working paper, text, secondary surfaces and selection. Current core text pairs pass, but card/canvas separation is only 1.07:1 and the panel is darker than the canvas. The older nested palette workshop also inherits light root aliases into dark specimens. That tooling defect is not a production dark-mode defect.

## Deliverable

Open `/page-lab/dark-mode`. Three isolated directions:

- **Charcoal & pine:** charcoal canvas, lighter panels, the current bright theme's paper colour as text, and a clearer green action colour. Recommended starting point for continuity.
- **Warm ink:** brown/plum-black surfaces, parchment text and eucalyptus actions.
- **Midnight slate:** cool slate surfaces, stone text and sea-green actions.

The URL retains palette, reference and specimen. Compare with current dark or bright using their real stylesheet tokens. Inspect actual dashboard, calendar, horse form and shared controls/dialogs using fictional records. Preview colour changes preserve the form draft; changing specimens still honours the form guard. Sample links are intercepted, while Back to style lab exits the comparison.

The preview owns the document theme, so root-derived app tokens and portalled dialogs inherit the same palette. Exiting restores the previous application appearance without saving a theme preference. No production palette or light-theme value was changed. The existing palette workshop is retained; its nested inheritance defect is documented rather than silently altering older studies.

## Validation

- Full TypeScript, scoped ESLint, formatting, production build and whitespace checks passed.
- 28 focused tests passed: palette semantic-role completeness, foreground/background contrast, control borders, safe URL defaults, existing document theme restoration and preference/shell regressions.
- All three candidates viewed on desktop; phone checks at 390 × 844. Desktop width was 1710. No horizontal document overflow observed on dashboard, calendar or horse form.
- Inspected shared control and dialog sample, confirmed portal foreground/background values, and exercised local save confirmation.
- Compared root-computed bright and current-dark tokens to the original CSS. On exit, root returned to light, the preview attribute was removed and background returned to `#eeece8`.
- Slightly darkened slate selection after pink error text initially measured 4.409:1 against it. Final tested pairs pass their thresholds.
- Manual keyboard focus and all alpha-composited/chart states are not comprehensively certified; full live backend workflows were outside this palette study.

## Tooling notes

Bounded critique detector: 11 existing TSX owners, zero findings. Browser overlay injection unavailable because CUA evaluation is read-only; used screenshots, DOM/computed styles and contrast arithmetic instead. No detector live server was started. The Vite preview remains running for comparison.

The design hook's palette-colour warnings were intentional study tokens. File/value-specific exceptions were added for the six new input/border values in `darkModePalettes.ts`; no global detector rule was disabled. Other immediate hook findings cleared after formatting. The hook also reported the existing DESIGN.md/sidecar timestamp drift; left unchanged because context repair was not requested.

Sources: [Material dark themes](https://codelabs.developers.google.com/codelabs/design-material-darktheme), [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [Apple Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode).

Decision resolved: Charcoal & pine adopted after the user's selection; alternate studies remain available for reference.
