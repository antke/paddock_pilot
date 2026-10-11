import { useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'

/** Open reference groups inside a single owning paper section. */
export function DetailReference({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="detail-reference"
      className={cn('grid min-w-0 gap-6', className)}
      {...props}
    />
  )
}

export function DetailReferenceGroup({
  title,
  children,
  as: Heading = 'h2',
  className,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> & {
  title: string
  children: ReactNode
  as?: 'h2' | 'h3'
}) {
  const headingId = useId()

  return (
    <section
      data-slot="detail-reference-group"
      aria-labelledby={headingId}
      className={cn(
        'grid min-w-0 gap-4 border-t border-border-subtle pt-6 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8',
        className,
      )}
      {...props}
    >
      <Heading
        id={headingId}
        className="font-sans text-lg font-semibold leading-snug text-foreground"
      >
        {title}
      </Heading>
      <div className="grid min-w-0 max-w-3xl content-start gap-6">
        {children}
      </div>
    </section>
  )
}

export function DetailReferenceList({
  children,
  mobileColumns = 1,
  title,
  as: Heading = 'h3',
}: {
  children: ReactNode
  mobileColumns?: 1 | 2
  title?: string
  as?: 'h3' | 'h4'
}) {
  const headingId = useId()

  return (
    <div className="grid min-w-0 gap-3">
      {title && (
        <Heading
          id={headingId}
          className="text-sm font-semibold text-foreground"
        >
          {title}
        </Heading>
      )}
      <dl
        data-slot="detail-reference-list"
        aria-labelledby={title ? headingId : undefined}
        className={cn(
          'grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2',
          mobileColumns === 2 && 'grid-cols-2',
        )}
      >
        {children}
      </dl>
    </div>
  )
}

export function DetailReferenceField({
  label,
  value,
  missingValue,
  fullWidth = false,
  multiline = false,
}: {
  label: string
  value?: ReactNode
  missingValue?: ReactNode
  fullWidth?: boolean
  multiline?: boolean
}) {
  const hasValue = value !== undefined && value !== null && value !== ''
  if (!hasValue && missingValue === undefined) return null

  return (
    <div
      className={cn(
        'grid min-w-0 content-start gap-1',
        fullWidth && 'col-span-full',
      )}
    >
      <dt className="text-sm leading-5 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 wrap-anywhere text-base leading-6',
          hasValue ? 'font-medium text-foreground' : 'text-muted-foreground',
          multiline && 'max-w-prose whitespace-pre-wrap font-normal',
        )}
      >
        {hasValue ? value : missingValue}
      </dd>
    </div>
  )
}
