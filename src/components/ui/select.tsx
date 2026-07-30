import * as React from 'react'

import { cn } from '#/lib/utils'

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <span className="group/select relative block w-full min-w-0">
      <select
        data-slot="select"
        className={cn(
          'app-control app-control-focus app-control-invalid cursor-pointer appearance-none py-1.5 pr-9',
          className,
        )}
        {...props}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-1 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-foreground/80 transition-[background-color,color,transform] duration-150 group-hover/select:bg-primary/18 group-hover/select:text-foreground group-active/select:scale-95 group-active/select:bg-primary/24 motion-reduce:transition-none"
      >
        <svg
          className="size-4"
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
    </span>
  )
}

export { Select }
