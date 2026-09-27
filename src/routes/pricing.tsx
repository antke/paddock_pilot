import { PricingTable } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { PricingPageView } from '#/components/pricing/PricingPageView'
import { getInvitationReturnPath } from '#/components/pricing/invitationReturnPath'

export const Route = createFileRoute('/pricing')({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => ({
    returnTo: getInvitationReturnPath(search.returnTo),
  }),
  component: PricingPage,
})

function PricingPage() {
  const { returnTo } = Route.useSearch()
  return (
    <PricingPageView
      billingEnabled={import.meta.env.VITE_CLERK_BILLING_ENABLED === 'true'}
      returnTo={returnTo}
      renderPricingTable={() => <PricingTable />}
    />
  )
}
