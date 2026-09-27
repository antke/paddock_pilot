import { useId, useState } from 'react'
import { PricingPageView } from '#/components/pricing/PricingPageView'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { useDevAuthBypassEnabled } from '#/lib/devAuthBypass'

export function PricingPageLab() {
  const sampleMode = useDevAuthBypassEnabled()
  if (!import.meta.env.DEV || !sampleMode)
    return (
      <DashboardEmptyState>
        Pricing samples require development sample data.
      </DashboardEmptyState>
    )
  return <LocalPricing />
}
function LocalPricing() {
  const id = useId()
  const [scenario, setScenario] = useState('disabled')
  return (
    <div className="grid gap-6">
      <Field>
        <FieldLabel htmlFor={id}>Sample pricing state</FieldLabel>
        <Select
          id={id}
          value={scenario}
          onChange={(event) => setScenario(event.target.value)}
        >
          <option value="disabled">Billing disabled for testing</option>
          <option value="unavailable">Widget failure, then retry</option>
          <option value="ready">Local widget placeholder</option>
        </Select>
      </Field>
      <p role="status">
        Interface sample only. No billing provider, checkout or purchase is
        connected.
      </p>
      <PricingPageView
        key={scenario}
        billingEnabled={scenario !== 'disabled'}
        renderPricingTable={(attempt) => (
          <SampleWidget fail={scenario === 'unavailable' && attempt === 0} />
        )}
      />
    </div>
  )
}
function SampleWidget({ fail }: { fail: boolean }) {
  if (fail) throw new Error('Sample pricing widget unavailable')
  return (
    <DashboardSectionCard
      title="Sample plan table area"
      description="The real provider owns the plan table. This local placeholder lets you check recovery without inventing prices or connecting checkout."
    />
  )
}
