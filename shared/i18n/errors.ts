export const userFacingErrorMessages = {
  futureTraining: 'Future sessions cannot be completed',
  chooseTrainingActivities: 'Choose training activities',
  eventNeedsOwnHorse:
    'A member-created event must include at least one of their horses',
  eventRetainsOwnHorse:
    'A member-managed event must retain at least one of their horses',
  eventTypeLocked:
    'Events and training sessions cannot be converted through this form',
  trainingScheduleLocked:
    'This session has training history. Keep its schedule and create a new session for a different schedule.',
  trainingHorseLocked:
    'A horse with recorded training cannot be removed from this session',
  trainingNotFound: 'Training session not found',
  trainingHorseUnconfirmed: 'This horse is not confirmed for this session',
  trainingPermission:
    'Only the horse owner or stable admin can record its training',
  trainingOccurrence: 'Choose a scheduled occurrence of this session',
} as const
export type UserFacingErrorCode = keyof typeof userFacingErrorMessages

export function getUserFacingErrorCode(
  error: unknown,
): UserFacingErrorCode | undefined {
  if (!error || typeof error !== 'object' || !('data' in error))
    return undefined
  const data = error.data
  if (
    data &&
    typeof data === 'object' &&
    'code' in data &&
    typeof data.code === 'string' &&
    Object.hasOwn(userFacingErrorMessages, data.code)
  )
    return data.code as UserFacingErrorCode
  // Exact old ConvexError string payloads only; never interpret a transport stack or arbitrary prose.
  if (typeof data === 'string')
    return (
      Object.keys(userFacingErrorMessages) as Array<UserFacingErrorCode>
    ).find((code) => userFacingErrorMessages[code] === data)
  return undefined
}
