import { Link } from '@tanstack/react-router'
import { useT } from '#/i18n/LocaleProvider'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import {
  DashboardNavigation,
  DashboardNavigationLinkItem,
} from '#/components/dashboard/DashboardNavigation'
import { ButtonLink } from '#/components/ui/button'

export const stableDirectoryTabs = ['contacts', 'people', 'yard'] as const
export type StableDirectoryTab = (typeof stableDirectoryTabs)[number]

export function StableDirectoryHeader({
  stableId,
  name,
  activeTab,
  isOwner,
}: {
  stableId: string
  name: string
  activeTab: StableDirectoryTab
  isOwner: boolean
}) {
  const t = useT()

  return (
    <div className="grid min-w-0 gap-4">
      <DashboardPageHeader
        title={name}
        actions={
          isOwner && (
            <ButtonLink
              to="/stables/$stableId/settings"
              params={{ stableId }}
              variant="outline"
            >
              {t('stables.settings')}
            </ButtonLink>
          )
        }
      />
      <DashboardNavigation
        ariaLabel={t('navigation.stable')}
        overflow="scroll"
        inset={false}
        className="w-full border-b border-border-subtle pb-2"
        listClassName="p-1"
      >
        {stableDirectoryTabs.map((tab) => (
          <DashboardNavigationLinkItem
            key={tab}
            active={activeTab === tab}
            variant="section"
            className="h-11"
            render={
              <Link
                to="/stables/$stableId/stable"
                params={{ stableId }}
                search={{ tab }}
                activeOptions={{ exact: true, includeSearch: true }}
                resetScroll={false}
              />
            }
          >
            {t(`stables.sharedTabs.${tab}`)}
          </DashboardNavigationLinkItem>
        ))}
        {(
          [
            { to: '/stables/$stableId/documents', label: 'documents' },
            { to: '/stables/$stableId/analysis', label: 'analysis' },
            { to: '/stables/$stableId/welcome', label: 'gettingStarted' },
          ] as const
        ).map(({ to, label }) => (
          <DashboardNavigationLinkItem
            key={label}
            variant="section"
            className="h-11"
            render={<Link to={to} params={{ stableId }} />}
          >
            {t(`navigation.${label}`)}
          </DashboardNavigationLinkItem>
        ))}
      </DashboardNavigation>
    </div>
  )
}
