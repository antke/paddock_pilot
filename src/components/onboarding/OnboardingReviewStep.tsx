import { useLocale, useT } from '#/i18n/LocaleProvider'
import { formatMediumDateKey, formatMonthYearDateKey } from '#/lib/dateDisplay'
import type { Locale } from 'shared/i18n/locale'
import { getEffectiveInvitationStatus } from 'shared/stableInvitations/invitationState'
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  HorseIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import type { Doc } from 'convex/_generated/dataModel'
import type { ReactNode } from 'react'

import { DashboardActions } from '#/components/dashboard/DashboardActions'
import { DashboardInlineHeader } from '#/components/dashboard/DashboardInlineHeader'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { TextLabel } from '#/components/ui/text-label'
import type { OnboardingRole, OnboardingStepId } from './onboardingSteps'

type Profile = {
  displayName: string
  phone?: string
  profileImageUrl?: string | null
}

export function OnboardingReviewStep({
  horse,
  invitations,
  member,
  onComplete,
  onEdit,
  profile,
  role,
  stable,
}: {
  horse?: Doc<'horses'>
  invitations: Array<Doc<'stableInvitations'>>
  member: Doc<'stableMembers'> | null
  onComplete: () => void | Promise<void>
  onEdit: (step: OnboardingStepId) => void
  profile: Profile
  role: OnboardingRole
  stable: Doc<'stables'>
}) {
  const t = useT()
  const { locale } = useLocale()

  const pendingInvitations = invitations.filter(
    (invitation) => getEffectiveInvitationStatus(invitation) === 'pending',
  )
  return (
    <div className="grid gap-5">
      <Alert role="note">
        <CheckCircleIcon aria-hidden="true" />
        <AlertTitle>{t('onboarding.reviewTitle')}</AlertTitle>
        <AlertDescription>
          {t('onboarding.reviewHelp', { name: stable.name })}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <ReviewSection title={t('onboarding.aboutYou')}>
          <ReviewField
            label={t('onboarding.preferredName')}
            value={profile.displayName}
            onEdit={() => onEdit('account-profile')}
          />
          <ReviewField
            label={t('onboarding.phoneNumber')}
            value={profile.phone || t('onboarding.notAdded')}
            onEdit={() => onEdit('account-profile')}
          />
          <ReviewField
            label={t('onboarding.profileImage')}
            value={
              profile.profileImageUrl
                ? t('onboarding.added')
                : t('onboarding.notAdded')
            }
            onEdit={() => onEdit('account-profile')}
          />
        </ReviewSection>

        <ReviewSection title={t('onboarding.stable')}>
          <ReviewField
            label={t('onboarding.stableName')}
            value={stable.name}
            onEdit={
              role === 'owner' ? () => onEdit('stable-basics') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.location')}
            value={stable.location}
            onEdit={
              role === 'owner' ? () => onEdit('stable-basics') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.primaryContact')}
            value={stable.contactName || t('onboarding.notAdded')}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.contactPhone')}
            value={stable.contactPhone || t('onboarding.notAdded')}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.emergencyPhone')}
            value={stable.emergencyPhone || t('onboarding.notAdded')}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.openingHours')}
            value={stable.openingHours || t('onboarding.notAdded')}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label={t('onboarding.yardRules')}
            value={stable.yardRules || t('onboarding.notAdded')}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
        </ReviewSection>

        {role === 'member' && member && (
          <ReviewSection title={t('onboarding.yourStableDetails')}>
            <ReviewField
              label={t('onboarding.phoneNumber')}
              value={member.phone || t('onboarding.notAdded')}
              onEdit={() => onEdit('member-details')}
            />
            <ReviewField
              label={t('onboarding.emergencyContact')}
              value={member.emergencyContact || t('onboarding.notAdded')}
              onEdit={() => onEdit('member-details')}
            />
          </ReviewSection>
        )}

        <ReviewSection title={t('onboarding.firstHorse')}>
          <ReviewField
            label={t('onboarding.horseName')}
            value={horse?.name || t('onboarding.notAdded')}
            onEdit={() => onEdit('first-horse')}
          />
          <ReviewField
            label={t('onboarding.birthDate')}
            value={formatBirthDate(t, locale, horse?.dateOfBirth)}
            onEdit={() => onEdit('first-horse')}
          />
          <ReviewField
            label={t('onboarding.currentAge')}
            value={
              horse
                ? t('onboarding.age', { count: horse.age })
                : t('onboarding.notProvided')
            }
            onEdit={() => onEdit('first-horse')}
          />
        </ReviewSection>

        {role === 'owner' && (
          <ReviewSection title={t('onboarding.yourTeam')}>
            <ReviewField
              label={t('onboarding.pendingInvitations')}
              value={
                pendingInvitations.length > 0
                  ? pendingInvitations
                      .map((invitation) => invitation.email)
                      .join('\n')
                  : t('onboarding.noPendingInvitations')
              }
              onEdit={() => onEdit('invite-team')}
            />
          </ReviewSection>
        )}
      </div>

      <NextSteps role={role} />

      <DashboardActions align="end">
        <Button type="button" onClick={onComplete}>
          {t('onboarding.openStable', { name: stable.name })}
        </Button>
      </DashboardActions>
    </div>
  )
}

function formatBirthDate(
  t: ReturnType<typeof useT>,
  locale: Locale,
  dateOfBirth?: string,
) {
  if (!dateOfBirth) return t('onboarding.notProvided')
  const parts = dateOfBirth.split('-')
  if (parts.length === 1) return t('onboarding.yearOnly', { date: dateOfBirth })
  if (parts.length === 2)
    return t('onboarding.dayNotProvided', {
      date: formatMonthYearDateKey(`${dateOfBirth}-01`, locale),
    })
  return formatMediumDateKey(dateOfBirth, locale)
}

function ReviewSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="grid gap-2">
      <div className="border-b border-border-subtle pb-2">
        <DashboardInlineHeader as="h3" title={title} titleSize="sm" />
      </div>
      <dl>{children}</dl>
    </section>
  )
}

