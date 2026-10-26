import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, ComponentType } from 'react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useNavigate } from '@tanstack/react-router'
import { AccountProfileForm } from '#/components/onboarding/AccountProfileForm'
import { OnboardingPage } from '#/components/onboarding/OnboardingPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { BackButton } from '#/components/ui/back-action'
import { Button } from '#/components/ui/button'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipRecoveryCopy } from './ownershipRecoveryCopy'

export function PersonalOnboarding({ returnTo }: { returnTo?: string }) {
  const profile = useQuery(api.onboarding.getAccountProfile)
  if (!profile) return <RoutePending />
  return <PersonalOnboardingView profile={profile} returnTo={returnTo} />
}

export function PersonalOnboardingView({
  returnTo,
  profile,
  ProfileForm = AccountProfileForm,
}: {
  returnTo?: string
  profile: ComponentProps<typeof AccountProfileForm>['initialValues']
  ProfileForm?: ComponentType<ComponentProps<typeof AccountProfileForm>>
}) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const [mode, setMode] = useState<'personal' | 'stable' | undefined>(
    returnTo ? 'personal' : undefined,
  )
  const [profileStarted, setProfileStarted] = useState(Boolean(returnTo))
  const [stableStarted, setStableStarted] = useState(false)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const startOption = useRef<HTMLButtonElement>(null)
  const profileRegion = useRef<HTMLDivElement>(null)
  const stableVisible = mode === 'stable' && stableStarted
  useEffect(() => {
    if (mode && !stableVisible)
      profileRegion.current?.querySelector('input')?.focus()
    else if (!mode && profileStarted) startOption.current?.focus()
  }, [mode, stableVisible, profileStarted])
  const choose = (next: 'personal' | 'stable') => {
    setMode(next)
    setProfileStarted(true)
  }
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      {mode && !returnTo && (
        <BackButton
          aria-label={r.changeStart}
          disabled={pending}
          onClick={() => setMode(undefined)}
        />
      )}
      <DashboardSectionCard
        title={
          stableVisible ? c.stableStart : mode ? r.profileStep : c.chooseUse
        }
        description={
          stableVisible
            ? undefined
            : returnTo
              ? r.resumeHelp
              : mode
                ? r.profileHelp
                : c.personalSetupHelp
        }
      >
        {!returnTo && (
          <ol
            aria-label={r.stepsLabel}
            className="grid grid-cols-3 gap-2 [&>li]:h-1 [&>li]:rounded-full [&>li]:bg-border-subtle [&>li[aria-current=step]]:bg-primary"
          >
            <li aria-current={!mode ? 'step' : undefined}>
              <span className="sr-only">{r.chooseStep}</span>
            </li>
            <li aria-current={mode && !stableVisible ? 'step' : undefined}>
              <span className="sr-only">{r.profileStep}</span>
            </li>
            <li aria-current={stableVisible ? 'step' : undefined}>
              <span className="sr-only">
                {mode === 'stable' ? r.stableStep : r.horseStep}
              </span>
            </li>
          </ol>
        )}
        {!mode && (
          <div className="flex flex-wrap gap-3">
            <Button ref={startOption} onClick={() => choose('personal')}>
              {c.personalStart}
            </Button>
            <Button variant="outline" onClick={() => choose('stable')}>
              {c.stableStart}
            </Button>
          </div>
        )}
        {/* Keep the same form mounted while choosing a different starting option, including its selected photo. */}
        {profileStarted && (
          <div ref={profileRegion} hidden={!mode || stableVisible}>
            <ProfileForm
              initialValues={profile}
              onboarding
              onPendingChange={setPending}
              submitLabel={
                returnTo
                  ? r.continueDestination
                  : mode === 'stable'
                    ? r.continueStable
                    : r.continueHorse
              }
              onSaved={() =>
                returnTo
                  ? navigate({ href: returnTo })
                  : mode === 'stable'
                    ? setStableStarted(true)
                    : navigate({ to: '/horses/create' })
              }
            />
          </div>
        )}
      </DashboardSectionCard>
      {stableVisible && <OnboardingPage />}
    </div>
  )
}
