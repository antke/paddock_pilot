import { CaretDownIcon } from '@phosphor-icons/react'
import { cn } from '#/lib/utils'

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
