import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DetailTextBlock } from '#/components/dashboard/DetailBlocks'
import { Badge } from '#/components/ui/badge'
import { Button, ButtonAnchor, ButtonLink } from '#/components/ui/button'
import { Component, createRef } from 'react'
import type { ReactNode } from 'react'
import { getInvitationReturnPath } from './invitationReturnPath'

function PricingWidget({
  renderPricingTable,
  attempt,
}: {
  renderPricingTable: (attempt: number) => ReactNode
  attempt: number
}) {
  return renderPricingTable(attempt)
}

class PricingTableBoundary extends Component<
  { renderPricingTable: (attempt: number) => ReactNode },
  { hasError: boolean; attempt: number }
> {
  state = { hasError: false, attempt: 0 }
  private region = createRef<HTMLDivElement>()
  componentDidUpdate(
    _previousProps: Readonly<{
      renderPricingTable: (attempt: number) => ReactNode
    }>,
    previousState: Readonly<{ hasError: boolean; attempt: number }>,
  ) {
    if (
      previousState.hasError !== this.state.hasError ||
      previousState.attempt !== this.state.attempt
    ) {
      this.region.current?.focus({ preventScroll: true })
      this.region.current?.scrollIntoView?.({
        behavior: 'instant',
        block: 'nearest',
      })
    }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    return (
      <div
        ref={this.region}
        role="region"
        aria-label="Plan options"
        tabIndex={-1}
      >
        {this.state.hasError ? (
          <DashboardSectionCard
            title="Plans couldn’t load"
            description="Available plans couldn’t be loaded. Try again in a moment."
            footer={
              <Button
                onClick={() =>
                  this.setState((state) => ({
                    hasError: false,
                    attempt: state.attempt + 1,
                  }))
                }
              >
                Retry loading plans
              </Button>
            }
          />
        ) : (
          <PricingWidget
            key={this.state.attempt}
            attempt={this.state.attempt}
            renderPricingTable={this.props.renderPricingTable}
          />
        )}
      </div>
    )
  }
}

export function PricingPageView({
  billingEnabled,
  returnTo,
  renderPricingTable,
}: {
  billingEnabled: boolean
  returnTo?: string
  renderPricingTable: (attempt: number) => ReactNode
}) {
  const invitationPath = getInvitationReturnPath(returnTo)
  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title="Plans"
        description={
          billingEnabled
            ? 'Review available plans and billing options.'
            : 'Stable operations are available to every member during testing. When billing launches, the premium plan will add the Analysis Centre; all other current features remain part of the core product.'
        }
        className="text-center"
        contentLayout="center"
        headingClassName="justify-items-center"
      />
      {billingEnabled ? (
        <PricingTableBoundary renderPricingTable={renderPricingTable} />
      ) : (
        <PricingFallback />
      )}
      {invitationPath && (
        <DashboardActions align="center">
          <ButtonAnchor href={invitationPath} variant="outline">
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
