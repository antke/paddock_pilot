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
          <Button
            type="button"
            variant="subtle"
            size="icon-xs"
            aria-label={label}
          />
        }
      >
        ?
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}

/**
 * A field label with its explanation behind a `?` button, so secondary help
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
