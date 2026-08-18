import { useState } from 'react'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CircleIcon,
  GearIcon,
  UserCircleIcon,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'

import { DashboardPercentBadge } from '#/components/dashboard/DashboardBadges'
import {
  DashboardItemCardContent,
  DashboardItemLinkCard,
  DashboardItemList,
  DashboardItemRecordCard,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { Button, ButtonLink } from '#/components/ui/button'
import { FieldPanel } from '#/components/ui/field'
import { Progress } from '#/components/ui/progress'
import type { api } from 'convex/_generated/api'
import { StableMemberRoleBadge, StableSetupStatusBadge } from './StableBadges'
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
}

export function OwnerStableWelcomePage({
  stable,
  horseCount,
  memberCount,
  invitationCount,
  providerCount,
}: OwnerWelcomePageProps) {
  const hasStableDetails = Boolean(
    stable.contactName ||
    stable.contactPhone ||
    stable.emergencyPhone ||
    stable.yardRules ||
    stable.openingHours,
  )
  const steps = [
    {
      title: 'Add operational stable details',
      description: 'Contact information, opening hours and yard rules.',
      complete: hasStableDetails,
      actionLabel: hasStableDetails ? 'Review details' : 'Add details',
      to: '/stables/$stableId/edit' as const,
    },
    {
      title: 'Add the first horse',
      description: 'Create the first horse record for this stable.',
      complete: horseCount > 0,
      actionLabel: horseCount > 0 ? 'View horses' : 'Add horse',
      to:
        horseCount > 0
          ? ('/stables/$stableId/horses' as const)
          : ('/stables/$stableId/horses/create' as const),
    },
    {
      title: 'Invite the first member',
      description: 'Invite by email, then track delivery and acceptance.',
      complete: memberCount > 0 || invitationCount > 0,
      actionLabel: memberCount > 0 ? 'Manage members' : 'Invite member',
      to: '/stables/$stableId/settings' as const,
      search: { tab: 'members' as const },
    },
    {
      title: 'Add a trusted provider',
      description: 'Keep vet, farrier and other service contacts close.',
      complete: providerCount > 0,
      actionLabel: providerCount > 0 ? 'View providers' : 'Add provider',
      to: '/stables/$stableId/settings' as const,
      search: { tab: 'providers' as const },
    },
  ]

  return (
    <StableWelcomeLayout
      stable={stable}
      title="Your stable is ready"
      description="Set up the few things that make day-to-day coordination work. You can return to this checklist at any time."
      role="owner"
      steps={steps}
    />
  )
}

export function MemberStableWelcomePage({
  stable,
  member,
  ownHorseCount,
}: MemberWelcomePageProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(
    !member.phone || !member.emergencyContact,
  )
  const hasMemberDetails = Boolean(member.phone && member.emergencyContact)
  const steps = [
    {
      title: 'Complete your yard profile',
      description: 'Add a phone number and an emergency contact for the owner.',
      complete: hasMemberDetails,
      customAction: (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditingDetails((value) => !value)}
        >
          {isEditingDetails ? 'Hide form' : 'Edit details'}
        </Button>
      ),
    },
    {
      title: 'Add your first horse',
      description: 'Your horses unlock event planning and care records.',
      complete: ownHorseCount > 0,
      actionLabel: ownHorseCount > 0 ? 'View horses' : 'Add your horse',
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
        title={`Welcome to ${stable.name}`}
        description="You’re connected as a member. Complete your own setup, then you can coordinate events involving your horses with other members."
        role="member"
        steps={steps}
      />

      {isEditingDetails && (
        <DashboardSectionCard
          title="Your private yard details"
          description="Only you and the stable owner can maintain these details."
        >
          <FieldPanel>
            <StableMemberDetailsForm
              member={member}
              onCancel={() => setIsEditingDetails(false)}
              onSaved={() => setIsEditingDetails(false)}
            />
          </FieldPanel>
        </DashboardSectionCard>
      )}

      <DashboardSectionCard
        title="Know your stable"
        description="These are useful reference points once your setup is complete."
        contentLayout="twoColumn"
      >
        <WelcomeLinkCard
          icon={<GearIcon />}
          title="Stable overview"
          description="Read contact details, opening hours and yard rules."
          to="/stables/$stableId"
          stableId={stable._id}
        />
        <WelcomeLinkCard
          icon={<UserCircleIcon />}
          title="Stable people"
          description="See the owner and the members you can coordinate with."
          to="/stables/$stableId/members"
          stableId={stable._id}
        />
      </DashboardSectionCard>
    </>
  )
}

type WelcomeStep = {
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
  const completedCount = steps.filter((step) => step.complete).length
  const completionPercent = Math.round((completedCount / steps.length) * 100)

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
            Open stable
            <ArrowRightIcon />
          </ButtonLink>
        }
      />

      <DashboardSectionCard
        title="Getting started"
        description={`${completedCount} of ${steps.length} setup steps complete`}
        badges={
          <DashboardPercentBadge
            value={completionPercent}
            variant={completedCount === steps.length ? 'success' : 'neutral'}
          />
        }
        contentGap="comfortable"
      >
        <Progress
          value={completedCount}
          max={steps.length}
          label={`${completedCount} of ${steps.length} setup steps complete`}
        />
        <DashboardItemList gap="compact">
          {steps.map((step) => (
            <WelcomeStepRow
              key={step.title}
              step={step}
              stableId={stable._id}
            />
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
  const action =
    step.customAction ??
    (step.to && step.actionLabel ? (
      <ButtonLink
        to={step.to}
        params={{ stableId }}
        search={step.search}
        variant="outline"
        size="sm"
      >
        {step.actionLabel}
      </ButtonLink>
    ) : undefined)

  return (
    <DashboardItemRecordCard
      chrome="soft"
      density="compact"
      actionBadges={<StableSetupStatusBadge complete={step.complete} />}
      actions={action}
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
  icon,
  title,
  description,
  to,
  stableId,
}: {
  icon: ReactNode
  title: string
  description: string
  to: '/stables/$stableId' | '/stables/$stableId/members'
  stableId: Stable['_id']
}) {
  return (
    <DashboardItemLinkCard
      to={to}
      params={{ stableId }}
      chrome="soft"
      density="compact"
    >
      <DashboardItemCardContent
        title={title}
        titleSize="sm"
        titleTone="open"
        leading={
          <span className="text-primary [&_svg]:size-5" aria-hidden="true">
            {icon}
          </span>
        }
        meta={<span>{description}</span>}
      />
    </DashboardItemLinkCard>
  )
}
