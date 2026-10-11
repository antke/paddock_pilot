import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import { useNavigate } from '@tanstack/react-router'
import { AccountProfileForm } from '#/components/onboarding/AccountProfileForm'
import { OnboardingPage } from '#/components/onboarding/OnboardingPage'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { RoutePending } from '#/components/layout/RoutePending'
import { Button } from '#/components/ui/button'
import { useOwnershipCopy } from './ownershipCopy'
import { useOwnershipRecoveryCopy } from './ownershipRecoveryCopy'

export function PersonalOnboarding({ returnTo }: { returnTo?: string }) {
  const c = useOwnershipCopy()
  const r = useOwnershipRecoveryCopy()
  const [mode, setMode] = useState<'personal' | 'stable' | undefined>(
    returnTo ? 'personal' : undefined,
  )
  const [profileStarted, setProfileStarted] = useState(Boolean(returnTo))
  const [stableStarted, setStableStarted] = useState(false)
  const [pending, setPending] = useState(false)
  const profile = useQuery(api.onboarding.getAccountProfile)
  const navigate = useNavigate()
  const startOption = useRef<HTMLButtonElement>(null)
  const profileRegion = useRef<HTMLDivElement>(null)
  const stableVisible = mode === 'stable' && stableStarted
  useEffect(() => {
    if (mode && !stableVisible)
      profileRegion.current?.querySelector('input')?.focus()
    else if (!mode && profileStarted) startOption.current?.focus()
  }, [mode, stableVisible, profileStarted])
  if (!profile) return <RoutePending />
  const choose = (next: 'personal' | 'stable') => {
    setMode(next)
    setProfileStarted(true)
  }
  return (
    <div className="grid gap-4">
      <DashboardSectionCard
        title={
          stableVisible ? c.stableStart : mode ? c.personalSetup : c.chooseUse
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
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground [&_[aria-current=step]]:font-semibold [&_[aria-current=step]]:text-foreground"
          >
            <li aria-current={!mode ? 'step' : undefined}>{r.chooseStep}</li>
            <li aria-current={mode && !stableVisible ? 'step' : undefined}>
              {r.profileStep}
            </li>
            <li aria-current={stableVisible ? 'step' : undefined}>
              {mode === 'stable' ? r.stableStep : r.horseStep}
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
        {mode && !returnTo && (
          <Button
            className="justify-self-start"
            variant="ghost"
            disabled={pending}
            onClick={() => setMode(undefined)}
          >
            {r.changeStart}
          </Button>
        )}
        {/* Keep the same form mounted while choosing a different starting option, including its selected photo. */}
        {profileStarted && (
          <div ref={profileRegion} hidden={!mode || stableVisible}>
            <AccountProfileForm
              initialValues={profile}
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
