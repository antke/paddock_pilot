import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { ClerkLoaded, ClerkLoading, Show, SignInButton, SignUpButton } from '@clerk/tanstack-react-start'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/invitations/$token')({
  component: InvitationPage,
})

function InvitationPage() {
  const { token } = Route.useParams()

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stable invitation</CardTitle>
          <CardDescription>
            Sign in with the invited email address to accept this stable invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClerkLoading>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </ClerkLoading>

          <ClerkLoaded>
            <Show when="signed-out">
              <div className="flex flex-wrap gap-3">
                <SignInButton>
                  <Button type="button">Sign in</Button>
                </SignInButton>
                <SignUpButton>
                  <Button type="button" variant="outline">
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            </Show>

            <Show when="signed-in">
              <AcceptInvitation token={token} />
            </Show>
          </ClerkLoaded>
        </CardContent>
      </Card>
    </main>
  )
}

function AcceptInvitation({ token }: { token: string }) {
  const acceptInvitation = useMutation(api.stableInvitations.accept)
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [needsSubscription, setNeedsSubscription] = useState(false)

  const onAccept = async () => {
    try {
      setIsSubmitting(true)
      const result = await acceptInvitation({ token })

      if (result.status === 'accepted_pending_subscription') {
        setNeedsSubscription(true)
        return
      }

      toast.success('Invitation accepted', {
        description: <p>You can now access the stable.</p>,
        position: 'top-right',
      })
      await navigate({
        to: '/stables/$stableId',
        params: { stableId: result.stableId },
      })
    } catch {
      toast.error('Could not accept invitation', {
        description: <p>Please check the invite link and signed-in email.</p>,
        position: 'top-right',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (needsSubscription) {
    return (
      <div className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Your invitation was accepted, but a Personal Plus subscription is needed
          before stable membership activates.
        </p>
        <CardFooter className="p-0">
          <Link to="/pricing">
            <Button type="button">Choose plan</Button>
          </Link>
        </CardFooter>
      </div>
    )
  }

  return (
    <Button type="button" disabled={isSubmitting} onClick={onAccept}>
      {isSubmitting ? 'Accepting...' : 'Accept invitation'}
    </Button>
  )
}
