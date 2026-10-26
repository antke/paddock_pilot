import { createRequestId } from '#/lib/createRequestId'
import { useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useLocale } from '#/i18n/LocaleProvider'
import { Button, ButtonLink } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { FieldLabel } from '#/components/ui/field'
import { DashboardSectionCard } from '#/components/dashboard/DashboardSectionCard'
import { FormSubmissionError } from '#/components/forms/FormSubmissionError'

const categories = ['events', 'training', 'care', 'documents', 'tasks'] as const
type Category = (typeof categories)[number]
const labels = {
  en: {
    events: 'Past events',
    training: 'Training history',
    care: 'Care history and current care profile',
    documents: 'Horse documents (excluding insurance and other files)',
    tasks: 'Pending care tasks',
  },
  pl: {
    events: 'Minione wydarzenia',
    training: 'Historia treningów',
    care: 'Historia opieki i aktualny profil opieki',
    documents: 'Dokumenty konia (bez ubezpieczeń i innych plików)',
    tasks: 'Oczekujące zadania opieki',
  },
}

export function HorseHistorySharing({
  horseId,
  stableId,
}: {
  horseId: Id<'horses'>
  stableId: Id<'stables'>
}) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const [cutoff] = useState(() => Date.now())
  const preview = useQuery(api.historySharing.preview, { horseId, cutoff })
  const jobs = useQuery(api.historySharing.jobsForHorse, { horseId })
  const start = useMutation(api.historySharing.start)
  const retry = useMutation(api.historySharing.retry)
  const [selected, setSelected] = useState<Array<Category>>([])
  const [review, setReview] = useState(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const request = useRef(createRequestId())
  const busy = useRef(false)
  if (!preview || !jobs)
    return (
      <p role="status">{pl ? 'Wczytywanie historii…' : 'Loading history…'}</p>
    )
  const job =
    jobs.find((item) => item.requestId === request.current) ??
    [...jobs]
      .reverse()
      .find((item) => item.stableId === stableId && item.status !== 'complete')
  if (job)
    return (
      <div className="space-y-3" aria-live="polite">
        <p>
          {job.status === 'complete'
            ? pl
              ? 'Koń jest w stajni. Wybrana historia została udostępniona.'
              : 'The horse is in the stable. Selected history is shared.'
            : job.status === 'failed'
              ? pl
                ? 'Udostępnianie przerwane. Sprawdź aktualną stajnię i członkostwo, a następnie spróbuj ponownie.'
                : 'Sharing interrupted. Check the current placement and membership, then retry.'
              : pl
                ? `Udostępnianie: ${job.processed} zapisów`
                : `Sharing: ${job.processed} records`}
        </p>
        {job.status !== 'complete' ? (
          <Button
            type="button"
            onClick={() =>
              void retry({ id: job._id }).catch(() => setFailed(true))
            }
          >
            {pl ? 'Ponów udostępnianie' : 'Retry sharing'}
          </Button>
        ) : null}
        <FormSubmissionError
          message={
            failed
              ? pl
                ? 'Nie udało się ponowić. Spróbuj ponownie.'
                : 'Could not retry. Please try again.'
              : undefined
          }
        />
      </div>
    )
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {pl
          ? `Wybierz historię do ${preview.throughDate}. Wybór nie obejmuje przyszłych zapisów ani przyszłych wystąpień cyklicznych.`
          : `Choose existing history through ${preview.throughDate}. This does not share future records or future recurring occurrences.`}
      </p>
      {categories.map((category) => (
        <FieldLabel
          key={category}
          className="flex min-h-11 items-center gap-3 font-normal"
        >
          <Checkbox
            aria-label={labels[locale][category]}
            checked={selected.includes(category)}
            disabled={
              pending ||
              review ||
              (category !== 'care' && preview.counts[category] === 0)
            }
            onCheckedChange={(checked) =>
              setSelected((values) =>
                checked
                  ? [...values, category]
                  : values.filter((value) => value !== category),
              )
            }
          />
          <span>
            {labels[locale][category]}{' '}
            <span className="text-muted-foreground">
              ({preview.counts[category]})
            </span>
          </span>
        </FieldLabel>
      ))}
      <p className="text-sm text-muted-foreground">
        {pl
          ? 'Opieka obejmuje zdrowie, leki, wagę i żywienie oraz aktualne alergie, karmienie i informacje alarmowe. Dokumenty finansowe i katalogi kontaktów nie są dołączane. Ubezpieczenia i inne pliki można udostępnić osobno.'
          : 'Care includes health, medication, weight and nutrition, plus current allergies, feeding routines and emergency notes. Financial documents and contact directories are not included. Share insurance and other files individually.'}
      </p>
      {review ? (
        <div className="space-y-3">
          <p>
            {selected.length
              ? selected.map((category) => labels[locale][category]).join(' · ')
              : pl
                ? 'Dodaj konia bez udostępniania historii.'
                : 'Add the horse without sharing history.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {pl
              ? 'Członkowie zobaczą harmonogram i status, administratorzy udostępnione szczegóły. Oryginalne zapisy pozostają przy koniu.'
              : 'Members will see schedule and status; administrators will see shared details. Original records stay with the horse.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={pending}
              onClick={async () => {
                if (busy.current) return
                busy.current = true
                setPending(true)
                setFailed(false)
                try {
                  await start({
                    horseId,
                    stableId,
                    categories: selected,
                    cutoff: preview.cutoff,
                    requestId: request.current,
                  })
                } catch {
                  setFailed(true)
                } finally {
                  busy.current = false
                  setPending(false)
                }
              }}
            >
              {pending
                ? pl
                  ? 'Zapisywanie…'
                  : 'Saving…'
                : pl
                  ? 'Dodaj konia i udostępnij wybór'
                  : 'Add horse and share selection'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setReview(false)}
            >
              {pl ? 'Zmień wybór' : 'Change selection'}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={() => setReview(true)}>
          {pl ? 'Sprawdź wybór' : 'Review selection'}
        </Button>
      )}
      <FormSubmissionError
        message={
          failed
            ? pl
              ? 'Nie udało się zapisać. Wybór zachowany — spróbuj ponownie.'
              : 'Could not save. Your selection is preserved; please retry.'
            : undefined
        }
      />
    </div>
  )
}

