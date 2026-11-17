import { DashboardPageHeader } from '../DashboardPageHeader'
import type { ReactNode } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react'
import { useT } from '#/i18n/LocaleProvider'
import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { buttonVariants } from '#/components/ui/button'
import { ContactLink } from '#/components/ui/contact-link'
import { DashboardCreateMenu } from '#/components/dashboard/DashboardCreateMenu'
import { DashboardLayoutStack } from '#/components/dashboard/DashboardLayoutGrid'
import { TodayTrainingCard } from './TodayTrainingCard'
import { TodayBriefingCard } from './TodayBriefingCard'
import { HorseRosterCard } from './HorseRosterCard'
import { MobileCareSummary, MobileHealthSummary } from './MobileHealthSummary'
import type { DashboardCommandData } from './dashboardTypes'

export function MobileStableDashboard({
  data,
  setupNotice,
  updates,
  pending,
}: {
  data: DashboardCommandData
  setupNotice?: ReactNode
  updates?: ReactNode
  pending?: ReactNode
}) {
  const t = useT()
  const workspace = useWorkspace()
  return (
    <DashboardLayoutStack data-slot="mobile-stable-dashboard">
      <DashboardPageHeader
        title={workspace ? t('navigation.home') : data.stable.name}
      />
      {/* Contacts stay in the Go to menu and the stable's Yard and contacts page. */}
      {data.stable.emergencyPhone && (
        <ContactLink
          kind="phone"
          value={data.stable.emergencyPhone}
          className={buttonVariants({ variant: 'outline' })}
        >
          {t('dashboard.callEmergency')}
        </ContactLink>
      )}
      <DashboardCreateMenu
        stableId={data.stable._id}
        stableName={data.stable.name}
      />
      <MobileHealthSummary data={data} />
      <MobileCareSummary data={data} stableId={data.stable._id} />
      {pending}
      <TodayBriefingCard data={data} compact showWeek />
      <TodayTrainingCard data={data} compact />
      <HorseRosterCard data={data} compact visibleItemLimit={3} />
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
    </DashboardLayoutStack>
  )
}
