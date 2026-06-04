import z from 'zod'

export const stableInvitationRoles = ['member', 'guest'] as const
export type StableInvitationRole = (typeof stableInvitationRoles)[number]

export const stableInvitationRoleLabels = {
  member: 'Member',
  guest: 'Guest',
} satisfies Record<StableInvitationRole, string>

export const stableInvitationSchema = z.object({
  email: z.string().trim().email('Use a valid email address.'),
  role: z.enum(stableInvitationRoles),
})

export type StableInvitationInput = z.infer<typeof stableInvitationSchema>
