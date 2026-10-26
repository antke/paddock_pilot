import { useId } from 'react'
import { motion } from 'motion/react'
import { journalMotion, useAppMotion } from '#/components/motion/appMotion'
import type { ReactNode } from 'react'

import { ToggleGroup, ToggleGroupItem } from '#/components/ui/toggle-group'
import { cn } from '#/lib/utils'

type ChoiceButtonOption<TValue extends string> = {
  value: TValue
  label: ReactNode
  description?: ReactNode
}

type ChoiceButtonGroupLayout = 'compact' | 'cards' | 'segmented'

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
  const id = useId()
  const { spatial } = useAppMotion()
  const sliding = layout === 'segmented' && spatial
  return (
    <ToggleGroup
      data-slot="choice-button-group"
      value={value ? [value] : []}
      variant="outline"
      spacing={layout === 'segmented' ? 0 : 2}
      onValueChange={(values) => {
        const nextValue = values.at(-1)
        const option = options.find((item) => item.value === nextValue)

        if (option) {
          onValueChange(option.value)
        }
      }}
      className={cn(
        layout === 'compact' && 'flex w-full flex-wrap gap-2',
        layout === 'cards' &&
          'grid w-full auto-rows-fr items-stretch gap-2 sm:grid-cols-2',
        layout === 'segmented' &&
          'inline-flex w-fit max-w-full flex-nowrap gap-0 rounded-control bg-surface-muted inset-ring inset-ring-border',
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
            layout !== 'cards' && 'h-auto min-h-10 px-4 py-2 text-sm',
            layout === 'segmented' &&
              'ml-0 border-transparent bg-transparent data-pressed:border-transparent hover:border-transparent hover:bg-selection-surface/50 data-pressed:hover:bg-selection-surface',
            layout === 'cards' &&
              'h-auto min-h-20 w-full flex-col items-start justify-start gap-1 px-4 py-3 text-left whitespace-normal',
            sliding &&
              'isolate data-pressed:bg-transparent data-pressed:hover:bg-transparent',
          )}
        >
          {sliding && value === option.value && (
            <motion.span
              aria-hidden="true"
              layoutId={`${id}-selection`}
              layoutDependency={value}
              initial={false}
              transition={journalMotion.spring}
              className="pointer-events-none absolute inset-0.5 -z-10 rounded-[calc(var(--radius-control)-2px)] bg-selection-surface"
            />
          )}
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
