import { QuestionMarkIcon } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'
import type { ReactNode } from 'react'
import { FieldLabel, FieldLabelRow } from '#/components/ui/field'
import { useT } from '#/i18n/LocaleProvider'
import { useState } from 'react'

type FormHelpTooltipProps = {
  label: string
  children: ReactNode
}

export function FormHelpTooltip({
  label,
  children,
  inline = false,
}: FormHelpTooltipProps & {
  /**
   * Keeps the button out of the line's height, so a label with help sits at
   * exactly the height of a plain label and neighbouring inputs align. The
   * tap target keeps its full size.
   */
  inline?: boolean
}) {
  if (inline)
    return (
      <span className="relative inline-flex w-6 shrink-0 self-stretch items-center justify-center">
        <span className="absolute">
          <FormHelpTooltip label={label}>{children}</FormHelpTooltip>
        </span>
      </span>
    )

  const [open, setOpen] = useState(false)

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        closeOnClick={false}
        onClick={() => setOpen(true)}
        render={
          // A 44px hit area around a 24px outlined circle; the negative margin
          // keeps the layout footprint at the circle's size.
          <Button
            type="button"
            variant="subtle"
            size="icon-lg"
            className="-m-2.5 max-w-none rounded-full hover:bg-transparent active:bg-transparent focus-visible:border-transparent focus-visible:outline-offset-[-10px] dark:hover:bg-transparent"
            aria-label={label}
          />
        }
      >
        <span
          aria-hidden="true"
          className="grid size-6 place-items-center rounded-full border border-border text-muted-foreground transition-colors group-hover/button:border-primary/50 group-hover/button:bg-primary/8 group-hover/button:text-foreground group-active/button:bg-primary/15 group-data-popup-open/button:border-primary/50 group-data-popup-open/button:bg-primary/10 group-data-popup-open/button:text-foreground"
        >
          <QuestionMarkIcon weight="bold" className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}

/**
 * A field label with its explanation behind a help button, so secondary help
 * costs no vertical space. The text stays in the DOM (visually hidden) under
 * `helpId`, so the control can keep it in `aria-describedby`.
 */
export function FieldHelpLabel({
  label,
  help,
  helpId,
  htmlFor,
  id,
  required,
}: {
  label: string
  help: ReactNode
  helpId: string
  htmlFor?: string
  id?: string
  required?: boolean
}) {
  const t = useT()
  return (
    <>
      <FieldLabelRow>
        <FieldLabel htmlFor={htmlFor} id={id} required={required}>
          {label}
        </FieldLabel>
        <FormHelpTooltip inline label={t('common.aboutField', { label })}>
          {help}
        </FormHelpTooltip>
      </FieldLabelRow>
      <span id={helpId} className="sr-only w-px!">
        {help}
      </span>
    </>
  )
}
