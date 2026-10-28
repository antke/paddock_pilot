import { MotionDisclosure } from '#/components/motion/MotionDisclosure'
import { useT } from '#/i18n/LocaleProvider'
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
  showRequiredHint?: boolean
  gap?: InlineFormGap
  layout?: InlineFormLayout
}

type FormTabsContentProps = ComponentProps<typeof TabsContent>
type FormGroupProps = Omit<ComponentProps<'section'>, 'title'> & {
  headingLevel?: 2 | 3 | 4
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
  collapsible?: boolean
  description?: ReactNode
  invalid?: boolean
  number?: number
  optionalLabel?: ReactNode
  summary?: ReactNode
  title: ReactNode
  validationAttempt?: number
}

export const inlineFormClassName = 'grid min-w-0 grid-cols-1 gap-5'
export const compactInlineFormClassName = 'grid min-w-0 grid-cols-1 gap-4'
export const tightInlineFormClassName = 'grid min-w-0 grid-cols-1 gap-3'
export const inviteInlineFormClassName =
  'sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start'
export const formTabsContentClassName = 'flex flex-col gap-4'

export function InlineForm({
  children,
  className,
  gap = 'standard',
  layout = 'stack',
  showRequiredHint = true,
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
      {showRequiredHint && <RequiredFieldsHint />}
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
  headingLevel = 3,
  ...props
}: FormGroupProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <section
      data-slot="form-group"
      className={cn('grid gap-4', className)}
      {...props}
    >
      <div className="grid gap-1">
        <Heading
          className={cn(
            dashboardNestedHeadingClassName,
            'text-lg leading-none',
          )}
        >
          {title}
        </Heading>
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
        className="row-span-2 grid size-7 place-items-center rounded-control border border-border-subtle bg-surface-muted font-sans text-xs font-semibold text-muted-foreground tabular-nums"
        aria-hidden="true"
      >
        {String(number).padStart(2, '0')}
      </span>
      <span className="text-xs font-bold text-foreground">{title}</span>
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
  collapsible = true,
  description,
  invalid = false,
  number,
  optionalLabel,
  summary,
  title,
  validationAttempt = 0,
  ...props
}: FormSectionProps) {
  const contentId = useId()
  const [expanded, setOpen] = useState(defaultOpen)
  const open = !collapsible || expanded
  const Header = collapsible ? 'button' : 'div'
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
    }, 0)

    return () => window.clearTimeout(focusTimer)
  }, [invalid, validationAttempt])

  return (
    <section
      ref={sectionRef}
      data-slot="form-section"
      data-open={open || undefined}
      className={cn(
        'app-row min-w-0 bg-card transition-colors',
        open && 'border-primary/25',
        invalid && 'border-destructive/45',
        className,
      )}
      {...props}
    >
      <Header
        type={collapsible ? 'button' : undefined}
        className={cn(
          'flex min-w-0 w-full items-center gap-3 rounded-t-[calc(var(--radius-row)-1px)] px-4 py-4 text-left sm:px-5',
          !open && 'rounded-b-[calc(var(--radius-row)-1px)]',
          collapsible &&
            'app-choice-feedback app-control-focus cursor-pointer hover:bg-primary/5 focus-visible:outline-none',
        )}
        aria-controls={collapsible ? contentId : undefined}
        aria-expanded={collapsible ? open : undefined}
        onClick={collapsible ? () => setOpen((current) => !current) : undefined}
      >
        {number !== undefined && (
          <span
            className={cn(
              'grid size-8 shrink-0 place-items-center rounded-control border border-border-subtle bg-surface-muted font-sans text-xs font-semibold text-muted-foreground tabular-nums',
              invalid &&
                'border-destructive/35 bg-destructive/10 text-destructive',
            )}
            aria-hidden="true"
          >
            {String(number).padStart(2, '0')}
          </span>
        )}

        <span className="grid min-w-0 flex-1 gap-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              role={collapsible ? undefined : 'heading'}
              aria-level={collapsible ? undefined : 3}
              className={cn(
                dashboardNestedHeadingClassName,
                'text-lg leading-none',
              )}
            >
              {title}
            </span>{' '}
            {optionalLabel && (
              <span className="text-sm font-normal text-muted-foreground">
                {optionalLabel}
              </span>
            )}
          </span>{' '}
          {(!open && summary ? summary : description) && (
            <span className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
              {!open && summary ? summary : description}
            </span>
          )}
        </span>

        {collapsible && (
          <CaretDownIcon
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        )}
      </Header>

      {/* Normal block flow avoids WebKit intrinsic sizing bugs in nested grid disclosures. */}
      <MotionDisclosure id={contentId} open={open}>
        <div className="grid min-w-0 grid-cols-1 gap-5 rounded-b-[calc(var(--radius-row)-1px)] border-t border-border-subtle bg-card px-4 py-5 sm:px-5 sm:py-6">
          {children}
        </div>
      </MotionDisclosure>
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

export function RequiredFieldsHint() {
  const t = useT()
  return (
    <p
      data-slot="required-fields-hint"
      className="col-span-full text-sm text-muted-foreground"
    >
      {t('common.requiredFields')}
    </p>
  )
}
