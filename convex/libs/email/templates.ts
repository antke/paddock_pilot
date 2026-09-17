import type { EmailMessage, EmailTemplate } from './types'
import { detailList, paragraph, renderEmailLayout } from './layout'

type MessageContent = Omit<EmailMessage, 'idempotencyKey' | 'to'>

const sanitizeSubjectValue = (value: string) =>
  value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export const getAppUrl = (environment: { APP_URL?: string } = process.env) => {
  const appUrl = environment.APP_URL?.trim()
  if (!appUrl) throw new Error('Missing APP_URL')
  return appUrl.replace(/\/$/, '')
}

export const createStableInvitationEmail = (input: {
  appUrl: string
  stableName: string
  token: string
}): MessageContent => {
  const subjectStableName = sanitizeSubjectValue(input.stableName)
  const inviteUrl = `${input.appUrl}/invitations/${encodeURIComponent(input.token)}`

  return {
    category: 'stable_invitation',
    subject: `You're invited to ${subjectStableName} on Paddock Pilot`,
    html: renderEmailLayout({
      preheader: `Join ${input.stableName} and take part in the day-to-day care of your yard.`,
      heading: 'Your place in the yard.',
      body:
        paragraph(
          `You have been invited to join ${input.stableName} on Paddock Pilot.`,
        ) +
        paragraph(
          'Keep up with shared plans, horse care and the everyday details of stable life.',
        ),
      action: { label: 'Review invitation', url: inviteUrl },
      note: 'This invitation expires 14 days after it was issued. If you were not expecting it, you can ignore this email.',
    }),
    text: `You have been invited to join ${input.stableName} on Paddock Pilot. Keep up with shared plans, horse care and the everyday details of stable life.\n\nReview the invitation: ${inviteUrl}\n\nThis invitation expires 14 days after it was issued. If you were not expecting it, you can ignore this email.`,
  }
}

const getEventUrl = (appUrl: string, stableId: string, eventId: string) =>
  `${appUrl}/stables/${encodeURIComponent(stableId)}/events/${encodeURIComponent(eventId)}`

export const createEventHorseInvitationEmail = (input: {
  appUrl: string
  eventId: string
  eventTitle: string
  horseNames: Array<string>
  stableId: string
}): MessageContent => {
  const subjectEventTitle = sanitizeSubjectValue(input.eventTitle)
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)

  return {
    category: 'event_horse_invitation',
    subject: `Horse invitation for ${subjectEventTitle}`,
    html: renderEmailLayout({
      preheader: `Review the horse invitation for ${input.eventTitle}.`,
      heading: 'An invitation for your horses.',
      body:
        paragraph(`Your horses have been invited to ${input.eventTitle}.`) +
        detailList(input.horseNames),
      action: { label: 'Review the event', url: eventUrl },
      note: 'Review the event, then approve or decline from your Paddock Pilot dashboard.',
    }),
    text: `Your horses (${input.horseNames.join(', ')}) have been invited to ${input.eventTitle}. Review the event and respond: ${eventUrl}`,
  }
}

export const createEventParticipationUpdateEmail = (input: {
  actorName: string
  appUrl: string
  eventId: string
  eventTitle: string
  horseName: string
  stableId: string
  status: 'approved' | 'declined' | 'withdrawn'
}): MessageContent => {
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)
  const subjectHorseName = sanitizeSubjectValue(input.horseName)
  const subjectEventTitle = sanitizeSubjectValue(input.eventTitle)

  return {
    category: 'event_participation_update',
    subject: `${subjectHorseName} ${input.status} for ${subjectEventTitle}`,
    html: renderEmailLayout({
      preheader: `${input.horseName}: ${input.status} for ${input.eventTitle}.`,
      heading: 'An update to the plan.',
      body: paragraph(
        `${input.actorName} ${input.status} ${input.horseName} for ${input.eventTitle}.`,
      ),
      action: { label: 'Open the event', url: eventUrl },
    }),
    text: `${input.actorName} ${input.status} ${input.horseName} for ${input.eventTitle}. Open the event: ${eventUrl}`,
  }
}

export const createEventDetailsChangedEmail = (input: {
  appUrl: string
  changes: Array<string>
  eventId: string
  eventTitle: string
  stableId: string
}): MessageContent => {
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)
  const subjectEventTitle = sanitizeSubjectValue(input.eventTitle)

  return {
    category: 'event_details_changed',
    subject: `Event updated: ${subjectEventTitle}`,
    html: renderEmailLayout({
      preheader: `See what has changed for ${input.eventTitle}.`,
      heading: 'A change to your calendar.',
      body:
        paragraph(`${input.eventTitle} has been updated.`) +
        detailList(input.changes),
      action: { label: 'Review the event', url: eventUrl },
    }),
    text: `${input.eventTitle} has been updated: ${input.changes.join('; ')}. Review the event: ${eventUrl}`,
  }
}

const getStableUrl = (appUrl: string, stableId: string) =>
  `${appUrl}/stables/${encodeURIComponent(stableId)}`

