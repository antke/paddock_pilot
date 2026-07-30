import { DetailDisplayField } from '#/components/dashboard/DetailBlocks'
import {
  DashboardItemCardContent,
  DashboardItemList,
  DashboardItemRecordCard,
  DashboardItemRecordFooter,
} from '#/components/dashboard/DashboardItemCard'
import { DashboardPage } from '#/components/dashboard/DashboardPage'
import { DashboardPageHeader } from '#/components/dashboard/DashboardPageHeader'
import {
  DashboardSectionCard,
  DashboardSectionDivider,
  DashboardSubsection,
} from '#/components/dashboard/DashboardSectionCard'
import { CreateRecordDialog } from '#/components/list-layout/CreateRecordDialog'
import { Button, ButtonLink } from '#/components/ui/button'
import { FieldPanel } from '#/components/ui/field'
import { showAppErrorToast, showAppSuccessToast } from '#/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { formatLineText } from '#/lib/textDisplay'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { StableInvitationsList } from './StableInvitationsList'
import { StableInviteForm } from './StableInviteForm'
import { StableMemberRoleBadge } from './StableBadges'
import { StableMemberDetailsForm } from './StableMemberDetailsForm'
import { StableProvidersCard } from './StableProvidersCard'

type StableSettingsData = {
  stable: Doc<'stables'>
  owner: Doc<'users'> | null
  members: Array<{
    membership: Doc<'stableMembers'> | null
    user: Doc<'users'> | null
    role: Doc<'stableMembers'>['role']
  }>
  invitations: Array<Doc<'stableInvitations'>>
}

type StableSettingsPageProps = {
  settings: StableSettingsData
}

export function StableSettingsPage({ settings }: StableSettingsPageProps) {
  const { stable, owner, members } = settings
  const postalAddress = [
    stable.addressLine1,
    stable.addressLine2,
    stable.postcode,
    stable.country,
  ].filter(Boolean)

  return (
    <DashboardPage>
      <DashboardPageHeader title="Stable settings" />

      <Tabs defaultValue="overview">
        <TabsList variant="section">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardSectionCard
            title={stable.name}
            actions={
              <ButtonLink
                to="/stables/$stableId/edit"
                params={{ stableId: stable._id }}
                variant="outline"
              >
                Edit stable
              </ButtonLink>
            }
            contentLayout="twoColumn"
            contentTextSize="sm"
          >
            <DetailDisplayField
              label="Location"
              value={stable.location}
              valueWeight="normal"
            />
            <DetailDisplayField
              label="Owner"
              value={formatUserName(owner)}
              valueWeight="normal"
            />
            {postalAddress.length > 0 && (
              <DetailDisplayField
                label="Postal address"
                span="sm2"
                value={formatLineText(postalAddress)}
                valueWeight="normal"
                multiline
              />
            )}
            {stable.contactName && (
              <DetailDisplayField
                label="Contact"
                value={stable.contactName}
                valueWeight="normal"
              />
            )}
            {stable.contactPhone && (
              <DetailDisplayField
                label="Contact phone"
                value={stable.contactPhone}
                valueWeight="normal"
              />
            )}
            {stable.emergencyPhone && (
              <DetailDisplayField
                label="Emergency phone"
                value={stable.emergencyPhone}
                valueWeight="normal"
              />
            )}
            {stable.description && (
              <DetailDisplayField
                label="Description"
                span="sm2"
                value={stable.description}
                valueWeight="normal"
                multiline
              />
            )}
            {stable.openingHours && (
              <DetailDisplayField
                label="Opening hours"
                span="sm2"
                value={stable.openingHours}
                valueWeight="normal"
                multiline
              />
            )}
            {stable.yardRules && (
              <DetailDisplayField
                label="Yard rules"
                span="sm2"
                value={stable.yardRules}
                valueWeight="normal"
                multiline
              />
            )}
          </DashboardSectionCard>
        </TabsContent>

        <TabsContent value="members">
          <StableMembersCard
            stableId={stable._id}
            stableName={stable.name}
            members={members}
            invitations={settings.invitations}
          />
        </TabsContent>

        <TabsContent value="providers">
          <StableProvidersCard stableId={stable._id} />
        </TabsContent>
      </Tabs>
    </DashboardPage>
  )
}

function StableMembersCard({
  stableId,
  stableName,
  members,
  invitations,
}: {
  stableId: Doc<'stables'>['_id']
  stableName: string
  members: StableSettingsData['members']
  invitations: StableSettingsData['invitations']
}) {
  const removeMember = useMutation(api.stableMembers.remove)
  const [removingMemberId, setRemovingMemberId] = useState<string>()
  const [editingMemberId, setEditingMemberId] = useState<string>()
  const [isInviteOpen, setIsInviteOpen] = useState(false)

  const inviteDialog = (
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
  )

  const onRemoveMember = async (member: Doc<'stableMembers'>) => {
    try {
      setRemovingMemberId(member._id)
      await removeMember({ id: member._id })

      showAppSuccessToast({
        title: 'Member removed',
        description: <p>The member no longer has access to {stableName}.</p>,
      })
    } catch (err) {
      showAppErrorToast()
    } finally {
      setRemovingMemberId(undefined)
    }
  }

  return (
    <DashboardSectionCard
      title="Members"
      description="Review who can access this stable and invite new members."
      actions={inviteDialog}
      contentGap="loose"
    >
      <DashboardSubsection title="Current members" gap="compact">
        <DashboardItemList gap="flush">
          {members.map((member) => {
            const membership = member.membership
            const editableMembership =
              membership && member.role !== 'owner' ? membership : null

            return (
              <DashboardItemRecordCard
                key={membership?._id ?? 'owner'}
                chrome="soft"
                density="compact"
                actions={
                  <>
                    <StableMemberRoleBadge role={member.role} />
                    {editableMembership && (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setEditingMemberId(editableMembership._id)
                          }
                        >
                          Edit details
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={removingMemberId === editableMembership._id}
                          onClick={() => onRemoveMember(editableMembership)}
                        >
                          {removingMemberId === editableMembership._id
                            ? 'Removing...'
                            : 'Remove'}
                        </Button>
                      </>
                    )}
                  </>
                }
                actionsClassName="grid w-full grid-cols-[5rem_auto_auto] items-center justify-start gap-2 sm:w-[19rem] sm:grid-cols-[5rem_7rem_5rem]"
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
              >
                <DashboardItemCardContent
                  title={formatMemberName(member)}
                  titleSize="sm"
                  meta={
                    <>
                      <span>{member.user?.email ?? 'No email available'}</span>
                      {membership?.phone && <span>{membership.phone}</span>}
                      {membership?.emergencyContact && (
                        <span>Emergency: {membership.emergencyContact}</span>
                      )}
                    </>
                  }
                  metaSeparator="dot"
                />
              </DashboardItemRecordCard>
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

function formatUserName(user: Doc<'users'> | null) {
  if (!user) return 'Unknown'

  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}

function formatMemberName(member: StableSettingsData['members'][number]) {
  return member.membership?.displayNameOverride || formatUserName(member.user)
}
