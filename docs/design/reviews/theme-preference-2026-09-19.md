# Theme preference lifecycle — 19 September 2026

Bounded Impeccable audit/harden pass of the actual Header's ThemeToggle. Preserve the light/ivory default, evergreen/oat application palette, existing light → dark → auto cycle, icon/button recipe and the distinct country landing. This is source and local DOM evidence. No theme was changed in the live browser during this pass.

## Source findings and reproduction

- **P1 — storage read failures can break the header mount.** getInitialMode called localStorage.getItem without a guard in its mount effect. A denied-storage test throws instead of rendering usable theme controls. The root bootstrap script already catches errors; this is the later control lifecycle, not a claim that the bootstrap lacks a guard.
- **P2 — failed persistence loses the current choice on remount.** The click handler applies a choice then throws on setItem; a later mount reads the old preference and reverses the choice. Keeping the current document usable should not depend on persistent storage.
- **P2 — rapid actions use a stale mode closure.** Two click events batched before React commits can both advance from the same mode instead of performing two changes.
- **P2 — another-tab preference does not update the active control.** The control had no storage listener even though the comparison capture boundary already accounts for a changed stored preference on exit. This is a state consistency gap, not a palette issue.

The new nine-case local suite against the old implementation produced four failed tests and one unhandled storage-write error; the other five cases already passed. Log: /tmp/paddock-theme-before-tests.log. Those pre-fix failures are evidence of the specific lifecycle defects, not browser rendering observations.

## Shared-owner correction

ThemeToggle now catches storage access failures, preserves existing document mode when storage cannot be read and retains an unpersisted choice per document through route remounts. The temporary fallback records the previous storage value; a later changed stored value takes precedence. Successful writes clear it. This is in-memory fallback only, not a claim that denied writes persist across reloads.

A synchronous current-mode ref keeps consecutive actions in order. A scoped storage listener applies another-tab theme changes and storage clearing, ignores other keys/session storage, and cleans up on unmount. Automatic mode alone observes system scheme changes; explicit modes remain stable and stale media callbacks cannot override a newly explicit choice. Existing classes, data-theme convention and color-scheme property are preserved without adding a component-local palette or style recipe.

Multiple header controls in the same document now synchronize through the shared owner’s local change event. This is relevant to the full app header plus HeaderPageLab’s HeaderView specimen: two independent local states previously could show different current modes. A two-control test verifies that either control advances from the shared current mode.

The early root bootstrap and the capture boundary retain their separate lifecycles. A local integration case exercises a rejected theme write, a temporary opposite-theme capture, capture cleanup and remount of the real toggle. Capture never persists its choice.

## Verification and remaining scope

Ten ThemeToggle cases plus the five existing capture-boundary cases pass together. Coverage includes all initial modes; missing/invalid stored value; denied reads/writes; remount and temporary capture restoration; rapid changes; auto listener lifecycle under StrictMode; external storage changes/clearing; and preservation of unrelated root classes. Log: /tmp/paddock-theme-final-tests.log. These tests use a controlled matchMedia and synthetic storage events, not actual operating-system or cross-tab browser changes.

Browser recovery was rechecked: inventory responded, but selecting existing tab7 timed out and reset the control session. No new browser screenshot, contrast, visual toggle, OS system-theme, reduced-motion, mobile target or native cross-tab result is claimed. The temporary live application Dark preference from the earlier audit still needs restoration through a working UI. Existing landing contrast/layout and motion/horse-form confirmation batches remain pending. Whole-project completion is not implied.

## Combined source checkpoint

After the theme, filter and choice/help/tooltip owners froze, the combined suite passed **496 tests across 100 files**. Full TypeScript, production Vite build, scoped lint/format and whitespace checks passed. Logs: /tmp/paddock-controls-final-tests.log, /tmp/paddock-controls-final-types.log, /tmp/paddock-controls-final-build.log, /tmp/paddock-controls-final-lint.log and /tmp/paddock-controls-final-format.log. The Impeccable source detector returned no findings for the seven changed shared owners (/tmp/paddock-controls-detector.json). This confirms source checks only; the browser and authenticated/backend gaps above remain.
