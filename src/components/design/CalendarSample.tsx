import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { StableEventsCalendar } from '#/components/stables/StableEventsCalendar'
import { Button } from '#/components/ui/button'
import { Field, FieldGrid, FieldLabel } from '#/components/ui/field'
import { Select } from '#/components/ui/select'
import {
  calendarSampleMonths,
  createCalendarSampleEvents,
  getCalendarSampleMonth,
} from './calendarSampleData'
import type {
  CalendarSampleMonth,
  CalendarSampleScenario,
} from './calendarSampleData'

export function CalendarSample({
  showUpdateControls = false,
}: { showUpdateControls?: boolean } = {}) {
  const id = useId()
  const [month, setMonth] = useState<CalendarSampleMonth>('current')
  const [scenario, setScenario] = useState<CalendarSampleScenario>('dense')
  const [denseDayCount, setDenseDayCount] = useState<0 | 2 | 6>(6)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialMonth = useMemo(() => getCalendarSampleMonth(month), [month])
  const events = useMemo(
    () => createCalendarSampleEvents(initialMonth, scenario, denseDayCount),
    [initialMonth, scenario, denseDayCount],
  )
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )
  const cancelUpdate = () => {
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = null
    setPending(false)
  }
  const resetSample = () => {
    cancelUpdate()
    setDenseDayCount(6)
    setMessage('Sample records reset. No live data changed.')
  }
  const queueUpdate = () => {
    if (timer.current !== null) return
    const next = denseDayCount === 6 ? 2 : 0
    setPending(true)
    setMessage(
      `In 3 seconds, day 18 will have ${next} sample events. You can focus its open agenda now.`,
    )
    timer.current = setTimeout(() => {
      timer.current = null
      setDenseDayCount(next)
      setPending(false)
      setMessage(`Day 18 now has ${next} sample events. No live data changed.`)
    }, 3000)
  }
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Fictional calendar records. Event links demonstrate their destinations;
        these sample IDs have no real event pages. No live data changes.
      </p>
      <FieldGrid>
        <Field>
          <FieldLabel htmlFor={`${id}-scenario`}>Calendar sample</FieldLabel>
          <Select
            id={`${id}-scenario`}
            value={scenario}
            onChange={(event) => {
              resetSample()
              setScenario(event.target.value as CalendarSampleScenario)
            }}
          >
            <option value="dense">Dense · six events on day 18</option>
            <option value="sparse">Sparse · long names and statuses</option>
            <option value="empty">Empty month</option>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-month`}>Sample month</FieldLabel>
          <Select
            id={`${id}-month`}
            value={month}
            onChange={(event) => {
              resetSample()
              setMonth(event.target.value as CalendarSampleMonth)
            }}
          >
            {calendarSampleMonths.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </FieldGrid>
      {showUpdateControls && scenario === 'dense' && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending || denseDayCount === 0}
            onClick={queueUpdate}
          >
            {denseDayCount === 6
              ? 'Keep two events on day 18 in 3 seconds'
              : 'Clear day 18 in 3 seconds'}
          </Button>
          {pending && (
            <Button
              variant="outline"
              onClick={() => {
                cancelUpdate()
                setMessage(
                  'Scheduled sample update cancelled. Records unchanged.',
                )
              }}
            >
              Cancel sample update
            </Button>
          )}
          <Button variant="subtle" onClick={resetSample}>
            Reset sample records
          </Button>
        </div>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>
      <StableEventsCalendar
        key={`${month}-${scenario}`}
        events={events}
        initialMonth={initialMonth}
      />
    </div>
  )
}
