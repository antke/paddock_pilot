import { getEmailCopy } from '../../../shared/i18n/email'
import type { Locale } from '../../../shared/i18n/locale'
import { translateEventChange } from '../../../shared/i18n/eventChanges'
import type { EmailMessage, EmailTemplate } from './types'
import { detailList, paragraph, renderEmailLayout } from './layout'

type MessageContent = Omit<EmailMessage, 'idempotencyKey' | 'to'>

function renderMessage(
  locale: Locale | undefined,
  input: Omit<MessageContent, 'html'> & {
    preheader: string
    heading: string
    paragraphs: Array<string>
    list?: Array<string>
    action?: { label: string; url: string }
    note?: string
  },
): MessageContent {
  return {
    category: input.category,
    subject: input.subject,
    text: input.text,
    html: renderEmailLayout({
      locale,
      preheader: input.preheader,
      heading: input.heading,
      body:
        input.paragraphs.map(paragraph).join('') + detailList(input.list ?? []),
      action: input.action,
      note: input.note,
    }),
  }
}

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
  locale?: Locale
  appUrl: string
  stableName: string
  token: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = `${input.appUrl}/invitations/${encodeURIComponent(input.token)}`
  return renderMessage(input.locale, {
    category: 'stable_invitation',
    subject: copy.invitationSubject(sanitizeSubjectValue(input.stableName)),
    preheader: copy.invitationPreheader(input.stableName),
    heading: copy.invitationHeading,
    paragraphs: [copy.invitationBody(input.stableName), copy.invitationContext],
    action: { label: copy.reviewInvitation, url },
    note: copy.invitationNote,
    text: copy.invitationText(input.stableName, url),
  })
}

const getEventUrl = (appUrl: string, stableId: string, eventId: string) =>
  `${appUrl}/stables/${encodeURIComponent(stableId)}/events/${encodeURIComponent(eventId)}`

