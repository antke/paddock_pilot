# Chrome fixture confirmation — 16 October 2026

Local route: `/page-lab/motion` on the development server. Production primitives, held local promises and disposable local records; no authenticated backend operations. This records Chrome evidence separately from the collaborative-preview evidence in the main ledger.

Desktop 1280 × 900 and mobile 390 × 844 were inspected together, including light and dark appearance, with one confirmation pass. The final corrections bound segmented-indicator layout measurement to selection changes, retain a minimum agenda height, and reset agenda presence when selecting a different date so outgoing events cannot displace the next day target. Optional fields use a static fallback outside the application motion scope; this also fixed the unmounted filter timer regression. Notices release overflow clipping after settling so focused content remains visible.

Observed:

- Form idle and pending dimensions both measured 153.5546875 × 40px. Pending was disabled and aria-busy. Rejection retained the draft and focused the error. Retry reached the accessible Saved state.
- Collapsing/reopening an optional section retained edited notes. Segmented choice, checkbox and tab selection updated correctly.
- Care showed no receipt before acknowledgement; rejection allowed retry. Confirmation showed the final-item receipt only at zero outstanding records. Restore returned the record and removed the stale receipt.
- Removed collection rows moved focus to the surviving list. Restore and reverse order retained one record per identity.
- Dialog Escape restored its trigger after the library exit completed.
- Month navigation and mobile date selection produced the correct calendar/agenda state. After the agenda correction, rapidly selecting the empty 17 October and populated 16 October returned the expected 16 October heading.
- No horizontal document overflow at either tested width; no application console errors captured.

Chrome file selection was blocked by the extension's missing file-URL permission. That permission was not changed. File selection/removal/cancellation, preserved files after upload failure, retry and late rejection after unmount are covered by component tests; the separate collaborative-preview selection check is recorded in the main ledger. No live file upload is claimed. OS-level reduced-motion browser emulation, physical mobile Safari, authenticated route persistence and backend synchronization remain outside this fixture verification.

The complete repository run passed 1,271 tests with the two pre-existing unrelated failures listed in the main ledger. The focused post-correction run passed 38 tests covering calendar behavior, care acknowledgement, motion lifecycle, disclosure, file selection and upload recovery. Typecheck, lint and production SSR smoke checks passed; lint retains three existing backend no-shadow warnings.

[Final desktop capture](desktop-light.jpg) shows the local fixture after an acknowledged form save. [Mobile capture](mobile-dark.jpg) records the care receipt during the confirmation pass, before the final selection-measurement/agenda correction; it is not a claim of live care persistence.

The final scope guard explicitly keeps pricing and historical lab routes on static shared fallbacks, while the working application retains exit presence without remounting its shell. A behavioral shell test checks this boundary. After that guard, typecheck and lint passed, 32 focused lifecycle/shell/calendar/care tests passed, and the production build plus anonymous SSR smoke checks passed again.
