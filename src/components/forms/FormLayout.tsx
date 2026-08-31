import { CaretDownIcon } from '@phosphor-icons/react'
import { useEffect, useId, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { dashboardNestedHeadingClassName } from '#/components/dashboard/DashboardInlineHeader'
import { TabsContent } from '#/components/ui/tabs'
import { Checkbox } from '#/components/ui/checkbox'
import { Field, FieldLabel } from '#/components/ui/field'
import { cn } from '#/lib/utils'

type InlineFormGap = 'standard' | 'compact' | 'tight'
type InlineFormLayout = 'stack' | 'invite'

type InlineFormProps = ComponentProps<'form'> & {
  gap?: InlineFormGap
  layout?: InlineFormLayout
}

type FormTabsContentProps = ComponentProps<typeof TabsContent>
type FormGroupProps = Omit<ComponentProps<'section'>, 'title'> & {
  description?: ReactNode
  title: ReactNode
}
type FormStepHeaderProps = Omit<ComponentProps<'div'>, 'title'> & {
  description?: ReactNode
  number: number
  title: ReactNode
}
type SelectableCardFieldProps = ComponentProps<typeof Field>
type SelectableCardCheckboxProps = ComponentProps<typeof Checkbox>
type SelectableCardLabelProps = ComponentProps<typeof FieldLabel>
type FormSectionProps = Omit<
  ComponentProps<'section'>,
  'children' | 'title'
> & {
  children: ReactNode
  defaultOpen?: boolean
  description?: ReactNode
  invalid?: boolean
  number: number
  summary?: ReactNode
  title: ReactNode
  validationAttempt?: number
}

export const inlineFormClassName = 'grid gap-5'
export const compactInlineFormClassName = 'grid gap-4'
export const tightInlineFormClassName = 'grid gap-3'
export const inviteInlineFormClassName =
  'sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start'
export const formTabsContentClassName = 'flex flex-col gap-4'

export function InlineForm({
  children,
  className,
  gap = 'standard',
  layout = 'stack',
  ...props
}: InlineFormProps) {
  return (
    <form
      data-slot="inline-form"
      className={cn(
        gap === 'standard' && inlineFormClassName,
        gap === 'compact' && compactInlineFormClassName,
        gap === 'tight' && tightInlineFormClassName,
        layout === 'invite' && inviteInlineFormClassName,
        className,
      )}
      {...props}
    >
      {children}
    </form>
  )
}

export function FormTabsContent({ className, ...props }: FormTabsContentProps) {
  return (
    <TabsContent
      data-slot="form-tabs-content"
      className={cn(formTabsContentClassName, className)}
      {...props}
    />
  )
}

export function FormGroup({
  children,
  className,
  description,
  title,
  ...props
}: FormGroupProps) {
  return (
    <section
      data-slot="form-group"
      className={cn('grid gap-4', className)}
      {...props}
    >
      <div className="grid gap-1">
        <h3
          className={cn(
            dashboardNestedHeadingClassName,
            'text-lg leading-none',
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

export function FormStepHeader({
  className,
  description,
  number,
  title,
  ...props
}: FormStepHeaderProps) {
  return (
    <div
      data-slot="form-step-header"
      className={cn(
        'grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1',
        className,
      )}
      {...props}
    >
      <span
        className="row-span-2 grid size-7 place-items-center rounded-control border border-border-subtle bg-surface-muted font-mono text-xs font-semibold text-muted-foreground"
        aria-hidden="true"
      >
        {String(number).padStart(2, '0')}
      </span>
      <span className="text-xs font-bold text-foreground uppercase">
        {title}
      </span>
      {description && (
        <span className="text-sm text-muted-foreground">{description}</span>
      )}
    </div>
  )
}

export function FormSection({
  children,
  className,
  defaultOpen = false,
  description,
  invalid = false,
  number,
  summary,
  title,
  validationAttempt = 0,
  ...props
}: FormSectionProps) {
  const contentId = useId()
  const [open, setOpen] = useState(defaultOpen)
  const sectionRef = useRef<HTMLElement>(null)
  const previousValidationAttempt = useRef(validationAttempt)

  useEffect(() => {
    const attemptedValidation =
      validationAttempt !== previousValidationAttempt.current
    previousValidationAttempt.current = validationAttempt

    if (!invalid) return

    setOpen(true)

    if (!attemptedValidation) return

    const focusTimer = window.setTimeout(() => {
      const section = sectionRef.current
      const form = section?.closest('form')
      const firstInvalidElement = form?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      )

      if (
        !section ||
        !firstInvalidElement ||
        !section.contains(firstInvalidElement)
      ) {
        return
      }

      const focusTarget = firstInvalidElement.matches(
        'button, input, select, textarea, [tabindex]',
      )
        ? firstInvalidElement
        : firstInvalidElement.querySelector<HTMLElement>(
            'button, input, select, textarea, [tabindex]',
          )

      focusTarget?.focus({ preventScroll: true })
      focusTarget?.scrollIntoView?.({
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')
          .matches
          ? 'auto'
          : 'smooth',
        block: 'center',
      })
    }, 220)

    return () => window.clearTimeout(focusTimer)
  }, [invalid, validationAttempt])

  return (
    <section
      ref={sectionRef}
      data-slot="form-section"
      data-open={open || undefined}
      className={cn(
        'app-row overflow-hidden bg-card transition-colors',
        open && 'border-primary/25',
        invalid && 'border-destructive/45',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className="app-control-focus flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left hover:bg-primary/5 focus-visible:outline-none sm:px-5"
        aria-controls={contentId}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-muted font-mono text-xs font-semibold text-muted-foreground',
            invalid &&
              'border-destructive/35 bg-destructive/10 text-destructive',
          )}
          aria-hidden="true"
        >
          {String(number).padStart(2, '0')}
        </span>

        <span className="grid min-w-0 flex-1 gap-1">
          <span
            className={cn(
              dashboardNestedHeadingClassName,
              'text-lg leading-none',
            )}
          >
            {title}
          </span>
          {description && (
            <span className="text-sm text-muted-foreground">{description}</span>
          )}
        </span>

        {summary && (
          <span className="hidden max-w-56 truncate text-right text-xs font-medium text-muted-foreground md:block">
            {summary}
          </span>
        )}

        <CaretDownIcon
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={contentId}
        aria-hidden={!open}
        className={cn(
          'app-height-collapse',
          open ? 'app-height-collapse-open' : 'app-height-collapse-closed',
        )}
      >
        <div className="app-height-collapse-inner" inert={!open}>
          <div className="grid gap-5 border-t border-border-subtle bg-card px-4 py-5 sm:px-5 sm:py-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export function SelectableCardField({
  className,
  orientation = 'horizontal',
  ...props
}: SelectableCardFieldProps) {
  return (
    <Field
      data-slot="selectable-card-field"
      orientation={orientation}
      className={cn('items-start', className)}
      {...props}
    />
  )
}

export function SelectableCardCheckbox({
  className,
  ...props
}: SelectableCardCheckboxProps) {
  return (
    <Checkbox
      data-slot="selectable-card-checkbox"
      className={cn('mt-4', className)}
      {...props}
    />
  )
}

export function SelectableCardLabel({
  width = 'full',
  ...props
}: SelectableCardLabelProps) {
  return (
    <FieldLabel data-slot="selectable-card-label" width={width} {...props} />
  )
}
