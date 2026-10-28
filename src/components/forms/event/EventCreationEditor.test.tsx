// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { getFunctionName } from 'convex/server'
import type { Id } from 'convex/_generated/dataModel'
import { EventCreationEditor } from './EventCreationEditor'
import { createEventEditorValues } from './eventEditorValues'
import {
  calendarSelectionKey,
  useCalendarSelection,
} from '#/components/events/calendarSourceSelection'

vi.mock('convex/react', () => ({
  useQuery: (reference: Parameters<typeof getFunctionName>[0]) => {
    if (getFunctionName(reference) === 'events:creationOptions')
      return {
        personal: [
          { _id: 'horse', name: 'Juniper', canShareAcrossStables: true },
        ],
        stables: [{ id: 'stable-new', name: 'Willow', horses: [] }],
      }
    return []
  },
}))
afterEach(() => {
  cleanup()
  localStorage.clear()
})

it('keeps creation sharing explicit and adds saved audiences to every viewing selector only after success', async () => {
  localStorage.setItem(
    calendarSelectionKey(null),
    JSON.stringify(['mine', 'stable-existing']),
  )
  const dashboard = renderHook(() => useCalendarSelection())
  const onSave = vi
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue('event')
  const onAcknowledged = vi.fn()
  const onSaved = vi.fn(() => {
    expect(
      JSON.parse(localStorage.getItem(calendarSelectionKey(null))!),
    ).toEqual(['mine', 'stable-existing', 'stable-new'])
  })
  render(
    <EventCreationEditor
      mode="create"
      initialValues={{
        ...createEventEditorValues(),
        title: 'Visit',
        date: '2026-10-28',
        time: '10:00',
        horseIds: ['horse'],
      }}
      horses={[{ _id: 'horse' as Id<'horses'>, name: 'Juniper' }]}
      onSave={onSave}
      onSaved={onSaved}
      onAcknowledged={onAcknowledged}
    />,
  )
  const stable = screen.getByRole('checkbox', { name: 'Willow' })
  expect(stable.getAttribute('aria-checked')).toBe('false')
  fireEvent.click(stable)
  expect(dashboard.result.current.selected).toEqual(['mine', 'stable-existing'])
  const form = screen.getByLabelText('Title', { exact: true }).closest('form')!
  fireEvent.submit(form)
  await screen.findByRole('alert')
  expect(onSave).toHaveBeenCalledOnce()
  expect(dashboard.result.current.selected).toEqual(['mine', 'stable-existing'])
  expect(onAcknowledged).not.toHaveBeenCalled()
  fireEvent.submit(form)
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
  expect(dashboard.result.current.selected).toEqual([
    'mine',
    'stable-existing',
    'stable-new',
  ])
  expect(onAcknowledged).toHaveBeenCalledOnce()
  expect(onSave.mock.calls[1][0].sharedStableIds).toEqual(['stable-new'])
})
