import type { ReactNode } from 'react'

import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { cn } from '#/lib/utils'

type ChoiceButtonOption<TValue extends string> = {
  value: TValue
  label: ReactNode
  description?: ReactNode
}

type ChoiceButtonGroupLayout = 'compact' | 'cards'

type ChoiceButtonGroupProps<TValue extends string> = {
  value?: TValue
  options: ReadonlyArray<ChoiceButtonOption<TValue>>
  onValueChange: (value: TValue) => void
  disabled?: boolean
  'aria-label'?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  className?: string
  layout?: ChoiceButtonGroupLayout
}

export function ChoiceButtonGroup<TValue extends string>({
  value,
  options,
  onValueChange,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  className,
  layout = 'compact',
}: ChoiceButtonGroupProps<TValue>) {
  return (
    <ToggleGroup
      data-slot="choice-button-group"
      value={value ? [value] : []}
      variant="outline"
      onValueChange={(values) => {
        const nextValue = values.at(-1)
        const option = options.find((item) => item.value === nextValue)

        if (option) {
          onValueChange(option.value)
        }
      }}
      className={cn(
        layout === 'compact' && 'flex w-full flex-wrap gap-2',
        layout === 'cards' && 'grid w-full gap-2 sm:grid-cols-2',
        className,
      )}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className={cn(
            layout === 'compact' && 'px-4',
            layout === 'cards' &&
              'h-auto min-h-20 w-full flex-col items-start gap-1 px-4 py-3 text-left whitespace-normal',
          )}
        >
          <span
            className={cn(
              layout === 'cards' && 'text-base font-semibold leading-snug',
            )}
          >
            {option.label}
          </span>
          {layout === 'cards' && option.description && (
            <span className="text-xs leading-relaxed opacity-75">
              {option.description}
            </span>
          )}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
