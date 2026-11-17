import { StateFeedback } from '#/components/motion/StateFeedback'
import { useT } from '#/i18n/LocaleProvider'
import {
  CaretDownIcon,
  CheckIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react'
import { useId, useState } from 'react'
import type { ComponentProps } from 'react'

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
      className={className}
      {...props}
    >
      {current && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={listId}
          className="app-control-focus flex min-h-11 w-full items-center gap-2 rounded-control text-left sm:hidden"
          onClick={() => setExpandedStep(expanded ? undefined : current.id)}
        >
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {currentIndex + 1} / {steps.length}
          </span>
          <span className="min-w-0 text-sm font-semibold">{current.label}</span>
          <CaretDownIcon
            aria-hidden="true"
            className={cn('size-4 shrink-0', expanded && 'rotate-180')}
          />
        </button>
      )}
      {/* Unboxed: the marker and label weight carry the state; captions stay for screen readers. */}
      <ol
        id={listId}
        className={cn(
          'gap-x-5 gap-y-1 sm:flex sm:flex-wrap',
          current && !expanded ? 'hidden' : 'grid',
        )}
      >
        {steps.map((step, index) => (
          <li
            key={step.id}
            aria-current={step.status === 'current' ? 'step' : undefined}
            data-status={step.status}
            className="min-w-0"
          >
            <button
              type="button"
              disabled={
                !onStepSelect ||
                (step.status !== 'completed' && step.status !== 'deferred')
              }
              className="app-choice-feedback app-control-focus -mx-1.5 flex min-h-11 min-w-0 items-center gap-2 rounded-control px-1.5 text-left outline-none enabled:hover:bg-surface-muted disabled:pointer-events-none"
              onClick={() => {
                setExpandedStep(undefined)
                onStepSelect?.(step)
              }}
            >
              <StepMarker index={index} status={step.status} />
              <span
                className={cn(
                  'break-words text-sm',
                  step.status === 'current'
                    ? 'font-semibold text-foreground'
                    : step.status === 'completed'
                      ? 'text-foreground'
                      : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
              <StepStatusLabel status={step.status} />
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
        'grid size-6 shrink-0 place-items-center rounded-full border font-sans text-xs leading-none font-semibold tabular-nums',
        status === 'current' &&
          'border-primary bg-primary text-primary-foreground',
        status === 'completed' &&
          'border-transparent bg-success/15 text-success',
        status === 'deferred' && 'border-transparent text-muted-foreground',
        status === 'upcoming' && 'border-border text-muted-foreground',
      )}
    >
      <StateFeedback value={status}>
        {status === 'completed' ? (
          <CheckIcon className="size-3.5" weight="bold" />
        ) : status === 'deferred' ? (
          <ClockCounterClockwiseIcon className="size-4" />
        ) : (
          index + 1
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

  return <span className="sr-only">{labels[status]}</span>
}
