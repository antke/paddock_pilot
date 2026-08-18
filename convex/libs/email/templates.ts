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
  const inviteUrl = `${input.appUrl}/invitations/${encodeURIComponent(input.token)}`

  return {
    category: 'stable_invitation',
    subject: `You're invited to ${input.stableName} on Paddock Pilot`,
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
  const eventUrl = getEventUrl(input.appUrl, input.stableId, input.eventId)

  return {
    category: 'event_horse_invitation',
    subject: `Horse invitation for ${input.eventTitle}`,
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

  return {
    category: 'event_participation_update',
    subject: `${input.horseName} ${input.status} for ${input.eventTitle}`,
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

  return {
    category: 'event_details_changed',
    subject: `Event updated: ${input.eventTitle}`,
    html: `<p>${escapeHtml(input.eventTitle)} has been updated.</p><ul>${changes}</ul><p><a href="${eventUrl}">Review the event</a></p>`,
    text: `${input.eventTitle} has been updated: ${input.changes.join('; ')}. Review the event: ${eventUrl}`,
  }
}

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
  }
}
