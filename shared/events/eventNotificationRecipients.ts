export const getEventChangeNotificationOwnerIds = <TId extends string>({
  actorUserId,
  excludedOwnerIds,
  horseOwnerIds,
}: {
  actorUserId: TId
  excludedOwnerIds?: Set<TId>
  horseOwnerIds: Array<TId>
}) => [
  ...new Set(
    horseOwnerIds.filter(
      (ownerId) =>
        ownerId !== actorUserId && !excludedOwnerIds?.has(ownerId),
    ),
  ),
]
