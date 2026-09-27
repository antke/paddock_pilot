import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, AlertDescription } from '#/components/ui/alert'

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

type StableMembersSettingsCardProps = {
  stableId: Doc<'stables'>['_id']
  stableName: string
  members: StableSettingsData['members']
  invitations: StableSettingsData['invitations']
  horses: StableSettingsData['horses']
}

type InviteFormSlotProps = {
  onCreated: () => void
  onPendingChange: (pending: boolean) => void
}

type DetailsFormSlotProps = {
  member: Doc<'stableMembers'>
  onCancel: () => void
  onSaved: () => void
  onPendingChange: (pending: boolean) => void
}

export function StableMembersSettingsCard(
  props: StableMembersSettingsCardProps,
) {
  return (
    <StableMembersSettingsCardView
      stableName={props.stableName}
      members={props.members}
      horses={props.horses}
      renderInviteForm={(formProps) => (
        <StableInviteForm stableId={props.stableId} {...formProps} />
      )}
      renderDetailsForm={(formProps) => (
        <StableMemberDetailsForm {...formProps} />
      )}
      renderRemoveMember={(removeProps) => (
        <RemoveMemberButton {...removeProps} />
      )}
      invitations={<StableInvitationsList invitations={props.invitations} />}
    />
  )
}

export function StableMembersSettingsCardView({
  stableName,
  members,
  horses,
  invitations,
  renderInviteForm,
  renderDetailsForm,
  renderRemoveMember,
}: Omit<StableMembersSettingsCardProps, 'stableId' | 'invitations'> & {
  invitations: ReactNode
  renderInviteForm: (props: InviteFormSlotProps) => ReactNode
  renderDetailsForm: (props: DetailsFormSlotProps) => ReactNode
  renderRemoveMember: (props: RemoveMemberButtonProps) => ReactNode
}) {
  const [editingMemberId, setEditingMemberId] = useState<string>()
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [isSavingDetails, setIsSavingDetails] = useState(false)
  const invitePending = useRef(false)
  const editor = useRef<HTMLDivElement>(null)
  const membersSection = useRef<HTMLDivElement>(null)
  const editButtons = useRef(new Map<string, HTMLButtonElement>())
  const returnFocusTo = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (editingMemberId)
      editor.current?.querySelector<HTMLInputElement>('input')?.focus()
  }, [editingMemberId])
  useEffect(() => {
    if (!editingMemberId && !isSavingDetails && returnFocusTo.current) {
      editButtons.current.get(returnFocusTo.current)?.focus()
      returnFocusTo.current = undefined
    }
  }, [editingMemberId, isSavingDetails])
  const closeEditor = (memberId: string) => {
    returnFocusTo.current = memberId
    setEditingMemberId(undefined)
  }

  return (
    <DashboardSectionCard
      ref={membersSection}
      role="group"
      aria-label="Members"
      tabIndex={-1}
      title="Members"
      description="Review who can access this stable and invite new members."
      actions={
        <CreateRecordDialog
          open={isInviteOpen}
          onOpenChange={(open) => {
            if (!invitePending.current) setIsInviteOpen(open)
          }}
          isPending={isInviting}
          triggerLabel="Invite member"
          title="Invite member"
          description="Invite someone to help manage this stable."
        >
          {renderInviteForm({
            onCreated: () => setIsInviteOpen(false),
            onPendingChange: (pending) => {
              invitePending.current = pending
              setIsInviting(pending)
            },
          })}
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
                        ref={(element) => {
                          if (element)
                            editButtons.current.set(
                              editableMembership._id,
                              element,
                            )
                          else
                            editButtons.current.delete(editableMembership._id)
                        }}
                        disabled={isSavingDetails}
                        onClick={() =>
                          setEditingMemberId(editableMembership._id)
                        }
                      >
                        Edit details
                      </Button>
                      {renderRemoveMember({
                        member,
                        membership: editableMembership,
                        members,
                        horses: horses.filter(
                          (horse) =>
                            horse.ownerId === editableMembership.userId,
                        ),
                        stableName,
                        disabled: isSavingDetails,
                        removalFocusTarget: () => membersSection.current,
                      })}
                    </>
                  ) : undefined
                }
                footer={
                  membership && editingMemberId === membership._id ? (
                    <DashboardItemRecordFooter>
                      <div ref={editor}>
                        {renderDetailsForm({
                          member: membership,
                          onCancel: () => closeEditor(membership._id),
                          onSaved: () => closeEditor(membership._id),
                          onPendingChange: setIsSavingDetails,
                        })}
                      </div>
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
        {invitations}
      </DashboardSubsection>
    </DashboardSectionCard>
  )
}

