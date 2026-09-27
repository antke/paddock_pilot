import { useState } from 'react'
import { StableListPage } from '#/components/stables/StableListPage'
import { DetailStack } from '#/components/dashboard/DetailBlocks'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'

export function StablesListPageLab({ data }: { data: DashboardLabData }) {
  const fixtureMode = useDevAuthBypassEnabled()
  const [sample, setSample] = useState('standard')
  const stables =
    !fixtureMode || sample === 'standard'
      ? data.stables
      : sample === 'empty'
        ? []
        : data.stables.map((stable) => ({
            ...stable,
            name: 'Stajnia Łąkowa — Northern Pastures Equestrian and Rehabilitation Centre',
            location:
              'Sample location: Łódź, near the northern bridleway and old orchard',
          }))
  return (
    <DetailStack gap="loose">
      {fixtureMode && (
        <Field>
          <FieldLabel htmlFor="stable-list-sample">
            Sample stable list
          </FieldLabel>
          <Select
            id="stable-list-sample"
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          >
            <option value="standard">Standard sample</option>
            <option value="long">Long names and locations</option>
            <option value="empty">No stables</option>
          </Select>
        </Field>
      )}
      <StableListPage stables={stables} />
    </DetailStack>
  )
}
