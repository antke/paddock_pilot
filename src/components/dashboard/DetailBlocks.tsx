import type { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '#/lib/utils'
import { TextLabel } from '#/components/ui/text-label'
import { DashboardInlinePanel } from './DashboardInlinePanel'

type TextLabelOptions = Pick<
  ComponentProps<typeof TextLabel>,
  'size' | 'weight' | 'tracking'
>

type DetailGridGap = 'compact' | 'default'
type DetailGridColumns = 2 | 3 | 4
type DetailGridBreakpoint = 'sm' | 'md' | 'lg' | 'xl'
type DetailPanelGridVariant = 'balanced' | 'equal'
type DetailStackGap = 'compact' | 'default' | 'loose'
type DetailMetricBlockSize = 'compact' | 'default'
type DetailSpan = 'careWide' | 'lg2' | 'sm2' | 'xl2' | 'xl3'
export type DetailTone = 'default' | 'muted' | 'negative' | 'positive'

export const detailToneTextClassNames = {
  default: 'text-foreground',
  muted: 'text-muted-foreground',
  negative: 'text-destructive',
  positive: 'text-primary',
} satisfies Record<DetailTone, string>

type DetailGridProps = ComponentProps<'div'> & {
  breakpoint?: DetailGridBreakpoint
  columns?: DetailGridColumns
  gap?: DetailGridGap
}

type DetailPanelGridProps = ComponentProps<'div'> & {
  variant?: DetailPanelGridVariant
}

type DetailStackProps = ComponentProps<'div'> & {
  gap?: DetailStackGap
}

const detailGridColumnClassNames = {
  2: {
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-2',
    xl: 'xl:grid-cols-2',
  },
  3: {
    sm: 'sm:grid-cols-3',
    md: 'md:grid-cols-3',
    lg: 'lg:grid-cols-3',
    xl: 'xl:grid-cols-3',
  },
  4: {
    sm: 'sm:grid-cols-2 lg:grid-cols-4',
    md: 'md:grid-cols-2 lg:grid-cols-4',
    lg: 'lg:grid-cols-4',
    xl: 'sm:grid-cols-2 xl:grid-cols-4',
  },
} satisfies Record<DetailGridColumns, Record<DetailGridBreakpoint, string>>

export function DetailGrid({
  breakpoint = 'sm',
  className,
  columns = 2,
  gap = 'compact',
  ...props
}: DetailGridProps) {
  return (
    <div
      className={cn(
        'grid',
        gap === 'compact' ? 'gap-3' : 'gap-4',
        detailGridColumnClassNames[columns][breakpoint],
        className,
      )}
      {...props}
    />
  )
}

const detailPanelGridVariantClassNames = {
  balanced: 'lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]',
  equal: 'lg:grid-cols-2',
} satisfies Record<DetailPanelGridVariant, string>

export function DetailPanelGrid({
  className,
  variant = 'balanced',
  ...props
}: DetailPanelGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        detailPanelGridVariantClassNames[variant],
        className,
      )}
      {...props}
    />
  )
}

const detailStackGapClassNames = {
  compact: 'gap-2',
  default: 'gap-3',
  loose: 'gap-4',
} satisfies Record<DetailStackGap, string>

export function DetailStack({
  className,
  gap = 'default',
  ...props
}: DetailStackProps) {
  return (
    <div
      className={cn('grid', detailStackGapClassNames[gap], className)}
      {...props}
    />
  )
}

type DetailMetricBlockProps = {
  label: ReactNode
  value: ReactNode
  className?: string
  labelProps?: TextLabelOptions
  size?: DetailMetricBlockSize
  valueClassName?: string
}

export function DetailMetricBlock({
  label,
  value,
  className,
  labelProps,
  size = 'default',
  valueClassName,
}: DetailMetricBlockProps) {
  return (
    <DashboardInlinePanel
      className={cn(size === 'compact' && 'grid gap-1', className)}
    >
      <TextLabel as="div" {...labelProps}>
        {label}
      </TextLabel>
      <div
        className={cn(
          size === 'default' && 'mt-3 text-xl font-semibold tracking-normal',
          size === 'compact' && 'text-base font-semibold tracking-normal',
          valueClassName,
        )}
      >
        {value}
      </div>
    </DashboardInlinePanel>
  )
}

type DetailPanelProps = {
  title: ReactNode
  children: ReactNode
  className?: string
  gap?: 'compact' | 'default'
  span?: DetailSpan
  variant?: 'default' | 'emphasis'
}

const detailPanelGapClassNames = {
  compact: 'gap-2',
  default: 'gap-4',
} satisfies Record<NonNullable<DetailPanelProps['gap']>, string>

