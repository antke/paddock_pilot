import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils.ts'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-bold whitespace-nowrap shadow-none transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary !text-primary-foreground !no-underline hover:bg-primary/90 hover:!no-underline',
        outline:
          'border-border bg-surface-elevated text-foreground !no-underline hover:border-primary hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:border-primary aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:border-input dark:bg-surface-elevated dark:hover:bg-primary/15',
        secondary:
          'border-border-subtle bg-secondary text-secondary-foreground !no-underline hover:border-border hover:bg-secondary hover:!no-underline aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'shadow-none !no-underline hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        subtle:
          'border-transparent text-muted-foreground shadow-none !no-underline hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive shadow-none !no-underline hover:bg-destructive/20 hover:!no-underline focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        control:
          'h-(--control-height) min-w-(--control-height) gap-2 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5',
        xs: "h-7 gap-1 rounded-sm px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-10',
        'icon-xs': "size-7 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md',
        'icon-lg': 'size-11',
        'chip-icon':
          "-mr-1 size-5 rounded-full border-0 [&_svg:not([class*='size-'])]:size-3",
        fab: "size-14 rounded-full [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

type ButtonAnchorProps = ComponentProps<'a'> &
  VariantProps<typeof buttonVariants>

const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  function ButtonAnchor(
    { className, variant = 'default', size = 'default', ...props },
    ref,
  ) {
  return (
    <a
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
  },
)

const ButtonLinkAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentProps<'a'> & VariantProps<typeof buttonVariants>
>(function ButtonLinkAnchor(
  { className, variant = 'default', size = 'default', ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
})

const ButtonLink = createLink(ButtonLinkAnchor)

export { Button, ButtonAnchor, ButtonLink, buttonVariants }
