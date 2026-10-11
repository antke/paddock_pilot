import { CaretDownIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useT } from '#/i18n/LocaleProvider'
import { getDashboardAttention } from './dashboardAttention'
import type { DashboardCareData } from './dashboardTypes'

export function MobileHealthSummary({ data }: { data: DashboardCareData }) {
  const t = useT()
  const attention = getDashboardAttention(data)
  if (!attention.healthIssueCount) return null

  return (
    <details className="group rounded-row bg-card px-4 xl:hidden">
      <summary className="app-control-focus flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold text-destructive [&::-webkit-details-marker]:hidden">
        <span>
          {t('dashboard.healthIssues')} · {attention.healthIssueCount}
        </span>
        <CaretDownIcon
          aria-hidden="true"
          className="shrink-0 group-open:rotate-180"
        />
      </summary>
      <ul className="app-record-list pb-3">
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
    </details>
  )
}