const detailSpanClassNames = {
  careWide: 'sm:col-span-2 xl:col-span-4',
  lg2: 'lg:col-span-2',
  sm2: 'sm:col-span-2',
  xl2: 'xl:col-span-2',
  xl3: 'xl:col-span-3',
} satisfies Record<DetailSpan, string>

export function DetailPanel({
  title,
  children,
  className,
  gap = 'default',
  span,
  variant = 'default',
}: DetailPanelProps) {
  return (
    <DashboardInlinePanel
      padding={variant === 'emphasis' ? 'compact' : 'default'}
      className={cn(
        'grid content-start',
        detailPanelGapClassNames[gap],
        variant === 'emphasis' && 'gap-3',
        span && detailSpanClassNames[span],
        className,
      )}
    >
      <TextLabel
        as="h3"
        size="sm"
        weight={variant === 'emphasis' ? 'black' : 'semibold'}
        className={cn(variant === 'emphasis' && 'text-base text-foreground')}
      >
        {title}
      </TextLabel>
      {children}
    </DashboardInlinePanel>
  )
}

type DetailFieldProps = {
  label: ReactNode
  value: ReactNode
  className?: string
  divided?: boolean
  framed?: boolean
  indent?: boolean
  labelClassName?: string
  multiline?: boolean
  span?: DetailSpan
  valueClassName?: string
  variant?: 'default' | 'emphasis' | 'summary'
}

type DetailDisplayFieldProps = Omit<
  DetailFieldProps,
  'indent' | 'labelClassName' | 'value' | 'valueClassName'
> & {
  labelClassName?: string
  value?: ReactNode | null
  valueClassName?: string
  valueWeight?: 'medium' | 'normal'
}
type DetailSummaryGridProps = ComponentProps<'div'>

const hasDetailValue = (value: ReactNode | null | undefined) =>
  value !== undefined && value !== null && value !== ''

export function DetailField({
  label,
  value,
  className,
  divided = false,
  framed = false,
  indent = true,
  labelClassName,
  multiline = false,
  span,
  valueClassName,
  variant = 'default',
}: DetailFieldProps) {
  const content = (
    <>
      <span
        className={cn(
          'text-xs text-muted-foreground',
          variant === 'emphasis' && 'text-base font-bold text-foreground/80',
          variant === 'summary' && 'text-sm',
          labelClassName,
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-medium leading-6',
          variant === 'emphasis' && 'text-lg font-semibold leading-7',
          variant === 'summary' && 'font-normal',
          multiline && 'whitespace-pre-line',
          valueClassName,
        )}
      >
        {value}
      </span>
    </>
  )
  const rowClassName = cn(
    divided && 'border-b border-border-subtle pb-3 last:border-b-0',
    span && detailSpanClassNames[span],
    className,
  )

  if (framed) {
    return (
      <DashboardInlinePanel
        padding={variant === 'emphasis' ? 'compact' : 'default'}
        className={cn('grid gap-1', rowClassName)}
      >
        {content}
      </DashboardInlinePanel>
    )
  }

  return (
    <div className={cn('grid gap-1', indent && 'pl-2', rowClassName)}>
      {content}
    </div>
  )
}

export function DetailDisplayField({
  label,
  value,
  labelClassName,
  valueClassName,
  valueWeight = 'medium',
  ...props
}: DetailDisplayFieldProps) {
  if (!hasDetailValue(value)) return null

  return (
    <DetailField
      label={label}
      value={value}
      indent={false}
      labelClassName={cn('text-sm', labelClassName)}
      valueClassName={cn(
        valueWeight === 'normal' && 'font-normal',
        valueClassName,
      )}
      {...props}
    />
  )
}

export function DetailSummaryField({
  className,
  multiline,
  ...props
}: Omit<DetailDisplayFieldProps, 'valueWeight' | 'variant' | 'divided'>) {
  return (
    <DetailDisplayField
      className={className}
      divided
      multiline={multiline}
      valueWeight="normal"
      variant="summary"
      {...props}
    />
  )
}

export function DetailSummaryGrid({
  className,
  ...props
}: DetailSummaryGridProps) {
  return (
    <div
      className={cn(
        'grid items-start gap-x-6 gap-y-3 text-sm sm:grid-cols-2',
        className,
      )}
      {...props}
    />
  )
}

