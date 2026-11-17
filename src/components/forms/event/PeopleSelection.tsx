import { useId } from 'react'
import { SelectionCheckMark } from '#/components/forms/FormLayout'
import { cn } from '#/lib/utils'
import { FieldGrid, FieldLegend, FieldSet } from '#/components/ui/field'
import { UserAvatar } from '#/components/users/UserAvatar'
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
  legendHidden = false,
  lockedIds = [],
}: {
  people: PersonOption[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  /** Legend text; defaults to "Taking part". */
  title?: string
  /** Inside a section that already shows the title, the legend is for screen readers only. */
  legendHidden?: boolean
  /** Accounts that are in the list for another reason and cannot be unticked. */
  lockedIds?: ReadonlyArray<string>
}) {
  const id = useId()
  const t = useT()
  const { locale } = useLocale()
  const pl = locale === 'pl'
  return (
    <FieldSet disabled={disabled}>
      <FieldLegend
        variant="label"
        className={legendHidden ? 'sr-only' : undefined}
      >
        {title ?? t('eventForm.takingPart')}
      </FieldLegend>
      <p className="-mt-1 text-sm text-muted-foreground">
        {t('eventForm.takingPartHelp')}
      </p>
      {/* Open rows matching the horse picker: hover band, pale stone fill and tick when chosen. */}
      <FieldGrid
        breakpoint="sm"
        gap="compact"
        className="items-stretch gap-x-3 gap-y-1"
      >
        {people.map((person) => {
          const locked = lockedIds.includes(person.id)
          const checked = locked || value.includes(person.id)
          const noteId = `${id}-${person.id}-locked`
          return (
            <label
              key={person.id}
              // A grid cell, so the row fills a stretched label and cards sharing a row match.
              className="grid min-w-0"
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
              <span
                data-selected={checked || undefined}
                className={cn(
                  'app-record app-record-compact app-choice-feedback flex min-h-11 min-w-0 items-center gap-3 peer-focus-visible:ring-2 peer-focus-visible:ring-ring data-selected:bg-selection-surface',
                  locked
                    ? 'cursor-default'
                    : 'app-record-hover cursor-pointer data-selected:hover:bg-selection-surface',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <UserAvatar
                  name={person.name}
                  photoUrl={person.photoUrl}
                  className="size-12 sm:size-14"
                />
                <span className="min-w-0 flex-1 break-words">
                  <span
                    id={`${id}-${person.id}-name`}
                    className="block font-semibold"
                  >
                    {person.name}
                  </span>
                  {locked && (
                    <span
                      id={noteId}
                      className="block text-sm font-medium text-primary"
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
                      className="block text-sm text-muted-foreground"
                    >
                      {pl ? 'Konie' : 'Horses'}: {person.horseNames!.join(', ')}
                    </span>
                  )}
                </span>
                <SelectionCheckMark checked={checked} />
              </span>
            </label>
          )
        })}
      </FieldGrid>
      {!people.length && (
        <p className="text-sm text-muted-foreground">
          {pl ? 'Brak osób do wybrania.' : 'No people available to select.'}
        </p>
      )}
    </FieldSet>
  )
}
