import { Badge } from '#/components/ui/badge'
import { Button, buttonVariants } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Separator } from '#/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Link } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { StableInvitationsList } from './StableInvitationsList'
import { StableInviteForm } from './StableInviteForm'

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

const roleLabels = {
  owner: 'Owner',
  member: 'Member',
  guest: 'Guest',
} satisfies Record<Doc<'stableMembers'>['role'], string>

export function StableSettingsPage({ settings }: StableSettingsPageProps) {
  const { stable, owner, members } = settings

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold">Stable settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage {stable.name} details and people.
          </p>
        </div>

        <Link
          to="/stables/$stableId"
          params={{ stableId: stable._id }}
          className={buttonVariants({ variant: 'outline' })}
        >
          Back to stable
        </Link>
      </header>

      <Tabs defaultValue="overview" className="grid gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="grid gap-1">
                <CardTitle>{stable.name}</CardTitle>
                <CardDescription>Stable profile and ownership.</CardDescription>
              </div>
              <Link
                to="/stables/$stableId/edit"
                params={{ stableId: stable._id }}
                className={buttonVariants({ variant: 'outline' })}
              >
                Edit stable
              </Link>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <DetailItem label="Location" value={stable.location} />
              <DetailItem label="Owner" value={formatUserName(owner)} />
              {stable.description && (
                <div className="grid gap-1 sm:col-span-2">
                  <span className="text-muted-foreground">Description</span>
                  <span>{stable.description}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <StableMembersCard
            stableId={stable._id}
            stableName={stable.name}
            members={members}
            invitations={settings.invitations}
          />
        </TabsContent>
      </Tabs>
    </div>
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

  const onRemoveMember = async (member: Doc<'stableMembers'>) => {
    try {
      setRemovingMemberId(member._id)
      await removeMember({ id: member._id })

      toast.success('Member removed', {
        description: <p>The member no longer has access to {stableName}.</p>,
        position: 'top-right',
      })
    } catch (err) {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setRemovingMemberId(undefined)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          Review who can access this stable and invite new members.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-3">
          <h3 className="text-sm font-medium">Invite member</h3>
          <StableInviteForm stableId={stableId} />
        </div>

        <Separator />

        <div className="grid gap-4">
          <h3 className="text-sm font-medium">Current members</h3>
          {members.map((member, index) => (
            <div key={member.membership?._id ?? 'owner'}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="grid gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {formatUserName(member.user)}
                    </span>
                    <Badge
                      variant={member.role === 'owner' ? 'default' : 'secondary'}
                    >
                      {roleLabels[member.role]}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {member.user?.email ?? 'No email available'}
                  </span>
                </div>

                {member.membership && member.role !== 'owner' && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={removingMemberId === member.membership._id}
                    onClick={() => onRemoveMember(member.membership)}
                  >
                    {removingMemberId === member.membership._id
                      ? 'Removing...'
                      : 'Remove'}
                  </Button>
                )}
              </div>
              {index < members.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>

        <Separator />

        <div className="grid gap-4">
          <h3 className="text-sm font-medium">Invitations</h3>
          <StableInvitationsList invitations={invitations} />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function formatUserName(user: Doc<'users'> | null) {
  if (!user) return 'Unknown'

  return [user.firstName, user.lastName].filter(Boolean).join(' ')
}
