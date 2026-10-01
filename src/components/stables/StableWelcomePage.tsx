import { useT } from '#/i18n/LocaleProvider'
import { useId, useState } from 'react'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CircleIcon,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'

import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import type { ButtonAction } from '#/components/ui/button'
import { Progress } from '#/components/ui/progress'
import type { api } from 'convex/_generated/api'
import { StableMemberRoleBadge } from './StableBadges'
import { StableMemberDetailsForm } from './StableMemberDetailsForm'

type Stable = NonNullable<FunctionReturnType<typeof api.stables.get>>
type StableMember = NonNullable<
  FunctionReturnType<typeof api.stableMembers.getMyDetails>
>

type OwnerWelcomePageProps = {
  stable: Stable
  horseCount: number
  memberCount: number
  invitationCount: number
  providerCount: number
}

type MemberWelcomePageProps = {
  stable: Stable
  member: StableMember
  ownHorseCount: number
  renderDetailsForm?: (props: {
    member: StableMember
    onCancel: () => void
    onSaved: () => void
  }) => ReactNode
}

export function OwnerStableWelcomePage({
  stable,
  horseCount,
  memberCount,
  invitationCount,
  providerCount,
}: OwnerWelcomePageProps) {
  const t = useT()

  const hasStableDetails = Boolean(
    stable.contactName ||
    stable.contactPhone ||
    stable.emergencyPhone ||
    stable.yardRules ||
    stable.openingHours,
  )
  const steps = [
    {
      title: t('stableSetup.operations'),
      description: t('stableSetup.operationsHelp'),
      complete: hasStableDetails,
      actionLabel: hasStableDetails
        ? t('stableSetup.reviewDetails')
        : t('stableSetup.addDetails'),
      action: hasStableDetails ? ('edit' as const) : ('create' as const),
      to: '/stables/$stableId/edit' as const,
    },
    {
      title: t('stableSetup.firstHorse'),
      description: t('stableSetup.firstHorseHelp'),
      complete: horseCount > 0,
      actionLabel:
        horseCount > 0
          ? t('stableSetup.viewHorses')
          : t('stableSetup.addHorse'),
      action: horseCount > 0 ? undefined : ('create' as const),
      to:
        horseCount > 0
          ? ('/stables/$stableId/horses' as const)
          : ('/stables/$stableId/horses/create' as const),
    },
    {
      title: t('stableSetup.firstMember'),
      description: t('stableSetup.firstMemberHelp'),
      complete: memberCount > 0 || invitationCount > 0,
      actionLabel:
        memberCount > 0
          ? t('stableSetup.manageMembers')
          : invitationCount > 0
            ? t('stableSetup.reviewInvitations')
            : t('stableSetup.inviteMember'),
      action:
        memberCount > 0 || invitationCount > 0
          ? undefined
          : ('create' as const),
      to: '/stables/$stableId/settings' as const,
      search: { tab: 'members' as const },
    },
    {
      title: t('stableSetup.firstProvider'),
      description: t('stableSetup.firstProviderHelp'),
      complete: providerCount > 0,
      actionLabel:
        providerCount > 0
          ? t('stableSetup.viewProviders')
          : t('stableSetup.addProvider'),
      action: providerCount > 0 ? undefined : ('create' as const),
      to: '/stables/$stableId/settings' as const,
      search: { tab: 'providers' as const },
    },
  ]

  return (
    <StableWelcomeLayout
      stable={stable}
      title={t('stableSetup.ownerTitle')}
      description={t('stableSetup.ownerHelp')}
      role="owner"
      steps={steps}
    />
  )
}

export function MemberStableWelcomePage({
  stable,
  member,
  ownHorseCount,
  renderDetailsForm,
}: MemberWelcomePageProps) {
  const t = useT()

  const detailsId = useId()
  const [isEditingDetails, setIsEditingDetails] = useState(
    !member.phone || !member.emergencyContact,
  )
  const hasMemberDetails = Boolean(member.phone && member.emergencyContact)
  const steps = [
    {
      title: t('stableSetup.memberProfile'),
      description: t('stableSetup.memberProfileHelp'),
      complete: hasMemberDetails,
      customAction: (
        <Button
          type="button"
          aria-expanded={isEditingDetails}
          aria-controls={isEditingDetails ? detailsId : undefined}
          action={isEditingDetails ? undefined : 'edit'}
          variant="outline"
          size="sm"
          onClick={() => setIsEditingDetails((value) => !value)}
        >
          {isEditingDetails
            ? t('stableSetup.hideForm')
            : t('stableSetup.editDetails')}
        </Button>
      ),
    },
    {
      title: t('stableSetup.ownHorse'),
      description: t('stableSetup.ownHorseHelp'),
      complete: ownHorseCount > 0,
      actionLabel:
        ownHorseCount > 0
          ? t('stableSetup.viewHorses')
          : t('stableSetup.addOwnHorse'),
      action: ownHorseCount > 0 ? undefined : ('create' as const),
      to:
        ownHorseCount > 0
          ? ('/stables/$stableId/horses' as const)
          : ('/stables/$stableId/horses/create' as const),
    },
  ]

  return (
    <>
      <StableWelcomeLayout
        stable={stable}
        title={t('stableSetup.memberTitle', { name: stable.name })}
        description={t('stableSetup.memberHelp')}
        role="member"
        steps={steps}
      />

      {isEditingDetails && (
        <DashboardSectionCard
          title={t('stableSetup.privateDetails')}
          description={t('stableSetup.privateDetailsHelp')}
        >
          <div id={detailsId}>
            {renderDetailsForm ? (
              renderDetailsForm({
                member,
                onCancel: () => setIsEditingDetails(false),
                onSaved: () => setIsEditingDetails(false),
              })
            ) : (
              <StableMemberDetailsForm
                member={member}
                onCancel={() => setIsEditingDetails(false)}
                onSaved={() => setIsEditingDetails(false)}
              />
            )}
          </div>
        </DashboardSectionCard>
      )}

      <DashboardSectionCard
        title={t('stableSetup.knowStable')}
        description={t('stableSetup.knowStableHelp')}
        contentLayout="twoColumn"
      >
        <WelcomeLinkCard
          title={t('stableSetup.overview')}
          description={t('stableSetup.overviewHelp')}
          to="/stables/$stableId"
          stableId={stable._id}
        />
        <WelcomeLinkCard
          title={t('stableSetup.people')}
          description={t('stableSetup.peopleHelp')}
          to="/stables/$stableId/members"
          stableId={stable._id}
        />
      </DashboardSectionCard>
    </>
  )
}

