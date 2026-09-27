# Care-summary print audit — 19 September 2026

Initial read-only, bounded Impeccable audit/adapt review, followed by the authorized correction batch recorded at the end of this report. Inspected the real care-summary renderer, print primitives, shared card/detail/header owners, stable/horse route composition, application shell, theme tokens, query shape and current local fixture. The original findings below distinguish demonstrable source behavior from pagination outcomes requiring a print engine. No browser print preview or PDF generation has been performed.

## Confirmed source defects

### P1: Print text is not isolated from dark-mode tokens

`src/components/dashboard/PrintSummary.tsx:20` sets black at the page ancestor, but `PrintSummarySection` renders a shared Card with its own `text-card-foreground` (`src/components/ui/card.tsx:10`). In dark mode that variable is `#f7f2e9` (`src/styles.css:199`). The section remains transparent, and record headings, record bodies and list values inherit its explicit light foreground. Selected details/descriptions have their own `print:text-black` overrides, producing an inconsistent print color policy within one document. The global body still uses `bg-background`; dark background is `#20231f` (`src/styles.css:196`). There is no print-specific canvas/token reset.

The ancestor's black declaration cannot override a descendant's explicit foreground. That is a concrete cascade defect. Whether a particular printer/browser suppresses backgrounds, adjusts the light text or prints dark fills is not verified; do not claim an observed blank page or a measured contrast ratio.

**Fix owner:** PrintSummary root plus a strictly scoped print CSS policy in `src/styles.css`. Provide a white paper canvas and dark text/muted/border tokens for the printable subtree, including card foreground. Override the document's screen color-scheme only for a summary print. Preserve all screen tokens and the country/lab identities. Do not apply global descendant color rules to every printable page.

### P2: Application chrome is still part of the printable document

`ApplicationRouteShell` always includes Header, PageLayout and Footer for the care-summary route (`src/components/layout/ApplicationRouteShell.tsx:16`). `AppHeader` stays sticky, `AppFooter` and its links remain visible, and AppShell carries inline viewport-height/grid layout (`src/components/layout/AppShell.tsx:35`). `AppMain` and `AppMainContent` retain screen padding, a 12-column grid and minimum height. The stable route renders breadcrumbs before its outlet (`src/routes/stables/_layout/$stableId.tsx:14`). None of these owners has a print opt-out.

The horse entity hero/navigation correctly has `print:hidden` (`src/components/horses/HorseDetail.tsx:96`), and the summary's Print button is correctly hidden through PrintSummaryHeader. Those narrower rules do not hide the outer app/stable chrome.

**Fix owner:** Scope shell cleanup to a marked print summary. Hide app header/footer, skip link and the stable breadcrumb rail, and normalize only its page-bearing ancestors to block/natural height with print-appropriate width/padding. Avoid `body * { visibility:hidden }`: that retains empty layout and can hide essential record content. No claim is made that the current browser repeats a sticky header on every printed page; the confirmed problem is that navigation is not excluded at all.

### P2: Keep-together is applied to entire collections

`PrintSummarySection` uses `print:break-inside-avoid` (`PrintSummary.tsx:50`) around full sections. `HorseCareSummaryPage.tsx:222–248` places both active-health and active-medication collections in one section; the documents section similarly contains the entire list. `convex/horseCareSummary.ts:79–91` returns all active health issues, active medications and documents without a presentation cap. Recent event/weight/nutrition lists are bounded to 12/6/6, but individual note bodies can still be long.

`PrintSummaryRecordPanel` has no record-level fragmentation policy (`PrintSummary.tsx:82`); record headers have no break-after guard, and the body only preserves whitespace (`PrintSummary.tsx:104`). RecordList also remains a grid (`HorseCareSummaryPage.tsx:358`). The source therefore asks the print engine to keep an arbitrarily long collection together while giving no smaller grouping guidance.

**Fix owner:** PrintSummary primitives. Let collection sections fragment; keep section/record headings with following content, prefer breaks between ordinary records, and allow an oversized record body to continue naturally. Use scoped block flow where nested screen grids interfere with print fragmentation, and bounded widow/orphan handling for prose. Do not add height limits, clipping or unconditional one-section-per-page breaks. `break-inside:avoid` is advisory, so source inspection alone cannot prove content loss or quantify whitespace; actual multipage pagination remains mandatory verification.

## Smaller source issue to separate from print styling

`HorseCareSummaryPage.tsx:244` labels every active medication's date `Started …`, while the query filters only `status === 'active'` and allows future-start records. A future date can therefore be described as already started. The actual medication card's date wording should be reused or matched if the parent includes this tiny factual-copy correction. Keep this separate from layout: no medication state or server query policy needs to change for the print-style batch.

## What already works

- The print document names the horse and stable and includes a generation date. The action invokes a supplied `onPrint` boundary, defaulting to `window.print`; it does not save or mutate records.
- Profile, emergency contacts, nutrition and individual record sections use actual data, named headings and shared owners. Absent optional details are omitted and empty record groups show explicit text.
- Record notes use preserved whitespace; no local fixed-height scroll viewport or line-clamp was found in the summary itself. App body has `overflow-wrap:anywhere`, which provides an existing long-identifier fallback.
- The query explicitly distinguishes active collections from recent limited histories. This summary should not be presented as a complete historical export, and this task need not change the data scope.
- Existing `HorseHistoryViews.test.tsx` checks title/section hierarchy, identifying values, empty/missing states and invocation of the print boundary. It does not exercise browser print CSS or pagination.

## Safe fixture gap

