export const eventEditor = {
  createIn: 'Sharing',
  personal: 'Private',
  personalHelp:
    'Visible only to the selected horses’ owners and authorised carers. Not shared with a stable.',
  stableHelp:
    'Appears in the selected stables. Owners and authorised carers keep their access. Members see the schedule and status; stable administrators can read shared details. Sharing does not grant access to other horse records.',
  requiresApproval: 'Requires approval',
  approvalHelp:
    'The horse’s owner, authorised editor carer or stable administrator must accept before it joins.',
  summary: 'Added directly: {{confirmed}} · Invitations: {{invited}}',
  switchTitle: 'Remove horses from this activity?',
  switchHelp:
    'These horses need a stable calendar you are deselecting: {{horses}}. The rest of your draft will be kept.',
  switchConfirm: 'Remove horses and continue',
  keepSpace: 'Keep selected calendars',
  createPrivateEvent: 'Create private event',
  createPrivateTraining: 'Create private training',
  createStable: 'Create in {{stable}}',
  recordPermission:
    'Completed training requires recording permission for every horse. Remove horses requiring approval or change the status to Planned.',
  awaiting: 'Awaiting approval',
  participants: 'Horse participation',
  confirmed: 'Confirmed',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
  invitationsLoading: 'Loading horse invitations…',
  invitationsFailed:
    'Horse invitations could not be loaded. Reload the page to try again.',

  eventSavedSentence: 'Event saved.',
  trainingSavedSentence: 'Training session saved.',
  eventSaveFailed:
    'Could not save event. Your entries are still here. Please try again.',
  trainingSaveFailed:
    'Could not save training session. Your entries are still here. Please try again.',
  trainingContinueFailed:
    'Training session saved, but its page could not be opened. Open the session to continue; your changes do not need to be saved again.',
  eventContinueFailed:
    'Event saved, but its page could not be opened. Open the event to continue; your changes do not need to be saved again.',
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
  resetEvent: 'Reset event changes?',
  resetTraining: 'Reset training session changes?',
  resetHelp:
    'Your unsaved entries will be replaced with the values from when you opened this form.',
  reset: 'Reset changes',
  createEvent: 'Create event',
  updateEvent: 'Update event',
  createTraining: 'Create training session',
  updateTraining: 'Update training session',
  creating: 'Creating…',
  saving: 'Saving…',
} as const
