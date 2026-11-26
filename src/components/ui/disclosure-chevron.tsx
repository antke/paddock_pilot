import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '#/lib/utils'

/**
 * Makes a record title open its details without wrapping the title: a button laid over the
 * `relative` title block, placed before the heading so the heading stays plain text that can
 * truncate. Give the heading `disclosureTitleClassName` and follow it with `<DisclosureChevron>`.
 */
export function DisclosureTitleButton({
  open,
  controls,
  onToggle,
  label,
}: {
  open: boolean
  controls: string
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onToggle}
      className="peer absolute inset-0 cursor-pointer rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    />
  )
}

/** The title after a `DisclosureTitleButton` underlines while the button is hovered. */
export const disclosureTitleClassName =
  'underline-offset-4 peer-hover:underline'

/**
 * The one disclosure cue: a trailing muted caret, down when closed, up when open.
 * Pass `open` for button disclosures; inside a native `<summary>` leave it out.
 */
export function DisclosureChevron({
  open,
  className,
}: {
  open?: boolean
  className?: string
}) {
  return (
    <CaretDownIcon
      aria-hidden="true"
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none',
        // Direct summary child only, so an open outer details never turns a nested one.
        open === undefined
          ? '[details[open]>summary>&]:rotate-180'
          : open && 'rotate-180',
        className,
      )}
    />
  )
}
