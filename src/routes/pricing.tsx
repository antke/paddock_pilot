import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DetailTextBlock } from '#/components/dashboard/DetailBlocks'
import { Badge } from '#/components/ui/badge'
import { ButtonAnchor, ButtonLink } from '#/components/ui/button'
import { PricingTable } from '@clerk/tanstack-react-start'
import { createFileRoute } from '@tanstack/react-router'
import { Component } from 'react'
import type { ReactNode } from 'react'

const shouldRenderClerkPricing =
  import.meta.env.VITE_CLERK_BILLING_ENABLED === 'true'

export const Route = createFileRoute('/pricing')({
  validateSearch: (search: Record<string, unknown>): { returnTo?: string } => ({
    returnTo:
      typeof search.returnTo === 'string' && search.returnTo.startsWith('/')
        ? search.returnTo
        : undefined,
  }),
  component: PricingPage,
})

type PricingTableBoundaryState = {
  hasError: boolean
}

class PricingTableBoundary extends Component<
  { children: ReactNode },
  PricingTableBoundaryState
> {
  state: PricingTableBoundaryState = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn(
        'Pricing table unavailable; showing pricing fallback.',
        error,
      )
    }
  }

  render() {
    if (this.state.hasError) {
      return <PricingFallback />
    }

    return this.props.children
  }
}

function PricingPage() {
  const { returnTo } = Route.useSearch()

  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title="Plans"
        description="Stable operations are available to every member during testing. When billing launches, the premium plan will add the Analysis Centre; all other current features remain part of the core product."
        className="text-center"
        contentLayout="center"
        headingClassName="justify-items-center"
      />
      {shouldRenderClerkPricing ? (
        <PricingTableBoundary>
          <PricingTable />
        </PricingTableBoundary>
      ) : (
        <PricingFallback />
      )}
      {returnTo && (
        <DashboardActions align="center">
          <ButtonAnchor href={returnTo} variant="outline">
            Return to invitation
          </ButtonAnchor>
        </DashboardActions>
      )}
    </DashboardPage>
  )
}

function PricingFallback() {
  return (
    <DashboardSectionCard
      title="Testing access"
      description="Billing is not enabled in this environment. Testers can use every current Paddock Pilot feature without choosing a plan or entering payment details."
      badges={<Badge variant="secondary">Included</Badge>}
      contentGap="comfortable"
      contentTextSize="sm"
      footer={<ButtonLink to="/sign-up/$">Start setup</ButtonLink>}
    >
      <DashboardLayoutGrid variant="thirdsCompact">
        {[
          ['Care records', 'Track reminders, visits, notes, and outcomes.'],
          ['Stable team', 'Coordinate owners, providers, and members.'],
          [
            'Analysis centre',
            'Review care gaps, cadence, and printable summaries.',
          ],
        ].map(([title, description]) => (
          <DetailTextBlock
            key={title}
            label={title}
            labelProps={{ weight: 'semibold' }}
            bodyClassName="text-muted-foreground"
          >
            {description}
          </DetailTextBlock>
        ))}
      </DashboardLayoutGrid>
    </DashboardSectionCard>
  )
}
