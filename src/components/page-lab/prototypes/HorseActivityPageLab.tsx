import { useMemo, useState } from 'react'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { HorseActivitySection } from '#/components/horses/HorseActivitySection'
import { RouteEntityNotFoundAlert } from '#/components/layout/RouteStatusAlert'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useLocalDateContext } from '#/lib/useLocalDateContext'

export function HorseActivityPageLab({ data }: { data: DashboardLabData }) {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Activity samples are available only with development sample data.
      </DashboardEmptyState>
    )
  return <ActivitySample key={data.stable._id} data={data} />
}

function ActivitySample({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState('mixed')
  const { today } = useLocalDateContext()
  const horse = data.horses[0]
  const events = useMemo(
    () => createHorseActivitySampleEvents(data, today, scenario),
    [data, today, scenario],
  )
  return (
    <DashboardPage>
      <DashboardPageHeader
        title={
          horse ? `${horse.name} — activity sample` : 'Horse activity sample'
        }
        description="Fictional activity rendered by the actual horse activity view. Filters work locally. Add event and event links lead to the real app and may require sign-in; sample event links do not represent saved records."
      />
      <Field>
        <FieldLabel htmlFor="horse-activity-sample">Sample activity</FieldLabel>
        <Select
          id="horse-activity-sample"
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="mixed">
            Planned, completed today and cancelled in the future
          </option>
          <option value="long">40 events and long titles</option>
          <option value="empty">No activity</option>
          <option value="missing">Missing horse</option>
        </Select>
      </Field>
      {!horse || scenario === 'missing' ? (
        <RouteEntityNotFoundAlert
          entity="horse"
          description="This sample horse is not available. No activity can be displayed."
        />
      ) : (
        <HorseActivitySection
          key={scenario}
          horse={horse}
          stableId={data.stable._id}
          events={events}
        />
      )}
    </DashboardPage>
  )
}

export function createHorseActivitySampleEvents(
  data: DashboardLabData,
  today: string,
  scenario: string,
): Array<Doc<'events'>> {
  const horse = data.horses[0]
  if (!horse || scenario === 'empty' || scenario === 'missing') return []
  const shiftDay = (days: number) => {
    const date = new Date(`${today}T12:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
  }
  const items: Array<Pick<Doc<'events'>, 'title' | 'date' | 'status'>> =
    scenario === 'long'
      ? Array.from({ length: 40 }, (_, index) => ({
          title: `Sample ${index + 1}: Arena schooling and turnout coordination for the Northern Pastures group`,
          date: shiftDay(index % 10),
          status: index % 2 === 0 ? 'planned' : 'completed',
        }))
      : [
          {
            title: 'Sample planned schooling today',
            date: today,
            status: 'planned',
          },
          {
            title: 'Sample completed visit today',
            date: today,
            status: 'completed',
          },
          {
            title: 'Sample cancelled future lesson',
            date: shiftDay(3),
            status: 'cancelled',
          },
          {
            title: 'Sample earlier appointment',
            date: shiftDay(-2),
            status: 'planned',
          },
          {
            title: 'Sample legacy event without status',
            date: shiftDay(2),
            status: undefined,
          },
        ]
  return items.map((item, index) => ({
    ...item,
    _id: `sample-horse-activity-${index}` as Id<'events'>,
    _creationTime: 0,
    stableId: data.stable._id,
    createdBy: data.stable.ownerId,
    horseIds: [horse._id],
    type: 'training',
    time: index % 2 === 0 ? '09:00' : '14:00',
    location: 'Sample arena',
  }))
}
