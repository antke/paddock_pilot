import { CheckIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react'
import type { ComponentProps, CSSProperties } from 'react'

import { cn } from '#/lib/utils'

export type OnboardingStepStatus =
  | 'completed'
  | 'current'
  | 'upcoming'
  | 'deferred'

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
  return (
    <nav
      aria-label="Onboarding progress"
      data-slot="onboarding-stepper"
      className={cn(
        'overflow-hidden rounded-card border border-border',
        className,
      )}
      {...props}
    >
      <ol
        className="grid bg-card sm:grid-cols-[repeat(var(--step-count),minmax(0,1fr))]"
        style={{ '--step-count': steps.length } as CSSProperties}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.status === 'current' ? 'step' : undefined}
            data-status={step.status}
            className={cn(
              'relative flex min-w-0 items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0',
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
              className="contents disabled:pointer-events-none"
              onClick={() => onStepSelect?.(step)}
            >
              <StepMarker index={index} status={step.status} />
              <span className="grid min-w-0 gap-0.5 text-left">
                <span
                  className={cn(
                    'truncate text-sm font-semibold',
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
        'grid size-8 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold',
        status === 'current' &&
          'border-primary bg-primary text-primary-foreground',
        status === 'completed' &&
          'border-success/30 bg-success/15 text-success',
        status === 'deferred' &&
          'border-border bg-surface-muted text-muted-foreground',
        status === 'upcoming' && 'border-border bg-card text-muted-foreground',
      )}
    >
      {status === 'completed' ? (
        <CheckIcon className="size-4" weight="bold" />
      ) : status === 'deferred' ? (
        <ClockCounterClockwiseIcon className="size-4" />
      ) : (
        String(index + 1).padStart(2, '0')
      )}
    </span>
  )
}

function StepStatusLabel({ status }: { status: OnboardingStepStatus }) {
  if (status === 'current') return null

  const labels = {
    completed: 'Complete',
    deferred: 'Done later',
    upcoming: 'Up next',
  } satisfies Record<Exclude<OnboardingStepStatus, 'current'>, string>

  return <span className="text-xs text-muted-foreground">{labels[status]}</span>
}
