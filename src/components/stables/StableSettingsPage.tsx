import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
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
  | 'overview'
  | 'members'
  | 'providers'
  | 'deleted-horses'
  | 'activity'

export function StableSettingsPage({
  settings,
  initialTab = 'overview',
}: StableSettingsPageProps) {
  const { stable } = settings

  return (
    <DashboardPage>
      <DashboardPageHeader title="Stable settings" />

      <Tabs defaultValue={initialTab}>
        <TabsList variant="section">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="deleted-horses">Deleted horses</TabsTrigger>
          <TabsTrigger value="activity">Activity log</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </DashboardPage>
  )
}
