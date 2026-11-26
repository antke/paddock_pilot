export const emailEN = {
  digestSubject: 'Care reminders due',
  digestHeading: 'Care to follow up on',
  digestBody:
    'These stables have care reminders due today or overdue. Open Care for the details.',
  digestCount: (name: string, count: number) =>
    `${name}: ${count} due or overdue`,
  digestSettings: 'Email settings',
  digestOpenCare: 'Open Care',
  digestPreferences:
    'You get this daily summary because you turned on care reminder emails. Change this in your profile:',
  invitationSubject: (stableName: string) =>
    `You're invited to ${stableName} on Paddock Pilot`,
  invitationPreheader: (stableName: string) =>
    `Join ${stableName} and take part in the day-to-day care of your yard.`,
  invitationHeading: 'Your place in the yard.',
  invitationBody: (stableName: string) =>
    `You’re invited to join ${stableName} on Paddock Pilot.`,
  invitationContext:
    'Keep up with shared plans, horse care and the everyday details of stable life.',
  reviewInvitation: 'Review invitation',
  invitationNote:
    'This invitation expires in 14 days. If you weren’t expecting it, you can ignore this email.',
  invitationText: (stableName: string, url: string) =>
    `You’re invited to join ${stableName} on Paddock Pilot. Keep up with shared plans, horse care and the everyday details of stable life.\n\nSee the invitation: ${url}\n\nThis invitation expires in 14 days. If you weren’t expecting it, you can ignore this email.`,
  horseInvitationSubject: (eventTitle: string) =>
    `Horse invitation for ${eventTitle}`,
  horseInvitationPreheader: (eventTitle: string) =>
    `Review the horse invitation for ${eventTitle}.`,
  horseInvitationHeading: 'An invitation for your horses.',
  horseInvitationBody: (eventTitle: string) =>
    `Your horses are invited to ${eventTitle}.`,
  reviewEvent: 'Review the event',
  horseInvitationNote:
    'Check the event, then approve or decline in Paddock Pilot.',
  horseInvitationText: (horseNames: string, eventTitle: string, url: string) =>
    `Your horses (${horseNames}) are invited to ${eventTitle}. See the event and reply: ${url}`,
  participationHeading: 'An update to the plan.',
  openEvent: 'Open the event',
  approvedSubject: (horseName: string, eventTitle: string) =>
    `${horseName} approved for ${eventTitle}`,
  declinedSubject: (horseName: string, eventTitle: string) =>
    `${horseName} declined for ${eventTitle}`,
  withdrawnSubject: (horseName: string, eventTitle: string) =>
    `${horseName} withdrawn for ${eventTitle}`,
  approvedPreheader: (horseName: string, eventTitle: string) =>
    `${horseName}: approved for ${eventTitle}.`,
  declinedPreheader: (horseName: string, eventTitle: string) =>
    `${horseName}: declined for ${eventTitle}.`,
  withdrawnPreheader: (horseName: string, eventTitle: string) =>
    `${horseName}: withdrawn for ${eventTitle}.`,
  approvedBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} approved ${horseName} for ${eventTitle}.`,
  declinedBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} declined ${horseName} for ${eventTitle}.`,
  withdrawnBody: (actorName: string, horseName: string, eventTitle: string) =>
    `${actorName} withdrew ${horseName} from ${eventTitle}.`,
  eventChangedSubject: (eventTitle: string) => `Event updated: ${eventTitle}`,
  eventChangedPreheader: (eventTitle: string) =>
    `See what’s changed for ${eventTitle}.`,
  eventChangedHeading: 'A change to your calendar.',
  eventChangedBody: (eventTitle: string) => `${eventTitle} was updated.`,
  eventChangedText: (eventTitle: string, changes: string, url: string) =>
    `${eventTitle} was updated: ${changes}. See the event: ${url}`,
  membershipSubject: (stableName: string) => `Welcome to ${stableName}`,
  membershipPreheader: (stableName: string) =>
    `You’re now a member of ${stableName}.`,
  membershipHeading: 'Welcome to the yard.',
  membershipContext:
    'Open the stable to catch up on shared plans and horse care.',
  openStable: 'Open the stable',
  membershipText: (stableName: string, url: string) =>
    `You’re now a member of ${stableName}. Open the stable: ${url}`,
  acceptedSubject: (memberName: string, stableName: string) =>
    `${memberName} joined ${stableName}`,
  acceptedPreheader: (memberName: string) =>
    `${memberName} accepted your stable invitation.`,
  acceptedHeading: 'A new face in the yard.',
  acceptedBody: (memberName: string, stableName: string) =>
    `${memberName} accepted the invitation to join ${stableName}.`,
  reviewMembers: 'See stable members',
  acceptedText: (memberName: string, stableName: string, url: string) =>
    `${memberName} accepted the invitation to join ${stableName}. See stable members: ${url}`,
  removedSubject: (stableName: string) =>
    `Your access to ${stableName} changed`,
  removedPreheader: (stableName: string) =>
    `You’re no longer a member of ${stableName}.`,
  removedHeading: 'Your stable access has changed.',
  removedBody: (stableName: string) =>
    `You’re no longer a member of ${stableName} and can’t see its shared records.`,
  removedNote: 'If this was unexpected, contact the stable owner.',
  archivedSubject: (stableName: string) => `${stableName} was archived`,
  archivedPreheader: (stableName: string) =>
    `${stableName} is no longer available in Paddock Pilot.`,
  archivedHeading: 'Your stable was archived.',
  archivedBody: (stableName: string) =>
    `${stableName} was archived by its owner and is no longer available in Paddock Pilot.`,
  welcomeSubject: 'Welcome to Paddock Pilot',
  welcomePreheader: 'Your account is ready. Now set up your stable.',
  welcomeHeading: 'Make yourself at home.',
  welcomeGreeting: (displayName: string) => `Welcome, ${displayName}.`,
  welcomeBody:
    'Your Paddock Pilot account is ready. Finish setup to get going with your stable and horses.',
  continueSetup: 'Continue setup',
  welcomeText: (displayName: string, url: string) =>
    `Welcome, ${displayName}. Your Paddock Pilot account is ready. Continue setup: ${url}`,
  deletedSubject: 'Your Paddock Pilot account was deleted',
  deletedPreheader: 'We’ve deleted your Paddock Pilot account.',
  deletedHeading: 'Your account is deleted.',
  deletedBody: (displayName: string) =>
    `${displayName}, we’ve deleted your Paddock Pilot account.`,
  deletedNote: 'If you didn’t ask for this, contact Paddock Pilot support.',
  fallback: 'If the button doesn’t work, copy this link into your browser:',
  footer: 'Good care is a shared effort.',
  footerNote: 'An account or stable update from Paddock Pilot.',
  memberFallback: 'Stable member',
}

export type EmailCopy = typeof emailEN
