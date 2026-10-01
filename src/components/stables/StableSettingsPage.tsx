import { useT } from '#/i18n/LocaleProvider'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useNavigate } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'
import { DeletedHorsesCard } from './DeletedHorsesCard'
import { StableActivityLogCard } from './StableActivityLogCard'
import { StableMembersSettingsCard } from './StableMembersSettingsCard'
import { StableProvidersCard } from './StableProvidersCard'
import { StableSettingsOverview } from './StableSettingsOverview'
import type { StableSettingsData } from './stableSettingsTypes'

type StableSettingsPageProps = {
  settings: StableSettingsData
  initialTab?: StableSettingsTab
}

export type StableSettingsTab =
  'overview' | 'members' | 'providers' | 'deleted-horses' | 'activity'

const stableSettingsTabs = [
  { value: 'overview', label: 'stables.overview' },
  { value: 'members', label: 'stables.members' },
  { value: 'providers', label: 'stables.providers' },
  { value: 'deleted-horses', label: 'stables.deletedHorses' },
  { value: 'activity', label: 'stables.activityLog' },
] as const satisfies ReadonlyArray<{
  value: StableSettingsTab
  label: string
}>

export function isStableSettingsTab(
  value: unknown,
): value is StableSettingsTab {
  return stableSettingsTabs.some((tab) => tab.value === value)
}

type StableSettingsLayoutProps = Pick<
  ComponentProps<typeof Tabs>,
  'defaultValue' | 'onValueChange' | 'value'
> & {
  children: ReactNode
}

export function StableSettingsLayout({
  children,
  ...tabsProps
}: StableSettingsLayoutProps) {
  const t = useT()

  return (
    <DashboardPage>
      <DashboardPageHeader title={t('stables.settings')} />

      <Tabs className="min-w-0 max-w-full" {...tabsProps}>
        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]">
          <TabsList
            variant="section"
            className="w-max min-w-full flex-nowrap justify-start"
          >
            {stableSettingsTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {t(tab.label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {children}
      </Tabs>
    </DashboardPage>
  )
}

export function StableSettingsPage({
  settings,
  initialTab = 'overview',
}: StableSettingsPageProps) {
  const { stable } = settings
  const navigate = useNavigate()

  const onTabChange = (value: string) => {
    if (!isStableSettingsTab(value)) return

    void navigate({
      to: '/stables/$stableId/settings',
      params: { stableId: stable._id },
      search: { tab: value === 'overview' ? undefined : value },
    })
  }

  return (
    <StableSettingsLayout value={initialTab} onValueChange={onTabChange}>
      <TabsContent value="overview">
        <StableSettingsOverview stable={stable} owner={settings.owner} />
      </TabsContent>

      <TabsContent value="members">
        <StableMembersSettingsCard
          stableId={stable._id}
          stableName={stable.name}
          members={settings.members}
          invitations={settings.invitations}
          horses={settings.horses}
        />
      </TabsContent>

      <TabsContent value="providers">
        <StableProvidersCard stableId={stable._id} />
      </TabsContent>

      <TabsContent value="deleted-horses">
        <DeletedHorsesCard horses={settings.deletedHorses} />
      </TabsContent>

      <TabsContent value="activity">
        <StableActivityLogCard entries={settings.auditEntries} />
      </TabsContent>
    </StableSettingsLayout>
  )
}
