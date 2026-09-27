# Care reminders family audit — 18 September 2026

Scope: stable reminder list, shared reminder rows/create form, horse reminder consumer, and the existing reminders Page Lab. Applied Impeccable audit/harden/distill principles against the approved warm, flat global design language. No live writes or destructive operations were performed.

## Findings and changes

- **Prototype fidelity gap:** the prior sample used inert mutation handlers, fabricated a horse for an empty stable, and skipped the production page header. `StableRemindersPageView` now supplies the same page composition to production and the local sample. The sample uses real form validation, filters, rows, dialogs, permission gates and local add/complete/dismiss/remove outcomes. Empty-roster data remains empty.
- **Actual form recovery gap:** a rejected asynchronous create escaped the form without a persistent inline explanation. The form now catches rejection, keeps entries, links validation errors to unique input IDs, names the target/priority groups, and exposes the horse group as a proper fieldset. Only a successful save resets the form. A pending create cannot be dismissed by the dialog close/Escape request.
- **Actual row recovery gap:** failed completion/dismissal previously relied entirely on owner toasts. Each affected row now retains an inline failure message, keeps the original status, and lets the user retry. Controls identify their reminder by accessible name; existing pending guards disable competing actions.
- **Inherited visual issue:** reminders explicitly selected framed card chrome. The shared list and horse consumer now use the global flat record treatment. No route-specific color, typography or control styling was added.
- **Sample coverage:** mixed permissions, read-only, empty and loading lists; success/failure-then-retry and slow response controls. Sample outcome copy distinguishes pending from applied changes. Switching scenarios invalidates pending updates, preventing a late response from changing the new sample.
- The horse list names the shared keyboard-scroll region “Available horses”; the global ScrollableList accessibility change is owned by the parent audit.

## Verification

`vitest run src/components/reminders src/components/page-lab/prototypes/RemindersPageLab.test.tsx` — 16 tests passed across four files. Four new regressions verify linked validation and failed-save retention, completion failure/retry with repeated-action guards, read-only and filtered-empty recovery, and interrupted local actions with an empty horse roster. A mutation-hook guard verifies that sample flows do not mount live mutations.

Scoped ESLint passed for all six changed source files and both added test files. Full project TypeScript check passed after concurrent fixture work settled.

## Limits and follow-up evidence

This note records source and component-test evidence. Browser desktop/mobile, keyboard focus, modal scrolling and visual review are delegated to the parent audit; no screenshots are claimed here. The sample uses local filtering rather than production server pagination and does not verify backend permissions or Convex mutation behavior. Production mutation adapters still await server success before success toasts and propagate failures to the shared view.

Completing/dismissing a reminder has no backend reopen/undo contract in the audited UI. This audit does not invent a local undo that could disagree with saved state. Removal retains the existing explicit destructive confirmation and shared failure handling. A parent browser pass found page h1 followed directly by record h3. The shared DashboardItemRecordContent now accepts a backward-compatible headingLevel prop (default 3). Headerless reminder lists default to h2, with the horse detail consumer explicitly retaining h3 under its existing h2 section title. The production-view sample regression asserts the page record level.

## Responsive dialog focus follow-up

Parent browser review found that successfully closing an add dialog after switching from desktop to mobile left focus on the page body: the original desktop trigger had become hidden. CreateRecordDialog now resolves the visible, connected desktop or floating trigger at close time through shared RecordDialog trigger refs. Two layout-emulated interaction tests cover both breakpoint directions. These tests passed, along with full TypeScript and scoped ESLint. The parent owns real-browser confirmation.
