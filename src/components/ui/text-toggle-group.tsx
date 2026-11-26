import type { ReactNode } from 'react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

/**
 * A quiet text toggle for a filter inside a view (Upcoming/History, To do/Done/All):
 * the selected option in ink, semibold and underlined, never a second segmented control.
 */
export function TextToggleGroup<TValue extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string
  options: ReadonlyArray<{ value: TValue; label: ReactNode }>
  value: TValue
  onChange: (value: TValue) => void
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('-ml-2 flex flex-wrap items-center', className)}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="subtle"
          size="sm"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className="px-2 text-sm font-medium decoration-2 underline-offset-[6px] hover:bg-transparent aria-pressed:font-semibold aria-pressed:text-foreground aria-pressed:underline"
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
