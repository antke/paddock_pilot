import type { ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { useT } from '#/i18n/LocaleProvider'
import { ButtonLink } from '#/components/ui/button'
import { DashboardCreateMenu } from '#/components/dashboard/DashboardCreateMenu'
import { TodayTrainingCard } from './TodayTrainingCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import { HorseRosterCard } from './HorseRosterCard'
import { MobileHealthSummary } from './MobileHealthSummary'
import { getDashboardAttention } from './dashboardAttention'
import type { DashboardCommandData } from './dashboardTypes'

export function MobileStableDashboard({
  data,
  setupNotice,
  updates,
}: {
  data: DashboardCommandData
  setupNotice?: ReactNode
  updates?: ReactNode
}) {
  const t = useT()
  const attention = getDashboardAttention(data)
  return (
    <div data-slot="mobile-stable-dashboard" className="grid min-w-0 gap-6">
      <h1 className="sr-only">{t('navigation.home')}</h1>
      <DashboardCreateMenu stableId={data.stable._id} />
      <MobileHealthSummary data={data} />
      <TodayTrainingCard data={data} compact />
      <TodayBriefingCard data={data} compact chrome="flat" />
      <HorseRosterCard data={data} compact chrome="flat" visibleItemLimit={3} />
      {attention.reminderCount > 0 && (
        <ButtonLink
          to="/stables/$stableId/reminders"
          params={{ stableId: data.stable._id }}
          variant="outline"
          className="min-h-12 justify-start"
        >
          {t('dashboard.reminders')} · {attention.reminderCount}
        </ButtonLink>
      )}
      {(setupNotice || updates) && (
        <details className="group border-t border-border-subtle">
          <summary className="app-control-focus flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden">
            {t('dashboard.stableUpdatesAndSetup')}
            <CaretDownIcon
              aria-hidden="true"
              className="group-open:rotate-180"
            />
          </summary>
          <div className="grid gap-4 py-3">
            {setupNotice}
            {updates}
          </div>
        </details>
      )}
    </div>
  )
}
