import { useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { HorseTimelineView } from '#/components/horses/HorseTimelinePage'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import {
  createHorseHistorySummary,
  createHorseHistoryTimeline,
} from './horseHistoryFixtures'
import type { HorseHistoryScenario } from './horseHistoryFixtures'

export function TimelinePageLab({ data }: { data: DashboardLabData }) {
  const [scenario, setScenario] = useState<HorseHistoryScenario>('standard')
  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Horse timeline sample"
        description="Illustrative records rendered by the actual timeline. Search and record-type filters work locally; no records are changed."
      />
      <Field>
        <FieldLabel htmlFor="timeline-sample">Sample records</FieldLabel>
        <Select
          id="timeline-sample"
          value={scenario}
          onChange={(event) =>
            setScenario(event.target.value as HorseHistoryScenario)
          }
        >
          <option value="standard">All record types</option>
          <option value="empty">Empty history</option>
          <option value="long">80 records and long horse name</option>
          <option value="missing">Missing horse</option>
        </Select>
      </Field>
      <HorseTimelineView
        key={`${data.stable._id}:${scenario}`}
        timeline={createHorseHistoryTimeline(
          createHorseHistorySummary(data, scenario),
          scenario,
        )}
      />
    </DashboardPage>
  )
}
