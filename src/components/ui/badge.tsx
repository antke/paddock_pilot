import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-control border border-transparent font-semibold whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/90',
        secondary:
          'bg-secondary text-secondary-foreground [a]:hover:bg-secondary',
        destructive:
          'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
        success:
          'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary',
        warning:
          'border-chart-3/35 bg-chart-3/15 text-chart-4 dark:border-chart-3/45 dark:bg-chart-3/15 dark:text-chart-3',
        info: 'border-chart-2/35 bg-chart-2/12 text-chart-2 dark:border-chart-2/45 dark:bg-chart-2/15 dark:text-chart-2',
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
        default: 'min-h-6 px-2.5 py-0.5 text-xs',
        chip: 'min-h-6 px-2.5 py-1 text-xs',
        micro: 'min-h-4 px-1.5 py-0 text-[0.62rem] leading-4 tracking-normal',
        count: 'size-5 min-h-5 rounded-full p-0 text-[0.625rem] leading-none',
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
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant, size }), className),
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
