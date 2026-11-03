import { createContext, useContext, useId } from 'react'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { SectionEditSlot } from './SectionEditSlot'

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

/** Stacked record groups read at a larger value size than compact cards. */
const DetailReferenceStacked = createContext(false)

export function DetailReferenceGroup({
  title,
  children,
  edit,
  layout = 'aside',
  as: Heading = 'h2',
  className,
  ...props
}: Omit<ComponentProps<'section'>, 'title'> & {
  title: string
  children: ReactNode
  /** The group's pencil, kept in the title row's top-right corner. */
  edit?: ReactNode
  /**
   * `aside` puts the title in a narrow column beside the fields on wide
   * screens (printable summaries). `stacked` keeps the title above the fields
   * at every width so the fields use the full row and the action sits in the
   * group's top-right corner.
   */
  layout?: 'aside' | 'stacked'
  as?: 'h2' | 'h3'
}) {
  const headingId = useId()
  const stacked = layout === 'stacked'
  const heading = (
    <Heading
      id={headingId}
      className={cn(
        'min-w-0 text-foreground',
        stacked
          ? 'font-display text-xl font-semibold leading-tight tracking-[-0.01em]'
          : 'font-sans text-lg font-semibold leading-snug',
      )}
    >
      {title}
    </Heading>
  )

  return (
    <section
      data-slot="detail-reference-group"
      aria-labelledby={headingId}
      className={cn(
        'grid min-w-0 gap-4 border-t border-border-subtle pt-6 first:border-t-0 first:pt-0',
        stacked
          ? 'gap-5'
          : 'lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-8',
        className,
      )}
      {...props}
    >
      {edit ? (
        // The control never adds height to the title row.
        <div
          className={cn(
            'flex min-w-0 items-center justify-between gap-3',
            !stacked && 'lg:justify-start',
          )}
        >
          {heading}
          <SectionEditSlot>{edit}</SectionEditSlot>
        </div>
      ) : (
        heading
      )}
      <div
        className={cn(
          'grid min-w-0 content-start gap-6',
          !stacked && 'max-w-3xl',
        )}
      >
        <DetailReferenceStacked.Provider value={stacked}>
          {children}
        </DetailReferenceStacked.Provider>
      </div>
    </section>
  )
}

export function DetailReferenceList({
  children,
  mobileColumns = 1,
  wideColumns = 2,
  title,
  as: Heading = 'h3',
}: {
  children: ReactNode
  mobileColumns?: 1 | 2
  /** Columns from the large breakpoint; 3 keeps one track across groups. */
  wideColumns?: 2 | 3
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
          'grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2',
          mobileColumns === 2 && 'grid-cols-2',
          wideColumns === 3 && 'lg:grid-cols-3',
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
  const stacked = useContext(DetailReferenceStacked)
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
          'min-w-0 wrap-anywhere',
          stacked ? 'text-lg leading-snug' : 'text-base leading-6',
          hasValue ? 'font-medium text-foreground' : 'text-muted-foreground',
          multiline && 'max-w-prose whitespace-pre-wrap font-normal',
        )}
      >
        {hasValue ? value : missingValue}
      </dd>
    </div>
  )
}
