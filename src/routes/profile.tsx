import { convexQuery } from '@convex-dev/react-query'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { AuthStateSwitch } from '#/components/layout/AuthStateSwitch'
import { SignedOutRoutePrompt } from '#/components/layout/SignedOutRoutePrompt'
import { AccountProfileForm } from '#/components/onboarding/AccountProfileForm'
import { showAppSuccessToast } from '#/components/ui/sonner'
import { api } from 'convex/_generated/api'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
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
      <DashboardPageHeader
        title="Your profile"
        description="Keep one identity across every stable you own or join. Stable-specific emergency details remain with each membership."
      />

      <DashboardSectionCard
        title="About you"
        description="These details help people recognise and contact you across Paddock Pilot."
        contentGap="comfortable"
      >
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
