import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'
import { Button } from '#/components/ui/button'

import {
  calendarDayCellClassName,
  calendarDayEventListClassName,
  calendarDayHeaderClassName,
  calendarDayNumberClassName,
  calendarEventChipClassName,
  calendarEventChipMetaClassName,
  calendarEventChipTitleClassName,
  calendarGridClassName,
  calendarMoreEventsButtonClassName,
  calendarShellClassName,
  calendarWeekdayCellClassName,
  calendarWeekdayRowClassName,
} from './EventCalendarChrome'

type CalendarDayCellProps = ComponentProps<'div'> & {
  isSelected?: boolean
  isToday?: boolean
  muted?: boolean
}

type CalendarDayNumberProps = ComponentProps<'span'> & {
  isToday?: boolean
}

type CalendarEventChipProps = ComponentProps<'div'>

type CalendarMoreEventsButtonProps = Omit<
  ComponentProps<typeof Button>,
  'className'
> & {
  className?: string
}

export function CalendarShell({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-shell"
      className={calendarShellClassName(className)}
      {...props}
    />
  )
}

export function CalendarWeekdayRow({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-weekday-row"
      className={calendarWeekdayRowClassName(className)}
      {...props}
    />
  )
}

export function CalendarWeekdayCell({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-weekday-cell"
      className={calendarWeekdayCellClassName(className)}
      {...props}
    />
  )
}

export function CalendarGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-grid"
      className={calendarGridClassName(className)}
      {...props}
    />
  )
}

export function CalendarDayCell({
  className,
  isSelected,
  isToday,
  muted,
  ...props
}: CalendarDayCellProps) {
  return (
    <div
      data-slot="calendar-day-cell"
      className={calendarDayCellClassName({
        className,
        isSelected,
        isToday,
        muted,
      })}
      {...props}
    />
  )
}

export function CalendarDayHeader({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-day-header"
      className={calendarDayHeaderClassName(className)}
      {...props}
    />
  )
}

export function CalendarDayNumber({
  className,
  isToday,
  ...props
}: CalendarDayNumberProps) {
  return (
    <span
      data-slot="calendar-day-number"
      className={calendarDayNumberClassName({ className, isToday })}
      {...props}
    />
  )
}

export function CalendarMoreEventsButton({
  className,
  ...props
}: CalendarMoreEventsButtonProps) {
  return (
    <Button
      type="button"
      variant="subtle"
      size="sm"
      data-slot="calendar-more-events-button"
      className={calendarMoreEventsButtonClassName(className)}
      {...props}
    />
  )
}

export function CalendarDayEventList({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-day-event-list"
      className={calendarDayEventListClassName(className)}
      {...props}
    />
  )
}

const CalendarEventChipLinkAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentProps<'a'>
>(function CalendarEventChipLinkAnchorRender({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      data-slot="calendar-event-chip"
      className={calendarEventChipClassName(className)}
      {...props}
    />
  )
})

export const CalendarEventChipLink = createLink(CalendarEventChipLinkAnchor)

export function CalendarEventChip({
  className,
  ...props
}: CalendarEventChipProps) {
  return (
    <div
      data-slot="calendar-event-chip"
      className={calendarEventChipClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventChipTitle({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      data-slot="calendar-event-chip-title"
      className={calendarEventChipTitleClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventChipMeta({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      data-slot="calendar-event-chip-meta"
      className={calendarEventChipMetaClassName(className)}
      {...props}
    />
  )
}
