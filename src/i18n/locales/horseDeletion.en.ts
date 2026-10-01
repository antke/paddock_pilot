export const horseDeletion = {
  moved: 'Horse moved to deleted horses',
  movedHelp: '{{name}} can be restored from stable settings for 14 days.',
  moveFailed:
    'Moving this horse was not confirmed. Please try again or cancel.',
  continueFailed:
    '{{name}} was moved to deleted horses and can be restored from stable settings for 14 days. Could not continue to the next page. Retry continuing; the horse will not be moved again.',
  continuing: 'Continuing…',
  moving: 'Moving…',
  retry: 'Retry continuing',
  move: 'Move horse',
  region: '{{name}} deletion',
  delete: 'Delete horse',
  help: 'Use the 14-day deleted horses area for recoverable mistakes. Permanent deletion cannot be undone.',
  acknowledged:
    '{{name}} was moved to deleted horses. Restoration is available in stable settings for 14 days.',
  moveAction: 'Move to deleted horses',
  movedTitle: '{{name}} moved to deleted horses',
  moveQuestion: 'Move {{name}} to deleted horses?',
  confirmed:
    'The move is confirmed. All records remain available for restoration from stable settings for 14 days.',
  warning:
    'The horse disappears from daily views but all records remain available for restoration for 14 days.',
  close: 'Close',
  cancel: 'Cancel',
  deletedHorses: 'Deleted horses',
  rosterFailed: 'The horse roster couldn’t load',
  rosterFailedHelp:
    'Check your connection, then try again. Your horse records have not been changed.',
  readOnly: 'This horse profile is read-only for you',
  readOnlyHelp:
    'Members can edit only their own horses. The stable owner can manage every horse in the stable.',
} as const
