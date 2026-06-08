import * as React from 'react'

import { cn } from '#/lib/utils'

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'app-control app-control-focus app-control-invalid py-2',
        className,
      )}
      {...props}
    />
  )
}

export { Select }
