# Stable journal motion

The working app is scoped by `AppMotionProvider` in `ApplicationRouteShell`. Pricing and historical lab routes explicitly disable this policy without remounting the shell; the standalone DEV motion fixture opts in. Unscoped surfaces render static fallbacks. `motion/react` is the primary JavaScript animation API; there is no second animation library or animation-driven business state.

## Conventions

JS times are seconds; CSS equivalents are in `styles.css`.

- Press 120ms; state/selection 160ms; disclosure 180ms; overlay 200ms; action menu 220ms; exit 140ms.
- Confirmation 320ms. Six pixels is the maximum routine directional offset; counter changes use two pixels.
- Arrivals use `[0.16, 1, 0.3, 1]`. List/selection layout uses the restrained spring (460 stiffness, 38 damping, 0.7 mass).
- Default intensity is quiet: color or opacity. Spatial motion explains changed order, selection or calendar direction. Only acknowledged local completion earns a drawn check. The final care ring additionally requires a complete outstanding count of zero.
- `useAppMotion` follows live `prefers-reduced-motion` changes with an SSR-safe snapshot. Reduced motion removes layout transforms, directional travel, height tweening and drawn paths while preserving state and short fades. `MotionConfig` is a second safety boundary, not a substitute for guarding measured height.

## Ownership

Native View Transitions own routes, horse section snapshots and stable chrome. Do not add Motion wrappers to outlets, dashboards, route headings or horse portraits. Local Motion elements are already visible on mount; they do not replay entrance choreography when a route resolves.

Base UI owns mounting, placement, stacking, keyboard navigation and focus for portals. Its `data-starting-style` / `data-ending-style` states drive CSS. Do not wrap these portals in AnimatePresence or use `forceMount` to keep an invisible overlay interactive. Sonner owns toast transitions and swipe dismissal. Native details use `interpolate-size` progressively; unsupported browsers stay immediate. CSS owns button interiors, focus and selection colors. Hit targets stay stationary. Shared segmented indicators use layoutDependency on the selection value so unrelated page layout changes cannot project the mark outside its button.

## Primitives

- `MotionList`: explicit keyed record collections only, replacing existing div list markup. Initial data never animates in. Identity changes animate positions; additions/exits get a short fade. The empty state remains inside the same mounted list. Exits become inert, aria-hidden and pointer-inactive immediately. Focus moves to the supplied surviving region only when the departing item owned it. A restored key reverses the exit. At more than 40 records, spatial layout/entry effects are disabled. Do not wrap table rows, links, or every calendar cell. Do not pass index keys. FilteredDashboardItemList requires getItemKey so callers declare record identity explicitly.
- `MotionDisclosure`: mounted optional form/filter content. One ResizeObserver per disclosure measures the inner block, including later validation and content changes. Closing immediately removes controls from keyboard/accessibility traversal; drafts stay mounted. The caller owns trigger state, Escape behavior and focus restoration. Do not put CSS height transitions on this same node.
- `MotionNotice`: short conditional notices/editors with visual exit retention. The caller's boolean is authoritative; exiting content is immediately inert and hidden from accessibility. Do not use for long page bodies or portals. Its wrapper can accept a grid span class when replacing a grid item.
- `StateFeedback`: changes existing counter/status text in place. No duplicate live text, queued number counting or remount. Background changes get this quiet feedback, never a completion celebration.
- `useChangeMotion`: animates an existing region on a meaningful state key, leaves focus and controls mounted, stops work and clears inline transforms on supersession/unmount. Calendar headers stay outside its scope.
- `ActionFeedback`: overlaid label slots reserve geometry for idle/pending/confirmed copy. Only the authoritative slot has an accessible name. It does not submit, lock requests, decide success or add a minimum pending duration. Callers retain their existing synchronous locks and pending disabling.
- `ConfirmedCheck`: presentation after acknowledgement only. Inherits foreground color so it remains legible on solid buttons and dark surfaces.

## Mutation contract

Await the real request before success feedback. Preserve input/file selection after rejection. Keep retry local. Never remove a row in an animation callback, assume a timer means success, or wait for an exit to dispatch a mutation/navigation. In care, the card owns a bounded receipt after the local promise resolves; server data owns the collection and outstanding count. Undo uses the existing reopen operation and promise toast, including retry on failure. A server update alone never produces a receipt.

Do not distinguish local/background updates by guessing from a changed query result. Use a local acknowledged operation for authored feedback. Ordinary server-driven additions/removals may use quiet collection continuity.

## Boundaries

Cross-route horse photo morphs and cross-dialog upload morphs are deliberately omitted: identity may appear several times, and server/query boundaries do not provide a reliable unique capture pair. Confirmed insertion and existing route transitions provide continuity without invented state. No percentages are shown for uploads because the current fetch path provides no progress events. Large calendars, charts, long text, initial loading and resumed onboarding do not animate item-by-item. There is no new drag workflow.

See [coverage and verification](../../../docs/design/motion/interaction-coverage.md).

API references: [Motion layout](https://motion.dev/docs/react-layout-animations), [AnimatePresence](https://motion.dev/docs/react-animate-presence), [MotionConfig](https://motion.dev/docs/react-motion-config).
