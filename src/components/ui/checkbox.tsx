import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { cn } from '#/lib/utils.ts'
import { CheckIcon } from '@phosphor-icons/react'

function Checkbox({
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: CheckboxPrimitive.Root.Props) {
  const accessibleNameProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : ariaLabelledBy || id
      ? { 'aria-labelledby': ariaLabelledBy ?? `${id}-label` }
      : {}

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      id={id}
      {...accessibleNameProps}
      className={cn(
        'peer relative flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-control border border-input/80 bg-surface-elevated transition-[background-color,border-color,color,box-shadow] duration-150 outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-3 hover:border-primary/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-4"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
