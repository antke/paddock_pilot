'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'
import { toggleVariants } from '#/components/ui/toggle.tsx'

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }
>({
  size: 'default',
  variant: 'default',
  spacing: 2,
  orientation: 'horizontal',
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = 'horizontal',
  wrap = false,
  children,
  style,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
    wrap?: boolean
  }) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      orientation={orientation}
      style={
        typeof style === 'function'
          ? style
          : ({ '--gap': spacing, ...style } as React.CSSProperties)
      }
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        wrap && 'flex-wrap',
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant = 'default',
  size = 'default',
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        'relative shrink-0 group-data-[spacing=0]/toggle-group:px-2 focus:z-20 focus-visible:z-20 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5',
        // The mark takes no width and hangs before the label, inside this padding; the end
        // padding mirrors it, so the label stays centred and pressing never resizes the chip.
        'has-data-[slot=choice-mark]:gap-0 has-data-[slot=choice-mark]:px-7',
        context.spacing === 0 &&
          (context.variant || variant) === 'outline' &&
          'data-pressed:z-10',
        context.spacing === 0 &&
          (context.variant || variant) === 'outline' &&
          (context.orientation === 'vertical'
            ? '-mt-px first:mt-0'
            : '-ml-px first:ml-0'),
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

/**
 * Leading slot of a choice chip: a zero-width anchor before the label, so the tick hangs just
 * before the text at any chip width while the label stays centred. A chip with a dot or icon
 * swaps it for the shared tick while pressed; a chip without one shows only the tick. The tick
 * draws in like the journal check, and the label never moves.
 */
function ToggleGroupItemMark({ children }: { children?: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      data-slot="choice-mark"
      className="pointer-events-none relative w-0 self-stretch"
    >
      <span className="absolute end-1.5 top-1/2 grid size-3.5 -translate-y-1/2 place-items-center">
        {children && (
          <span className="col-start-1 row-start-1 grid place-items-center transition-[opacity,scale] duration-(--motion-state) ease-(--ease-arrive) group-data-pressed/toggle:scale-50 group-data-pressed/toggle:opacity-0 motion-reduce:transition-none">
            {children}
          </span>
        )}
        <svg viewBox="0 0 24 24" className="col-start-1 row-start-1 size-3.5">
          <path
            d="m5 12.5 4.5 4.5L19 7.5"
            pathLength={1}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-(--motion-exit) ease-out group-data-pressed/toggle:[stroke-dashoffset:0] group-data-pressed/toggle:duration-(--motion-disclosure) group-data-pressed/toggle:ease-(--ease-arrive) motion-reduce:transition-none"
          />
        </svg>
      </span>
    </span>
  )
}

export { ToggleGroup, ToggleGroupItem, ToggleGroupItemMark }
