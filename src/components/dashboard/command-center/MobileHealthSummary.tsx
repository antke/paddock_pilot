import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useT } from '#/i18n/LocaleProvider'
import { cn } from '#/lib/utils'
import { DisclosureChevron } from '#/components/ui/disclosure-chevron'
import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { getDashboardAttention } from './dashboardAttention'
import { CareReminderLink } from './PriorityQueueCard'
import { SeeAllLink } from './SeeAllLink'
import type { DashboardCareData } from './dashboardTypes'

/** A phone attention summary: one row that expands in place to its top items. */
function MobileAttentionDisclosure({
  title,
  urgent,
  preview,
  children,
}: {
  title: string
  urgent: boolean
  preview?: string
  children: ReactNode
}) {
  return (
    <details className="group rounded-row bg-card px-4 xl:hidden">
      <summary
        className={cn(
          'app-control-focus flex min-h-11 cursor-pointer list-none items-center gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden',
          urgent ? 'text-destructive' : 'text-foreground',
        )}
      >
        {/* One line open or closed: the preview trails the title, so opening never resizes the row. */}
        <span className="flex min-w-0 flex-1 items-baseline gap-x-3">
          {/* Serif like the section titles below; colour stays per the Attention Rule. */}
          <span className="shrink-0 font-display text-lg leading-snug tracking-[-0.015em]">
            {title}
          </span>
          {preview && (
            <span className="min-w-0 truncate text-sm font-normal group-open:hidden">
              {preview}
            </span>
          )}
        </span>
        <DisclosureChevron />
      </summary>
      <div className="grid gap-1 pb-2">{children}</div>
    </details>
  )
}

export function MobileHealthSummary({ data }: { data: DashboardCareData }) {
  const t = useT()
  const attention = getDashboardAttention(data)
  if (!attention.healthIssueCount) return null

  return (
    <MobileAttentionDisclosure
      title={`${t('dashboard.healthIssues')} · ${attention.healthIssueCount}`}
      urgent
      preview={attention.healthHorses[0]?.horseName}
    >
      <ul className="app-record-list">
        {attention.healthHorses.map((horse) => (
          <li key={horse.horseId}>
            <Link
              to="/horses/$horseId/care"
              params={{ horseId: horse.horseId }}
              search={{ careView: 'health' }}
              className="app-control-focus app-record flex min-h-11 items-center justify-between gap-3 rounded-row text-sm"
            >
              <span className="font-semibold">{horse.horseName}</span>
              <span>
                {t('dashboard.issues', { count: horse.highIssueCount })}
              </span>
            </Link>
          </li>
        ))}
        {attention.missingHealthIssueCount > 0 && (
          <li className="py-3 text-sm">
            {t('dashboard.missingIssues', {
              count: attention.missingHealthIssueCount,
            })}{' '}
            <Link
              to={data.stable ? '/stables/$stableId/horses' : '/horses'}
              params={{ stableId: data.stable?._id ?? '' }}
              className="underline"
            >
              {t('dashboard.viewHorses')}
            </Link>
          </li>
        )}
      </ul>
    </MobileAttentionDisclosure>
  )
}

/** Due care on phones: the same disclosure as health, ending with the reminders page link. */
export function MobileCareSummary({
  data,
  stableId,
}: {
  data: DashboardCareData
  stableId: string
}) {
  const t = useT()
  const attention = getDashboardAttention(data)
  if (!attention.reminderCount) return null

  return (
    <MobileAttentionDisclosure
      title={`${t('dashboard.reminders')} · ${attention.reminderCount}`}
      urgent={attention.reminders.some((reminder) => reminder.overdue)}
      preview={attention.reminders[0]?.title}
    >
      <DashboardItemList gap="compact">
        {attention.reminders.slice(0, 3).map((reminder) => (
          <CareReminderLink key={reminder.id} reminder={reminder} />
        ))}
      </DashboardItemList>
      <SeeAllLink
        to="/stables/$stableId/reminders"
        params={{ stableId }}
        className="justify-self-start"
      >
        {t('dashboard.viewReminders')}
      </SeeAllLink>
    </MobileAttentionDisclosure>
  )
}
