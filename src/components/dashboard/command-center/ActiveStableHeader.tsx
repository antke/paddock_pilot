import { useWorkspace } from '#/components/layout/WorkspaceContext'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import type { DashboardCommandData } from './dashboardTypes'
import { ContactLink } from '#/components/ui/contact-link'
import { cn } from '#/lib/utils'
import { buttonVariants } from '#/components/ui/button'

type ActiveStableHeaderProps = {
  data: DashboardCommandData
}

export function ActiveStableHeader({ data }: ActiveStableHeaderProps) {
  const workspace = useWorkspace()
  const t = useT()

  // Contacts live under the stable's Yard and contacts page in the sidebar; the header keeps only the emergency call.
  return (
    <DashboardPageHeader
      title={workspace ? t('navigation.home') : data.stable.name}
      titleClassName="break-words"
      actions={
        data.stable.emergencyPhone && (
          <ContactLink
            kind="phone"
            value={data.stable.emergencyPhone}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'min-h-11',
            )}
          >
            {t('dashboard.callEmergency')}
          </ContactLink>
        )
      }
    />
  )
}
