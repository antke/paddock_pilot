import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'
import { createContext, useContext, useEffect, useId, useState } from 'react'

import { cn } from '#/lib/utils.ts'

const TooltipDescriptionContext = createContext<{
  open: boolean
  contentId: string
  setContentId: (id: string | undefined) => void
} | null>(null)

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: TooltipPrimitive.Root.Props) {
  const generatedId = useId()
  const [contentId, setContentId] = useState<string>()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen

  return (
    <TooltipDescriptionContext.Provider
      value={{ open, contentId: contentId ?? generatedId, setContentId }}
    >
      <TooltipPrimitive.Root
        data-slot="tooltip"
        {...props}
        open={open}
        onOpenChange={(nextOpen, details) => {
          onOpenChange?.(nextOpen, details)
          if (!details.isCanceled) setUncontrolledOpen(nextOpen)
        }}
      />
    </TooltipDescriptionContext.Provider>
  )
}

function TooltipTrigger({
  'aria-describedby': describedBy,
  ...props
}: TooltipPrimitive.Trigger.Props) {
  const context = useContext(TooltipDescriptionContext)
  const description =
    [
      ...new Set(
        [describedBy, context?.open ? context.contentId : undefined].filter(
          Boolean,
        ),
      ),
    ].join(' ') || undefined
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      {...props}
      aria-describedby={description}
    />
  )
}

function TooltipContent({
  className,
  side = 'top',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  children,
  id,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  >) {
  const context = useContext(TooltipDescriptionContext)
  const setContentId = context?.setContentId
  const fallbackId = useId()
  useEffect(() => {
    if (!id || !setContentId) return
    setContentId(id)
    return () => setContentId(undefined)
  }, [id, setContentId])

  return (
    <TooltipPrimitive.Portal data-slot="tooltip-portal">
      <TooltipPrimitive.Positioner
        data-slot="tooltip-positioner"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={8}
        className="isolate z-50 max-w-[min(var(--available-width),calc(100vw-1rem))]"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          id={id ?? context?.contentId ?? fallbackId}
          role="tooltip"
          className={cn(
            'z-50 inline-flex w-fit min-w-0 max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-control border border-border bg-foreground px-3 py-1.5 text-xs font-medium wrap-anywhere text-background shadow-control has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-control data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none motion-reduce:transition-none',
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-none bg-foreground fill-foreground data-[side=bottom]:top-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-left-1 data-[side=inline-end]:-translate-y-1/2 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-right-1 data-[side=inline-start]:-translate-y-1/2 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5"
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
