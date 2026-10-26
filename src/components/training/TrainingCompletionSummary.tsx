import type { TrainingEntry } from 'shared/training/trainingEntries'
import { useLocale } from '#/i18n/LocaleProvider'

export function TrainingCompletionSummary({
  entries,
}: {
  entries: Array<TrainingEntry>
}) {
  const { locale } = useLocale()
  if (entries.length < 2) return null
  const completed = entries.filter(
    (entry) => entry.status === 'completed',
  ).length
  return (
    <p role="status" className="text-sm font-medium">
      {locale === 'pl'
        ? `Ukończono ${completed} z ${entries.length}`
        : `${completed} of ${entries.length} completed`}
    </p>
  )
}
