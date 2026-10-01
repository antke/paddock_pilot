import z from 'zod'

export const stableInvitationRoles = ['member'] as const
export type StableInvitationRole = (typeof stableInvitationRoles)[number]

export const stableInvitationRoleLabels = {
  member: 'Member',
  guest: 'Guest (legacy)',
} as const

export const createStableInvitationSchema = (
  invalidEmail = 'Use a valid email address.',
) =>
  z.object({
    email: z.string().trim().email(invalidEmail),
    role: z.literal('member'),
  })

export const stableInvitationSchema = createStableInvitationSchema()

export type StableInvitationInput = z.infer<typeof stableInvitationSchema>
