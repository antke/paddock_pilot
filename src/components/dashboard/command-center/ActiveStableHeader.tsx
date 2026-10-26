import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardValueBadge } from '#/components/dashboard/DashboardBadges'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { DashboardCommandData } from './dashboardTypes'
import { ContactLink } from '#/components/ui/contact-link'
import { ButtonLink, buttonVariants } from '#/components/ui/button'

type ActiveStableHeaderProps = {
  data: DashboardCommandData
}

export function ActiveStableHeader({ data }: ActiveStableHeaderProps) {
  const workspace = useWorkspace()
  const t = useT()

  const eventLabel = t('dashboard.todayEntries', {
    count: data.todayEvents.length,
  })

  return (
    <DashboardPageHeader
      title={workspace ? t('navigation.home') : data.stable.name}
      titleClassName="break-words"
      actions={
        <>
          {data.stable.emergencyPhone && (
            <ContactLink
              kind="phone"
              value={data.stable.emergencyPhone}
              className={buttonVariants({ variant: 'outline', size: 'sm' })}
            >
              {t('dashboard.callEmergency')}
            </ContactLink>
          )}
          <ButtonLink
            to="/stables/$stableId/stable"
            params={{ stableId: data.stable._id }}
            search={{ tab: 'contacts' }}
            variant="ghost"
            size="sm"
          >
            {t('dashboard.contacts')}
          </ButtonLink>
        </>
      }
      badges={
        data.todayEvents.length > 0 ? (
          <DashboardValueBadge variant="secondary">
            {eventLabel}
          </DashboardValueBadge>
        ) : undefined
      }
      className="py-1 md:py-6"
    />
  )
}
