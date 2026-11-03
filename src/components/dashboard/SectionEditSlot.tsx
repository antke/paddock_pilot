import type { ReactNode } from 'react'

/**
 * Holds a section's pencil in the title row's top-right corner. Negative
 * margins keep the 44px touch target from adding height to the title row.
 */
export function SectionEditSlot({ children }: { children: ReactNode }) {
  return (
    <div data-slot="section-edit" className="-my-1.5 -mr-1.5 shrink-0">
      {children}
    </div>
  )
}
