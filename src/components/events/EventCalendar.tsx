import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { ComponentProps } from 'react'

import {
  calendarDayCellClassName,
  calendarDayEventListClassName,
  calendarDayHeaderClassName,
  calendarDayNumberClassName,
  calendarEventChipClassName,
  calendarEventChipMetaClassName,
  calendarEventChipTitleClassName,
  calendarEventPopoverClassName,
  calendarEventPopoverDescriptionClassName,
  calendarEventPopoverHeaderClassName,
  calendarEventPopoverTextClassName,
  calendarEventPopoverTitleClassName,
  calendarGridClassName,
  calendarMutedPillClassName,
  calendarShellClassName,
  calendarWeekdayCellClassName,
  calendarWeekdayRowClassName,
} from './EventCalendarChrome'

type CalendarDayCellProps = ComponentProps<'div'> & {
  isToday?: boolean
  muted?: boolean
}

type CalendarDayNumberProps = ComponentProps<'span'> & {
  isToday?: boolean
}

type CalendarEventChipProps = ComponentProps<'div'>

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
  isToday,
  muted,
  ...props
}: CalendarDayCellProps) {
  return (
    <div
      data-slot="calendar-day-cell"
      className={calendarDayCellClassName({ className, isToday, muted })}
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

export function CalendarMutedPill({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      data-slot="calendar-muted-pill"
      className={calendarMutedPillClassName(className)}
      {...props}
    />
  )
}

const CalendarEventChipLinkAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentProps<'a'>
>(function CalendarEventChipLinkAnchor({ className, ...props }, ref) {
  return (
    <a
      ref={ref}
      data-slot="calendar-event-chip"
      className={calendarEventChipClassName(className)}
      {...props}
    />
  )
})

export const CalendarEventChipLink = createLink(
  CalendarEventChipLinkAnchor,
)

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

export function CalendarEventPopover({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-event-popover"
      className={calendarEventPopoverClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventPopoverHeader({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="calendar-event-popover-header"
      className={calendarEventPopoverHeaderClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventPopoverTitle({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      data-slot="calendar-event-popover-title"
      className={calendarEventPopoverTitleClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventPopoverText({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      data-slot="calendar-event-popover-text"
      className={calendarEventPopoverTextClassName(className)}
      {...props}
    />
  )
}

export function CalendarEventPopoverDescription({
  className,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      data-slot="calendar-event-popover-description"
      className={calendarEventPopoverDescriptionClassName(className)}
      {...props}
    />
  )
}
