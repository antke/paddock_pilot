import type { ReactNode } from 'react'

import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { cn } from '#/lib/utils'

type ChoiceButtonOption<TValue extends string> = {
  value: TValue
  label: ReactNode
}

type ChoiceButtonGroupProps<TValue extends string> = {
  value?: TValue
  options: ReadonlyArray<ChoiceButtonOption<TValue>>
  onValueChange: (value: TValue) => void
  disabled?: boolean
  'aria-invalid'?: boolean
  className?: string
}

export function ChoiceButtonGroup<TValue extends string>({
  value,
  options,
  onValueChange,
  disabled = false,
  'aria-invalid': ariaInvalid,
  className,
}: ChoiceButtonGroupProps<TValue>) {
  return (
    <ToggleGroup
      value={value ? [value] : []}
      onValueChange={(values) => {
        const nextValue = values.at(-1)
        const option = options.find((item) => item.value === nextValue)

        if (option) {
          onValueChange(option.value)
        }
      }}
      className={cn('flex w-full flex-wrap gap-2', className)}
      disabled={disabled}
      aria-invalid={ariaInvalid}
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          className="!rounded-row border border-border-subtle bg-background/55 px-4 text-muted-foreground shadow-none hover:border-primary/25 hover:bg-primary/5 data-[state=on]:border-primary/20 data-[state=on]:bg-card data-[state=on]:text-foreground data-[state=on]:shadow-control"
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
