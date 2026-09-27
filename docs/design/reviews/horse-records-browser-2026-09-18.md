# Horse records — browser audit

18 September 2026. Impeccable audit/harden/polish, with the user's authorization to fix shared causes. Scope: the actual Care and Nutrition sections through `/page-lab/horse-records`, and actual HorseActivitySection through `/page-lab/horse-activity`. Local, visibly labelled records only; no authenticated writes or real deletions. This report supplements the source reviews, not the production route coverage.

## Integrity and visual assessment

The approved identity is retained: Alegreya headings, Alegreya Sans controls/body, ivory canvas, neutral selected tabs, evergreen actions and burgundy failures/removals. Record rows use the shared flat treatment; filters and protected dialogs retain their own surfaces. The sample controls and large lab navigation are audit scaffolding, not production page content. They must not be mistaken for extra product UI.

Provisional technical score for the observed sample compositions: accessibility 3/4, performance 3/4, responsive design 3/4, theming 3/4, implementation integrity 3/4 — **15/20**. This is not WCAG certification or a performance benchmark. Important remaining scope includes native date controls, reduced-motion/browser text scaling, authenticated shells and backend outcomes.

## First browser round

Desktop 1366×1000 and narrow 390×844, Chromium in the Codex browser. State reads and viewport screenshots were used together. No horizontal document overflow was observed in checked narrow forms/medication and desktop activity. Browser full-page stitching produced duplicated/scaled content, so that capture is excluded; use the viewport images below.

- **Care reminders:** Complete visibly entered a disabled pending state while the sample still reported no change. Acknowledgement changed the record to Completed. Confirmed local removal removed the row; focus returned to the surviving `Care reminders` group, not body or a detached button.
- **Health issues:** two independent records entered Resolving concurrently and both retained their own inline errors after simulated failures. Retrying one resolved that row while leaving the other's failure intact. H1→H2→H3 hierarchy is present. On mobile, submitting an empty issue focused the title and linked the visible error through `aria-describedby`/`aria-invalid`; the dialog fit the viewport.
- **Nutrition:** actual Enter/typing preserved `Hay\nWater` in the textarea. A delayed submit kept the dialog open on Escape, with Adding feedback and no premature success. Failure retained the draft; retry added one local history entry with separate Hay/Water items. The current feeding routine remained unchanged. After acknowledgement the dialog closed and focus returned to the visible Add nutrition log trigger.
- **Weight:** zero was rejected and focus moved to the invalid weight field. A valid 1100 lb record without optional body condition was added locally. View-only removed Add/Remove actions. Empty data showed the specific empty message, without a misleading latest metric.
- **Medication:** active records read Planned end, completed records read Ended, and future-start courses had disabled completion. Searching history retained the active/planned summary. A local record with optional fields absent exposed empty metadata separators, recorded below. Native date `.fill` and segmented key entry did not change the date values in this browser driver; the attempted reversed-date browser scenario is **not** counted as validation evidence. Form/schema/in-memory backend tests cover chronology separately.
- **Activity:** completed-today and cancelled-future records appeared in History, while current/future planned and legacy records appeared in Upcoming. The 40-event sample retained 20 rows per bucket. Keyboard PageDown focused the named history region and moved its scrollTop from 0 to 580. Expand increased height from 600 to 1440 without removing rows. No-result search and Clear all recovered; empty data had the correct message. Dark mobile and desktop screenshots confirmed readable flat hierarchy and wrapping. Real event links/Add event were not followed because sample IDs are not saved entities.

## Findings and correction batch

- **P1 — offscreen request failure:** Nutrition's failure alert sat above the visible area after submission from the bottom of its long mobile dialog. The values survived, but a sighted user could miss why nothing happened. Shared submission-error focus/reveal treatment is being applied across the four horse record forms; field validation remains a separate path.
- **P2 — latest weight on equal dates:** browser observation showed a same-displayed-date sample below an older record. Source inspection separated a fixture UTC/local-midnight inconsistency from a real production tie: measurement-only sorting/selection kept the first equal-date record. The correction uses measurement date then creation time, and normalizes fixture dates through the existing local-date utility.
- **P2 — orphan metadata separators:** empty optional strings in medication summaries were counted as children by DashboardMetaList, producing double/trailing dots. The global owner now filters blank string children while preserving numeric zero. Two regression tests cover optional values and zero.
- **P3 — repeated disclaimer:** nutrition repeated the history-only explanation in its dialog introduction and form group. Keep the explanation beside the historical snapshot fields and shorten the introduction.

All four findings above were corrected in one batch. The second browser round confirmed the affected behaviour; no further cosmetic loop was performed.

## Bounded confirmation

- Shared `FormSubmissionError` now owns the existing destructive Alert presentation, focus and immediate nearest-edge reveal, directly before submit. After a delayed nutrition failure at 390×844, the alert was the active element and its bounds were y=752–827, inside the visible dialog. Tab moved directly to Add nutrition log; Enter retried, acknowledgement closed the dialog, and the draft was preserved through failure. Instant scrolling adds no motion-dependent delay. The other three consumers have regression/source coverage of the same shared owner; this does not claim a second native browser failure run for each form.
- Adding 511 kg on the fixture's existing measurement date updated Latest record to 511 kg and placed it before the older 500 kg record. The shared ordering comparator is used by the query, view and sample, with order-independent tie regressions.
- Saving a medication record with blank optional frequency/prescriber produced exactly `Illustrative value·Started 18 Sept 2026`, with one separator. Acknowledged completion of another sample course removed it from the active summary and changed its row to Completed / Ended 18 Sept 2026. The future course remained uncompleted.
- The shortened nutrition dialog introduction and form-owned disclaimer were visible. No horizontal document overflow appeared in the confirmed narrow medication state. Temporary viewport override was reset and the initial light theme restored.

## Screenshots

Files under `/Users/antek/.codex/visualizations/2026/09/17/01a0b0f2-ddce-78b1-bcc3-d513123b3d04/horse-records-audit/`:

- `health-desktop.png`: independent failure and successful retry.
- `health-mobile-validation.png`: title validation, focus and narrow dialog.
- `nutrition-mobile-failure.png`: first-round offscreen-error finding; screenshot shows retained multiline draft at the scrolled form bottom, **not** the error itself.
- `medication-mobile-dark.png`: narrow filtered medication history with active summary retained.
- `activity-mobile-dark.png`: expanded keyboard-scrollable history with long titles.
- `activity-desktop-dark.png`: status-based History composition.
- `nutrition-mobile-error-confirmed.png`: focused visible error after the shared fix.
- `weight-mobile-latest-confirmed.png`: same-day newly created measurement correctly selected as latest.

## Checks and limits

Before browser work: full TypeScript passed; 331 tests across 69 files passed. After the correction batch: **337 tests across 72 files pass**, full TypeScript and scoped ESLint pass, production Vite build passes, and `git diff --check` passes. Logs: `/tmp/paddock-horse-records-final-tests.log` and `/tmp/paddock-horse-records-build.log`. Scoped static Impeccable detector completed without findings; this does not establish visual correctness. All source/test/build tools finished before the final browser interactions to avoid HMR resetting samples.

Authenticated route composition, real permissions/subscriptions, live saves, backend latency/error contracts, real native mobile calendars, browser midnight rollover, reduced motion and text scaling remain open. The medication backend chronological guard has in-memory test evidence, not deployment evidence. No undo for a persisted medical/care state was invented. Sample success messages explicitly describe local changes.
