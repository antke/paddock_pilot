import { useT } from '#/i18n/LocaleProvider'
import { LanguageSelector } from '#/i18n/LanguageSelector'
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
  const t = useT()
  return (
    <AuthStateSwitch
      signedOut={
        <SignedOutRoutePrompt
          title={t('profile.signInTitle')}
          description={t('profile.signInDescription')}
        />
      }
      signedIn={<ProfilePage />}
    />
  )
}

function ProfilePage() {
  const t = useT()
  const { data: profile } = useSuspenseQuery(
    convexQuery(api.onboarding.getAccountProfile),
  )

  if (!profile) return null

  return (
    <DashboardPage>
      <DashboardPageHeader title={t('profile.title')} />

      <DashboardSectionCard
        title={t('profile.details')}
        contentGap="comfortable"
      >
        <AccountProfileForm
          initialValues={{
            displayName: profile.displayName,
            phone: profile.phone,
            profileImageUrl: profile.profileImageUrl,
          }}
          submitLabel={t('profile.save')}
          onSaved={() => showAppSuccessToast({ title: t('profile.saved') })}
        />
      </DashboardSectionCard>
      <DashboardSectionCard
        title={t('language.label')}
        contentGap="comfortable"
      >
        <p>{t('language.description')}</p>
        <div className="max-w-xs">
          <LanguageSelector />
        </div>
      </DashboardSectionCard>
    </DashboardPage>
  )
}

function ProfileError({ reset }: ErrorComponentProps) {
  const t = useT()
  return (
    <RouteQueryErrorAlert
      reset={reset}
      title={t('profile.errorTitle')}
      description={t('profile.errorDescription')}
      width="narrow"
    />
  )
}
