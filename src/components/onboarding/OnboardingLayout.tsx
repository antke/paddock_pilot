import { ArrowLeftIcon, SparkleIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { OnboardingStepper } from './OnboardingStepper'
import type { OnboardingStep } from './OnboardingStepper'

type OnboardingLayoutProps = {
  children: ReactNode
  description: ReactNode
  optional?: boolean
  onBack?: () => void
  onStepSelect?: (step: OnboardingStep) => void
  pageDescription: ReactNode
  pageTitle: ReactNode
  steps: Array<OnboardingStep>
  title: ReactNode
}

export function OnboardingLayout({
  children,
  description,
  optional = false,
  onBack,
  onStepSelect,
  pageDescription,
  pageTitle,
  steps,
  title,
}: OnboardingLayoutProps) {
  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          onBack ? (
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeftIcon aria-hidden="true" />
              Back
            </Button>
          ) : undefined
        }
      />

      <OnboardingStepper steps={steps} onStepSelect={onStepSelect} />

      <DashboardSectionCard
        title={title}
        description={description}
        badges={optional ? <Badge variant="secondary">Optional</Badge> : null}
        contentGap="comfortable"
      >
        {children}
      </DashboardSectionCard>
    </DashboardPage>
  )
}

export function OnboardingLaterNote({ children }: { children: ReactNode }) {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <SparkleIcon aria-hidden="true" />
      <AlertTitle>You can do this later</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
