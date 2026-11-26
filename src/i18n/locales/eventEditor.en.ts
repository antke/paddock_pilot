export const eventEditor = {
  createIn: 'Sharing',
  personal: 'Private',
  personalHelp:
    'Only these horses’ owners and authorised carers see it. Not shared with any stable.',
  stableHelp:
    'Shows in the stables you pick. Owners and authorised carers keep access. Members see the time and status; stable admins see shared details. Sharing doesn’t open up other horse records.',
  requiresApproval: 'Requires approval',
  approvalHelp:
    'The horse joins once its owner, an editing carer or a stable admin accepts.',
  summary: 'Added: {{confirmed}} · Invited: {{invited}}',
  switchTitle: 'Remove horses from this activity?',
  switchHelp:
    'These horses need a stable calendar you’re unticking: {{horses}}. The rest of your draft stays.',
  switchConfirm: 'Remove horses and continue',
  keepSpace: 'Keep selected calendars',
  createPrivateEvent: 'Create private event',
  createPrivateTraining: 'Create private training',
  createStable: 'Create in {{stable}}',
  recordPermission:
    'To log completed training, you need permission for every horse. Remove horses that need approval, or set the status to Planned.',
  awaiting: 'Awaiting approval',
  participants: 'Horses',
  confirmed: 'Confirmed',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  invitationsLoading: 'Loading horse invitations…',
  invitationsFailed:
    'Couldn’t load horse invitations. Reload the page to try again.',

  eventSavedSentence: 'Event saved.',
  trainingSavedSentence: 'Training session saved.',
  eventSaveFailed: 'Couldn’t save the event. Your entries are still here.',
  trainingSaveFailed: 'Couldn’t save the session. Your entries are still here.',
  trainingContinueFailed:
    'Training session saved, but its page didn’t open. Open the session to carry on; no need to save again.',
  eventContinueFailed:
    'Event saved, but its page didn’t open. Open the event to carry on; no need to save again.',
  addEvent: 'Add event',
  editEvent: 'Edit event',
  addTraining: 'Add training session',
  editTraining: 'Edit training session',
  trainingSaved: 'Training saved',
  eventSaved: 'Event saved',
  openEvent: 'Open event',
  openTraining: 'Open training session',
  openingTraining: 'Opening session…',
  openingEvent: 'Opening event…',
  resetEvent: 'Discard event changes?',
  resetTraining: 'Discard training session changes?',
  resetHelp:
    'The form goes back to how it was when you opened it. Unsaved changes are lost.',
  createEvent: 'Create event',
  updateEvent: 'Save changes',
  createTraining: 'Create training session',
  updateTraining: 'Save changes',
  creating: 'Creating…',
  saving: 'Saving…',
} as const
