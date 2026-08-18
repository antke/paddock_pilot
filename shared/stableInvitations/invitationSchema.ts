import z from 'zod'

export const stableInvitationRoles = ['member'] as const
export type StableInvitationRole = (typeof stableInvitationRoles)[number]

export const stableInvitationRoleLabels = {
  member: 'Member',
  guest: 'Guest (legacy)',
} as const

export const stableInvitationSchema = z.object({
  email: z.string().trim().email('Use a valid email address.'),
  role: z.literal('member'),
})

export type StableInvitationInput = z.infer<typeof stableInvitationSchema>
