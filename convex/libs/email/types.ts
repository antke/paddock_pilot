import type { Id } from '../../_generated/dataModel'

export const emailCategories = [
  'stable_invitation',
  'event_horse_invitation',
  'event_participation_update',
  'event_details_changed',
  'stable_membership_activated',
  'stable_invitation_accepted',
  'stable_membership_removed',
  'stable_archived',
  'account_welcome',
  'account_deleted',
] as const

export const emailProviderNames = ['console', 'resend'] as const

export type EmailCategory = (typeof emailCategories)[number]
export type EmailProviderName = (typeof emailProviderNames)[number]

export type EmailRelation =
  | { type: 'stableInvitation'; id: Id<'stableInvitations'> }
  | { type: 'event'; id: Id<'events'> }
  | { type: 'stable'; id: Id<'stables'> }
  | { type: 'user'; id: Id<'users'> }

export type EmailTemplate =
  | {
      kind: 'stable_invitation'
      stableName: string
      token: string
    }
  | {
      kind: 'event_horse_invitation'
      eventId: Id<'events'>
      eventTitle: string
      horseNames: Array<string>
      stableId: Id<'stables'>
    }
  | {
      kind: 'event_participation_update'
      actorName: string
      eventId: Id<'events'>
      eventTitle: string
      horseName: string
      stableId: Id<'stables'>
      status: 'approved' | 'declined' | 'withdrawn'
    }
  | {
      kind: 'event_details_changed'
      changes: Array<string>
      eventId: Id<'events'>
      eventTitle: string
      stableId: Id<'stables'>
    }
  | {
      kind: 'stable_membership_activated'
      stableId: Id<'stables'>
      stableName: string
    }
  | {
      kind: 'stable_invitation_accepted'
      memberName: string
      stableId: Id<'stables'>
      stableName: string
    }
  | {
      kind: 'stable_membership_removed'
      stableName: string
    }
  | {
      kind: 'stable_archived'
      stableName: string
    }
  | {
      kind: 'account_welcome'
      displayName: string
    }
  | {
      kind: 'account_deleted'
      displayName: string
    }

export type EmailMessage = {
  category: EmailCategory
  html: string
  idempotencyKey: string
  subject: string
  text: string
  to: string
}

export type EmailDeliveryResult = {
  provider: EmailProviderName
  providerMessageId?: string
  status: 'accepted' | 'skipped'
}

export interface EmailProvider {
  readonly name: EmailProviderName
  send: (message: EmailMessage) => Promise<EmailDeliveryResult>
}

export class EmailProviderError extends Error {
  public readonly code?: string
  public readonly retryable: boolean
  public readonly safeMessage: string

  constructor(
    message: string,
    safeMessage: string,
    options: { code?: string; retryable?: boolean } = {},
  ) {
    super(message)
    this.name = 'EmailProviderError'
    this.code = options.code
    this.retryable = options.retryable ?? false
    this.safeMessage = safeMessage
  }
}

export const getEmailErrorDetails = (error: unknown) => ({
  message:
    error instanceof EmailProviderError
      ? error.safeMessage
      : 'The email provider did not accept this message.',
  retryable: error instanceof EmailProviderError ? error.retryable : true,
})
