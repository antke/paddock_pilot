import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import type { FunctionReturnType } from 'convex/server'

import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  DetailStack,
  DetailSummaryField,
} from '#/components/dashboard/DetailBlocks'
import { DashboardEmptyState } from '#/components/dashboard/DashboardEmptyState'
import { Button, ButtonLink } from '#/components/ui/button'
import type { api } from 'convex/_generated/api'
import { StableMemberRoleBadge } from './StableBadges'
import { StableMemberDetailsForm } from './StableMemberDetailsForm'
import { StablePersonCard } from './StablePersonCard'

type Stable = NonNullable<FunctionReturnType<typeof api.stables.get>>
type StableAccess = FunctionReturnType<typeof api.stables.getAccess>
type StablePeople = FunctionReturnType<typeof api.stableMembers.listByStable>
type MyDetails = FunctionReturnType<typeof api.stableMembers.getMyDetails>

type StableMembersPageProps = {
  stable: Stable
  access: Pick<StableAccess, 'role'>
  people: StablePeople
  myDetails: MyDetails
  renderDetailsForm?: (
    props: ComponentProps<typeof StableMemberDetailsForm>,
  ) => ReactNode
}

export function StableMembersPage({
  stable,
  access,
  people,
  myDetails,
  renderDetailsForm = (props) => <StableMemberDetailsForm {...props} />,
}: StableMembersPageProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const previouslyEditing = useRef(false)
  useEffect(() => {
    if (isEditingDetails)
      editorRef.current
        ?.querySelector<HTMLInputElement>('input:not(:disabled)')
        ?.focus()
    else if (previouslyEditing.current) editButtonRef.current?.focus()
    previouslyEditing.current = isEditingDetails
  }, [isEditingDetails])

  return (
    <>
      <DashboardPageHeader
        title="Members"
        description={`Everyone currently connected to ${stable.name}. Your contact and emergency details are visible only to you and the stable owner.`}
        badges={<StableMemberRoleBadge role={access.role} />}
      />

      <DashboardLayoutGrid variant="sidebar">
        <DashboardSectionCard title="Stable directory" contentGap="compact">
          <DashboardItemList gap="flush">
            {people.length === 0 && (
              <DashboardEmptyState>
                No members are listed for this stable.
              </DashboardEmptyState>
            )}
            {people.map((person) => {
              const name = formatPersonName(person)

              return (
                <StablePersonCard
                  key={person.user?._id ?? person.membership?._id}
                  name={name}
                  photoUrl={person.user?.photoUrl}
                  role={person.role}
                />
              )
            })}
          </DashboardItemList>
        </DashboardSectionCard>

        <DashboardSectionCard
          title={myDetails ? 'Your yard profile' : 'Your role'}
          description={
            myDetails
              ? 'Keep the details the owner may need around the yard up to date.'
              : 'You manage this stable and its membership.'
          }
          actions={
            myDetails && !isEditingDetails ? (
              <Button
                ref={editButtonRef}
                type="button"
                action="edit"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDetails(true)}
              >
                Edit details
              </Button>
            ) : undefined
          }
        >
          {myDetails ? (
            isEditingDetails ? (
              <div ref={editorRef}>
                {renderDetailsForm({
                  member: myDetails,
                  onCancel: () => setIsEditingDetails(false),
                  onSaved: () => setIsEditingDetails(false),
                })}
              </div>
            ) : (
              <DetailStack>
                <DetailSummaryField
                  label="Yard display name"
                  value={myDetails.displayNameOverride || 'Not added yet'}
                />
                <DetailSummaryField
                  label="Phone"
                  value={myDetails.phone || 'Not added yet'}
                />
                <DetailSummaryField
                  label="Emergency contact"
                  value={myDetails.emergencyContact || 'Not added yet'}
                />
              </DetailStack>
            )
          ) : (
            <DetailStack>
              <p>
                Invite members, update their details, and manage access from
                Stable settings.
              </p>
              <ButtonLink
                to="/stables/$stableId/settings"
                params={{ stableId: stable._id }}
                search={{ tab: 'members' }}
                size="sm"
              >
                Manage members
              </ButtonLink>
            </DetailStack>
          )}
        </DashboardSectionCard>
      </DashboardLayoutGrid>
    </>
  )
}

function formatPersonName(person: StablePeople[number]) {
  const accountName =
    person.user?.preferredName ||
    [person.user?.firstName, person.user?.lastName].filter(Boolean).join(' ')

  return (
    person.membership?.displayNameOverride || accountName || 'Stable member'
  )
}
