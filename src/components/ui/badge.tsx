import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const primaryTint =
  'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15'

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-control border border-transparent font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        // Badges are tinted labels, never solid action fills.
        default: primaryTint,
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive focus-visible:ring-destructive dark:border-destructive/40 dark:bg-destructive/20 [a]:hover:bg-destructive/20',
        success: primaryTint,
        warning:
          'border-status-warning/40 bg-status-warning-surface text-status-warning',
        info: 'border-status-info/40 bg-status-info-surface text-status-info',
        neutral:
          'border-border-subtle bg-surface-muted text-muted-foreground dark:bg-surface-muted',
        filter:
          'border-border-subtle bg-secondary text-foreground dark:bg-secondary',
        outline:
          'border-border bg-surface-elevated text-foreground shadow-none [a]:hover:bg-primary/8 [a]:hover:text-foreground',
        ghost:
          'hover:bg-primary/8 hover:text-foreground dark:hover:bg-primary/15',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'min-h-6 px-2.5 py-0 text-xs',
        // 28px, the xs button height of Clear all beside it.
        chip: 'min-h-7 px-2.5 py-0 text-xs',
        micro: 'min-h-5 px-1.5 py-0 text-xs leading-4 tracking-normal',
        count: 'min-h-5 min-w-5 rounded-full px-1.5 py-0 text-xs leading-none',
        // A status in an action row, or in place of an action, matches the sm button.
        action:
          'min-h-8 px-3 py-1 text-xs max-md:min-h-11 pointer-coarse:min-h-11 [&>svg]:size-3.5!',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Badge({
  className,
  variant = 'default',
  size = 'default',
  render,
  reserveLabel,
  children,
  ...props
}: useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** The label of the action this status replaces; the badge keeps at least its width. */
    reserveLabel?: string
  }) {
  if (reserveLabel)
    children = (
      <span className="inline-grid justify-items-center [&>*]:col-start-1 [&>*]:row-start-1">
        <span className="inline-flex items-center gap-1">{children}</span>
        <span aria-hidden="true" className="invisible">
          {reserveLabel}
        </span>
      </span>
    )
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant, size }), className),
        children,
      },
      props,
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
