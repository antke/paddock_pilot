# Onboarding stepper — bounded shared-owner correction

This pass addresses the two stepper findings in `shared-style-ownership-2026-09-18.md`. It is not an audit of all onboarding forms or backend progress persistence.

## Shared corrections

- `OnboardingStepper.tsx` now uses the existing `rounded-panel` token, replacing undefined `rounded-card`.
- The native button now owns the complete flex row, padding and at least 64px height. Previously `display: contents` removed its visual box, preventing a dependable focus outline and leaving padding outside its target.
- Focus uses the global `app-control-focus` recipe. Its ring is inset inside the clipped stepper; an initially transparent one-pixel button border becomes the evergreen focus boundary. Palette, typography and ring definition remain globally owned.
- The list still owns separating borders and current/completed backgrounds. Current and upcoming steps remain disabled; completed and deferred steps are navigable only when an `onStepSelect` callback exists. `aria-current="step"` remains on the current list item.
- A separate `design/OnboardingStepperSample.tsx` makes the style-lab specimen interactive without changing production onboarding logic. Review a completed/deferred sample step and return to the original current step. The status explicitly states that no live onboarding progress changed.

## Verified evidence

The style-lab specimen was tested in an isolated Chrome tab at its existing 3008×1459 viewport; no browser resize was performed while the parent audit was using the browser.

1. Native Tab from **About you Complete** skipped disabled **Stable** and **First horse** and reached **Your team Done later**.
2. DOM observation confirmed `:focus-visible`, `display: flex`, a 343.5×66.75px focused target, evergreen `rgb(36, 76, 59)` border, a 3px inset shared focus ring, and 12px wrapper radius.
3. A screenshot confirmed the focus treatment is visible inside the rounded container, including the last step at the right edge.
4. Native Space activated the deferred step and set `aria-current` to **Your team** with truthful local-only status.
5. Native Enter on **Return to current step** restored **Stable**. Native Enter on **About you Complete** opened that completed step. Reset and Tab navigation repeated successfully.

Screenshot: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/onboarding-audit/stepper-keyboard-focus-desktop.png` (cropped browser screenshot around the component, not a resized/edited mockup).

Unit coverage extends the existing test to verify focusability/disabled native semantics across completed, current, upcoming and deferred states; disabled activation cannot call the selection callback; completed/deferred callbacks keep their correct identity; a progress-only specimen remains outside the focus order. JSDOM does not prove CSS or native Enter/Space behavior; those were checked in Chrome as described above.

## Consumer scope and remaining verification

`OnboardingLayout` owns the production consumer and is used by first-stable and stable-specific flows in `OnboardingPage`, reached from `/onboarding`. The style-lab uses the same `OnboardingStepper` via its local sample. No route-specific styling or backend mutations were introduced.

Still required in the parent family audit: narrow vertical layout, dark theme, text scaling/long translated labels and authenticated production step navigation. This evidence proves the shared stepper correction on the desktop specimen, not the completion of onboarding as a page family.

Checks: scoped ESLint passed; all 5 stepper tests passed. The full project typecheck reached an unrelated concurrent `FormsPageLab.test.tsx:49` error (`value` on `HTMLElement`), reported to the parent for the forms owner to resolve; this pass does not claim a green full-project typecheck at that moment.

## Parent narrow-screen confirmation

At 390×844, the stepper stacks vertically with no page-level horizontal overflow. Native Tab skips current/upcoming disabled steps, reaches Your team, and shows the full-row inset focus outline; Enter activates it. Real screenshot: `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/onboarding-audit/stepper-keyboard-focus-mobile.png`. Dark, text scaling and authenticated navigation remain pending.
