import type { Id } from '../../_generated/dataModel'

export const emailCategories = [
  'stable_invitation',
  'event_horse_invitation',
  'event_participation_update',
  'event_details_changed',
] as const

export const emailProviderNames = ['console', 'resend'] as const

export type EmailCategory = (typeof emailCategories)[number]
export type EmailProviderName = (typeof emailProviderNames)[number]

export type EmailRelation =
  | { type: 'stableInvitation'; id: Id<'stableInvitations'> }
  | { type: 'event'; id: Id<'events'> }

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
  send(message: EmailMessage): Promise<EmailDeliveryResult>
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
  retryable:
    error instanceof EmailProviderError ? error.retryable : true,
})
