import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils.ts'

export type ButtonAction = 'create' | 'delete' | 'edit'

type ButtonActionProps = {
  action?: ButtonAction
}

const buttonActionIcons = {
  create: PlusIcon,
  delete: TrashIcon,
  edit: PencilSimpleIcon,
} satisfies Record<ButtonAction, typeof PlusIcon>

function ButtonActionIcon({ action }: { action?: ButtonAction }) {
  if (!action) return null

  const Icon = buttonActionIcons[action]

  return <Icon data-icon="inline-start" weight="bold" aria-hidden={true} />
}

const buttonVariants = cva(
  "group/button relative inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center rounded-control border border-transparent bg-clip-padding text-center text-sm font-semibold whitespace-normal shadow-none transition-[background-color,border-color,color,box-shadow] duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-card !text-primary !no-underline hover:bg-primary/10 hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:!text-primary dark:bg-card dark:hover:bg-primary/15',
        solid:
          'border-primary bg-primary !text-primary-foreground !no-underline hover:bg-primary/92 hover:!no-underline aria-expanded:bg-primary/90 aria-expanded:!text-primary-foreground',
        outline:
          'border-border bg-surface-elevated text-foreground !no-underline hover:border-primary hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:border-primary aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:border-input dark:bg-surface-elevated dark:hover:bg-primary/15',
        secondary:
          'border-border-subtle bg-secondary text-secondary-foreground !no-underline hover:border-primary/25 hover:bg-secondary/85 hover:!no-underline aria-expanded:border-primary/25 aria-expanded:bg-secondary/85 aria-expanded:text-secondary-foreground',
        ghost:
          'shadow-none !no-underline hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        subtle:
          'border-transparent text-muted-foreground shadow-none !no-underline hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive shadow-none !no-underline hover:bg-destructive/20 hover:!no-underline focus-visible:border-destructive focus-visible:ring-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'min-h-10 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11',
        control:
          'h-(--control-height) min-w-(--control-height) gap-2 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11',
        xs: "min-h-7 gap-1 rounded-sm px-2 py-1 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-8 gap-1.5 rounded-md px-3 py-1.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'min-h-11 gap-2 px-5 py-2 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [@media(pointer:coarse)]:min-w-11',
        icon: 'size-10 [@media(pointer:coarse)]:size-11',
        'icon-xs':
          "size-7 rounded-sm [@media(pointer:coarse)]:size-11 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md [@media(pointer:coarse)]:size-11',
        'icon-lg': 'size-11',
        'chip-icon':
          "-mr-1 size-5 rounded-full border-0 after:absolute after:-inset-3 [&_svg:not([class*='size-'])]:size-3",
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
  action,
  children,
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> &
  ButtonActionProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <ButtonActionIcon action={action} />
      {children}
    </ButtonPrimitive>
  )
}

type ButtonAnchorProps = ComponentProps<'a'> &
  VariantProps<typeof buttonVariants> &
  ButtonActionProps

const ButtonAnchor = forwardRef<HTMLAnchorElement, ButtonAnchorProps>(
  function ButtonAnchorRender(
    {
      action,
      children,
      className,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref,
  ) {
    return (
      <a
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        <ButtonActionIcon action={action} />
        {children}
      </a>
    )
  },
)

const ButtonLinkAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentProps<'a'> & VariantProps<typeof buttonVariants> & ButtonActionProps
>(function ButtonLinkAnchorRender(
  {
    action,
    children,
    className,
    variant = 'default',
    size = 'default',
    ...props
  },
  ref,
) {
  return (
    <a
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <ButtonActionIcon action={action} />
      {children}
    </a>
  )
})

const ButtonLink = createLink(ButtonLinkAnchor)

export { Button, ButtonAnchor, ButtonLink, buttonVariants }
