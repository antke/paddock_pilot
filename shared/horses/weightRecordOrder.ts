type WeightRecordOrder = {
  measuredAt: number
  createdAt: number
  _creationTime: number
}

/** Most recent measurement first; a later entry wins on the same date. */
export const compareWeightRecordsNewestFirst = (
  a: WeightRecordOrder,
  b: WeightRecordOrder,
) =>
  b.measuredAt - a.measuredAt ||
  b.createdAt - a.createdAt ||
  b._creationTime - a._creationTime
