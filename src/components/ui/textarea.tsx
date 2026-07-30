import * as React from 'react'

import { cn } from '#/lib/utils'

type TextareaMinHeight = 'default' | 'relaxed'

const textareaMinHeightClassNames = {
  default: 'min-h-24',
  relaxed: 'min-h-32',
} satisfies Record<TextareaMinHeight, string>

function Textarea({
  className,
  minHeight = 'default',
  ...props
}: React.ComponentProps<'textarea'> & {
  minHeight?: TextareaMinHeight
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'app-control app-control-focus app-control-invalid flex field-sizing-content py-2.5',
        textareaMinHeightClassNames[minHeight],
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
