# Filters, navigation, help and print boundary

19 September 2026. Bounded browser follow-up to shared source fixes, using actual owners in existing local labs. No live record mutation, download or upload was performed. The approved visual identity remains intact.

## Filters: actual HorseList consumer

At 1280px, choosing Mare and Front shoes reduced the standard sample to one result. Escape from the Shoeing field closed the facet panel and focused its toggle. Activating Remove Sex by Enter moved focus to Remove Shoeing. Removing the final chip moved focus to Search horses. Counts and selected state updated with each action.

With Search horses focused and query Juniper, changing the specimen's roster to Empty through the supported select control retained the query, the search input and focused search. The list showed zero results and its filtered-empty message. Clear all removed the query and kept search focused. Tab reached the filter toggle; the next Tab reached Deleted horses, after which the now-empty, inactive filter controls unmounted. There was no observed focus jump to the document body. This is a local source transition, not a live subscription/permission change.

At 390×844, the 50-horse sample filtered to ten Juniper records, with Mare selected. The filter panel was 358px wide, x16–374, in normal flow (`position: static`). Document width stayed 390px. The screenshot shows the open facets, chip, count and complete first identity row.

At 1280×720, the same long roster uses the shared sticky recipe. After scrolling, the filter top was 89px and the header bottom 73px, leaving 16px clearance. The document remained 1280px wide. No local layout correction was needed.

## Horse navigation

In `/page-lab/horse-activity`, ArrowRight from Upcoming moved focus to History while Upcoming stayed pressed and the region stayed labelled by Upcoming. Enter selected History and displayed completed/cancelled/past events. ArrowLeft followed by Space restored Upcoming. Both buttons controlled the same real region ID, whose accessible label changed with selection. These are section buttons, not falsely advertised URL tabs.

In `/page-lab/horse-detail` at 320×720, tabbing through Profile, Activity, Care, Nutrition and Documents scrolled the major navigation rail automatically. Documents was fully inside the 288px rail (x110.84–218.64 inside x16–304), with rail scrollLeft 234 and no document overflow. Opening More by Enter focused Timeline. The portalled menu occupied x84.16–304.16 and remained within the 320px viewport. Escape closed it and returned focus to More. No sample link to an authenticated horse route was followed.

## Help tooltip finding

**P2 — Shared tooltip exceeded the narrow viewport.** In the real recurrence fields at 320×720, Enter on About simple recurrence presets opened a tooltip with width 320px, x5–325. Its right edge was visibly clipped. The trigger retained focus and correctly referenced the tooltip ID through aria-describedby; Escape dismissed it. This was a sizing defect in the shared tooltip owner, not a reason to add a form-local override.

The correction lives in `src/components/ui/tooltip.tsx`: the positioner uses 8px collision clearance and caps its width at the smaller of the available space and viewport minus 1rem. The popup retains its desktop maximum and supports wrapping. No consumer-local override was added.

The bounded confirmation pass measured the settled recurrence popup at **x8–312, width 304** on 320×720, with document width 320. At 1280×720 it retained its **320px** desktop maximum, x8–328, and document width 1280. Both were visually inspected and captured. Enter opened it, repeated Enter kept it readable, and Escape dismissed it while retaining trigger focus and removing the temporary description association. Reopening at desktop also worked.

The actual unavailable-document consumer was checked again after correction at 320px: keyboard focus opened “No file is attached”, with matching aria-describedby/tooltip ID, and its settled width remained 117.62px (x160–277.62). Escape dismissed it; Tab continued to Remove. No document action was activated. This confirms a short-content consumer alongside the long recurrence help.

Before that correction, keyboard Tab from the preceding document actions reached the focusable unavailable-download wrapper in `/page-lab/documents`. Its aria-describedby resolved to “No file is attached”; the nested Download remained disabled. The settled short tooltip was within x160–277.62 at 320px. Escape and Tab allowed normal continuation to Remove. No document action was activated.

## Care-summary print limitation

Selected Multipage records and long body in `/page-lab/care-summary`. The screen rendered the Unicode horse name, the long handover record and all 24 document headings, including records 01 and 24. Activated the actual Print summary button. The IAB page remained available, but no inspectable print preview or PDF artifact was exposed through its supported controls. The advertised browser/tab capabilities contain no print/PDF endpoint. Native inspection of the Codex app was explicitly disallowed by the computer-use tool; no workaround was attempted.

Consequently, pagination, margins, continued long records, first/last printed records, dark-theme paper output and print-only removal of app/lab chrome remain unverified. A screen screenshot or source CSS check cannot substitute for real paginated output. This is a specific verification boundary, not evidence that the print implementation is broken. It does not block the remaining browser audit.

## Evidence and boundaries

Real captures live under `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/filter-navigation-confirmation/`:

- `horse-filters-390.jpg`
- `horse-filters-1280.jpg`
- `horse-menu-320.jpg`
- `recurrence-help-320-before.jpg`
- `recurrence-help-320-after.jpg`
- `recurrence-help-1280-after.jpg`
- `document-help-320-after.jpg`

The palm overlay is the development-only TanStack Devtools launcher. None of these images was retouched. A locator scoped to the original navigation failed after the More menu moved into a portal; inspecting its rendered portal and using that owner confirmed normal behavior. Occasional selector-evaluation timeouts were resolved with a fresh read-only DOM observation, without restarting the app or repeating mutations.

Remaining scope includes authenticated destinations/permissions, live source transitions, screen-reader output, physical touch and software keyboards, enlarged text, OS reduced motion, full contrast/performance and actual print pagination. The report does not promote every consumer of these shared components to fully verified.

## Confirmation checks and cleanup

The form fixture was left without a save, and navigating away discarded its local recurrence changes. The final document fixture was reloaded to defaults, light theme retained, and the temporary viewport override reset. The preview tab was retained for the next audit family.

Focused Tooltip and FormHelpTooltip tests, full TypeScript, scoped ESLint and formatting results are recorded with the coverage update. The subsequent combined confirmation passed 31 tests across 8 files and a production build after registration of the recovery specimen; see `directory-route-recovery-browser-2026-09-19.md`. Earlier full-suite results remain historical.
