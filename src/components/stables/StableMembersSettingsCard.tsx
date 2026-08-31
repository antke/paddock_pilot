import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'

import {
  DashboardItemList,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import {
  DashboardSectionCard,
  DashboardSectionDivider,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldHeader,
  FieldHeaderContent,
  FieldLabel,
  FieldPanel,
  FieldTitle,
} from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { formatCountLabel } from '#/lib/numberDisplay'
import { formatCommaList } from '#/lib/textDisplay'
import { StableInvitationsList } from './StableInvitationsList'
import { StableInviteForm } from './StableInviteForm'
import { StableMemberDetailsForm } from './StableMemberDetailsForm'
import { StablePersonCard } from './StablePersonCard'
import { formatStableMemberName } from './stableSettingsTypes'
import type { StableSettingsData } from './stableSettingsTypes'

export function StableMembersSettingsCard({
  stableId,
  stableName,
  members,
  invitations,
  horses,
}: {
  stableId: Doc<'stables'>['_id']
  stableName: string
  members: StableSettingsData['members']
  invitations: StableSettingsData['invitations']
  horses: StableSettingsData['horses']
}) {
  const [editingMemberId, setEditingMemberId] = useState<string>()
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  return (
    <DashboardSectionCard
      title="Members"
      description="Review who can access this stable and invite new members."
      actions={
        <CreateRecordDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          triggerLabel="Invite member"
          title="Invite member"
          description="Invite someone to help manage this stable."
        >
          <StableInviteForm
            stableId={stableId}
            onCreated={() => setIsInviteOpen(false)}
          />
        </CreateRecordDialog>
      }
      contentGap="loose"
    >
      <DashboardSubsection title="Current members" gap="compact">
        <DashboardItemList gap="compact">
          {members.map((member) => {
            const membership = member.membership
            const editableMembership =
              membership && member.role !== 'owner' ? membership : null

            return (
              <StablePersonCard
                key={membership?._id ?? 'owner'}
                name={formatStableMemberName(member)}
                photoUrl={member.user?.photoUrl}
                role={member.role}
                meta={
                  <>
                    <span>{member.user?.email ?? 'No email available'}</span>
                    {membership?.phone && <span>{membership.phone}</span>}
                    {membership?.emergencyContact && (
                      <span>Emergency: {membership.emergencyContact}</span>
                    )}
                  </>
                }
                actions={
                  editableMembership ? (
                    <>
                      <Button
                        type="button"
                        action="edit"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingMemberId(editableMembership._id)
                        }
                      >
                        Edit details
                      </Button>
                      <RemoveMemberButton
                        member={member}
                        membership={editableMembership}
                        members={members}
                        horses={horses.filter(
                          (horse) =>
                            horse.ownerId === editableMembership.userId,
                        )}
                        stableName={stableName}
                      />
                    </>
                  ) : undefined
                }
                footer={
                  membership && editingMemberId === membership._id ? (
                    <DashboardItemRecordFooter>
                      <FieldPanel>
                        <StableMemberDetailsForm
                          member={membership}
                          onCancel={() => setEditingMemberId(undefined)}
                          onSaved={() => setEditingMemberId(undefined)}
                        />
                      </FieldPanel>
                    </DashboardItemRecordFooter>
                  ) : undefined
                }
              />
            )
          })}
        </DashboardItemList>
      </DashboardSubsection>

      <DashboardSectionDivider />

      <DashboardSubsection title="Invitations">
        <StableInvitationsList invitations={invitations} />
      </DashboardSubsection>
    </DashboardSectionCard>
  )
}

function RemoveMemberButton({
  member,
  membership,
  members,
  horses,
  stableName,
}: {
  member: StableSettingsData['members'][number]
  membership: Doc<'stableMembers'>
  members: StableSettingsData['members']
  horses: Array<Doc<'horses'>>
  stableName: string
}) {
  const removeMember = useMutation(
    api.stableMembers.removeWithHorseReassignment,
  )
  const [open, setOpen] = useState(false)
  const [reassignToUserId, setReassignToUserId] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)
  const reassignmentTargets = members.filter(
    (candidate) => candidate.user && candidate.user._id !== membership.userId,
  )
  const memberName = formatStableMemberName(member)

  const onRemove = async () => {
    try {
      setIsRemoving(true)
      const result = await removeMember({
        id: membership._id,
        reassignToUserId: reassignToUserId
          ? (reassignToUserId as Doc<'users'>['_id'])
          : undefined,
      })
      setOpen(false)
      showAppSuccessToast({
        title: 'Member removed',
        description: (
          <p>
            {memberName} no longer has access to {stableName}.
            {result.reassignedHorseCount > 0 &&
              ` ${result.reassignedHorseCount} horse${result.reassignedHorseCount === 1 ? '' : 's'} reassigned.`}
          </p>
        ),
      })
    } catch {
      showAppErrorToast({
        title: 'Could not remove member',
        description: <p>Check the horse reassignment and try again.</p>,
      })
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button type="button" action="delete" variant="ghost" size="sm" />
        }
      >
        Remove
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose access to {stableName}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {horses.length > 0 && (
          <FieldPanel>
            <FieldHeader>
              <FieldHeaderContent>
                <FieldTitle>
                  Reassign {formatCountLabel(horses.length, 'horse')} first
                </FieldTitle>
                <FieldDescription>
                  {formatCommaList(horses.map((horse) => horse.name))}
                </FieldDescription>
              </FieldHeaderContent>
            </FieldHeader>
            <Field>
              <FieldLabel htmlFor={`reassign-${membership._id}`}>
                New owner
              </FieldLabel>
              <Select
                id={`reassign-${membership._id}`}
                value={reassignToUserId}
                disabled={isRemoving}
                onChange={(event) => setReassignToUserId(event.target.value)}
              >
                <option value="">Choose a stable member</option>
                {reassignmentTargets.map((candidate) => (
                  <option key={candidate.user!._id} value={candidate.user!._id}>
                    {formatStableMemberName(candidate)}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldPanel>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            action="delete"
            variant="destructive"
            disabled={isRemoving || (horses.length > 0 && !reassignToUserId)}
            aria-busy={isRemoving || undefined}
            onClick={onRemove}
          >
            {isRemoving ? 'Removing...' : 'Remove member'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
