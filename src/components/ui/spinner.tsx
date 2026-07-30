import { SpinnerIcon } from '@phosphor-icons/react'

import { cn } from '#/lib/utils.ts'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <SpinnerIcon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin text-primary', className)}
      weight="bold"
      {...props}
    />
  )
}

export { Spinner }
