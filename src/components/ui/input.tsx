import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'

import { cn } from '#/lib/utils'

type InputWidth = 'default' | 'compactNumber'

type InputProps = React.ComponentProps<'input'> & {
  width?: InputWidth
}

const inputWidthClassNames = {
  compactNumber: 'w-24',
  default: '',
} satisfies Record<InputWidth, string>

function Input({ className, type, width = 'default', ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'app-control app-control-focus app-control-invalid py-1.5 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        ['date', 'datetime-local', 'month', 'time', 'week'].includes(
          type ?? '',
        ) && 'app-picker-control',
        inputWidthClassNames[width],
        className,
      )}
      {...props}
    />
  )
}

export { Input }
