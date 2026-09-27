import { StableCommandCenter } from '#/components/dashboard/command-center/StableCommandCenter'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useId, useState } from 'react'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import {
  createDashboardAuditSample,
  createTodayTrainingSample,
} from './dashboardAnalysisFixtures'
import type { DashboardSampleState } from './dashboardAnalysisFixtures'
import { HomeDashboardSample } from './HomeDashboardSample'

type StableDashboardPageLabProps = {
  data: DashboardLabData
}

export function StableDashboardPageLab({ data }: StableDashboardPageLabProps) {
  const fixture = useDevAuthBypassEnabled()
  const id = useId()
  const compositionId = useId()
  const [composition, setComposition] = useState('stable')
  const { today } = useLocalDateContext()
  const [scenario, setScenario] = useState<DashboardSampleState>('routine')
  if (!import.meta.env.DEV || !fixture)
    return <StableCommandCenter data={data} />
  const sample = createDashboardAuditSample(data, scenario, today)
  return (
    <>
      <DashboardInlinePanel chrome="flat">
        <Field>
          <FieldLabel htmlFor={compositionId}>Preview composition</FieldLabel>
          <Select
            id={compositionId}
            value={composition}
            onChange={(event) => setComposition(event.target.value)}
          >
            <option value="stable">Stable dashboard</option>
            <option value="home">Signed-in home</option>
          </Select>
        </Field>
        {composition === 'stable' ? (
          <>
            <Field>
              <FieldLabel htmlFor={id}>Sample dashboard</FieldLabel>
              <Select
                id={id}
                value={scenario}
                onChange={(event) =>
                  setScenario(event.target.value as DashboardSampleState)
                }
              >
                <option value="routine">Routine sample</option>
                <option value="schedule">
                  Recurring, multi-day and completed events
                </option>
                <option value="attention">
                  Urgent horses outside the first five
                </option>
                <option value="crowded">
                  50 horses, busy schedule and overdue care
                </option>
                <option value="empty">Empty stable</option>
              </Select>
            </Field>
            <p>
              Fictional records in the actual dashboard. Links lead to real app
              pages; sample IDs are not saved records.
            </p>
          </>
        ) : null}
      </DashboardInlinePanel>
      {composition === 'home' ? (
        <HomeDashboardSample data={data} />
      ) : (
        <StableCommandCenter
          key={`${data.stable._id}-${scenario}`}
          data={{
            ...sample,
            todayTraining: createTodayTrainingSample(sample, today),
          }}
        />
      )}
    </>
  )
}
