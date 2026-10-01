import { useT } from '#/i18n/LocaleProvider'
import type { TFunction } from 'i18next'
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
  { renderPricingTable: (attempt: number) => ReactNode; t: TFunction<'app'> },
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
    const t = this.props.t
    return (
      <div
        ref={this.region}
        role="region"
        aria-label={t('pricing.options')}
        tabIndex={-1}
      >
        {this.state.hasError ? (
          <DashboardSectionCard
            title={t('pricing.errorTitle')}
            description={t('pricing.errorDescription')}
            footer={
              <Button
                onClick={() =>
                  this.setState((state) => ({
                    hasError: false,
                    attempt: state.attempt + 1,
                  }))
                }
              >
                {t('pricing.retry')}
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
  const t = useT()
  const invitationPath = getInvitationReturnPath(returnTo)
  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title={t('navigation.plans')}
        description={
          billingEnabled
            ? t('pricing.description')
            : t('pricing.testingDescription')
        }
        className="text-center"
        contentLayout="center"
        headingClassName="justify-items-center"
      />
      {billingEnabled ? (
        <PricingTableBoundary t={t} renderPricingTable={renderPricingTable} />
      ) : (
        <PricingFallback />
      )}
      {invitationPath && (
        <DashboardActions align="center">
          <ButtonAnchor href={invitationPath} variant="outline">
            {t('pricing.return')}
          </ButtonAnchor>
        </DashboardActions>
      )}
    </DashboardPage>
  )
}

function PricingFallback() {
  const t = useT()
  return (
    <DashboardSectionCard
      title={t('pricing.testingTitle')}
      description={t('pricing.testingAccess')}
      badges={<Badge variant="secondary">{t('pricing.included')}</Badge>}
      contentGap="comfortable"
      contentTextSize="sm"
      footer={<ButtonLink to="/sign-up/$">{t('pricing.start')}</ButtonLink>}
    >
      <DashboardLayoutGrid variant="thirdsCompact">
        {[
          [t('pricing.care'), t('pricing.careDescription')],
          [t('pricing.team'), t('pricing.teamDescription')],
          [t('pricing.analysis'), t('pricing.analysisDescription')],
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