type WelcomeStep = {
  action?: ButtonAction
  title: string
  description: string
  complete: boolean
  actionLabel?: string
  to?:
    | '/stables/$stableId/edit'
    | '/stables/$stableId/horses'
    | '/stables/$stableId/horses/create'
    | '/stables/$stableId/settings'
  search?: { tab: 'members' | 'providers' }
  customAction?: ReactNode
}

function StableWelcomeLayout({
  stable,
  title,
  description,
  role,
  steps,
}: {
  stable: Stable
  title: string
  description: string
  role: 'owner' | 'member'
  steps: Array<WelcomeStep>
}) {
  const t = useT()

  const completedCount = steps.filter((step) => step.complete).length

  return (
    <>
      <DashboardPageHeader
        title={title}
        description={description}
        badges={<StableMemberRoleBadge role={role} />}
        actions={
          <ButtonLink
            to="/stables/$stableId"
            params={{ stableId: stable._id }}
            variant="outline"
          >
            {t('stableSetup.openStable')}
            <ArrowRightIcon />
          </ButtonLink>
        }
      />

      <DashboardSectionCard
        title={t('stableSetup.gettingStarted')}
        description={t('stableSetup.progress', {
          completed: completedCount,
          total: steps.length,
        })}
        contentGap="comfortable"
      >
        <Progress
          value={completedCount}
          max={steps.length}
          label={t('stableSetup.progress', {
            completed: completedCount,
            total: steps.length,
          })}
        />
        <DashboardItemList
          gap="flush"
          role="list"
          aria-label={t('stableSetup.checklist')}
        >
          {steps.map((step, index) => (
            <WelcomeStepRow key={index} step={step} stableId={stable._id} />
          ))}
        </DashboardItemList>
      </DashboardSectionCard>
    </>
  )
}

function WelcomeStepRow({
  step,
  stableId,
}: {
  step: WelcomeStep
  stableId: Stable['_id']
}) {
  const t = useT()

  const action =
    step.customAction ??
    (step.to && step.actionLabel ? (
      <ButtonLink
        to={step.to}
        params={{ stableId }}
        search={step.search}
        action={step.action}
        variant="outline"
        size="sm"
      >
        {step.actionLabel}
      </ButtonLink>
    ) : undefined)

  return (
    <DashboardItemRecordCard
      chrome="flat"
      density="compact"
      actions={action}
      interactive={false}
      role="listitem"
      aria-label={t('stableSetup.stepState', {
        title: step.title,
        status: step.complete
          ? t('stableSetup.complete')
          : t('stableSetup.incomplete'),
      })}
    >
      <DashboardItemCardContent
        title={step.title}
        titleSize="sm"
        leading={
          step.complete ? (
            <CheckCircleIcon
              weight="fill"
              className="size-6 text-primary"
              aria-hidden="true"
            />
          ) : (
            <CircleIcon
              className="size-6 text-muted-foreground"
              aria-hidden="true"
            />
          )
        }
        meta={<span>{step.description}</span>}
      />
    </DashboardItemRecordCard>
  )
}

function WelcomeLinkCard({
  title,
  description,
  to,
  stableId,
}: {
  title: string
  description: string
  to: '/stables/$stableId' | '/stables/$stableId/members'
  stableId: Stable['_id']
}) {
  return (
    <DashboardItemLinkCard
      to={to}
      params={{ stableId }}
      chrome="flat"
      density="compact"
    >
      <DashboardItemCardContent
        title={title}
        titleSize="sm"
        titleTone="open"
        meta={<span>{description}</span>}
      />
    </DashboardItemLinkCard>
  )
}
