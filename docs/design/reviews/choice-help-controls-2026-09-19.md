# Choice and help controls — 19 September 2026

Bounded Impeccable audit/hardening of ChoiceButtonGroup, ToggleGroup, RadioGroup and FormHelpTooltip, expanded with approval to the shared Tooltip owner. Read incumbent recipes and installed Base UI 1.7 behavior; reproduced failures in local DOM before correction. No browser inspection, geometry certification, backend mutation or production build belongs to this pass.

## Confirmed corrections

### P2: ToggleGroup consumed its orientation

`src/components/ui/toggle-group.tsx` consumed `orientation` for styling/context but did not pass it to Base UI. A vertical group retained horizontal keyboard behavior: ArrowDown left focus on the first item. The primitive now receives orientation. Its layout and zero-gap border selectors now use the actual `data-orientation` attribute rather than nonexistent `data-vertical`/`data-horizontal` flags. The regression verifies up/down navigation, disabled-item skipping and Home/End. No current production vertical ToggleGroup consumer was found; this corrects an exposed shared API rather than claiming a demonstrated vertical production-page failure.

### P2: Tooltip content lacked a role and description association

The installed Base UI Tooltip mounts its floating content and handles focus/hover/dismissal, but its inspected Root/Popup implementation does not supply `role="tooltip"`, a content ID or a trigger `aria-describedby` relationship. Before the fix, keyboard focus visibly mounted FormHelpTooltip's text in DOM while the role/name association query failed.

`src/components/ui/tooltip.tsx` now owns that association once. A small root context shares the open state and a generated content ID. Popup supplies the default tooltip role and ID; an explicit caller ID remains authoritative. Triggers preserve caller-provided description IDs and add the open tooltip's ID. Controlled `open`, uncontrolled `defaultOpen`, open-change callbacks and canceled changes are covered. Existing popup styling, placement, portal, focus/hover handling and reduced-motion recipe remain at their original owners. FormHelpTooltip no longer duplicates this role/ID recipe.

A real metadata-only `DocumentDownloadAction` regression focuses its existing focusable unavailable wrapper, verifies the tooltip reason is associated with it, and confirms no download is attempted. Existing download lifecycle tests remain passing.

### P2: Explicit form-help activation immediately dismissed help

FormHelpTooltip used TooltipTrigger's default close-on-click behavior. The local touch-like pointerdown → focus → pointerup → click sequence closed the help immediately. `src/components/forms/FormHelpTooltip.tsx` now uses controlled open state, opts out of close-on-click, and explicitly opens on activation. This makes help readable after tap/click, including repeated activation, while retaining hover, keyboard focus, Escape, and blur dismissal. The trigger remains a non-submitting button using the shared recipe. It does not create a new popover style or change generic tooltip click policy.

### P2: Disabled radio styling targeted the wrong element state

Base UI renders the visible radio as a span with `data-disabled` and `aria-disabled`; native `:disabled` styling cannot match that span. `src/components/ui/radio-group.tsx` now applies the existing cursor/opacity treatments through `data-disabled`. Selection and submitted values are unchanged. Local tests already demonstrated that disabled items are skipped and a disabled group cannot change; browser confirmation of rendered disabled contrast remains outstanding.

## Preserved behavior and actual consumers

ChoiceButtonGroup remains a named group of pressed/unpressed toggle buttons. Compact and descriptive card variants remain single-selection and keep the selected value when it is clicked again. Arrow movement changes focus, not the product value; explicit activation selects. No radio conversion was introduced. Its existing group-level invalid/description attributes remain linked to visible errors.

EventFormFields uses card choices for simple/advanced scheduling, independent weekday toggles for recurrence, and true radios for monthly pattern/end conditions. HorseFormFields uses compact choices for sex/shoeing status. CareReminderForm and MedicationRecordForm use named, disabled-aware choice groups and link errors at the group. Their source semantics were inspected; existing actual event/horse form regression suites were included in verification.

RadioGroup retains native value submission through Base UI's hidden input. Tests exercise real FieldLabel association, label activation, arrow-driven checked selection, disabled skipping and submitted FormData. Generic ToggleGroup retains independent multi-selection for weekday-style controls. No wrapper/card redesign or per-route styles were introduced.

## Verification

Before correction, the initial focused run had **3 failing / 6 passing tests**: vertical navigation, form-help role/association, and explicit touch-like help activation. After correction and expansion, **36 tests passed across 7 files**:

- `src/components/ui/choice-controls.test.tsx` — 7 cases.
- `src/components/ui/tooltip.test.tsx` — 4 cases, including the real unavailable document consumer.
- `src/components/forms/FormHelpTooltip.test.tsx` — 4 cases.
- Existing `DocumentDownloadAction.test.tsx`, `EventFormFields.test.tsx`, `FormsPageLab.test.tsx`, and `HorseProfileForm.test.tsx`.

Full TypeScript, scoped ESLint, Prettier and diff checks passed. Logs: `/tmp/paddock-choice-help-before.log`, `/tmp/paddock-choice-help-final-tests.log`, `/tmp/paddock-choice-help-types.log`.

## Remaining verification limits

JSDOM demonstrates event/state, accessible associations and native-form data; it does not establish rendered tooltip collision handling, wrapping, actual touch target geometry, mobile hit testing, focus-ring visibility or contrast. The touch-like event sequence is an automated regression, not proof on an iOS/Android browser. Card/compact content and semantics were tested, but their widths and responsive wrapping still need the resumed browser pass. Native button Space/Enter activation is left to the browser; tests directly exercise arrow navigation and explicit click activation rather than claiming a simulated key event performs a native browser click. Other tooltip consumers inherit the shared correction but were not each visually inspected. No whole-project accessibility score or completion claim is made.

## Browser-found 320px tooltip overflow — bounded owner correction

The parent’s browser pass opened “About simple recurrence presets” with Enter on `/page-lab/forms` at 320 × 720. The popup measured x=5, right=325, width=320 and clipped beyond the viewport (`filter-navigation-confirmation/recurrence-help-320-before.jpg`). This is observed geometry, unlike the earlier DOM-only checks.

The shared popup kept its 20rem maximum while installed Base UI’s Positioner defaulted to 5px collision padding. Collision positioning alone could not make a 320px-wide popup fit a 320px viewport with an inset. Installed `TooltipPositionerCssVars` exposes `--available-width`, populated by its positioning size middleware.

Only `src/components/ui/tooltip.tsx` changes: its existing positioner now has 8px collision padding and maximum width `min(var(--available-width), calc(100vw - 1rem))`. The popup keeps `w-fit` and `max-w-xs`, so it fits inside the constrained containing block while explicit narrower caller maxima remain applicable. `min-w-0` and anywhere wrapping let long text shrink instead of imposing an unbreakable minimum. No new wrapper, caller/form override, palette, content or interaction change was introduced. Direct consumers remain FormHelpTooltip (event/stable/file fields), DocumentDownloadAction, StableActivityTimelineChart and Style Lab.

Scoped formatting/ESLint and full TypeScript checking pass; existing Tooltip and FormHelpTooltip regressions pass **8 tests across 2 files**, including keyboard description/dismissal, repeated activation and the unavailable-document consumer. No class-string-only or fictitious jsdom geometry test was added. Subsequent browser confirmation is recorded in `filter-navigation-browser-2026-09-19.md`: recurrence help fits x8–312 at320px, retains320px maximum at desktop, and the unavailable-document tooltip preserves its short width and keyboard behavior. This does not claim coverage of every tooltip consumer.
