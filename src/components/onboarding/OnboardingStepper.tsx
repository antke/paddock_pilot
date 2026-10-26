import { StateFeedback } from '#/components/motion/StateFeedback'
import { useT } from '#/i18n/LocaleProvider'
import {
  CaretDownIcon,
  CheckIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react'
import { useId, useState } from 'react'
import type { ComponentProps, CSSProperties } from 'react'

import { cn } from '#/lib/utils'

export type OnboardingStepStatus =
  'completed' | 'current' | 'upcoming' | 'deferred'

export type OnboardingStep = {
  id: string
  label: string
  status: OnboardingStepStatus
}

type OnboardingStepperProps = Omit<ComponentProps<'nav'>, 'children'> & {
  onStepSelect?: (step: OnboardingStep) => void
  steps: Array<OnboardingStep>
}

export function OnboardingStepper({
  className,
  onStepSelect,
  steps,
  ...props
}: OnboardingStepperProps) {
  const t = useT()
  const listId = useId()
  const currentIndex = steps.findIndex((step) => step.status === 'current')
  const current = steps[currentIndex]
  const [expandedStep, setExpandedStep] = useState<string>()
  const expanded = expandedStep !== undefined && expandedStep === current?.id

  return (
    <nav
      aria-label={t('onboarding.progress')}
      data-slot="onboarding-stepper"
      className={cn(
        'overflow-hidden rounded-panel border border-border',
        className,
      )}
      {...props}
    >
      {current && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          className="app-control-focus flex min-h-14 w-full items-center gap-3 bg-card px-4 py-3 text-left sm:hidden"
          onClick={() => setExpandedStep(expanded ? undefined : current.id)}
        >
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {currentIndex + 1} / {steps.length}
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold">
            {current.label}
          </span>
          <CaretDownIcon
            aria-hidden="true"
            className={cn('size-4 shrink-0', expanded && 'rotate-180')}
          />
        </button>
      )}
      <ol
        id={listId}
        className={cn(
          'bg-card sm:grid sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]',
          current && !expanded ? 'hidden' : 'grid',
        )}
        style={{ '--step-count': steps.length } as CSSProperties}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.status === 'current' ? 'step' : undefined}
            data-status={step.status}
            className={cn(
              'relative flex min-w-0 border-b border-border-subtle last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0',
              step.status === 'current' && 'bg-primary/8',
              step.status === 'completed' && 'bg-success/6',
            )}
          >
            <button
              type="button"
              disabled={
                !onStepSelect ||
                (step.status !== 'completed' && step.status !== 'deferred')
              }
              className="app-choice-feedback app-control-focus flex min-h-16 w-full min-w-0 items-center gap-3 border border-transparent px-4 py-3 text-left outline-none ring-inset enabled:hover:bg-surface-muted disabled:pointer-events-none"
              onClick={() => {
                setExpandedStep(undefined)
                onStepSelect?.(step)
              }}
            >
              <StepMarker index={index} status={step.status} />
              <span className="grid min-w-0 gap-0.5 text-left">
                <span
                  className={cn(
                    'break-words text-sm font-semibold',
                    step.status === 'upcoming'
                      ? 'text-muted-foreground'
                      : 'text-foreground',
                  )}
                >
                  {step.label}
                </span>
                <StepStatusLabel status={step.status} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function StepMarker({
  index,
  status,
}: {
  index: number
  status: OnboardingStepStatus
}) {
  return (
    <span
      aria-hidden="true"
      data-slot="onboarding-step-marker"
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full border font-sans text-xs font-semibold tabular-nums',
        status === 'current' &&
          'border-primary bg-primary text-primary-foreground',
        status === 'completed' &&
          'border-success/30 bg-success/15 text-success',
        status === 'deferred' &&
          'border-border bg-surface-muted text-muted-foreground',
        status === 'upcoming' && 'border-border bg-card text-muted-foreground',
      )}
    >
      <StateFeedback value={status}>
        {status === 'completed' ? (
          <CheckIcon className="size-4" weight="bold" />
        ) : status === 'deferred' ? (
          <ClockCounterClockwiseIcon className="size-4" />
        ) : (
          String(index + 1).padStart(2, '0')
        )}
      </StateFeedback>
    </span>
  )
}

function StepStatusLabel({ status }: { status: OnboardingStepStatus }) {
  const t = useT()

  if (status === 'current') return null

  const labels = {
    completed: t('onboarding.complete'),
    deferred: t('onboarding.deferred'),
    upcoming: t('onboarding.upcoming'),
  } satisfies Record<Exclude<OnboardingStepStatus, 'current'>, string>

  return <span className="text-xs text-muted-foreground">{labels[status]}</span>
}
