import { useId, useState } from 'react'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { StableAnalysisPageView } from '#/components/analysis/StableAnalysisPage'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardInlinePanel } from '#/components/dashboard/DashboardInlinePanel'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import { useLocalDateContext } from '#/lib/useLocalDateContext'
import {
  createAnalysisAuditSample,
  createDashboardAuditSample,
} from './dashboardAnalysisFixtures'

export function AnalysisPageLab({ data: base }: { data: DashboardLabData }) {
  const fixture = useDevAuthBypassEnabled()
  const id = useId()
  const { today } = useLocalDateContext()
  const [scenario, setScenario] = useState('populated')
  if (!import.meta.env.DEV || !fixture)
    return (
      <DashboardEmptyState>
        Analysis samples are available only in local fixture mode.
      </DashboardEmptyState>
    )
  const data = createDashboardAuditSample(
    base,
    scenario === 'empty'
      ? 'empty'
      : scenario === 'many'
        ? 'crowded'
        : 'schedule',
    today,
  )
  const analysis =
    scenario === 'locked'
      ? {
          hasAccess: false as const,
          requiredPlan: 'personal_pro' as const,
          stable: base.stable,
        }
      : createAnalysisAuditSample(data, today, scenario === 'empty')
  return (
    <>
      <DashboardInlinePanel chrome="flat">
        <Field>
          <FieldLabel htmlFor={id}>Sample analysis</FieldLabel>
          <Select
            id={id}
            value={scenario}
            onChange={(event) => setScenario(event.target.value)}
          >
            <option value="populated">
              Unlocked — illustrative records and care signals
            </option>
            <option value="many">Unlocked — 50 horses and busy timeline</option>
            <option value="empty">Unlocked — empty stable</option>
            <option value="locked">Locked — actual access prompt</option>
          </Select>
        </Field>
        <p>
          Fictional records in the actual analysis view. Links leave this sample
          for real app pages and may require sign-in. No plan, event or care
          record is changed.
        </p>
      </DashboardInlinePanel>
      <StableAnalysisPageView
        key={`${base.stable._id}-${scenario}`}
        analysis={analysis}
        data={data}
      />
    </>
  )
}
