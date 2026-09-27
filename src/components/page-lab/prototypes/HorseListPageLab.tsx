import { HorseListPage } from '#/components/horses/HorseListPage'
import type { DashboardLabData } from '#/components/dashboard-lab/dashboardLabTypes'
import { useState } from 'react'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { DetailStack } from '#/components/dashboard/DetailBlocks'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

type HorseListPageLabProps = {
  data: DashboardLabData
}

export function HorseListPageLab({ data }: HorseListPageLabProps) {
  const fixtureMode = useDevAuthBypassEnabled()
  const [sample, setSample] = useState('standard')
  const base = data.horses[0]
  const horses =
    !fixtureMode || sample === 'standard'
      ? data.horses
      : sample === 'empty' || !base
        ? []
        : Array.from({ length: 50 }, (_, index) => ({
            ...base,
            _id: `${base._id}-sample-${index}` as typeof base._id,
            name:
              index % 5 === 0
                ? `Juniper of the Northern Pastures and Cedar Ridge ${index + 1}`
                : `Sample horse ${index + 1}`,
            ownerName: 'Alexandra and Christopher Montgomery',
          }))
  return (
    <DetailStack gap="loose">
      {fixtureMode && (
        <Field>
          <FieldLabel htmlFor="horse-list-sample">Sample roster</FieldLabel>
          <Select
            id="horse-list-sample"
            value={sample}
            onChange={(event) => setSample(event.target.value)}
          >
            <option value="standard">Standard sample</option>
            <option value="busy">50 horses, including long names</option>
            <option value="empty">Empty stable</option>
          </Select>
        </Field>
      )}
      <HorseListPage horses={horses} stableId={data.stable._id} />
    </DetailStack>
  )
}
