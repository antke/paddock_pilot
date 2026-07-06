import * as React from 'react'

import { cn } from '#/lib/utils'

function Select({
  className,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <span className="relative block w-full min-w-0">
      <select
        data-slot="select"
        className={cn(
          'app-control app-control-focus app-control-invalid cursor-pointer appearance-none py-2 pr-9',
          className,
        )}
        {...props}
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 16 16"
      >
        <path d="m4 6 4 4 4-4" />
      </svg>
    </span>
  )
}

export { Select }