export function ExistingHorseSharing({
  stableId,
}: {
  stableId: Id<'stables'>
}) {
  const { locale } = useLocale()
  const pl = locale === 'pl'
  const horses = useQuery(api.horses.listMine, {})
  const [selected, setSelected] = useState<Array<string>>([])
  if (!horses) return null
  const owned = horses.filter((horse) => horse.access.isOwner)
  return (
    <DashboardSectionCard
      title={pl ? 'Dodaj swoje konie' : 'Add your existing horses'}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {pl
          ? 'Członkostwo jest aktywne. Dodanie koni jest opcjonalne; nie trzeba tworzyć ich ponownie.'
          : 'Your membership is active. Adding horses is optional; you do not need to create them again.'}
      </p>
      <div className="space-y-5">
        {owned.map((horse) => (
          <div key={horse._id} className="space-y-3">
            <FieldLabel className="flex min-h-11 items-center gap-3">
              <Checkbox
                aria-label={horse.name}
                checked={selected.includes(horse._id)}
                onCheckedChange={(checked) =>
                  setSelected((values) =>
                    checked
                      ? [...values, horse._id]
                      : values.filter((id) => id !== horse._id),
                  )
                }
              />
              {horse.name}{' '}
              <span className="font-normal text-muted-foreground">
                ·{' '}
                {horse.access.stable?.name ??
                  (pl ? 'Bez stajni' : 'No stable placement')}
              </span>
            </FieldLabel>
            {selected.includes(horse._id) ? (
              horse.stableId && horse.stableId !== stableId ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    {pl
                      ? 'Najpierw sprawdź przeniesienie konia. Po przeprowadzce wróć, aby wybrać historię.'
                      : 'Review this horse’s move first. Return after the move to select history.'}
                  </p>
                  <ButtonLink
                    to="/horses/$horseId/manage"
                    params={{ horseId: horse._id }}
                  >
                    {pl ? 'Sprawdź przeniesienie' : 'Review move'}
                  </ButtonLink>
                </div>
              ) : (
                <HorseHistorySharing horseId={horse._id} stableId={stableId} />
              )
            ) : null}
          </div>
        ))}
      </div>
      {!owned.length ? (
        <ButtonLink to="/horses/create">
          {pl ? 'Dodaj nowego konia' : 'Add a new horse'}
        </ButtonLink>
      ) : null}
    </DashboardSectionCard>
  )
}