type RemoveMemberButtonProps = {
  removalFocusTarget?: () => HTMLElement | null
  disabled?: boolean
  member: StableSettingsData['members'][number]
  membership: Doc<'stableMembers'>
  members: StableSettingsData['members']
  horses: Array<Doc<'horses'>>
  stableName: string
}

function RemoveMemberButton(props: RemoveMemberButtonProps) {
  const { member, membership, stableName } = props
  const removeMember = useMutation(
    api.stableMembers.removeWithHorseReassignment,
  )
  const memberName = formatStableMemberName(member)

  const onRemove = async (reassignToUserId?: Doc<'users'>['_id']) => {
    try {
      const result = await removeMember({
        id: membership._id,
        reassignToUserId,
      })
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
      return true
    } catch {
      showAppErrorToast({
        title: 'Could not remove member',
        description: <p>Check the horse reassignment and try again.</p>,
      })
      return false
    }
  }

  return <RemoveMemberButtonView {...props} onRemove={onRemove} />
}

export function RemoveMemberButtonView({
  member,
  membership,
  members,
  horses,
  stableName,
  onRemove,
  disabled = false,
  removalFocusTarget,
}: RemoveMemberButtonProps & {
  onRemove: (reassignToUserId?: Doc<'users'>['_id']) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [reassignToUserId, setReassignToUserId] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)
  const [removeError, setRemoveError] = useState(false)
  const removeTrigger = useRef<HTMLButtonElement>(null)
  const removalAccepted = useRef(false)
  const reassignmentTargets = members.filter(
    (candidate) => candidate.user && candidate.user._id !== membership.userId,
  )
  const memberName = formatStableMemberName(member)

  const pendingRef = useRef(false)
  const confirmRemoval = async () => {
    if (pendingRef.current || disabled) return
    pendingRef.current = true
    setIsRemoving(true)
    setRemoveError(false)
    try {
      if (
        await onRemove(
          reassignToUserId
            ? (reassignToUserId as Doc<'users'>['_id'])
            : undefined,
        )
      ) {
        removalAccepted.current = true
        setOpen(false)
      } else setRemoveError(true)
    } catch {
      setRemoveError(true)
    } finally {
      pendingRef.current = false
      setIsRemoving(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pendingRef.current) {
          setOpen(nextOpen)
          if (!nextOpen) setRemoveError(false)
          else removalAccepted.current = false
        }
      }}
    >
      <AlertDialogTrigger
        disabled={disabled || isRemoving}
        render={
          <Button
            ref={removeTrigger}
            type="button"
            action="delete"
            variant="ghost"
            size="sm"
          />
        }
      >
        Remove
      </AlertDialogTrigger>
      <AlertDialogContent
        finalFocus={() =>
          removalAccepted.current
            ? (removalFocusTarget?.() ?? removeTrigger.current)
            : removeTrigger.current?.isConnected
              ? removeTrigger.current
              : removalFocusTarget?.()
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {memberName}?</AlertDialogTitle>
          <AlertDialogDescription>
            They will immediately lose access to {stableName}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {removeError && (
          <Alert variant="destructive">
            <AlertDescription>
              Could not remove this member. Check the horse reassignment and try
              again.
            </AlertDescription>
          </Alert>
        )}
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
            onClick={() => void confirmRemoval()}
          >
            {isRemoving ? 'Removing...' : 'Remove member'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
