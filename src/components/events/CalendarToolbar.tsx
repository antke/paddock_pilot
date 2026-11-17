import type { ReactNode } from 'react'
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { ChoiceButtonGroup } from '#/components/ui/choice-button-group'
import { useSmallScreen } from '#/lib/useSmallScreen'
import { useT } from '#/i18n/LocaleProvider'

/**
 * Shared calendar toolbar, one anatomy at every width: ‹ title › Today on the
 * left; view, Filters and actions on the right. Phones wrap a view control to
 * a second row with Filters at the right edge; Filters alone stays on the date
 * row and wraps only when it does not fit.
 */
export function CalendarToolbar({
  label,
  headingAs: Heading = 'h2',
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
  headingAs?: 'h2' | 'h3'
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
  // Phones carry page actions in their bottom bar, not the toolbar.
  const toolbarActions = small ? undefined : actions
  const trailing = (mobileFilters || toolbarActions) && (
    <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
      {mobileFilters}
      {toolbarActions}
    </div>
  )
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div
        role="group"
        aria-label={t('trainingViews.navigation')}
        className="flex min-w-0 items-center gap-0.5"
      >
        <Button
          variant="ghost"
          size={small ? 'icon-lg' : 'icon'}
          onClick={onPrevious}
          aria-label={previousLabel}
        >
          <CaretLeftIcon aria-hidden="true" />
        </Button>
        <Heading
          className="min-w-0 px-1 text-center font-display text-lg leading-tight font-semibold md:text-xl"
          aria-live="polite"
          aria-atomic="true"
        >
          {label}
        </Heading>
        <Button
          variant="ghost"
          size={small ? 'icon-lg' : 'icon'}
          onClick={onNext}
          aria-label={nextLabel}
        >
          <CaretRightIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="control"
          className={small ? 'min-h-11 px-2' : 'px-2.5'}
          onClick={onToday}
        >
          {t('calendar.today')}
        </Button>
      </div>
      {(viewControl || trailing) && (
        <div
          className={
            small
              ? 'flex w-full flex-wrap items-center gap-2'
              : 'ml-auto flex flex-wrap items-center justify-end gap-2'
          }
        >
          {viewControl}
          {trailing}
        </div>
      )}
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
      layout="segmented"
      className={
        small
          ? '[&>button]:min-h-11 [&>button]:px-3 [&>button]:text-sm'
          : '[&>button]:h-(--control-height) [&>button]:px-3 [&>button]:text-sm [&>button]:pointer-coarse:min-h-11'
      }
      value={value}
      options={options}
      onValueChange={onValueChange}
    />
  )
}
