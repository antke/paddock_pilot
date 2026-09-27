import { StableEventsPage } from '#/components/events/StableEventsPage'
import type { EventsView } from '#/components/events/StableEventsPage'
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
  const [view, setView] = useState<EventsView>('calendar')
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
    <div className="grid gap-6">
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
      <StableEventsPage
        stableId={data.stable._id}
        events={events}
        view={view}
        onViewChange={setView}
      />
    </div>
  )
}
