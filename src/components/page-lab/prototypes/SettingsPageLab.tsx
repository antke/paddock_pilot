import { MembersSettingsPageLab } from './MembersSettingsPageLab'
import { useState } from 'react'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { ProvidersPageLab } from './ProvidersPageLab'
import { DeletedHorsesPageLab } from './DeletedHorsesPageLab'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { StableOverviewPageLab } from './StableOverviewPageLab'
import { StableActivityLogCard } from '#/components/stables/StableActivityLogCard'
import { StableSettingsLayout } from '#/components/stables/StableSettingsPage'
import { TabsContent } from '#/components/ui/tabs'

const activityEntries = [
  {
    _id: 'activity-horse-approved',
    action: 'event_horse.approved',
    summary: 'Clover joined Shared vet visit',
    createdAt: Date.UTC(2026, 7, 5),
    actor: { firstName: 'Rae', lastName: 'Monroe' },
  },
  {
    _id: 'activity-member-invited',
    action: 'member_invitation.created',
    summary: 'june@cedarridge.example',
    createdAt: Date.UTC(2026, 7, 4),
    actor: { firstName: 'Mae', lastName: 'Turner' },
  },
  {
    _id: 'activity-stable-updated',
    action: 'stable.updated',
    createdAt: Date.UTC(2026, 7, 2),
    actor: { firstName: 'Mae', lastName: 'Turner' },
  },
]

export function SettingsPageLab({ data }: { data: DashboardLabData }) {
  return (
    <StableSettingsLayout defaultValue="overview">
      <TabsContent value="overview">
        <StableOverviewPageLab data={data} />
      </TabsContent>

      <TabsContent value="members">
        <MembersSettingsPageLab data={data} embedded />
      </TabsContent>

      <TabsContent value="providers">
        <ProvidersPageLab data={data} embedded />
      </TabsContent>

      <TabsContent value="deleted-horses">
        <DeletedHorsesPageLab data={data} embedded />
      </TabsContent>

      <TabsContent value="activity">
        <ActivitySample />
      </TabsContent>
    </StableSettingsLayout>
  )
}

function ActivitySample() {
  const [scenario, setScenario] = useState('standard')
  const entries =
    scenario === 'empty'
      ? []
      : scenario === 'long'
        ? Array.from({ length: 20 }, (_, index) => ({
            ...activityEntries[index % 3],
            _id: `sample-activity-${index}`,
            createdAt: Date.UTC(2026, 8, 18, 12) - index * 3600000,
            actor: index === 3 ? null : activityEntries[index % 3].actor,
            summary:
              index === 0
                ? 'A long sample change mentioning the Northern Pastures Equestrian and Rehabilitation Centre and its coordination team.'
                : activityEntries[index % 3].summary,
          }))
        : activityEntries
  return (
    <>
      <Field>
        <FieldLabel htmlFor="activity-sample-state">Sample activity</FieldLabel>
        <Select
          id="activity-sample-state"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="standard">Standard</option>
          <option value="long">20 changes and long details</option>
          <option value="empty">Empty</option>
        </Select>
      </Field>
      <StableActivityLogCard entries={entries} />
    </>
  )
}
