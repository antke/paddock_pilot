# Safari form compatibility — 14 October 2026

The current local form implementation passed the checks below. No remaining visible field overlap was reproduced. This verifies the local changes from the preceding form-layout work; it does not establish which code is currently deployed or identify the cause of the user's original Safari screenshot (none was supplied).

## Verified scope

- **Native Safari 26.6.2 on macOS:** manually opened the production training editor through `/page-lab/training`, expanded Additional details, and inspected date/time fields, wrapped work and format choices, title, duration, textareas, end-date help and status. Visible controls and labels did not overlap. Safari WebDriver was unavailable because Allow remote automation was disabled; the native UI was inspected without changing that setting.
- **Playwright 1.62.1 / WebKit build 2336:** 80 successful layout checks across training, event, horse and stable forms, plus the design-system control specimen. Desktop/light at 1280px and 768px; mobile/touch emulation/dark at 375px and 320px. Each combination covers collapsed sections, expanded sections, multiline Unicode textarea content and native textarea sizing with `field-sizing: fixed`.
- Checks reject intersecting independent fields, content extending below its field, controls wider than their container, page overflow and sub-16px mobile control text. Deliberately clipped accessibility and combobox proxy inputs are excluded.
- Production form components use the existing local-only Page Lab callbacks. No live records were submitted or modified.
- TypeScript and scoped ESLint passed for the verification script and design-system example changes.

The earlier fixes are retained in the shared primitives: shrinkable field/grid widths, bounded native date/time controls, automatic textarea height, mobile input text size and block-flow form disclosures. The design-system page now includes actual date, time and textarea examples alongside text, select, invalid and upload controls.

## Reproduce

Install the pinned dependency with `pnpm install`, then install its WebKit browser once:

```sh
pnpm exec playwright install webkit
```

Start the ordinary dev server in one terminal (`pnpm dev`), then run:

```sh
pnpm test:forms:webkit
```

If the dev server is on another port:

```sh
FORM_TEST_URL=http://localhost:9092 pnpm test:forms:webkit
```

The script only accepts loopback URLs. Results are written to `.browser-checks/webkit-forms/results.json`, with screenshots on layout failures; these generated artifacts are ignored by Git. Browser checks remain separate from jsdom tests because jsdom cannot verify CSS geometry.

## Limits

This is a form-layout compatibility check, not a certification of every design-system component. It does not cover older Safari releases, physical iOS keyboard/viewport behavior, every locale or enlarged text setting, authenticated route wrappers, actual persistence, or screen-reader speech. Mobile emulation and disabling textarea auto-sizing exercise specific fallback paths; they do not reproduce an entire older Safari release. The user's exact device and Safari version remain unconfirmed.
