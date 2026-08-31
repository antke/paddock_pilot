import { useMemo } from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils'
import { Label } from '#/components/ui/label'
import { Separator } from '#/components/ui/separator'

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        '[&>[data-slot=field-legend]]:pl-2',
        className,
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        'mb-2.5 font-semibold data-[variant=label]:text-sm data-[variant=legend]:text-base',
        className,
      )}
      {...props}
    />
  )
}

type FieldGroupGap = 'compact' | 'default' | 'tight'

const fieldGroupGapClassNames = {
  compact: 'gap-4 *:data-[slot=field-group]:gap-3',
  default: 'gap-5 *:data-[slot=field-group]:gap-4',
  tight: 'gap-3 *:data-[slot=field-group]:gap-2',
} satisfies Record<FieldGroupGap, string>

function FieldGroup({
  className,
  gap = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  gap?: FieldGroupGap
}) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col data-[slot=checkbox-group]:gap-3',
        fieldGroupGapClassNames[gap],
        className,
      )}
      {...props}
    />
  )
}

type FieldPanelGap = 'compact' | 'default'
type FieldLabelSize = 'compact' | 'default'

const fieldPanelGapClassNames = {
  compact: 'gap-2',
  default: 'gap-3',
} satisfies Record<FieldPanelGap, string>

function FieldPanel({
  className,
  gap = 'default',
  ...props
}: React.ComponentProps<'div'> & {
  gap?: FieldPanelGap
}) {
  return (
    <div
      data-slot="field-panel"
      className={cn(
        'app-row grid p-5 text-sm',
        fieldPanelGapClassNames[gap],
        className,
      )}
      {...props}
    />
  )
}

type FieldGridBreakpoint = 'sm' | 'md' | 'lg'
type FieldGridColumns = 2 | 3 | 4
type FieldGridGap = 'compact' | 'default'
type FieldGridTemplate =
  | 'equal'
  | 'trailing-sm'
  | 'trailing-md'
  | 'trailing-auto'

const fieldGridColumnClassNames = {
  sm: {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
  },
  md: {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  },
  lg: {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  },
} satisfies Record<FieldGridBreakpoint, Record<FieldGridColumns, string>>

const fieldGridTemplateClassNames = {
  sm: {
    equal: '',
    'trailing-sm': 'sm:grid-cols-[minmax(0,1fr)_9rem]',
    'trailing-md': 'sm:grid-cols-[minmax(0,1fr)_12rem]',
    'trailing-auto': 'sm:grid-cols-[minmax(0,1fr)_auto]',
  },
  md: {
    equal: '',
    'trailing-sm': 'md:grid-cols-[minmax(0,1fr)_9rem]',
    'trailing-md': 'md:grid-cols-[minmax(0,1fr)_12rem]',
    'trailing-auto': 'md:grid-cols-[minmax(0,1fr)_auto]',
  },
  lg: {
    equal: '',
    'trailing-sm': 'lg:grid-cols-[minmax(0,1fr)_9rem]',
    'trailing-md': 'lg:grid-cols-[minmax(0,1fr)_12rem]',
    'trailing-auto': 'lg:grid-cols-[minmax(0,1fr)_auto]',
  },
} satisfies Record<FieldGridBreakpoint, Record<FieldGridTemplate, string>>

function FieldGrid({
  breakpoint = 'md',
  className,
  columns = 2,
  gap = 'default',
  template = 'equal',
  ...props
}: React.ComponentProps<'div'> & {
  breakpoint?: FieldGridBreakpoint
  columns?: FieldGridColumns
  gap?: FieldGridGap
  template?: FieldGridTemplate
}) {
  return (
    <div
      data-slot="field-grid"
      className={cn(
        'grid',
        gap === 'compact' ? 'gap-3' : 'gap-4',
        template === 'equal'
          ? fieldGridColumnClassNames[breakpoint][columns]
          : fieldGridTemplateClassNames[breakpoint][template],
        className,
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  'group/field flex w-full gap-2 data-[invalid=true]:text-destructive',
  {
    variants: {
      orientation: {
        vertical:
          'flex-col *:w-full [&>.sr-only]:w-auto [&>[data-slot=field-label]]:pl-2',
        horizontal:
          'flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
        responsive:
          'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  },
)

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        'group/field-content flex flex-1 flex-col gap-0.5 leading-snug',
        className,
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  htmlFor,
  id,
  interactive = false,
  size = 'default',
  width = 'fit',
  ...props
}: React.ComponentProps<typeof Label> & {
  interactive?: boolean
  size?: FieldLabelSize
  width?: 'fit' | 'full'
}) {
  return (
    <Label
      data-slot="field-label"
      htmlFor={htmlFor}
      id={id ?? (htmlFor ? `${htmlFor}-label` : undefined)}
      className={cn(
        'group/field-label peer/field-label flex gap-2 font-semibold leading-snug group-data-[disabled=true]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10',
        size === 'default' ? 'text-sm' : 'text-xs',
        width === 'fit' ? 'w-fit' : 'w-full',
        interactive && 'cursor-pointer',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2 text-sm/relaxed font-semibold leading-snug group-data-[disabled=true]/field:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-left text-sm/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5',
        'last:mt-0 nth-last-2:-mt-1',
        '[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary',
        className,
      )}
      {...props}
    />
  )
}

function FieldInlineText({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="field-inline-text"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function FieldInlineControl({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-inline-control"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  )
}

function FieldLabelRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-label-row"
      className={cn('flex items-center gap-1 pl-2', className)}
      {...props}
    />
  )
}

function FieldHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-header"
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        className,
      )}
      {...props}
    />
  )
}

function FieldHeaderContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-header-content"
      className={cn('grid min-w-0 gap-1', className)}
      {...props}
    />
  )
}

function FieldOptionGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="field-option-group"
      className={cn('flex flex-wrap gap-4', className)}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        'relative -my-2 h-5 text-xs group-data-[variant=outline]/field-group:-mb-2',
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-xs font-normal text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGrid,
  FieldGroup,
  FieldHeader,
  FieldHeaderContent,
  FieldInlineControl,
  FieldInlineText,
  FieldLabelRow,
  FieldLegend,
  FieldOptionGroup,
  FieldPanel,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
