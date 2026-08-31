import { Switch as SwitchPrimitive } from '@base-ui/react/switch'

import { cn } from '#/lib/utils.ts'

function Switch({
  className,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default'
}) {
  const accessibleNameProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : ariaLabelledBy || id
      ? { 'aria-labelledby': ariaLabelledBy ?? `${id}-label` }
      : {}

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      id={id}
      {...accessibleNameProps}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-input/80 p-px transition-[background-color,border-color,box-shadow] duration-150 outline-none after:absolute after:-inset-x-2 after:-inset-y-3.5 hover:border-primary/45 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-unchecked:bg-surface-muted data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-card ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-4 group-data-[size=sm]/switch:data-checked:translate-x-3 group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 motion-reduce:transition-none"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