function ReviewField({
  label,
  onEdit,
  value,
}: {
  label: string
  onEdit?: () => void
  value: ReactNode
}) {
  const t = useT()
  return (
    <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(7rem,0.7fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <TextLabel as="dt">{label}</TextLabel>
      <dd className="col-start-1 min-w-0 break-words whitespace-pre-wrap text-sm font-medium sm:col-start-auto">
        {value}
      </dd>
      {onEdit && (
        <Button
          type="button"
          action="edit"
          variant="ghost"
          size="icon-sm"
          className="col-start-2 row-start-1 sm:col-start-3"
          aria-label={t('onboarding.editField', { field: label })}
          onClick={onEdit}
        />
      )}
    </div>
  )
}

function NextSteps({ role }: { role: OnboardingRole }) {
  const t = useT()

  const items: Array<{
    description: string
    icon: ReactNode
    title: string
  }> =
    role === 'owner'
      ? [
          {
            title: t('onboarding.growRecords'),
            description: t('onboarding.growRecordsHelp'),
            icon: <HorseIcon />,
          },
          {
            title: t('onboarding.inviteTeam'),
            description: t('onboarding.manageMembersHelp'),
            icon: <UsersThreeIcon />,
          },
          {
            title: t('onboarding.planActivity'),
            description: t('onboarding.planActivityHelp'),
            icon: <CalendarCheckIcon />,
          },
        ]
      : [
          {
            title: t('onboarding.keepCurrent'),
            description: t('onboarding.keepCurrentHelp'),
            icon: <HorseIcon />,
          },
          {
            title: t('onboarding.knowTeam'),
            description: t('onboarding.knowTeamHelp'),
            icon: <UsersThreeIcon />,
          },
          {
            title: t('onboarding.coordinateEvents'),
            description: t('onboarding.coordinateEventsHelp'),
            icon: <CalendarCheckIcon />,
          },
        ]

  return (
    <DashboardItemList gap="compact">
      {items.map((item) => (
        <DashboardItemRecordCard
          key={item.title}
          chrome="flat"
          density="compact"
        >
          <DashboardItemCardContent
            leading={
              <span className="text-primary [&_svg]:size-5" aria-hidden="true">
                {item.icon}
              </span>
            }
            title={item.title}
            meta={item.description}
            titleSize="sm"
          />
        </DashboardItemRecordCard>
      ))}
    </DashboardItemList>
  )
}
