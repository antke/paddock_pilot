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
import { FieldPanel } from '#/components/ui/field'
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
  return (
    <div className="grid gap-5">
      <Alert className="border-success/25 bg-success/10">
        <CheckCircleIcon aria-hidden="true" />
        <AlertTitle>Review your setup</AlertTitle>
        <AlertDescription>
          Check the details below before opening {stable.name}. Use any pencil
          button to make a correction without losing your progress.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        <ReviewSection title="About you">
          <ReviewField
            label="Preferred name"
            value={profile.displayName}
            onEdit={() => onEdit('account-profile')}
          />
          <ReviewField
            label="Phone number"
            value={profile.phone || 'Not added'}
            onEdit={() => onEdit('account-profile')}
          />
          <ReviewField
            label="Profile image"
            value={profile.profileImageUrl ? 'Added' : 'Not added'}
            onEdit={() => onEdit('account-profile')}
          />
        </ReviewSection>

        <ReviewSection title="Stable">
          <ReviewField
            label="Stable name"
            value={stable.name}
            onEdit={
              role === 'owner' ? () => onEdit('stable-basics') : undefined
            }
          />
          <ReviewField
            label="Location"
            value={stable.location}
            onEdit={
              role === 'owner' ? () => onEdit('stable-basics') : undefined
            }
          />
          <ReviewField
            label="Primary contact"
            value={stable.contactName || 'Not added'}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label="Contact phone"
            value={stable.contactPhone || 'Not added'}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label="Emergency phone"
            value={stable.emergencyPhone || 'Not added'}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label="Opening hours"
            value={stable.openingHours || 'Not added'}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
          <ReviewField
            label="Yard rules"
            value={stable.yardRules || 'Not added'}
            onEdit={
              role === 'owner' ? () => onEdit('stable-operations') : undefined
            }
          />
        </ReviewSection>

        {role === 'member' && member && (
          <ReviewSection title="Your stable details">
            <ReviewField
              label="Phone number"
              value={member.phone || 'Not added'}
              onEdit={() => onEdit('member-details')}
            />
            <ReviewField
              label="Emergency contact"
              value={member.emergencyContact || 'Not added'}
              onEdit={() => onEdit('member-details')}
            />
          </ReviewSection>
        )}

        <ReviewSection title="First horse">
          <ReviewField
            label="Horse name"
            value={horse?.name || 'Not added'}
            onEdit={() => onEdit('first-horse')}
          />
          <ReviewField
            label="Birth date"
            value={formatBirthDate(horse?.dateOfBirth)}
            onEdit={() => onEdit('first-horse')}
          />
          <ReviewField
            label="Current age"
            value={horse ? `${horse.age} years` : 'Not provided'}
            onEdit={() => onEdit('first-horse')}
          />
        </ReviewSection>

        {role === 'owner' && (
          <ReviewSection title="Your team">
            <ReviewField
              label="Pending invitations"
              value={
                invitations.length > 0
                  ? invitations.map((invitation) => invitation.email).join('\n')
                  : 'No invitations added'
              }
              onEdit={() => onEdit('invite-team')}
            />
          </ReviewSection>
        )}
      </div>

      <NextSteps role={role} />

      <DashboardActions align="end">
        <Button type="button" onClick={onComplete}>
          Open {stable.name}
        </Button>
      </DashboardActions>
    </div>
  )
}

function formatBirthDate(dateOfBirth?: string) {
  if (!dateOfBirth) return 'Not provided'
  const parts = dateOfBirth.split('-')
  if (parts.length === 1) return `${dateOfBirth} (year only)`
  if (parts.length === 2) return `${dateOfBirth} (day not provided)`
  return dateOfBirth
}

function ReviewSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <FieldPanel className="overflow-hidden p-0">
      <div className="border-b border-border-subtle bg-surface-muted px-4 py-3">
        <DashboardInlineHeader as="h3" title={title} titleSize="sm" />
      </div>
      <dl>{children}</dl>
    </FieldPanel>
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
  return (
    <div className="grid min-h-14 grid-cols-[minmax(7rem,0.7fr)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
      <TextLabel as="dt">{label}</TextLabel>
      <dd className="min-w-0 whitespace-pre-wrap text-sm font-medium">
        {value}
      </dd>
      {onEdit && (
        <Button
          type="button"
          action="edit"
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${label.toLowerCase()}`}
          onClick={onEdit}
        />
      )}
    </div>
  )
}

function NextSteps({ role }: { role: OnboardingRole }) {
  const items: Array<{
    description: string
    icon: ReactNode
    title: string
  }> =
    role === 'owner'
      ? [
          {
            title: 'Grow the horse records',
            description: 'Add care and health details over time.',
            icon: <HorseIcon />,
          },
          {
            title: 'Bring in your team',
            description: 'Invite and manage members from Stable settings.',
            icon: <UsersThreeIcon />,
          },
          {
            title: 'Plan stable activity',
            description: 'Create events and coordinate the horses involved.',
            icon: <CalendarCheckIcon />,
          },
        ]
      : [
          {
            title: 'Keep your horses current',
            description: 'Add care and health details when ready.',
            icon: <HorseIcon />,
          },
          {
            title: 'Know the stable team',
            description: 'See who you can coordinate with around the yard.',
            icon: <UsersThreeIcon />,
          },
          {
            title: 'Coordinate events',
            description: 'Plan for your horses and invite others to join.',
            icon: <CalendarCheckIcon />,
          },
        ]

  return (
    <DashboardItemList gap="compact">
      {items.map((item) => (
        <DashboardItemRecordCard
          key={item.title}
          chrome="soft"
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
