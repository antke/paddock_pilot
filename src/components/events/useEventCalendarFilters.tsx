import { useId, useMemo, useRef, useState } from 'react'
import { CheckIcon, FunnelSimpleIcon, XIcon } from '@phosphor-icons/react'
import type { CalendarHorse } from 'shared/horses/horseCalendarColours'
import { eventCalendarHorses } from 'shared/horses/horseCalendarColours'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import type { StableDashboardEvent } from '#/components/stables/stableDashboardDates'
import { MotionDisclosure } from '#/components/motion/MotionDisclosure'
import { Button } from '#/components/ui/button'
import { Field, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '#/components/ui/combobox'
import { useLocale, useT } from '#/i18n/LocaleProvider'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { useSessionState } from '#/lib/useSessionState'
import { createEventListFilterConfig } from './eventListFilters'

export function useEventCalendarFilters({
  events,
  horses,
  storageKey,
  onShowResults,
}: {
  events: StableDashboardEvent[]
  horses: ReadonlyArray<CalendarHorse>
  storageKey?: string
  onShowResults: () => void
}) {
  const t = useT()
  const { locale } = useLocale()
  const small = useSmallScreen()
  const id = useId()
  const toggleRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [horsePickerOpen, setHorsePickerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const config = useMemo(() => createEventListFilterConfig(locale), [locale])
  const key = (field: string) =>
    storageKey ? `${storageKey}:filters:${field}` : undefined
  const [selected, setSelected] = useSessionState<string[]>(
    key('horses'),
    [],
    (value) =>
      Array.isArray(value) &&
      value.length < 1000 &&
      value.every((item) => typeof item === 'string')
        ? value
        : undefined,
  )
  const [type, setType] = useSessionState(key('type'), 'all', (value) =>
    typeof value === 'string' &&
    (value === 'all' ||
      config.facets[0].options.some((option) => option.value === value))
      ? value
      : undefined,
  )
  const [status, setStatus] = useSessionState(key('status'), 'all', (value) =>
    typeof value === 'string' &&
    (value === 'all' ||
      config.facets[1].options.some((option) => option.value === value))
      ? value
      : undefined,
  )
  const horseLabel = (horseId: string) => {
    const horse = horses.find((item) => item._id === horseId)
    return horse ? getHorseDisplayName(horse) : horseId
  }
  const count =
    Number(selected.length > 0) +
    Number(type !== 'all') +
    Number(status !== 'all')
  const summary = [
    selected.map(horseLabel).join(', '),
    config.facets[0].options.find((option) => option.value === type)?.label,
    config.facets[1].options.find((option) => option.value === status)?.label,
  ]
    .filter(Boolean)
    .join(' · ')
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          (!selected.length ||
            eventCalendarHorses(event, horses).some((horse) =>
              selected.includes(horse._id),
            )) &&
          (type === 'all' || event.type === type) &&
          (status === 'all' || (event.status ?? 'planned') === status),
      ),
    [events, horses, selected, type, status],
  )
  const clear = () => {
    setSelected([])
    setType('all')
    setStatus('all')
    setQuery('')
  }
  const control = (
    <Button
      ref={toggleRef}
      variant="outline"
      size="control"
      className={small ? 'min-h-11 px-2' : undefined}
      aria-expanded={open}
      aria-controls={`${id}-filters`}
      onClick={() => setOpen((value) => !value)}
    >
      <FunnelSimpleIcon aria-hidden="true" />
      <span className="whitespace-nowrap">
        {t('listControls.filtersWithCount', { count })}
      </span>
    </Button>
  )
  const content = (
    <>
      {(!small || count > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {!small && control}
          {count > 0 && (
            <>
              <span className="min-w-0 flex-1 text-sm [overflow-wrap:anywhere]">
                {summary}
              </span>
              <Button variant="ghost" size="control" onClick={clear}>
                {t('listControls.clear')}
              </Button>
            </>
          )}
        </div>
      )}
      <MotionDisclosure
        id={`${id}-filters`}
        open={open}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            setOpen(false)
            toggleRef.current?.focus()
          }
        }}
      >
        <div className="grid gap-4 rounded-row bg-surface p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              onKeyDownCapture={(event) => {
                if (event.key === 'Escape' && !horsePickerOpen) {
                  event.preventDefault()
                  event.stopPropagation()
                  setOpen(false)
                  toggleRef.current?.focus()
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && horsePickerOpen)
                  event.stopPropagation()
              }}
            >
              <FieldLabel htmlFor={`${id}-horses`}>
                {t('trainingViews.findHorses')}
              </FieldLabel>
              <Combobox
                multiple
                openOnInputClick
                open={horsePickerOpen}
                onOpenChange={setHorsePickerOpen}
                items={horses.map((horse) => horse._id)}
                value={selected}
                onValueChange={(value) => {
                  setSelected(value)
                  setQuery('')
                }}
                inputValue={query}
                onInputValueChange={setQuery}
                itemToStringLabel={horseLabel}
                filter={(horseId, search) =>
                  horseLabel(horseId)
                    .toLocaleLowerCase(locale)
                    .includes(search.trim().toLocaleLowerCase(locale))
                }
              >
                <ComboboxInput
                  id={`${id}-horses`}
                  aria-label={t('trainingViews.findHorses')}
                  placeholder={t('trainingViews.searchHorses')}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {t('trainingViews.noMatchingHorses')}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(horseId: string) => (
                      <ComboboxItem
                        key={horseId}
                        value={horseId}
                        className="flex items-center justify-between gap-2"
                      >
                        <span className="min-w-0 wrap-anywhere">
                          {horseLabel(horseId)}
                        </span>
                        {selected.includes(horseId) && (
                          <CheckIcon
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                        )}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <div
                role="group"
                aria-label={t('trainingViews.filterHorses')}
                className="flex flex-wrap gap-2"
              >
                <Button
                  size="control"
                  variant={selected.length ? 'outline' : 'secondary'}
                  aria-pressed={!selected.length}
                  onClick={() => setSelected([])}
                >
                  {t('trainingViews.allHorses')}
                </Button>
                {selected.map((horseId) => (
                  <Button
                    key={horseId}
                    size="control"
                    variant="secondary"
                    aria-pressed
                    onClick={() =>
                      setSelected((value) =>
                        value.filter((item) => item !== horseId),
                      )
                    }
                  >
                    {horseLabel(horseId)}
                    <XIcon aria-hidden="true" />
                  </Button>
                ))}
              </div>
            </Field>
            {config.facets.map((facet) => (
              <Field key={facet.id}>
                <FieldLabel htmlFor={`${id}-${facet.id}`}>
                  {facet.label}
                </FieldLabel>
                <Select
                  id={`${id}-${facet.id}`}
                  value={facet.id === 'type' ? type : status}
                  onChange={(event) =>
                    (facet.id === 'type' ? setType : setStatus)(
                      event.target.value,
                    )
                  }
                >
                  <option value="all">{facet.allLabel}</option>
                  {facet.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            ))}
          </div>
          {small && (
            <Button
              variant="secondary"
              className="min-h-11 w-full"
              onClick={() => {
                setOpen(false)
                onShowResults()
              }}
            >
              {t('trainingViews.showResults')}
            </Button>
          )}
        </div>
      </MotionDisclosure>
    </>
  )
  return { events: filteredEvents, control, content, activeFilterCount: count }
}
