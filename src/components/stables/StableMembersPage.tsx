import { accountDisplayName } from 'shared/users/displayName'
import { useT } from '#/i18n/LocaleProvider'
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
import { EditActionButton } from '#/components/ui/edit-action'
import type { api } from 'convex/_generated/api'
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
  embedded?: boolean
  /** Owner-only membership controls; only supplied when the viewer owns the stable. */
  management?: ReactNode
  renderDetailsForm?: (
    props: ComponentProps<typeof StableMemberDetailsForm>,
  ) => ReactNode
}

export function StableMembersPage({
  stable,
  access,
  people,
  myDetails,
  embedded = false,
  management,
  renderDetailsForm = (props) => <StableMemberDetailsForm {...props} />,
}: StableMembersPageProps) {
  const t = useT()

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
      {!embedded && (
        <DashboardPageHeader
          title={t('stables.members')}
          description={t('stables.membersDescription', { name: stable.name })}
        />
      )}

      {access.role === 'owner' && management ? (
        management
      ) : (
        <DashboardLayoutGrid variant="sidebar">
          <DashboardSectionCard
            title={t('stables.directory')}
            contentGap="compact"
          >
            <DashboardItemList gap="flush">
              {people.length === 0 && (
                <DashboardEmptyState>
                  {t('stables.noMembers')}
                </DashboardEmptyState>
              )}
              {people.map((person) => {
                const name = formatPersonName(person, t)

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
            title={
              myDetails ? t('stables.yourYardProfile') : t('stables.yourRole')
            }
            description={
              myDetails
                ? t('stables.profileCurrentHelp')
                : t('stables.ownerHelp')
            }
            edit={
              myDetails && !isEditingDetails ? (
                <EditActionButton
                  ref={editButtonRef}
                  label={t('stables.editYourYardProfile')}
                  onClick={() => setIsEditingDetails(true)}
                />
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
                    label={t('stables.yardDisplayName')}
                    value={
                      myDetails.displayNameOverride || t('stables.notAdded')
                    }
                  />
                  <DetailSummaryField
                    label={t('stables.phone')}
                    value={myDetails.phone || t('stables.notAdded')}
                  />
                  <DetailSummaryField
                    label={t('stables.emergencyContact')}
                    value={myDetails.emergencyContact || t('stables.notAdded')}
                  />
                </DetailStack>
              )
            ) : null}
          </DashboardSectionCard>
        </DashboardLayoutGrid>
      )}
    </>
  )
}

function formatPersonName(
  person: StablePeople[number],
  t: ReturnType<typeof useT>,
) {
  return (
    accountDisplayName(person.user) ||
    person.membership?.displayNameOverride ||
    t('stables.memberFallback')
  )
}