export const createEventHorseInvitationEmail = (input: {
  locale?: Locale
  appUrl: string
  eventId: string
  eventTitle: string
  horseNames: Array<string>
  stableId: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = getEventUrl(input.appUrl, input.stableId, input.eventId)
  return renderMessage(input.locale, {
    category: 'event_horse_invitation',
    subject: copy.horseInvitationSubject(
      sanitizeSubjectValue(input.eventTitle),
    ),
    preheader: copy.horseInvitationPreheader(input.eventTitle),
    heading: copy.horseInvitationHeading,
    paragraphs: [copy.horseInvitationBody(input.eventTitle)],
    list: input.horseNames,
    action: { label: copy.reviewEvent, url },
    note: copy.horseInvitationNote,
    text: copy.horseInvitationText(
      input.horseNames.join(', '),
      input.eventTitle,
      url,
    ),
  })
}

export const createEventParticipationUpdateEmail = (input: {
  locale?: Locale
  actorName: string
  appUrl: string
  eventId: string
  eventTitle: string
  horseName: string
  stableId: string
  status: 'approved' | 'declined' | 'withdrawn'
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = getEventUrl(input.appUrl, input.stableId, input.eventId)
  const body = copy[`${input.status}Body`](
    input.actorName,
    input.horseName,
    input.eventTitle,
  )
  return renderMessage(input.locale, {
    category: 'event_participation_update',
    subject: copy[`${input.status}Subject`](
      sanitizeSubjectValue(input.horseName),
      sanitizeSubjectValue(input.eventTitle),
    ),
    preheader: copy[`${input.status}Preheader`](
      input.horseName,
      input.eventTitle,
    ),
    heading: copy.participationHeading,
    paragraphs: [body],
    action: { label: copy.openEvent, url },
    text: `${body} ${copy.openEvent}: ${url}`,
  })
}

export const createEventDetailsChangedEmail = (input: {
  locale?: Locale
  appUrl: string
  changes: Array<string>
  eventId: string
  eventTitle: string
  stableId: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = getEventUrl(input.appUrl, input.stableId, input.eventId)
  const changes = input.changes.map((change) =>
    translateEventChange(change, input.locale),
  )
  return renderMessage(input.locale, {
    category: 'event_details_changed',
    subject: copy.eventChangedSubject(sanitizeSubjectValue(input.eventTitle)),
    preheader: copy.eventChangedPreheader(input.eventTitle),
    heading: copy.eventChangedHeading,
    paragraphs: [copy.eventChangedBody(input.eventTitle)],
    list: changes,
    action: { label: copy.reviewEvent, url },
    text: copy.eventChangedText(input.eventTitle, changes.join('; '), url),
  })
}

const getStableUrl = (appUrl: string, stableId: string) =>
  `${appUrl}/stables/${encodeURIComponent(stableId)}`

export const createStableMembershipActivatedEmail = (input: {
  locale?: Locale
  appUrl: string
  stableId: string
  stableName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = getStableUrl(input.appUrl, input.stableId)
  return renderMessage(input.locale, {
    category: 'stable_membership_activated',
    subject: copy.membershipSubject(sanitizeSubjectValue(input.stableName)),
    preheader: copy.membershipPreheader(input.stableName),
    heading: copy.membershipHeading,
    paragraphs: [
      copy.membershipPreheader(input.stableName),
      copy.membershipContext,
    ],
    action: { label: copy.openStable, url },
    text: copy.membershipText(input.stableName, url),
  })
}

export const createStableInvitationAcceptedEmail = (input: {
  locale?: Locale
  appUrl: string
  memberName: string
  stableId: string
  stableName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = `${getStableUrl(input.appUrl, input.stableId)}/settings?tab=members`
  return renderMessage(input.locale, {
    category: 'stable_invitation_accepted',
    subject: copy.acceptedSubject(
      sanitizeSubjectValue(input.memberName),
      sanitizeSubjectValue(input.stableName),
    ),
    preheader: copy.acceptedPreheader(input.memberName),
    heading: copy.acceptedHeading,
    paragraphs: [copy.acceptedBody(input.memberName, input.stableName)],
    action: { label: copy.reviewMembers, url },
    text: copy.acceptedText(input.memberName, input.stableName, url),
  })
}

export const createStableMembershipRemovedEmail = (input: {
  locale?: Locale
  stableName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const body = copy.removedBody(input.stableName)
  return renderMessage(input.locale, {
    category: 'stable_membership_removed',
    subject: copy.removedSubject(sanitizeSubjectValue(input.stableName)),
    preheader: copy.removedPreheader(input.stableName),
    heading: copy.removedHeading,
    paragraphs: [body],
    note: copy.removedNote,
    text: `${body} ${copy.removedNote}`,
  })
}

export const createStableArchivedEmail = (input: {
  locale?: Locale
  stableName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const body = copy.archivedBody(input.stableName)
  return renderMessage(input.locale, {
    category: 'stable_archived',
    subject: copy.archivedSubject(sanitizeSubjectValue(input.stableName)),
    preheader: copy.archivedPreheader(input.stableName),
    heading: copy.archivedHeading,
    paragraphs: [body],
    text: body,
  })
}

export const createAccountWelcomeEmail = (input: {
  locale?: Locale
  appUrl: string
  displayName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const url = `${input.appUrl}/onboarding`
  return renderMessage(input.locale, {
    category: 'account_welcome',
    subject: copy.welcomeSubject,
    preheader: copy.welcomePreheader,
    heading: copy.welcomeHeading,
    paragraphs: [copy.welcomeGreeting(input.displayName), copy.welcomeBody],
    action: { label: copy.continueSetup, url },
    text: copy.welcomeText(input.displayName, url),
  })
}

export const createAccountDeletedEmail = (input: {
  locale?: Locale
  displayName: string
}): MessageContent => {
  const copy = getEmailCopy(input.locale)
  const body = copy.deletedBody(input.displayName)
  return renderMessage(input.locale, {
    category: 'account_deleted',
    subject: copy.deletedSubject,
    preheader: copy.deletedPreheader,
    heading: copy.deletedHeading,
    paragraphs: [body],
    note: copy.deletedNote,
    text: `${body} ${copy.deletedNote}`,
  })
}

export const createEmailContent = (
  template: EmailTemplate,
  appUrl: string,
  locale: Locale = 'en',
): MessageContent => {
  switch (template.kind) {
    case 'stable_invitation':
      return createStableInvitationEmail({ appUrl, ...template, locale })
    case 'event_horse_invitation':
      return createEventHorseInvitationEmail({ appUrl, ...template, locale })
    case 'event_participation_update':
      return createEventParticipationUpdateEmail({
        appUrl,
        ...template,
        locale,
      })
    case 'event_details_changed':
      return createEventDetailsChangedEmail({ appUrl, ...template, locale })
    case 'stable_membership_activated':
      return createStableMembershipActivatedEmail({
        appUrl,
        ...template,
        locale,
      })
    case 'stable_invitation_accepted':
      return createStableInvitationAcceptedEmail({
        appUrl,
        ...template,
        locale,
      })
    case 'stable_membership_removed':
      return createStableMembershipRemovedEmail({ ...template, locale })
    case 'stable_archived':
      return createStableArchivedEmail({ ...template, locale })
    case 'account_welcome':
      return createAccountWelcomeEmail({ appUrl, ...template, locale })
    case 'account_deleted':
      return createAccountDeletedEmail({ ...template, locale })
  }
}
