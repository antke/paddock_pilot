import { EventTable } from '#/components/events/EventList'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { ButtonLink } from '#/components/ui/button'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useState } from 'react'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

type EventListPageLabProps = {
  data: DashboardLabData
}

export function EventListPageLab({ data }: EventListPageLabProps) {
  const fixtureMode = useDevAuthBypassEnabled()
  const [sample, setSample] = useState('standard')
  const stableEvents = data.events.filter(
    (event) => event.stableId === data.stable._id,
  )
  const base = stableEvents[0]
  const events =
    !import.meta.env.DEV || !fixtureMode || sample === 'standard'
      ? stableEvents
      : sample === 'empty' || !base
        ? []
        : Array.from({ length: 50 }, (_, index) => ({
            ...base,
            _id: `${base._id}-sample-${index}` as typeof base._id,
            title:
              index % 5 === 0
                ? `Sample coordinated farrier visit for the northern pasture horses ${index + 1}`
                : `Sample appointment ${index + 1}`,
          }))

  return (
    <DashboardPage>
      {import.meta.env.DEV && fixtureMode && (
        <Field>
          <FieldLabel htmlFor="event-list-sample">Sample schedule</FieldLabel>
          <Select
            id="event-list-sample"
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          >
            <option value="standard">Standard sample</option>
            <option value="busy">
              50 sample events, including long titles
            </option>
            <option value="empty">Empty schedule</option>
          </Select>
        </Field>
      )}
      <DashboardPageHeader
        title="Events"
        actions={
          <ButtonLink
            to="/stables/$stableId/events/create"
            params={{ stableId: data.stable._id }}
            action="create"
          >
            Add event
          </ButtonLink>
        }
      />

      <DashboardSectionCard contentGap="comfortable">
        <EventTable
          stableId={data.stable._id}
          events={events}
          emptyTitle="No events added yet."
          emptyDescription="Create an event to start building this stable schedule."
        />
      </DashboardSectionCard>
    </DashboardPage>
  )
}
