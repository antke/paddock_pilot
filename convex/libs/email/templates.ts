import type { EmailMessage, EmailTemplate } from './types'

type MessageContent = Omit<EmailMessage, 'idempotencyKey' | 'to'>

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character]!,
  )

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
  const stableName = escapeHtml(input.stableName)
  const subjectStableName = sanitizeSubjectValue(input.stableName)
  const inviteUrl = `${input.appUrl}/invitations/${encodeURIComponent(input.token)}`

  return {
    category: 'stable_invitation',
    subject: `You're invited to ${subjectStableName} on Paddock Pilot`,
    html: `<p>You have been invited to join ${stableName} on Paddock Pilot.</p><p><a href="${inviteUrl}">Review invitation</a></p><p>This invitation expires in 14 days.</p>`,
    text: `You have been invited to join ${input.stableName} on Paddock Pilot. Review the invitation: ${inviteUrl}. This invitation expires in 14 days.`,
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
  const horseList = input.horseNames
    .map((horseName) => `<li>${escapeHtml(horseName)}</li>`)
    .join('')
  const eventTitle = escapeHtml(input.eventTitle)
  const subjectEventTitle = sanitizeSubjectValue(input.eventTitle)
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)

  return {
    category: 'event_horse_invitation',
    subject: `Horse invitation for ${subjectEventTitle}`,
    html: `<p>Your horses have been invited to ${eventTitle}.</p><ul>${horseList}</ul><p><a href="${eventUrl}">Review the event</a>, then approve or decline from your Paddock Pilot dashboard.</p>`,
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
    html: `<p>${escapeHtml(input.actorName)} ${input.status} ${escapeHtml(input.horseName)} for ${escapeHtml(input.eventTitle)}.</p><p><a href="${eventUrl}">Open the event</a></p>`,
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
  const changes = input.changes
    .map((change) => `<li>${escapeHtml(change)}</li>`)
    .join('')
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)
  const subjectEventTitle = sanitizeSubjectValue(input.eventTitle)

  return {
    category: 'event_details_changed',
    subject: `Event updated: ${subjectEventTitle}`,
    html: `<p>${escapeHtml(input.eventTitle)} has been updated.</p><ul>${changes}</ul><p><a href="${eventUrl}">Review the event</a></p>`,
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
  const stableName = escapeHtml(input.stableName)
  const stableUrl = getStableUrl(input.appUrl, input.stableId)

  return {
    category: 'stable_membership_activated',
    subject: `Welcome to ${sanitizeSubjectValue(input.stableName)}`,
    html: `<p>Your membership of ${stableName} is active.</p><p><a href="${stableUrl}">Open the stable</a> and finish setting up your yard profile.</p>`,
    text: `Your membership of ${input.stableName} is active. Open the stable: ${stableUrl}`,
  }
}

export const createStableInvitationAcceptedEmail = (input: {
  appUrl: string
  memberName: string
  stableId: string
  stableName: string
}): MessageContent => {
  const stableName = escapeHtml(input.stableName)
  const memberName = escapeHtml(input.memberName)
  const membersUrl = `${getStableUrl(input.appUrl, input.stableId)}/settings?tab=members`

  return {
    category: 'stable_invitation_accepted',
    subject: `${sanitizeSubjectValue(input.memberName)} joined ${sanitizeSubjectValue(input.stableName)}`,
    html: `<p>${memberName} accepted the invitation to join ${stableName}.</p><p><a href="${membersUrl}">Review stable members</a></p>`,
    text: `${input.memberName} accepted the invitation to join ${input.stableName}. Review stable members: ${membersUrl}`,
  }
}

export const createStableMembershipRemovedEmail = (input: {
  stableName: string
}): MessageContent => ({
  category: 'stable_membership_removed',
  subject: `Your access to ${sanitizeSubjectValue(input.stableName)} changed`,
  html: `<p>Your membership of ${escapeHtml(input.stableName)} has ended and you no longer have access to its shared records.</p><p>If this was unexpected, contact the stable owner.</p>`,
  text: `Your membership of ${input.stableName} has ended and you no longer have access to its shared records. If this was unexpected, contact the stable owner.`,
})

export const createStableArchivedEmail = (input: {
  stableName: string
}): MessageContent => ({
  category: 'stable_archived',
  subject: `${sanitizeSubjectValue(input.stableName)} was archived`,
  html: `<p>${escapeHtml(input.stableName)} was archived by its owner and is no longer available in Paddock Pilot.</p>`,
  text: `${input.stableName} was archived by its owner and is no longer available in Paddock Pilot.`,
})

export const createAccountWelcomeEmail = (input: {
  appUrl: string
  displayName: string
}): MessageContent => ({
  category: 'account_welcome',
  subject: 'Welcome to Paddock Pilot',
  html: `<p>Welcome, ${escapeHtml(input.displayName)}.</p><p>Your Paddock Pilot account is ready. <a href="${input.appUrl}/onboarding">Continue setup</a></p>`,
  text: `Welcome, ${input.displayName}. Your Paddock Pilot account is ready. Continue setup: ${input.appUrl}/onboarding`,
})

export const createAccountDeletedEmail = (input: {
  displayName: string
}): MessageContent => ({
  category: 'account_deleted',
  subject: 'Your Paddock Pilot account was deleted',
  html: `<p>${escapeHtml(input.displayName)}, your Paddock Pilot account has been deleted.</p><p>If you did not request this, contact Paddock Pilot support.</p>`,
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
