import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { RouteQueryErrorAlert } from '#/components/layout/RouteStatusAlert'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { AccountProfileForm } from '#/components/onboarding/AccountProfileForm'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
  errorComponent: ProfileError,
})

function ProfileRoute() {
  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title="Sign in to edit your profile"
          description="Your profile follows you across the stables you own and join."
        />
      }
      signedIn={<ProfilePage />}
    />
  )
}

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(
    convexQuery(api.onboarding.getAccountProfile),
  )

  if (!profile) return null

  return (
    <DashboardPage>
      <DashboardPageHeader title="Your profile" />

      <DashboardSectionCard title="Profile details" contentGap="comfortable">
        <AccountProfileForm
          initialValues={{
            displayName: profile.displayName,
            phone: profile.phone,
            profileImageUrl: profile.profileImageUrl,
          }}
          submitLabel="Save profile"
          onSaved={() => showAppSuccessToast({ title: 'Profile updated' })}
        />
      </DashboardSectionCard>
    </DashboardPage>
  )
}

function ProfileError({ reset }: ErrorComponentProps) {
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title="Your profile couldn’t load"
      description="Check your connection, then try again. Your profile has not been changed."
      width="narrow"
    />
  )
}
