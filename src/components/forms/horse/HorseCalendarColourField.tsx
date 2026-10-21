import { useId, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { useController, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { CheckIcon, SlidersHorizontalIcon } from '@phosphor-icons/react'
import { motion } from 'motion/react'
import {
  horseCalendarColourIds,
  getHorseCalendarColour,
  horseCalendarColourCss,
  isCustomHorseColour,
} from 'shared/horses/horseCalendarColours'
import type {
  CalendarHorse,
  HorseCalendarColourId,
  HorseCalendarColour,
} from 'shared/horses/horseCalendarColours'
import { getHorseDisplayName } from 'shared/horses/horseDisplayName'
import { useT } from '#/i18n/LocaleProvider'
import { HorseColourDot } from '#/components/horses/HorseCalendarIdentity'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import { journalMotion, useAppMotion } from '#/components/motion/appMotion'
import { Input } from '#/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '#/components/ui/field'
import { hexToHsv, hsvToHex } from './colourPickerMath'
import type { HsvColour } from './colourPickerMath'
import type { HorseFormInput, HorseFormSchema } from './horseFormSchema'

export function HorseCalendarColourField({
  control,
  horses = [],
  disabled,
}: {
  control: Control<HorseFormInput, unknown, HorseFormSchema>
  horses?: ReadonlyArray<CalendarHorse>
  disabled?: boolean
}) {
  const t = useT()
  const id = useId()
  const { spatial } = useAppMotion()
  const { field, fieldState } = useController({
    name: 'calendarColourId',
    control,
  })
  const [name, nickname, useNickname] = useWatch({
    control,
    name: ['name', 'nickname', 'useNickname'],
  })
  const horseName = getHorseDisplayName({
    name: name || t('calendar.previewHorse'),
    nickname,
    useNickname,
  })
  const [customOpen, setCustomOpen] = useState(false)
  const [draft, setDraft] = useState('#347653')
  const preset = horseCalendarColourIds.includes(
    field.value as HorseCalendarColourId,
  )
  const colour = getHorseCalendarColour({
    _id: 'preview',
    calendarColourId: field.value,
  })
  const custom = isCustomHorseColour(field.value)
  const draftValid = isCustomHorseColour(draft)
  const applyDraft = () => {
    if (!draftValid || disabled) return
    field.onChange(draft.toUpperCase())
    field.onBlur()
    setCustomOpen(false)
  }
  const colourName = preset
    ? t(`calendar.colours.${field.value as HorseCalendarColourId}`)
    : t('calendar.customColour')
  const used = horses.filter(
    (horse) => getHorseCalendarColour(horse) === colour,
  )
  return (
    <Field
      data-invalid={fieldState.invalid}
      className="max-w-md"
      data-slot="horse-colour-picker"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <FieldLabel id={`${id}-label`}>{t('calendar.colourField')}</FieldLabel>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {colourName}
          {custom ? ` · ${field.value}` : ''}
        </span>
      </div>
      <FieldDescription id={`${id}-help`}>
        {t('calendar.colourFieldHelp')}
      </FieldDescription>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-help`}
        className="grid w-full max-w-72 grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-1"
      >
        {horseCalendarColourIds.map((option, index) => {
          const selected = field.value === option
          const inUse = horses.filter(
            (horse) => getHorseCalendarColour(horse) === option,
          )
          return (
            <button
              key={option}
              ref={index === 0 ? field.ref : undefined}
              type="button"
              disabled={disabled}
              aria-label={t(`calendar.colours.${option}`)}
              aria-pressed={selected}
              title={`${t(`calendar.colours.${option}`)}${inUse.length ? ` · ${t('calendar.colourUsed', { names: inUse.map(getHorseDisplayName).join(', ') })}` : ''}`}
              onBlur={field.onBlur}
              onClick={() => {
                field.onChange(option)
                setCustomOpen(false)
              }}
              className="app-control-focus relative flex h-11 w-full cursor-pointer items-center justify-center rounded-full hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className="size-8 rounded-full"
                style={{ backgroundColor: horseCalendarColourCss(option) }}
              />
              {selected && (
                <motion.span
                  layoutId={spatial ? `${id}-selection` : undefined}
                  initial={false}
                  transition={journalMotion.spring}
                  className="absolute inset-0 rounded-full border-2 border-foreground"
                />
              )}
              {selected && (
                <span className="absolute flex size-5 items-center justify-center rounded-full bg-background text-foreground">
                  <CheckIcon
                    weight="bold"
                    className="size-3.5"
                    aria-hidden="true"
                  />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogTrigger
          disabled={disabled}
          onClick={(event) =>
            setDraft(
              custom
                ? field.value!
                : getComputedStyle(event.currentTarget)
                    .getPropertyValue(`--horse-${colour}`)
                    .trim() || '#347653',
            )
          }
          render={<Button type="button" variant="outline" className="w-fit" />}
        >
          {custom ? (
            <HorseColourDot colour={colour} className="size-4" />
          ) : (
            <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
          )}
          {t('calendar.customColour')}
        </DialogTrigger>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] max-w-md grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-w-md"
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              event.target instanceof HTMLInputElement &&
              event.target.type !== 'range'
            ) {
              event.preventDefault()
              event.stopPropagation()
              applyDraft()
            }
          }}
        >
          <DialogHeader className="p-5 pr-12">
            <DialogTitle>{t('calendar.customColour')}</DialogTitle>
            <DialogDescription>
              {t('calendar.customColourHelp', { name: horseName })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid min-h-0 gap-4 overflow-y-auto px-5 pb-5">
            <CustomColourEditor
              value={draft}
              onChange={setDraft}
              onBlur={() => {}}
              disabled={disabled}
              errorId={`${id}-draft-error`}
              invalid={!draftValid}
            />
            {!draftValid && (
              <div id={`${id}-draft-error`}>
                <FieldError>
                  {t('horseValidation.calendarColourInvalid')}
                </FieldError>
              </div>
            )}
            <ColourPreview
              colour={draftValid ? draft : colour}
              horseName={horseName}
            />
          </div>
          <DialogFooter className="border-t border-border px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCustomOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              disabled={!draftValid || disabled}
              onClick={applyDraft}
            >
              {t('calendar.useColour')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {fieldState.error && <FieldError errors={[fieldState.error]} />}
      <ColourPreview colour={colour} horseName={horseName} />
      {used.length > 0 && (
        <FieldDescription>
          {t('calendar.colourUsed', {
            names: used.map(getHorseDisplayName).join(', '),
          })}
        </FieldDescription>
      )}
    </Field>
  )
}

function ColourPreview({
  colour,
  horseName,
}: {
  colour: HorseCalendarColour
  horseName: string
}) {
  const t = useT()
  return (
    <div className="grid gap-2">
      <span className="text-sm text-muted-foreground">
        {t('calendar.colourPreview')}
      </span>
      <div
        className="grid grid-cols-2 gap-2"
        aria-label={t('calendar.colourPreview')}
      >
        {(['light', 'dark'] as const).map((theme) => (
          <div
            key={theme}
            className={`${theme === 'dark' ? 'dark' : 'light'} horse-colour-preview min-w-0 rounded-control border px-3 py-2.5`}
          >
            <div className="mb-2 text-xs opacity-75">
              {t(`calendar.${theme}Preview`)}
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
              <HorseColourDot
                colour={colour}
                className="size-2.5 motion-safe:transition-colors"
              />
              <span className="truncate">{horseName}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CustomColourEditor({
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  errorId,
}: {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  disabled?: boolean
  invalid: boolean
  errorId: string
}) {
  const t = useT()
  const id = useId()
  const [lastValue, setLastValue] = useState(value)
  const [hsv, setHsv] = useState(() =>
    hexToHsv(isCustomHorseColour(value) ? value : '#347653'),
  )
  // Preserve the user's hue through black/grey, and follow resets or a typed hex value.
  if (value !== lastValue) {
    setLastValue(value)
    if (isCustomHorseColour(value)) setHsv(hexToHsv(value, hsv.h))
  }
  const change = (next: HsvColour) => {
    const hex = hsvToHex(next)
    setHsv(next)
    setLastValue(hex)
    onChange(hex)
  }
  const point = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return
    const bounds = event.currentTarget.getBoundingClientRect()
    change({
      ...hsv,
      s: Math.max(
        0,
        Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100),
      ),
      v: Math.max(
        0,
        Math.min(100, (1 - (event.clientY - bounds.top) / bounds.height) * 100),
      ),
    })
  }
  const hue = hsvToHex({ h: hsv.h, s: 100, v: 100 })
  return (
    <div className="grid gap-3 pb-2">
      <div
        aria-hidden="true"
        className="relative h-36 touch-none overflow-hidden rounded-control border border-border"
        style={{
          background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hue})`,
          cursor: disabled ? 'not-allowed' : 'crosshair',
          opacity: disabled ? 0.5 : 1,
        }}
        onPointerDown={(event) => {
          if (!disabled && event.button === 0) {
            event.currentTarget.setPointerCapture(event.pointerId)
            point(event)
          }
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            point(event)
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            point(event)
            event.currentTarget.releasePointerCapture(event.pointerId)
            onBlur()
          }
        }}
      >
        <span
          className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white outline outline-1 outline-black"
          style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }}
        />
      </div>
      {(['h', 's', 'v'] as const).map((channel) => {
        const label = t(
          `calendar.${channel === 'h' ? 'hue' : channel === 's' ? 'saturation' : 'brightness'}`,
        )
        return (
          <div
            key={channel}
            className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3"
          >
            <label htmlFor={`${id}-${channel}`} className="text-sm">
              {label}
            </label>
            <input
              id={`${id}-${channel}`}
              type="range"
              min={0}
              max={channel === 'h' ? 360 : 100}
              step={1}
              value={Math.round(hsv[channel])}
              aria-valuetext={`${Math.round(hsv[channel])}${channel === 'h' ? '°' : '%'}`}
              disabled={disabled}
              onBlur={onBlur}
              onChange={(event) =>
                change({ ...hsv, [channel]: Number(event.target.value) })
              }
              className="horse-colour-slider app-control-focus min-h-11 w-full rounded-control disabled:opacity-50"
              style={
                {
                  '--colour-track':
                    channel === 'h'
                      ? 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'
                      : channel === 's'
                        ? `linear-gradient(to right, #fff, ${hue})`
                        : `linear-gradient(to right, #000, ${hue})`,
                } as CSSProperties
              }
            />
          </div>
        )
      })}
      <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3">
        <label htmlFor={`${id}-hex`} className="text-sm">
          {t('calendar.hexColour')}
        </label>
        <Input
          id={`${id}-hex`}
          value={value}
          disabled={disabled}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          onBlur={onBlur}
          onChange={(event) => {
            const text = event.target.value
            onChange(text.startsWith('#') ? text : `#${text}`)
          }}
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}
