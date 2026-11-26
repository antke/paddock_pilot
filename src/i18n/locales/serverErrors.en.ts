export const serverErrors = {
  futureTraining: 'You can’t complete a future session',
  chooseTrainingActivities: 'Choose training activities',
  trainingRequiresPermission:
    'To log completed training, you need permission for every horse. Remove the other horses or plan a session instead.',
  eventNeedsOwnHorse: 'Include at least one of your horses',
  eventRetainsOwnHorse: 'Keep at least one of your horses in this event',
  eventTypeLocked: 'This form can’t turn an event into training or back',
  trainingScheduleLocked:
    'This session already has history. Keep its schedule, or create a new session for other times.',
  trainingHorseLocked:
    'This horse has training logged here, so it can’t be removed',
  trainingHorseConflict:
    'This horse already has training logged for this session',
  trainingNotFound: 'Training session not found',
  trainingHorseUnconfirmed: 'This horse is not confirmed for this session',
  trainingPermission:
    'Only the horse’s owner, an editing carer or a stable admin can record its training',
  trainingOccurrence: 'Choose a date from this session’s schedule',
  eventDeleteBlocked:
    'Some horses already have this in their history, or another owner’s horse takes part, so it can’t be deleted. Cancel it instead.',
  eventClosed: 'This event has already happened or was cancelled',
  stableHasUnclaimedHorses:
    'Some horses here still don’t have an owner. Once their owners accept your invites, or you delete those horses, you can archive the stable.',
} as const