export const createStableMembershipActivatedEmail = (input: {
  appUrl: string
  stableId: string
  stableName: string
}): MessageContent => {
  const stableUrl = getStableUrl(input.appUrl, input.stableId)

  return {
    category: 'stable_membership_activated',
    subject: `Welcome to ${sanitizeSubjectValue(input.stableName)}`,
    html: renderEmailLayout({
      preheader: `Your membership of ${input.stableName} is active.`,
      heading: 'Welcome to the yard.',
      body:
        paragraph(`Your membership of ${input.stableName} is active.`) +
        paragraph(
          'Open the stable to catch up on shared plans and horse care.',
        ),
      action: { label: 'Open the stable', url: stableUrl },
    }),
    text: `Your membership of ${input.stableName} is active. Open the stable: ${stableUrl}`,
  }
}

export const createStableInvitationAcceptedEmail = (input: {
  appUrl: string
  memberName: string
  stableId: string
  stableName: string
}): MessageContent => {
  const membersUrl = `${getStableUrl(input.appUrl, input.stableId)}/settings?tab=members`

  return {
    category: 'stable_invitation_accepted',
    subject: `${sanitizeSubjectValue(input.memberName)} joined ${sanitizeSubjectValue(input.stableName)}`,
    html: renderEmailLayout({
      preheader: `${input.memberName} accepted your stable invitation.`,
      heading: 'A new face in the yard.',
      body: paragraph(
        `${input.memberName} accepted the invitation to join ${input.stableName}.`,
      ),
      action: { label: 'Review stable members', url: membersUrl },
    }),
    text: `${input.memberName} accepted the invitation to join ${input.stableName}. Review stable members: ${membersUrl}`,
  }
}

export const createStableMembershipRemovedEmail = (input: {
  stableName: string
}): MessageContent => ({
  category: 'stable_membership_removed',
  subject: `Your access to ${sanitizeSubjectValue(input.stableName)} changed`,
  html: renderEmailLayout({
    preheader: `Your membership of ${input.stableName} has ended.`,
    heading: 'Your stable access has changed.',
    body: paragraph(
      `Your membership of ${input.stableName} has ended and you no longer have access to its shared records.`,
    ),
    note: 'If this was unexpected, contact the stable owner.',
  }),
  text: `Your membership of ${input.stableName} has ended and you no longer have access to its shared records. If this was unexpected, contact the stable owner.`,
})

export const createStableArchivedEmail = (input: {
  stableName: string
}): MessageContent => ({
  category: 'stable_archived',
  subject: `${sanitizeSubjectValue(input.stableName)} was archived`,
  html: renderEmailLayout({
    preheader: `${input.stableName} is no longer available in Paddock Pilot.`,
    heading: 'Your stable was archived.',
    body: paragraph(
      `${input.stableName} was archived by its owner and is no longer available in Paddock Pilot.`,
    ),
  }),
  text: `${input.stableName} was archived by its owner and is no longer available in Paddock Pilot.`,
})

export const createAccountWelcomeEmail = (input: {
  appUrl: string
  displayName: string
}): MessageContent => ({
  category: 'account_welcome',
  subject: 'Welcome to Paddock Pilot',
  html: renderEmailLayout({
    preheader:
      'Your account is ready. Take the next step into your shared stable.',
    heading: 'Make yourself at home.',
    body:
      paragraph(`Welcome, ${input.displayName}.`) +
      paragraph(
        'Your Paddock Pilot account is ready. Continue setup to get started with your stable and horses.',
      ),
    action: { label: 'Continue setup', url: `${input.appUrl}/onboarding` },
  }),
  text: `Welcome, ${input.displayName}. Your Paddock Pilot account is ready. Continue setup: ${input.appUrl}/onboarding`,
})

export const createAccountDeletedEmail = (input: {
  displayName: string
}): MessageContent => ({
  category: 'account_deleted',
  subject: 'Your Paddock Pilot account was deleted',
  html: renderEmailLayout({
    preheader: 'Confirmation that your Paddock Pilot account has been deleted.',
    heading: 'Your account has been deleted.',
    body: paragraph(
      `${input.displayName}, your Paddock Pilot account has been deleted.`,
    ),
    note: 'If you did not request this, contact Paddock Pilot support.',
  }),
  text: `${input.displayName}, your Paddock Pilot account has been deleted. If you did not request this, contact Paddock Pilot support.`,
})

export const createEmailContent = (
  template: EmailTemplate,
  appUrl: string,
): MessageContent => {
  switch (template.kind) {
    case 'stable_invitation':
      return createStableInvitationEmail({ appUrl, ...template })
    case 'event_horse_invitation':
      return createEventHorseInvitationEmail({ appUrl, ...template })
    case 'event_participation_update':
      return createEventParticipationUpdateEmail({ appUrl, ...template })
    case 'event_details_changed':
      return createEventDetailsChangedEmail({ appUrl, ...template })
    case 'stable_membership_activated':
      return createStableMembershipActivatedEmail({ appUrl, ...template })
    case 'stable_invitation_accepted':
      return createStableInvitationAcceptedEmail({ appUrl, ...template })
    case 'stable_membership_removed':
      return createStableMembershipRemovedEmail(template)
    case 'stable_archived':
      return createStableArchivedEmail(template)
    case 'account_welcome':
      return createAccountWelcomeEmail({ appUrl, ...template })
    case 'account_deleted':
      return createAccountDeletedEmail(template)
  }
}
