import { useId } from 'react'
import { DashboardItemCard } from '#/components/dashboard/DashboardItemCard'
import { FormHelpTooltip } from '#/components/forms/FormHelpTooltip'
import { FieldLegend, FieldSet } from '#/components/ui/field'
import { useLocale } from '#/i18n/LocaleProvider'

export type PersonOption = {
  id: string
  name: string
  photoUrl?: string
  horseNames?: string[]
  stableIds?: string[]
  personal?: boolean
}

export function PeopleSelection({
  people,
  value,
  onChange,
  disabled = false,
}: {
  people: PersonOption[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}) {
  const id = useId()
  const { locale } = useLocale()
  const pl = locale === 'pl'
  return (
    <FieldSet disabled={disabled}>
      <FieldLegend variant="label">
        <span className="inline-flex items-center gap-1">
          {pl ? 'Osoby' : 'People'}
          <FormHelpTooltip
            label={pl ? 'Informacje o uczestnikach' : 'About people selection'}
          >
            {pl
              ? 'Wybierz uczestników, także tych bez własnego konia. Właściciel wybranego konia zostanie zaznaczony — możesz go odznaczyć. Uczestnicy zobaczą termin w swoim kalendarzu, bez dostępu do prywatnych wpisów konia.'
              : 'Choose who is taking part, including people without a horse. Horse owners are preselected and can be removed. Participants see the schedule in their calendar, without access to private horse records.'}
          </FormHelpTooltip>
        </span>
      </FieldLegend>
      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => {
          const checked = value.includes(person.id)
          return (
            <label
              key={person.id}
              className="block min-w-0"
              htmlFor={`${id}-${person.id}`}
            >
              <input
                id={`${id}-${person.id}`}
                type="checkbox"
                name="peopleIds"
                aria-labelledby={`${id}-${person.id}-name`}
                aria-describedby={
                  person.horseNames?.length
                    ? `${id}-${person.id}-horses`
                    : undefined
                }
                value={person.id}
                checked={checked}
                disabled={disabled}
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
                interactive={!disabled}
                selected={checked}
                className={`h-full cursor-pointer peer-focus-visible:ring-2 peer-focus-visible:ring-ring ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
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
