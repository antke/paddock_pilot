import type { ReactNode } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { useT } from '#/i18n/LocaleProvider'

/** Shared calendar navigation, following the training log's responsive layout. */
export function CalendarToolbar({
  label,
  previousLabel,
  nextLabel,
  onPrevious,
  onNext,
  onToday,
  viewControl,
  actions,
  mobileFilters,
}: {
  label: string
  previousLabel: string
  nextLabel: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  viewControl?: ReactNode
  actions?: ReactNode
  mobileFilters?: ReactNode
}) {
  const small = useSmallScreen()
  const t = useT()
  return small ? (
    <div className="grid gap-3">
      <div
        role="group"
        aria-label={t('trainingViews.navigation')}
        className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem_auto] items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onPrevious}
          aria-label={previousLabel}
        >
          <CaretLeftIcon aria-hidden="true" />
        </Button>
        <h2
          className="min-w-0 text-center font-display text-lg font-semibold leading-tight"
          aria-live="polite"
          aria-atomic="true"
        >
          {label}
        </h2>
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={onNext}
          aria-label={nextLabel}
        >
          <CaretRightIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="control"
          className="min-h-11 px-2"
          onClick={onToday}
        >
          {t('calendar.today')}
        </Button>
      </div>
      {(viewControl || mobileFilters) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {viewControl}
          {mobileFilters}
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="group"
        aria-label={t('trainingViews.navigation')}
        className="grid max-w-full grid-cols-3 items-center gap-2 [&>button]:px-2 [&>button]:whitespace-nowrap sm:[&>button]:px-3"
      >
        <Button
          variant="outline"
          size="control"
          onClick={onPrevious}
          aria-label={previousLabel}
        >
          <CaretLeftIcon aria-hidden="true" className="hidden sm:block" />
          {t('calendar.previous')}
        </Button>
        <Button variant="outline" size="control" onClick={onToday}>
          {t('calendar.today')}
        </Button>
        <Button
          variant="outline"
          size="control"
          onClick={onNext}
          aria-label={nextLabel}
        >
          {t('calendar.next')}
          <CaretRightIcon aria-hidden="true" className="hidden sm:block" />
        </Button>
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {viewControl}
        {actions}
      </div>
    </div>
  )
}

export function CalendarViewControl<T extends string>({
  value,
  options,
  onValueChange,
  label,
}: {
  value: T
  options: ReadonlyArray<{ value: T; label: string }>
  onValueChange: (value: T) => void
  label: string
}) {
  const small = useSmallScreen()
  return (
    <ChoiceButtonGroup
      aria-label={label}
      layout={small ? 'segmented' : 'compact'}
      className={
        small
          ? '[&>button]:min-h-11 [&>button]:px-3 [&>button]:text-sm'
          : 'grid w-auto grid-cols-2 [&>button]:h-(--control-height) [&>button]:px-3 [&>button]:text-sm [&>button]:pointer-coarse:min-h-11'
      }
      value={value}
      options={options}
      onValueChange={onValueChange}
    />
  )
}
