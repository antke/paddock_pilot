import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'

type ActionGroupAlign = 'start' | 'center' | 'end'
type ActionGroupLayout = 'inline' | 'footer'

type ActionGroupProps = Omit<ComponentProps<'div'>, 'align' | 'children'> & {
  align?: ActionGroupAlign
  children?: ReactNode
  layout?: ActionGroupLayout
  wrap?: boolean
}

export const actionGroupInlineClassName = 'flex flex-wrap items-center gap-2'
export const actionGroupInlineNoWrapClassName =
  'flex flex-row flex-nowrap items-center gap-2'
export const actionGroupFooterClassName =
  'flex flex-col-reverse gap-2 sm:flex-row'

function getActionGroupAlignClassName({
  align,
  layout,
}: {
  align: ActionGroupAlign
  layout: ActionGroupLayout
}) {
  const prefix = layout === 'footer' ? 'sm:' : ''

  if (align === 'start') return `${prefix}justify-start`
  if (align === 'center') return `${prefix}justify-center`
  return `${prefix}justify-end`
}

export function ActionGroup({
  align = 'end',
  children,
  className,
  layout = 'inline',
  wrap = true,
  ...props
}: ActionGroupProps) {
  return (
    <div
      data-slot="action-group"
      {...props}
      className={cn(
        layout === 'footer'
          ? actionGroupFooterClassName
          : wrap
            ? actionGroupInlineClassName
            : actionGroupInlineNoWrapClassName,
        getActionGroupAlignClassName({ align, layout }),
        className,
      )}
    >
      {children}
    </div>
  )
}
