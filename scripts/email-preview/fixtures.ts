import type { Id } from '../../convex/_generated/dataModel'
import type { EmailTemplate } from '../../convex/libs/email/types'

// Fictional content only. Reserved .example URLs cannot reach the real app.
export const previewAppUrl = 'https://paddock.example'
const stableId = 'example-stable' as Id<'stables'>
const eventId = 'example-event' as Id<'events'>
const event = { eventId, stableId, eventTitle: 'Autumn farrier visit' }

export const emailPreviewFixtures: Array<{
  id: string
  label: string
  template: EmailTemplate
}> = [
  {
    id: 'stable-invitation',
    label: 'Stable invitation',
    template: {
      kind: 'stable_invitation',
      stableName: 'Willow & Oak Stables',
      token: 'example-invitation-not-valid',
    },
  },
  {
    id: 'account-welcome',
    label: 'Account welcome',
    template: { kind: 'account_welcome', displayName: 'Alex' },
  },
  {
    id: 'membership-activated',
    label: 'Membership activated',
    template: {
      kind: 'stable_membership_activated',
      stableId,
      stableName: 'Willow & Oak Stables',
    },
  },
  {
    id: 'invitation-accepted',
    label: 'Invitation accepted',
    template: {
      kind: 'stable_invitation_accepted',
      stableId,
      stableName: 'Willow & Oak Stables',
      memberName: 'Alex Morgan',
    },
  },
  {
    id: 'horse-invitation',
    label: 'Horse invitation',
    template: {
      kind: 'event_horse_invitation',
      ...event,
      horseNames: ['Juniper', 'Clover'],
    },
  },
  ...(['approved', 'declined', 'withdrawn'] as const).map((status) => ({
    id: `participation-${status}`,
    label: `Participation ${status}`,
    template: {
      kind: 'event_participation_update' as const,
      ...event,
      actorName: 'Alex Morgan',
      horseName: 'Juniper',
      status,
    },
  })),
  {
    id: 'event-changed',
    label: 'Event updated',
    template: {
      kind: 'event_details_changed',
      ...event,
      changes: [
        'Start time changed to 10:30 on 24 October.',
        'Location changed to the covered yard.',
        'Please bring horses in before the farrier arrives.',
      ],
    },
  },
  {
    id: 'membership-removed',
    label: 'Membership ended',
    template: {
      kind: 'stable_membership_removed',
      stableName: 'Willow & Oak Stables',
    },
  },
  {
    id: 'stable-archived',
    label: 'Stable archived',
    template: { kind: 'stable_archived', stableName: 'Willow & Oak Stables' },
  },
  {
    id: 'account-deleted',
    label: 'Account deleted',
    template: { kind: 'account_deleted', displayName: 'Alex' },
  },
  {
    id: 'long-invitation',
    label: 'Long name & Polish characters',
    template: {
      kind: 'stable_invitation',
      stableName: 'Stajnia Źródlana — Ośrodek Opieki nad Końmi „Łąki & Dęby”',
      token:
        'example-long-invitation-token-not-valid-0123456789-abcdefghijklmnopqrstuvwxyz',
    },
  },
]
