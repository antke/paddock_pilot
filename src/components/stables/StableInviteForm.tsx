import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useMutation } from 'convex/react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import {
  stableInvitationRoleLabels,
  stableInvitationRoles,
  stableInvitationSchema,
  type StableInvitationRole,
} from 'shared/stableInvitations/invitationSchema'

type StableInviteFormProps = {
  stableId: Id<'stables'>
}

export function StableInviteForm({ stableId }: StableInviteFormProps) {
  const createInvitation = useMutation(api.stableInvitations.create)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<StableInvitationRole>('member')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = stableInvitationSchema.safeParse({ email, role })
    if (!result.success) {
      toast.error('Invalid invitation', {
        description: <p>{result.error.issues[0]?.message}</p>,
        position: 'top-right',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await createInvitation({
        stableId,
        email: result.data.email,
        role: result.data.role,
      })
      setEmail('')
      setRole('member')
      toast.success('Invitation sent', {
        description: <p>{result.data.email} has been invited.</p>,
        position: 'top-right',
      })
    } catch {
      toast.error('Oops! Something went wrong.', {
        description: <p>Please try again.</p>,
        position: 'top-right',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="grid gap-3 sm:grid-cols-[1fr_auto_auto]" onSubmit={onSubmit}>
      <Input
        type="email"
        placeholder="member@example.com"
        value={email}
        disabled={isSubmitting}
        onChange={(event) => setEmail(event.target.value)}
      />
      <select
        className="h-9 border border-input bg-background px-3 text-sm"
        value={role}
        disabled={isSubmitting}
        onChange={(event) => setRole(event.target.value as StableInvitationRole)}
      >
        {stableInvitationRoles.map((roleOption) => (
          <option key={roleOption} value={roleOption}>
            {stableInvitationRoleLabels[roleOption]}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Inviting...' : 'Invite'}
      </Button>
    </form>
  )
}
