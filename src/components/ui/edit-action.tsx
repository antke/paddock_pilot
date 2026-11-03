import { PencilSimpleIcon } from '@phosphor-icons/react'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils'
import { Button, ButtonAnchor } from './button'

/**
 * The quiet pencil that edits the section it sits in. It lives in the top-right
 * corner of the section's title row, is always visible on every device, and
 * names what it edits through its accessible label and tooltip.
 */
const editActionClassName =
  'shrink-0 text-muted-foreground hover:text-foreground print:hidden'

type EditActionOwnProps = {
  /** What this edits, for example "Edit yard details". */
  label: string
}

function EditActionIcon() {
  return <PencilSimpleIcon weight="bold" aria-hidden="true" />
}

export function EditActionButton({
  label,
  className,
  ...props
}: Omit<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'action' | 'children'
> &
  EditActionOwnProps) {
  return (
    <Button
      type="button"
      data-slot="edit-action"
      {...props}
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn(editActionClassName, className)}
    >
      <EditActionIcon />
    </Button>
  )
}

const EditActionAnchor = forwardRef<
  HTMLAnchorElement,
  Omit<
    ComponentProps<typeof ButtonAnchor>,
    'variant' | 'size' | 'action' | 'children'
  > &
    EditActionOwnProps
>(function EditActionAnchorRender({ label, className, ...props }, ref) {
  return (
    <ButtonAnchor
      ref={ref}
      data-slot="edit-action"
      {...props}
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      className={cn(editActionClassName, className)}
    >
      <EditActionIcon />
    </ButtonAnchor>
  )
})

/** Router link form of the section pencil, for edits that open a route form. */
export const EditActionLink = createLink(EditActionAnchor)
