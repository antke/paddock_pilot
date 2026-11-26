import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils.ts'

export type ButtonAction = 'create' | 'delete' | 'edit' | 'record' | 'schedule'

type ButtonActionProps = {
  action?: ButtonAction
}

const buttonActionIcons = {
  create: PlusIcon,
  delete: TrashIcon,
  edit: PencilSimpleIcon,
  record: PlusIcon,
  schedule: PlusIcon,
} satisfies Record<ButtonAction, typeof PlusIcon>

function ButtonActionIcon({ action }: { action?: ButtonAction }) {
  if (!action) return null

  const Icon = buttonActionIcons[action]

  return <Icon data-icon="inline-start" weight="bold" aria-hidden={true} />
}

const buttonVariants = cva(
  "app-button group/button relative inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center rounded-control border border-transparent bg-clip-padding text-center text-sm font-semibold whitespace-normal shadow-none outline-none select-none focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border-action bg-action !text-action-foreground !no-underline hover:bg-action/92 active:bg-action/80 hover:!no-underline aria-expanded:bg-action/90 aria-expanded:!text-primary-foreground',
        solid:
          'border-action bg-action !text-action-foreground !no-underline hover:bg-action/92 active:bg-action/80 hover:!no-underline aria-expanded:bg-action/90 aria-expanded:!text-primary-foreground',
        outline:
          'border-border bg-surface-elevated text-foreground !no-underline hover:border-primary hover:bg-primary/8 active:bg-primary/15 hover:text-foreground hover:!no-underline aria-expanded:border-primary aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:border-input dark:bg-surface-elevated dark:hover:bg-primary/15',
        secondary:
          'border-border-subtle bg-secondary text-secondary-foreground !no-underline hover:border-primary/25 hover:bg-secondary/85 active:bg-secondary/65 hover:!no-underline aria-expanded:border-primary/25 aria-expanded:bg-secondary/85 aria-expanded:text-secondary-foreground',
        ghost:
          'shadow-none !no-underline active:bg-primary/15 hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        subtle:
          'border-transparent text-muted-foreground shadow-none !no-underline active:bg-primary/15 hover:bg-primary/8 hover:text-foreground hover:!no-underline aria-expanded:bg-primary/10 aria-expanded:text-foreground dark:hover:bg-primary/15',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive shadow-none !no-underline hover:bg-destructive/20 active:bg-destructive/30 hover:!no-underline focus-visible:border-destructive focus-visible:ring-destructive dark:bg-destructive/20 dark:hover:bg-destructive/30',
        link: 'active:text-primary/75 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default:
          'min-h-10 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 max-md:min-h-11 pointer-coarse:min-h-11 max-md:min-w-11 pointer-coarse:min-w-11',
        control:
          'h-(--control-height) min-w-(--control-height) gap-2 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 max-md:min-h-11 pointer-coarse:min-h-11 max-md:min-w-11 pointer-coarse:min-w-11',
        xs: "min-h-7 gap-1 rounded-sm px-2 py-0.5 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 max-md:min-h-11 pointer-coarse:min-h-11 max-md:min-w-11 pointer-coarse:min-w-11 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-8 gap-1.5 rounded-md px-3 py-1 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 max-md:min-h-11 pointer-coarse:min-h-11 max-md:min-w-11 pointer-coarse:min-w-11 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'min-h-11 gap-2 px-5 py-2 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 max-md:min-w-11 pointer-coarse:min-w-11',
        icon: 'size-10 max-md:size-11 pointer-coarse:size-11',
        'icon-xs':
          "size-7 rounded-sm max-md:size-11 pointer-coarse:size-11 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-md max-md:size-11 pointer-coarse:size-11',
        'icon-lg': 'size-11',
        // A record row's "…": 32px to sit quietly beside a two-line row, with an invisible 44px touch target.
        'icon-row': "size-8 after:absolute after:-inset-1.5 after:content-['']",
        'chip-icon':
          "-mr-1 size-5 rounded-full border-0 after:absolute after:-inset-3 after:content-[''] focus-visible:outline-offset-[-3px] [&_svg:not([class*='size-'])]:size-3",
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
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ variant, size }),
        // Resting removals stay quiet ink with a red trash, so a list is not a
        // column of alarms; interaction turns the whole control destructive.
        action === 'delete' &&
          variant !== 'destructive' &&
          'text-muted-foreground [&_svg]:text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive active:bg-destructive/15 aria-expanded:bg-destructive/10 aria-expanded:text-destructive dark:hover:bg-destructive/15',
        className,
      )}
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
        data-size={size}
        data-variant={variant}
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
      data-size={size}
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      <ButtonActionIcon action={action} />
      {children}
    </a>
  )
})

const ButtonLink = createLink(ButtonLinkAnchor)

/**
 * Phones show `short` ("Add", "All") so a title row's actions stay on one line;
 * without `short` the button is its icon alone there. The full label is the
 * accessible name at every width and visible from `md`.
 */
function PhoneShortLabel({
  short,
  children,
}: {
  short?: ReactNode
  children: ReactNode
}) {
  return (
    <>
      <span className="max-md:sr-only">{children}</span>
      {short && (
        <span aria-hidden="true" className="md:hidden">
          {short}
        </span>
      )}
    </>
  )
}

export { Button, ButtonAnchor, ButtonLink, PhoneShortLabel, buttonVariants }
