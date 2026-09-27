# Calendar ownership and experimental motion — final follow-up

19 September 2026. This bounded confirmation closes two previously recorded source findings. It does not broaden the authenticated/backend or physical-device claims in the project checklist.

## Weekly calendar

`MiniCalendarCard` no longer chooses its own seven paper backgrounds. `EventCalendarChrome` owns the weekly paper recipe and includes it in the selected-day and inline-day panel recipes. Existing active consumers use flat, selectable days with a selected-day panel; cards, soft and inline variants remain dormant source contracts.

The actual stable dashboard at `/page-lab/stable-dashboard` was inspected with its labelled fictional routine sample. At 320px, Enter selected Sunday 20 and exposed “No calendar entries for this day.” Enter selected Tuesday 22 and exposed the Farrier reset entry with time, category and location. A repeated Enter collapsed that panel and set `aria-expanded=false`. The horizontal day scroller stayed within the page; document width was 320px. At 1280px, both empty and populated selections worked in the desktop panel and document width remained 1280px. Event links were not followed into fictional IDs.

Captured and visually inspected:

- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/final-calendar-confirmation/empty-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/final-calendar-confirmation/populated-320.jpg`
- `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/final-calendar-confirmation/populated-1280.jpg`

The desktop capture was retaken after viewport resizing settled; the retained file is the actual 1280px view. The floating palm control is development tooling, not dashboard design.

## Experimental landing reduced motion

Within the existing `prefers-reduced-motion: reduce` block, Gathered Yard headings, Stable Aisle images and Owner/Member Gatefold panels now explicitly remove spatial animation, transforms and clipping. Gathered headings also remain fully opaque. This adopts their existing static fallback and changes no normal-motion rule or approved country landing styling.

The running browser parsed and delivered the new media rule with all seven selectors, `animation: none !important`, `transform: none`, `clip-path: none` and the Gathered opacity declaration. At 1280px in the actual Gathered capture document, normal motion still computed `gathered-arrive` on all four headings and the composition was visually inspected. The browser reported reduced motion false. Available browser controls expose viewport and visibility, but no reduced-motion emulation; the OS preference was not changed. Therefore this is source/CSSOM verification of the reduced branch and normal-mode rendering, **not an observed reduced-motion runtime or physical accessibility certification**.

## Checks

After these changes, TypeScript and production Vite build passed. The focused dashboard and landing contract run passed 18 tests in 3 files. Scoped ESLint, Prettier and whitespace checks cover the changed owners. These tests cover existing composition/interaction contracts, not CSS rendering or OS preferences. Logs are `/tmp/paddock-audit-followup-types.log`, `/tmp/paddock-audit-followup-build.log`, `/tmp/paddock-audit-followup-tests.log`, `/tmp/paddock-audit-followup-lint.log` and `/tmp/paddock-audit-followup-format.log`.

The preceding full-suite checkpoint remains 598 passing tests in 122 files. It predates this small source extraction and CSS-only follow-up; it is not presented as a new full-suite run.

The scoped Impeccable detector reported one advisory in the pre-existing experimental landing headline clamp at line 332: its 4.5rem endpoint differs from the application type ramp. This belongs to the deliberately separate landing experiment and was not introduced by the motion change. It is retained as a scoped typography exception, not suppressed or reported as a clean detector result. There were no non-advisory findings. Exact output: `/tmp/paddock-audit-followup-detector.log`.
