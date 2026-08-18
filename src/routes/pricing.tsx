import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
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
        title="Choose your plan"
        description="Personal Plus unlocks stable member access and horse management. Personal Pro adds the premium Analysis Centre, printable care summaries, and document storage."
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
      title="Personal Pro"
      description="The billing table is not available in this environment. Use this preview to keep the pricing page aligned with the app design while billing is configured."
      badges={<Badge variant="secondary">Preview</Badge>}
      contentGap="comfortable"
      contentTextSize="sm"
      footer={
        <ButtonLink to="/sign-up/$" variant="secondary">
          Start setup
        </ButtonLink>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Care records', 'Track reminders, visits, notes, and outcomes.'],
          ['Stable team', 'Coordinate owners, providers, and members.'],
          [
            'Analysis centre',
            'Review care gaps, cadence, and printable summaries.',
          ],
        ].map(([title, description]) => (
          <div key={title} className="grid gap-1">
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </DashboardSectionCard>
  )
}
