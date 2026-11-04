import { useId } from 'react'
import { DashboardItemCard } from '#/components/dashboard/DashboardItemCard'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { FieldLegend, FieldSet } from '#/components/ui/field'
import { useLocale, useT } from '#/i18n/LocaleProvider'

export type PersonOption = {
  id: string
  name: string
  photoUrl?: string
  horseNames?: string[]
  stableIds?: string[]
  personal?: boolean
}

/**
 * The member a typed name refers to, when exactly one account has that name.
 * Free text never grants anything; this only tells the form which tick to
 * keep on for someone already named as leading the session.
 */
export function findPersonByName(
  people: ReadonlyArray<PersonOption>,
  name: string | undefined,
  locale: string,
) {
  const normalise = (value: string) =>
    value.trim().replace(/\s+/g, ' ').toLocaleLowerCase(locale)
  const wanted = normalise(name ?? '')
  if (!wanted) return undefined
  const matches = people.filter((person) => normalise(person.name) === wanted)
  return matches.length === 1 ? matches[0] : undefined
}

export function PeopleSelection({
  people,
  value,
  onChange,
  disabled = false,
  title,
  lockedIds = [],
}: {
  people: PersonOption[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Legend text; defaults to "Taking part". */
  title?: string
  /** Accounts that are in the list for another reason and cannot be unticked. */
  lockedIds?: ReadonlyArray<string>
}) {
  const id = useId()
  const t = useT()
  const { locale } = useLocale()
  const pl = locale === 'pl'
  return (
    <FieldSet disabled={disabled}>
      <FieldLegend variant="label">
        <span className="inline-flex items-center gap-1">
          {title ?? t('eventForm.takingPart')}
          <FormHelpTooltip
            label={pl ? 'Informacje o uczestnikach' : 'About people selection'}
          >
            {pl
              ? 'Wybierz uczestników, także tych bez własnego konia. Właściciel wybranego konia zostanie zaznaczony — możesz go odznaczyć. Uczestnicy zobaczą termin w swoim kalendarzu, bez dostępu do prywatnych wpisów konia.'
              : 'Choose who is taking part, including people without a horse. Horse owners are preselected and can be removed. Participants see the schedule in their calendar, without access to private horse records.'}
          </FormHelpTooltip>
        </span>
      </FieldLegend>
      <p className="-mt-1 text-sm text-muted-foreground">
        {t('eventForm.takingPartHelp')}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => {
          const locked = lockedIds.includes(person.id)
          const checked = locked || value.includes(person.id)
          const noteId = `${id}-${person.id}-locked`
          return (
            <label
              key={person.id}
              className="block min-w-0"
              title={locked ? t('eventForm.leaderIncludedReason') : undefined}
              htmlFor={`${id}-${person.id}`}
            >
              <input
                id={`${id}-${person.id}`}
                type="checkbox"
                name="peopleIds"
                aria-labelledby={`${id}-${person.id}-name`}
                aria-describedby={
                  [
                    person.horseNames?.length
                      ? `${id}-${person.id}-horses`
                      : undefined,
                    locked ? noteId : undefined,
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                value={person.id}
                checked={checked}
                disabled={disabled || locked}
                className="peer sr-only"
                onChange={(e) =>
                  onChange(
                    e.target.checked
                      ? [...value, person.id]
                      : value.filter((v) => v !== person.id),
                  )
                }
              />
              <DashboardItemCard
                chrome="cards"
                density="compact"
                interactive={!disabled && !locked}
                selected={checked}
                className={`h-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${locked ? 'cursor-default' : 'cursor-pointer'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex min-h-12 min-w-0 items-center gap-3">
                  {person.photoUrl ? (
                    <img
                      src={person.photoUrl}
                      alt=""
                      className="size-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold"
                    >
                      {person.name
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </span>
                  )}
                  <div className="min-w-0 break-words">
                    <span
                      id={`${id}-${person.id}-name`}
                      className="block font-medium"
                    >
                      {person.name}
                    </span>
                    {locked && (
                      <span
                        id={noteId}
                        className="mt-1 block text-sm font-medium text-primary"
                      >
                        {t('eventForm.leaderIncluded')}
                        <span className="sr-only">
                          . {t('eventForm.leaderIncludedReason')}
                        </span>
                      </span>
                    )}
                    {Boolean(person.horseNames?.length) && (
                      <span
                        id={`${id}-${person.id}-horses`}
                        className="mt-1 block text-sm text-muted-foreground"
                      >
                        {pl ? 'Konie' : 'Horses'}:{' '}
                        {person.horseNames!.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </DashboardItemCard>
            </label>
          )
        })}
      </div>
      {!people.length && (
        <p className="text-sm text-muted-foreground">
          {pl ? 'Brak osób do wybrania.' : 'No people available to select.'}
        </p>
      )}
    </FieldSet>
  )
}
