import type { EventType } from 'shared/events/eventSchema'

const itemColors = {
  training: 'var(--analysis-training)',
  competition: 'var(--analysis-competition)',
  vet: 'var(--analysis-health)',
  dentist: 'var(--chart-3)',
  hoof_trimming: 'var(--chart-4)',
  massage: 'var(--analysis-care)',
  other: 'var(--muted-foreground)',
  healthIssue: 'var(--analysis-health)',
  medicationRecord: 'var(--analysis-medication)',
  nutritionLog: 'var(--analysis-nutrition)',
  weightRecord: 'var(--analysis-weight)',
} satisfies Record<
  | EventType
  | 'healthIssue'
  | 'medicationRecord'
  | 'nutritionLog'
  | 'weightRecord',
  string
>

/** The trigger's accessible name and preview supply the matching text label. */
export function CalendarItemTypeDot({
  type,
}: {
  type: keyof typeof itemColors
}) {
  return (
    <span
      aria-hidden="true"
      className="size-2 shrink-0 rounded-full"
      style={{ backgroundColor: itemColors[type] }}
    />
  )
}
