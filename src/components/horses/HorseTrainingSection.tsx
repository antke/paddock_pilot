import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { TrainingCalendar } from '#/components/training/TrainingCalendar'
import type { TrainingHorse } from '#/components/training/trainingCalendarData'

export type HorseTrainingData = {
  events: Array<Doc<'events'>>
  records: Array<Doc<'trainingRecords'>>
  horses: Array<TrainingHorse>
}
type Props = {
  stableId: string
  horse: TrainingHorse
  data?: HorseTrainingData
}

export function HorseTrainingSection({ data, ...props }: Props) {
  return data ? (
    <HorseTrainingLog {...props} data={data} />
  ) : (
    <ConnectedHorseTraining {...props} />
  )
}

function ConnectedHorseTraining({ stableId, horse }: Omit<Props, 'data'>) {
  const { data } = useSuspenseQuery(
    convexQuery(api.training.listForStable, {
      stableId: stableId as Id<'stables'>,
    }),
  )
  return <HorseTrainingLog stableId={stableId} horse={horse} data={data} />
}

function HorseTrainingLog({
  stableId,
  horse,
  data,
}: Props & { data: HorseTrainingData }) {
  return (
    <TrainingCalendar
      key={horse._id}
      stableId={stableId}
      events={data.events}
      records={data.records}
      horses={data.horses.filter((item) => item._id === horse._id)}
      fixedHorseId={horse._id}
    />
  )
}
