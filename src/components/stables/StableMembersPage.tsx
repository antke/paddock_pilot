import { useState } from 'react'
import { IdentificationCardIcon, PencilSimpleIcon } from '@phosphor-icons/react'
import type { FunctionReturnType } from 'convex/server'

import { DashboardItemList } from '#/components/dashboard/DashboardItemCard'
import { DashboardLayoutGrid } from '#/components/dashboard/DashboardLayoutGrid'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import {
  DetailStack,
  DetailSummaryField,
} from '#/components/dashboard/DetailBlocks'
import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { FieldPanel } from '#/components/ui/field'
import { formatCountLabel } from '#/lib/numberDisplay'
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
  access: StableAccess
  people: StablePeople
  myDetails: MyDetails
}

export function StableMembersPage({
  stable,
  access,
  people,
  myDetails,
}: StableMembersPageProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(false)

  return (
    <>
      <DashboardPageHeader
        title="Stable people"
        description={`Everyone currently connected to ${stable.name}. Contact and emergency details stay private to you and the stable owner.`}
        badges={<StableMemberRoleBadge role={access.role} />}
      />

      <DashboardLayoutGrid variant="sidebar">
        <DashboardSectionCard
          title={formatCountLabel(people.length, 'person')}
          description="The active owner and members of this stable."
          contentGap="compact"
        >
          <DashboardItemList gap="flush">
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
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDetails(true)}
              >
                <PencilSimpleIcon />
                Edit details
              </Button>
            ) : undefined
          }
        >
          {myDetails ? (
            isEditingDetails ? (
              <FieldPanel>
                <StableMemberDetailsForm
                  member={myDetails}
                  onCancel={() => setIsEditingDetails(false)}
                  onSaved={() => setIsEditingDetails(false)}
                />
              </FieldPanel>
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
            <Alert>
              <IdentificationCardIcon />
              <AlertTitle>Stable owner access</AlertTitle>
              <AlertDescription>
                Owners can invite and remove members from Stable settings.
                Member contact details are available there when operational
                access is needed.
              </AlertDescription>
            </Alert>
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
