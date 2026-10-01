import { useT } from '#/i18n/LocaleProvider'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '#/lib/utils'

/** Optional record notes; essential status and actions stay outside the disclosure. */
export function DashboardRecordDetails({
  children,
  className,
  recordTitle,
  ...props
}: ComponentProps<'details'> & { recordTitle: ReactNode }) {
  const t = useT()

  return (
    <details
      data-slot="record-details"
      className={cn('group/details', className)}
      {...props}
    >
      <summary className="w-fit cursor-pointer rounded-control py-2 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:min-h-11">
        {t('reminders.details')}
        <span className="sr-only">
          {t('reminders.forPrefix')}
          {recordTitle}
        </span>
      </summary>
      <div className="max-w-prose whitespace-pre-wrap pb-2 text-sm leading-6 text-foreground">
        {children}
      </div>
    </details>
  )
}
