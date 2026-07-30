import { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete'
import { CaretDownIcon } from '@phosphor-icons/react'

import { cn } from '#/lib/utils'

function AutocompleteRoot<TItemValue>({
  ...props
}: Omit<AutocompletePrimitive.Root.Props<TItemValue>, 'items'> & {
  items?: ReadonlyArray<TItemValue>
}) {
  return <AutocompletePrimitive.Root<TItemValue> {...props} />
}

function AutocompleteInput({
  className,
  triggerLabel = 'Show suggestions',
  ...props
}: AutocompletePrimitive.Input.Props & {
  triggerLabel?: string
}) {
  return (
    <div className="relative">
      <AutocompletePrimitive.Input
        data-slot="autocomplete-input"
        className={cn(
          'app-control app-control-focus app-control-invalid py-1.5 pr-11',
          className,
        )}
        {...props}
      />
      <AutocompletePrimitive.Trigger
        aria-label={triggerLabel}
        className="app-control-focus group/autocomplete-trigger absolute top-1/2 right-1 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-transparent text-foreground/80 transition-[background-color,color,transform] duration-150 outline-none hover:bg-primary/18 hover:text-foreground active:scale-95 active:bg-primary/24 disabled:pointer-events-none disabled:opacity-50 data-popup-open:text-foreground motion-reduce:transition-none"
      >
        <CaretDownIcon
          aria-hidden="true"
          className="size-4 transition-transform duration-150 group-data-popup-open/autocomplete-trigger:rotate-180 motion-reduce:transition-none"
          weight="bold"
        />
      </AutocompletePrimitive.Trigger>
    </div>
  )
}

function AutocompleteContent({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: AutocompletePrimitive.Popup.Props &
  Pick<
    AutocompletePrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            'z-50 w-(--anchor-width) min-w-64 origin-(--transform-origin) overflow-hidden rounded-row border border-border bg-popover text-popover-foreground shadow-control duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...props}
        />
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

function AutocompleteList({
  className,
  ...props
}: AutocompletePrimitive.List.Props) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={cn(
        'max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto p-1 outline-none',
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteItem({
  className,
  ...props
}: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        'cursor-pointer rounded-control border border-transparent px-3 py-2.5 outline-none transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:border-primary/20 data-highlighted:bg-primary/8',
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteGroup({
  className,
  ...props
}: AutocompletePrimitive.Group.Props) {
  return (
    <AutocompletePrimitive.Group
      data-slot="autocomplete-group"
      className={cn('contents', className)}
      {...props}
    />
  )
}

function AutocompleteGroupLabel({
  className,
  ...props
}: AutocompletePrimitive.GroupLabel.Props) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-group-label"
      className={cn(
        'px-4 pt-3 pb-1 text-[0.6875rem] font-bold tracking-[0.12em] text-muted-foreground uppercase',
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteEmpty({
  className,
  ...props
}: AutocompletePrimitive.Empty.Props) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={cn(
        'px-4 py-4 text-sm leading-relaxed text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

export {
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteRoot,
}