export function DetailPrintField({
  labelClassName,
  multiline,
  valueClassName,
  ...props
}: Omit<DetailDisplayFieldProps, 'valueWeight' | 'variant'>) {
  return (
    <DetailDisplayField
      labelClassName={cn('print:text-black/70', labelClassName)}
      valueClassName={cn(
        multiline ? 'whitespace-pre-wrap' : undefined,
        'print:text-black',
        valueClassName,
      )}
      valueWeight="normal"
      {...props}
    />
  )
}

type DetailPrintListBlockProps = {
  label: ReactNode
  items?: ReadonlyArray<ReactNode>
  className?: string
  labelClassName?: string
  listClassName?: string
}

export function DetailPrintListBlock({
  label,
  items,
  className,
  labelClassName,
  listClassName,
}: DetailPrintListBlockProps) {
  if (!items?.length) return null

  return (
    <div className={cn('grid gap-1', className)}>
      <span
        className={cn(
          'text-muted-foreground print:text-black/70',
          labelClassName,
        )}
      >
        {label}
      </span>
      <ul className={cn('list-disc pl-5', listClassName)}>
        {items.map((item, index) => (
          <li key={String(index)}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

type DetailKeyValueRowProps = {
  label: ReactNode
  value: ReactNode
  className?: string
  labelClassName?: string
  valueTone?: DetailTone
  valueClassName?: string
}

export function DetailKeyValueRow({
  label,
  value,
  className,
  labelClassName,
  valueTone = 'default',
  valueClassName,
}: DetailKeyValueRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <span className={labelClassName}>{label}</span>
      <span
        className={cn(
          'font-medium',
          detailToneTextClassNames[valueTone],
          valueClassName,
        )}
      >
        {value}
      </span>
    </div>
  )
}

type DetailNoteBlockProps = {
  label: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  span?: DetailSpan
}

type DetailTextBlockProps = {
  label: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  labelProps?: TextLabelOptions
}

export function DetailTextBlock({
  label,
  children,
  className,
  bodyClassName,
  labelProps,
}: DetailTextBlockProps) {
  return (
    <div className={cn('grid gap-1', className)}>
      <TextLabel as="div" {...labelProps}>
        {label}
      </TextLabel>
      <p className={cn('whitespace-pre-wrap text-sm leading-6', bodyClassName)}>
        {children}
      </p>
    </div>
  )
}

type DetailListBlockProps = {
  label: ReactNode
  items: ReadonlyArray<ReactNode>
  className?: string
  listClassName?: string
  labelProps?: TextLabelOptions
}

type DetailIconListProps = ComponentProps<'ul'> & {
  icon: ElementType
  iconTone?: DetailTone
  items: ReadonlyArray<ReactNode>
}

type DetailListGridProps = ComponentProps<'div'> & {
  breakpoint?: 'sm' | 'md' | 'lg'
}

const detailListGridBreakpointClassNames = {
  sm: 'sm:grid-cols-2',
  md: 'md:grid-cols-2',
  lg: 'lg:grid-cols-2',
} satisfies Record<NonNullable<DetailListGridProps['breakpoint']>, string>

export function DetailListBlock({
  label,
  items,
  className,
  listClassName,
  labelProps,
}: DetailListBlockProps) {
  if (items.length === 0) return null

  return (
    <div className={cn('grid gap-1', className)}>
      <TextLabel as="div" {...labelProps}>
        {label}
      </TextLabel>
      <ul
        className={cn('list-inside list-disc text-sm leading-6', listClassName)}
      >
        {items.map((item, index) => (
          <li key={String(index)}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function DetailIconList({
  className,
  icon: Icon,
  iconTone = 'default',
  items,
  ...props
}: DetailIconListProps) {
  if (items.length === 0) return null

  return (
    <ul className={cn('grid gap-2', className)} {...props}>
      {items.map((item, index) => (
        <li key={String(index)} className="flex items-start gap-2">
          <Icon
            aria-hidden={true}
            className={cn('mt-0.5 size-4', detailToneTextClassNames[iconTone])}
            weight="bold"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function DetailListGrid({
  breakpoint = 'sm',
  className,
  ...props
}: DetailListGridProps) {
  return (
    <div
      className={cn(
        'grid gap-2 text-sm',
        detailListGridBreakpointClassNames[breakpoint],
        className,
      )}
      {...props}
    />
  )
}

export function DetailNoteBlock({
  label,
  children,
  className,
  bodyClassName,
  span,
}: DetailNoteBlockProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        span && detailSpanClassNames[span],
        className,
      )}
    >
      <TextLabel>{label}</TextLabel>
      <DashboardInlinePanel
        className={cn('whitespace-pre-wrap text-sm leading-6', bodyClassName)}
      >
        {children}
      </DashboardInlinePanel>
    </div>
  )
}
