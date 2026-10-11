import { useState } from 'react'
import { useMutation } from 'convex/react'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '#/components/ui/field'
import { Switch } from '#/components/ui/switch'
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
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
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
  const setReminderDigest = useMutation(api.users.setReminderDigest)
  const [savingDigest, setSavingDigest] = useState(false)
  const { data: profile } = useSuspenseQuery(
    convexQuery(api.onboarding.getAccountProfile),
  )

  if (!profile) return null
  const digestTimezone =
    profile.reminderDigestTimezone ??
    profile.timezone ??
    Intl.DateTimeFormat().resolvedOptions().timeZone
  const updateDigest = async (enabled: boolean) => {
    setSavingDigest(true)
    try {
      await setReminderDigest({ enabled, timezone: digestTimezone })
      showAppSuccessToast({ title: t('profile.digestSaved') })
    } catch {
      showAppErrorToast({ title: t('profile.digestError') })
    } finally {
      setSavingDigest(false)
    }
  }

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
        title={t('profile.notifications')}
        contentGap="comfortable"
      >
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel id="care-digest-label" htmlFor="care-digest">
              {t('profile.digestLabel')}
            </FieldLabel>
            <FieldDescription id="care-digest-description">
              {t('profile.digestDescription', { timezone: digestTimezone })}
            </FieldDescription>
          </FieldContent>
          <Switch
            id="care-digest"
            aria-describedby="care-digest-description"
            checked={profile.reminderDigestEnabled ?? false}
            disabled={savingDigest}
            onCheckedChange={updateDigest}
          />
        </Field>
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
