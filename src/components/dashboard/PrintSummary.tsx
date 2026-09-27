import type { ComponentProps } from 'react'

import { cn } from '#/lib/utils'
import { DashboardEmptyState } from './DashboardEmptyState'
import { DashboardInlineHeader } from './DashboardInlineHeader'
import { DashboardInlinePanel } from './DashboardInlinePanel'
import { DashboardPage } from './DashboardPage'
import { DashboardPageHeader } from './DashboardPageHeader'
import { DashboardSectionCard } from './DashboardSectionCard'

type PrintSummaryScreenOnlyProps = ComponentProps<'span'>
type PrintSummaryBodyTextProps = ComponentProps<'p'>

export function PrintSummaryPage({
  className,
  ...props
}: ComponentProps<typeof DashboardPage>) {
  return (
    <DashboardPage
      data-print-summary=""
      className={cn('print:block print:text-black', className)}
      {...props}
    />
  )
}

export function PrintSummaryHeader({
  className,
  actionsClassName,
  contentClassName,
  descriptionClassName,
  ...props
}: ComponentProps<typeof DashboardPageHeader>) {
  return (
    <DashboardPageHeader
      className={cn('print-summary-header', className)}
      actionsClassName={cn('print:hidden', actionsClassName)}
      contentClassName={cn('print:block', contentClassName)}
      descriptionClassName={cn('print:text-black', descriptionClassName)}
      {...props}
    />
  )
}

export function PrintSummarySection({
  className,
  contentTextSize = 'sm',
  ...props
}: ComponentProps<typeof DashboardSectionCard>) {
  return (
    <DashboardSectionCard
      data-print-summary-section=""
      className={cn('print:border-black/30 print:shadow-none', className)}
      contentTextSize={contentTextSize}
      {...props}
    />
  )
}

export function PrintSummaryEmptyState({
  chrome = 'soft',
  className,
  ...props
}: ComponentProps<typeof DashboardEmptyState>) {
  return (
    <DashboardEmptyState
      chrome={chrome}
      className={cn(
        'print:border print:border-black/30 print:bg-transparent print:p-3 print:text-black/70',
        className,
      )}
      {...props}
    />
  )
}

export function PrintSummaryRecordPanel({
  className,
  ...props
}: ComponentProps<typeof DashboardInlinePanel>) {
  return (
    <DashboardInlinePanel
      data-print-summary-record=""
      className={cn('print:border print:border-black/30', className)}
      {...props}
    />
  )
}

export function PrintSummaryRecordHeader({
  className,
  descriptionClassName,
  ...props
}: ComponentProps<typeof DashboardInlineHeader>) {
  return (
    <DashboardInlineHeader
      className={cn('print-summary-record-header', className)}
      descriptionClassName={cn('print:text-black/70', descriptionClassName)}
      {...props}
    />
  )
}

export function PrintSummaryBodyText({
  className,
  ...props
}: PrintSummaryBodyTextProps) {
  return (
    <p
      data-print-summary-body=""
      className={cn('whitespace-pre-wrap', className)}
      {...props}
    />
  )
}

export function PrintSummaryScreenOnly({
  className,
  ...props
}: PrintSummaryScreenOnlyProps) {
  return <span className={cn('print:hidden', className)} {...props} />
}
