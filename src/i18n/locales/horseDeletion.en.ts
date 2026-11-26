export const horseDeletion = {
  moved: 'Horse moved to deleted horses',
  movedHelp: 'You can restore {{name}} in stable settings for 14 days.',
  moveFailed: 'Couldn’t move {{name}} to deleted horses',
  continueFailed:
    '{{name}} is in deleted horses; you can restore it in stable settings for 14 days. The next page didn’t open. Try again; the horse won’t be moved twice.',
  continuing: 'Continuing…',
  moving: 'Moving…',
  retry: 'Try again',
  move: 'Move horse',
  region: '{{name}} deletion',
  delete: 'Delete horse',
  help: 'You can restore deleted horses for 14 days. Deleting for good can’t be undone.',
  acknowledged:
    '{{name}} is in deleted horses. You can restore it in stable settings for 14 days.',
  moveAction: 'Move to deleted horses',
  movedTitle: '{{name}} moved to deleted horses',
  moveQuestion: 'Move {{name}} to deleted horses?',
  confirmed:
    'Done. You can restore the horse and all its records in stable settings for 14 days.',
  warning:
    'The horse leaves everyday views, but you can restore it with all its records for 14 days.',
  close: 'Close',
  cancel: 'Cancel',
  deletedHorses: 'Deleted horses',
  rosterFailed: 'Couldn’t load horses',
  rosterFailedHelp:
    'Check your connection and try again. Nothing about your horses has changed.',
  readOnly: 'You can view this horse, not edit it',
  readOnlyHelp:
    'Members can edit only their own horses. The stable owner can edit every horse.',
} as const
