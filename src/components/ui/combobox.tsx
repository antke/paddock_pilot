import { useT } from '#/i18n/LocaleProvider'
import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox'
import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '#/lib/utils'
import { usePickerDismissTranslation } from './usePickerDismissTranslation'

// shadcn/ui's Base UI combobox composition, styled with the app control tokens.
const Combobox = ComboboxPrimitive.Root

function ComboboxInput({
  className,
  triggerLabel,
  ...props
}: ComboboxPrimitive.Input.Props & {
  triggerLabel?: string
}) {
  const t = useT()
  const dismissContainerRef = usePickerDismissTranslation()

  return (
    <div ref={dismissContainerRef} className="relative">
      <ComboboxPrimitive.Input
        data-slot="combobox-input"
        className={cn(
          'app-control app-control-focus app-control-invalid py-1.5 pr-11 max-md:pr-12 pointer-coarse:pr-12',
          className,
        )}
        {...props}
      />
      <ComboboxPrimitive.Trigger
        data-slot="combobox-trigger"
        aria-label={triggerLabel ?? t('listControls.showSuggestions')}
        className="app-control-focus group/combobox-trigger absolute top-1/2 right-1 flex size-8 max-md:right-0 max-md:size-11 pointer-coarse:right-0 pointer-coarse:size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent text-foreground/80 transition-[background-color,color,transform] duration-150 outline-none hover:bg-surface-muted hover:text-foreground motion-safe:active:scale-95 active:bg-surface-muted disabled:pointer-events-none disabled:opacity-50 data-popup-open:text-foreground motion-reduce:transition-none"
      >
        <CaretDownIcon
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-data-popup-open/combobox-trigger:rotate-180 motion-reduce:transition-none"
          weight="bold"
        />
      </ComboboxPrimitive.Trigger>
    </div>
  )
}

function ComboboxContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  const dismissContainerRef = usePickerDismissTranslation()
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        ref={dismissContainerRef}
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            'z-50 w-(--anchor-width) min-w-[min(16rem,var(--available-width))] max-w-(--available-width) origin-(--transform-origin) overflow-hidden rounded-row border border-border bg-popover text-popover-foreground shadow-control app-popup-motion outline-none motion-reduce:animate-none motion-reduce:transition-none',
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn(
        'max-h-[min(18rem,calc(var(--available-height)-2px))] scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain p-1 outline-none',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem({ className, ...props }: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        'min-h-11 cursor-pointer rounded-control border border-transparent px-3 py-2.5 app-choice-feedback outline-none active:bg-primary/15 select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:border-selection data-highlighted:bg-selection-surface data-highlighted:text-selection',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxEmpty({
  className,
  children,
  ...props
}: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    >
      {/* Keep the live region mounted, but render its spacing only with the message. */}
      <div className="px-4 py-4">{children}</div>
    </ComboboxPrimitive.Empty>
  )
}

export {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Combobox,
}
