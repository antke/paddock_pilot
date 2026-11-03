import type { ReactNode } from 'react'
import { cn } from '#/lib/utils'

/**
 * The one position for a page's Back: top left, above the title, in every page
 * header. Collapses when the page has no Back.
 */
export function PageBackSlot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="page-back-slot"
      className={cn(
        'mb-3 flex justify-start empty:hidden print:hidden',
        className,
      )}
    >
      {children}
    </div>
  )
}
