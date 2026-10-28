import { useState } from 'react'
import { cn } from '#/lib/utils'
import { FieldLabel } from '#/components/ui/field'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

const choiceClassName =
  'flex h-full min-h-11 w-full min-w-0 max-w-full cursor-pointer items-center gap-2 rounded-control border border-transparent px-3 py-2 text-sm md:h-auto md:w-fit'

type Choice = {
  id: string
  name: string
  disabled?: boolean
  help?: { label: string; description: string }
}
type Props = {
  choices: Choice[]
  label: string
  disabled?: boolean
  describedBy?: string
  value: string[]
  onChange: (value: string[]) => void
}

/** The same source controls filter calendars and set activity audiences. */
export function CalendarSourceChoices(props: Props) {
  const [openHelpId, setOpenHelpId] = useState<string | null>(null)
  if (!props.choices.some((choice) => choice.id !== 'mine')) return null

  return (
    <div
      className="grid grid-cols-2 items-stretch gap-2 md:flex md:flex-wrap"
      role="group"
      aria-label={props.label}
      aria-describedby={props.describedBy}
    >
      {props.choices.map((choice) => {
        const control = (
          <FieldLabel
            key={choice.id}
            className={cn(
              choiceClassName,
              (props.disabled || choice.disabled) && 'cursor-default',
            )}
          >
            <Checkbox
              className={
                choice.disabled && choice.help
                  ? 'pointer-events-none'
                  : undefined
              }
              disabled={props.disabled || choice.disabled}
              checked={props.value.includes(choice.id)}
              onCheckedChange={(checked) =>
                props.onChange(
                  checked
                    ? [...props.value, choice.id]
                    : props.value.filter((id) => id !== choice.id),
                )
              }
            />
            <span className="min-w-0 wrap-anywhere">{choice.name}</span>
          </FieldLabel>
        )
        return choice.help ? (
          <Tooltip
            key={choice.id}
            open={openHelpId === choice.id}
            onOpenChange={(open) =>
              setOpenHelpId((current) =>
                open ? choice.id : current === choice.id ? null : current,
              )
            }
          >
            <TooltipTrigger
              closeOnClick={false}
              onClick={() => setOpenHelpId(choice.id)}
              render={<span />}
              tabIndex={choice.disabled ? 0 : -1}
              aria-label={choice.help.label}
              className="min-w-0 max-w-full rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {control}
            </TooltipTrigger>
            <TooltipContent>{choice.help.description}</TooltipContent>
          </Tooltip>
        ) : (
          control
        )
      })}
    </div>
  )
}
