import { useT } from '#/i18n/LocaleProvider'
import { ArrowLeftIcon, SparkleIcon } from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  OnboardingPendingContext,
  OnboardingTransitionError,
} from './onboardingAsync'

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
  pending?: boolean
  transitionError?: string
  onRetry?: () => void
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
  pending = false,
  transitionError,
  onRetry,
  description,
  optional = false,
  onBack,
  onStepSelect,
  pageDescription,
  pageTitle,
  steps,
  title,
}: OnboardingLayoutProps) {
  const t = useT()

  const [childPending, setChildPending] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const stepId = steps.find((step) => step.status === 'current')?.id
  const previousStepId = useRef(stepId)
  useEffect(() => {
    if (previousStepId.current !== stepId) {
      previousStepId.current = stepId
      sectionRef.current?.focus()
    }
  }, [stepId])
  const busy = pending || childPending
  const blocked = busy || Boolean(transitionError)
  return (
    <DashboardPage width="narrow">
      <DashboardPageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          onBack ? (
            <Button
              type="button"
              variant="outline"
              disabled={blocked}
              onClick={onBack}
            >
              <ArrowLeftIcon aria-hidden="true" />
              {t('onboarding.back')}
            </Button>
          ) : undefined
        }
      />

      <OnboardingStepper
        steps={steps}
        onStepSelect={blocked ? undefined : onStepSelect}
      />

      <DashboardSectionCard
        ref={sectionRef}
        tabIndex={-1}
        role="region"
        aria-label={
          typeof title === 'string' ? title : t('onboarding.currentStep')
        }
        title={title}
        description={description}
        badges={
          optional ? (
            <Badge variant="secondary">{t('onboarding.optional')}</Badge>
          ) : null
        }
        contentGap="comfortable"
      >
        {busy && (
          <p role="status" className="text-sm text-muted-foreground">
            {pending
              ? t('onboarding.continuing')
              : t('onboarding.savingStatus')}
          </p>
        )}
        <OnboardingTransitionError
          message={transitionError}
          onRetry={onRetry}
          pending={pending}
        />
        <OnboardingPendingContext.Provider value={setChildPending}>
          <fieldset disabled={blocked} aria-busy={busy} className="min-w-0">
            {children}
          </fieldset>
        </OnboardingPendingContext.Provider>
      </DashboardSectionCard>
    </DashboardPage>
  )
}

export function OnboardingLaterNote({ children }: { children: ReactNode }) {
  const t = useT()

  return (
    <Alert role="note">
      <SparkleIcon aria-hidden="true" />
      <AlertTitle>{t('onboarding.laterTitle')}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
