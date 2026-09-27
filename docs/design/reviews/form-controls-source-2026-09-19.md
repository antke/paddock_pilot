# Shared form controls — 19 September 2026

Bounded Impeccable audit/harden pass on `ui/field.tsx`, `input.tsx`, `textarea.tsx`, `label.tsx` and `forms/RouteFormCard.tsx`. Read the installed Base UI Input/Field.Control implementation, the global control recipes, and representative stable/event/horse form consumers. No browser, build, live mutation, print changes or coverage edits. Existing product context was retained without rerunning setup.

## Confirmed defects and shared corrections

### P2 — Successful reset can leave its confirmation open

Before correction, `RouteFormActions` used an uncontrolled AlertDialog and a plain `AlertDialogAction` button calling only `onReset`. The shared action is not a Close primitive. Production stable edit (`src/routes/stables/_layout/$stableId/edit.tsx:123`) supplies a persistent confirmation configuration, so resetting its form does not remove the dialog. Dirty-conditional configurations in horse/event forms concealed this behavior by unmounting the confirmation instead.

Reproduced locally with the actual shared form/dialog owners: reset was called once, but the alertdialog remained present. Corrected at `src/components/forms/RouteFormCard.tsx`: explicit open state closes only after the synchronous reset callback returns. The confirmation is explicitly a non-submit button. Final focus returns to the reset trigger when usable, or the owning form's first eligible input/textarea/select, then an eligible button (such as a collapsed section trigger). Local regression covers both persistent and dirty-conditional confirmation configurations and verifies focus returns to the stable-name field when the reset trigger becomes disabled.

Parent review identified a further fallback problem: a broad input query selected an inert input inside a closed actual FormSection before an open section. Two additional pre-fix DOM cases reproduced that wrong target, including a form with every section collapsed (`/tmp/paddock-form-controls-collapsed-before.log`). Eligibility now excludes disabled/disconnected controls and hidden/inert/aria-hidden ancestors **within the owning form**. The form boundary matters: installed Base UI resolves `finalFocus` while it still temporarily masks outside application ancestors; rejecting that temporary ancestor excluded every legitimate candidate in a local trial. The final implementation returns the eligible element to Base UI and lets the library own timing; no microtask, timer or geometry workaround was introduced. Tests include a closed first section, later open section, hidden/aria-hidden fields, and a button fallback when no editable field is eligible.

### P2 — Already-open confirmation ignores newly disabled/pending state

The trigger observed `disabled || isSubmitting`, but its confirmation action did not. Rerendering an open confirmation with either state true left the destructive reset callable. Two pre-fix DOM tests reproduced the callback firing. The shared action now receives the same disabled state and checks it before calling reset (`RouteFormCard.tsx`). “Keep editing” stays available so users can exit a stale confirmation. Tests cover each interruption separately and cancellation after the state change.

### P3 — Sparse errors can render an empty announcement

The FieldError array contract permits optional/missing messages. Deduplication previously retained `undefined` and blank strings; multiple distinct empty entries produced an empty list inside `role=alert`. A sparse array with undefined/empty/whitespace-only messages reproduced that node. `src/components/ui/field.tsx:400` now drops nonmessages before deduplication, preserves actual message text, renders no alert when nothing remains, and clears stale errors after correction. This is a shared API edge case; the sampled ordinary RHF consumers generally pass one field error and did not reproduce it in their normal path.

## Verified contracts kept intact

- **Input:** installed Base UI Input forwards to Field.Control and ultimately a native input. The local wrapper passes the caller's ref, name, type, native attributes and ARIA through. Explicit label association, required validity, linked hints/errors and focus refs survived the real wrapper in DOM tests. No input-owner change was needed.
- **Textarea:** native textarea preserves ref, explicit required/invalid descriptions, Unicode content and line breaks. Native read-only values remain in FormData; controls inside a disabled fieldset are excluded without erasing their drafts. No textarea-owner change was needed.
- **Field/Label:** Field is a layout/role-group wrapper, not Base UI Field.Root; consumers remain responsible for the control's `aria-invalid`, `aria-required` and `aria-describedby`. Existing stable/event consumers provide those associations explicitly. The audit did not add automatic attribute inference or change required validation semantics. Label remains a native label with htmlFor passthrough.
- **Pending and retry:** existing stable and horse lifecycle tests already exercise disabled fields, preserved failed drafts, linked/focused errors and acknowledged-save/navigation separation. They were rerun as regression coverage rather than duplicating those flows in new tests.
- **Global ownership:** input and textarea continue to use `app-control`, `app-control-focus` and `app-control-invalid`; the form uses DashboardSectionCard, DashboardActions and shared action/dialog owners. No per-form colors, font, surface, width or layout changes were introduced. The approved warm screen identity remains intact.

## Evidence

- Pre-fix: **4 failing / 1 passing tests** across the new FieldError and reset-interruption cases. Log: `/tmp/paddock-form-controls-before.log`.
- Final focused run: **28 passing tests / 5 files** — new `RouteFormCard.test.tsx` and `ui/field.test.tsx`, existing `StableFormPageLab.test.tsx`, `EventFormFields.test.tsx` and `HorseProfileForm.test.tsx`. Log: `/tmp/paddock-form-controls-tests.log`.
- Full TypeScript check passed: `/tmp/paddock-form-controls-types.log`.
- Scoped ESLint passed: `/tmp/paddock-form-controls-lint.log`. Changed-source Prettier and `git diff --check` passed.

## Remaining verification boundary

Long Unicode values and description associations were verified as retained DOM content, not as rendered line wrapping. Browser layout, 200% zoom, coarse-pointer target geometry, native date/number pickers, textarea resizing/auto-sizing, light/dark contrast and the sticky action rail's physical clearance remain unverified here. Screen-reader announcements and modal focus behavior need confirmation in a real browser/assistive-technology combination; local focus assertions do not certify that experience. No numeric accessibility/theming/responsive score is assigned without those measurements.

The reset callback contract remains synchronous (`() => void`); this pass does not add asynchronous reset semantics. Application save operations remain owned by each form controller. No application-wide form audit completion is claimed.
