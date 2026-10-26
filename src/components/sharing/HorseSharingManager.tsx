import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { FieldLabel } from '#/components/ui/field'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'

function OccurrenceAudience({
  horseId,
  recordId,
  date,
  pl,
}: {
  horseId: Id<'horses'>
  recordId: string
  date: string
  pl: boolean
}) {
  const audience = useQuery(api.recordSharing.audience, {
    horseId,
    recordId,
    occurrenceDate: date,
  })
  return (
    <p className="mt-2 text-sm text-muted-foreground" role="status">
      {audience === undefined
        ? pl
          ? 'Sprawdzanie dostępu…'
          : 'Checking access…'
        : audience?.shared
          ? pl
            ? `Ten termin jest udostępniony · ${audience.stable?.name}`
            : `This occurrence is shared · ${audience.stable?.name}`
          : pl
            ? 'Ten termin nie jest udostępniony stajni.'
            : 'This occurrence is not shared with the stable.'}
    </p>
  )
}

export function HorseSharingManager({ horseId }: { horseId: Id<'horses'> }) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const data = useQuery(api.recordSharing.listForHorse, { horseId })
  const set = useMutation(api.recordSharing.set)
  const [pending, setPending] = useState<string>()
  const [confirmation, setConfirmation] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [saved, setSaved] = useState<{ recordId: string; date: string }>()
  const [dates, setDates] = useState<Record<string, string>>({})
  if (!data?.stable) return null
  const change = async (
    recordId: string,
    enabled: boolean,
    occurrenceDate?: string,
  ) => {
    if (pending) return
    setPending(recordId)
    setFailed(false)
    setSaved(undefined)
    try {
      await set({ horseId, recordId, enabled, occurrenceDate })
      setConfirmation(undefined)
      if (occurrenceDate) setSaved({ recordId, date: occurrenceDate })
    } catch {
      setFailed(true)
    } finally {
      setPending(undefined)
    }
  }
  return (
    <DashboardSectionCard
      title={pl ? 'Udostępnianie zapisów' : 'Record sharing'}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {pl
          ? 'Zmiana dostępu zachowuje treść, załączniki i status. Opiekunowie zachowują niezależny dostęp.'
          : 'Changing access preserves content, attachments and status. Personal carers keep their independent access.'}
      </p>
      <div className="divide-y divide-border">
        {data.records.map((record) => (
          <div key={record.id} className="space-y-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {record.kind === 'profile'
                    ? pl
                      ? 'Aktualny profil opieki'
                      : 'Current care profile'
                    : record.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {record.shared
                    ? pl
                      ? `Udostępnione · ${data.stable!.name}`
                      : `Shared · ${data.stable!.name}`
                    : pl
                      ? 'Nieudostępnione stajni'
                      : 'Not shared with a stable'}
                </p>
              </div>
              {data.canManage ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={Boolean(pending)}
                  onClick={() =>
                    record.group && record.shared
                      ? setConfirmation(record.id)
                      : void change(record.id, !record.shared)
                  }
                >
                  {record.shared
                    ? pl
                      ? 'Przestań udostępniać'
                      : 'Stop sharing'
                    : pl
                      ? 'Udostępnij'
                      : 'Share'}
                </Button>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {pl
                    ? 'Tylko podgląd — dostęp opiekuna'
                    : 'View only — viewer carer access'}
                </span>
              )}
            </div>
            {confirmation === record.id ? (
              <div className="space-y-2" role="alert">
                <p>
                  {pl
                    ? 'Stajnia straci dostęp do udziału i szczegółów tego konia. Harmonogram pozostałych koni pozostanie dostępny. Nie anulujesz wydarzenia.'
                    : 'The stable will lose access to this horse’s participation and details. Other horses keep their shared schedule. This does not cancel the activity.'}
                </p>
                <Button
                  type="button"
                  disabled={Boolean(pending)}
                  onClick={() => void change(record.id, false)}
                >
                  {pl
                    ? 'Potwierdź wycofanie dostępu'
                    : 'Confirm withdrawal of access'}
                </Button>
              </div>
            ) : null}
            {record.recurring && data.canManage ? (
              <details>
                <summary className="cursor-pointer text-sm">
                  {pl
                    ? 'Wyjątek dla pojedynczego terminu'
                    : 'Individual occurrence exception'}
                </summary>
                <div className="mt-3 flex flex-wrap items-end gap-2">
                  <div className="space-y-1">
                    <FieldLabel htmlFor={`sharing-date-${record.id}`}>
                      {pl ? 'Data wystąpienia' : 'Occurrence date'}
                    </FieldLabel>
                    <Input
                      id={`sharing-date-${record.id}`}
                      type="date"
                      value={dates[record.id] ?? ''}
                      onChange={(event) => {
                        setSaved(undefined)
                        setDates((values) => ({
                          ...values,
                          [record.id]: event.target.value,
                        }))
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!dates[record.id] || Boolean(pending)}
                    onClick={() =>
                      void change(record.id, true, dates[record.id])
                    }
                  >
                    {pl ? 'Udostępnij termin' : 'Share occurrence'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!dates[record.id] || Boolean(pending)}
                    onClick={() =>
                      void change(record.id, false, dates[record.id])
                    }
                  >
                    {pl ? 'Ukryj przed stajnią' : 'Stop sharing occurrence'}
                  </Button>
                </div>
                {dates[record.id] && (
                  <OccurrenceAudience
                    horseId={horseId}
                    recordId={record.id}
                    date={dates[record.id]}
                    pl={pl}
                  />
                )}
                {saved?.recordId === record.id &&
                  saved.date === dates[record.id] && (
                    <p className="mt-2 text-sm" role="status">
                      {pl
                        ? `Zapisano dostęp dla terminu ${saved.date}.`
                        : `Sharing saved for ${saved.date}.`}
                    </p>
                  )}
              </details>
            ) : null}
          </div>
        ))}
      </div>
      <FormSubmissionError
        message={
          failed
            ? pl
              ? 'Nie udało się zmienić dostępu. Spróbuj ponownie.'
              : 'Could not change access. Please retry.'
            : undefined
        }
      />
    </DashboardSectionCard>
  )
}