`CareSummaryPageLab` already reuses the real `HorseCareSummaryView`. Its `long` fixture lengthens the horse name, passport identifier, emergency note and document name, but still contains one health issue, one medication, one document and at most three events (`horseHistoryFixtures.ts:30–43, 117–146`). It does not adequately exercise a many-page collection or a single record longer than a page.

Add a clearly marked local print specimen with many uniquely named/numbered records, one deliberately long multiline body, long identifiers, sparse/empty sections and Polish characters. Keep a small **print-visible sample identifier** in the fixture: its current overarching sample description is inside `print:hidden` (`CareSummaryPageLab.tsx:15`). The real document must not gain a sample watermark. No live query/save is needed to validate this shape.

## Proposed bounded correction batch

1. Add stable semantic/data hooks to `PrintSummary.tsx`; put page, section, record and heading print policies at those owners. Keep their on-screen classes and content intact.
2. Add summary-scoped `@media print` rules in `src/styles.css` for white canvas, light color-scheme, dark foreground tokens and natural document flow. Use existing `data-slot` hooks where available. Add a narrowly shared shell/breadcrumb opt-out hook only if an existing selector cannot express the boundary cleanly. Do not rewrite generic Card or all DashboardPage layouts for screen use.
3. Extend only the care-summary specimen/fixtures to exercise many-page and oversized-record cases. Keep explicit sample provenance in print. Optionally address the future-start wording separately in HorseCareSummaryPage.
4. Add focused semantic regression for complete specimen content and grouping; verify print hooks/styles at their owner without treating DOM tests as a pagination test. Run targeted lint/type checks and existing history regressions.
5. Once browser control is available, inspect real print preview/export for A4 and Letter, light and dark app mode, backgrounds enabled and disabled. Check the same oversized/many-record cases for omitted/duplicated text, first/last record presence, usable page margins, no app chrome, readable values/notes and heading/orphan behavior. Verify canceling print leaves the screen layout/theme untouched. Capture actual previews/PDF evidence only then.

No implementation is authorized by this report itself; the parent decides the correction scope. A reliable printed deliverable cannot be declared complete while the browser print path remains unverified.

## Authorized correction — 19 September 2026

The parent subsequently authorized the shared print fixes and specimen. Revalidated the current owners before editing; the initial three source defects were still present.

- `src/components/dashboard/PrintSummary.tsx` now marks the document, section, record and body boundaries, plus shared header classes. Removed collection-wide keep-together; existing screen classes, heading hierarchy and content remain unchanged.
- `src/styles.css` adds a named `care-summary` page with 14 mm margins, activated only when a summary exists. Print-only `:has([data-print-summary])` rules set a white canvas and light color-scheme, remove app header/footer/breadcrumb/skip link and lab controls, and normalize only document-bearing ancestors to natural block flow. Separate direct body siblings (including portal chrome) are excluded from this document. The printable subtree overrides its card/foreground/muted/border tokens; screen and other-route palettes remain untouched.
- Shared sections and record lists use block flow for print. Collections can fragment; ordinary records request keep-together, with an oversized record allowed to fragment by the print engine. Section and record headers request following content; body paragraphs use three-line orphan/widow guidance and preserve whitespace. No height cap, line clamp, unconditional section page break or content truncation was added. These are fragmentation hints, not proof of engine output.
- `src/components/page-lab/prototypes/CareSummaryPageLab.tsx` adds “Multipage records and long body” using the actual `HorseCareSummaryView`. It contains 24 uniquely identified document records, Polish characters, a passport identifier, existing mixed record kinds, and an 82-line note within the real 1,000-character limit. A print-visible notice identifies all available specimens as illustrative. This notice is confined to the lab; production summaries do not gain sample copy. Empty-horse input remains missing rather than manufacturing a record. No live query, upload or save was introduced.

### Verification and limits

`CareSummaryPageLab.test.tsx` plus existing `HorseHistoryViews.test.tsx`: **7 tests / 2 files passed**. New cases verify all 24 document titles/bodies remain in real record/section groups; the long body is retained exactly through its final line; production content has no specimen notice; scenario changes clear old records; the real print boundary is invoked; and empty/missing horses expose no Print action. These are local DOM/content checks, not CSS layout or pagination checks.

Scoped ESLint, Prettier and `git diff --check` passed. This batch's full TypeScript attempt reported only a parallel `RouteError.tsx` title-type error, which the parent then corrected at `RouteStatusAlert`; the parent owns the final aggregate type confirmation. Logs: `/tmp/paddock-print-summary-tests.log`, `/tmp/paddock-print-summary-types.log`.

**Still pending:** actual A4/Letter print-engine inspection in both app themes and with background printing on/off; first/last record presence in the rendered document; tall-body continuation; heading/orphan behavior; margins and absence of shell chrome; return from print without changing the screen theme/layout. No PDF, screenshots, browser print success or full print audit completion is claimed.

### Separate factual-copy correction

Parent review changed the active-medication date label in `HorseCareSummaryPage` from “Started” to “Start date:”. This accurately labels past or future dates without asserting that a future course has begun. It changes neither medication state nor the query. The existing actual-summary tests are included in the aggregate check; no new test was added solely for this text substitution.

### Combined confirmation

The parent aggregate passed **516 tests / 105 files**, full TypeScript, production build, scoped lint/format and whitespace checks. The initial aggregate typecheck additionally caught a missing `HTMLSelectElement` generic in the new specimen test; the parent corrected that annotation and reran TypeScript successfully. See [combined checkpoint](lab-entry-navigation-2026-09-19.md#combined-checkpoint) for logs and detector assessment. Print-engine evidence remains pending as stated above.
