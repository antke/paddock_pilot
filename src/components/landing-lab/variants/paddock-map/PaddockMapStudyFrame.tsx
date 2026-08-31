import type { ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { LandingLabPageFrame } from '../../LandingLabPrimitives'

export function PaddockMapStudyFrame({
  children,
  className,
  theme,
}: {
  children: ReactNode
  className?: string
  theme: 'light' | 'dark'
}) {
  return (
    <LandingLabPageFrame
      theme={theme}
      footerClassName="bg-secondary text-secondary-foreground"
    >
      <main
        id="main-content"
        className={cn('landing-overdrive relative overflow-hidden', className)}
      >
        {children}
      </main>
    </LandingLabPageFrame>
  )
}
