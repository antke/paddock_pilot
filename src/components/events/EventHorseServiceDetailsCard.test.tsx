// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { ConvexError } from 'convex/values'
import type { Id } from 'convex/_generated/dataModel'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { EventHorseServiceDetailsView } from './EventHorseServiceDetailsCard'
import type { EventHorseDetailRow } from './EventHorseServiceDetailsCard'

afterEach(cleanup)

function deferred() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const promise = new Promise<void>((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function sampleRow(): EventHorseDetailRow {
  const data = createDashboardLabFixtureData()
  return {
    horse: data.horses[0],
    eventHorse: {
      _id: 'sample-event-horse' as Id<'eventsHorses'>,
      _creationTime: 0,
      eventId: data.events[0]._id,
      horseId: data.horses[0]._id,
      requestedServiceNotes: 'Original notes',
      status: 'confirmed',
    },
    canManage: true,
    canWithdraw: true,
  }
}

describe('Event horse service interactions', () => {
  it('keeps training notes and participation in a closed disclosure with existing edit and withdrawal controls', () => {
    render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={async () => undefined}
        trainingDisclosure
      />,
    )
    const summary = screen.getByText('Horse notes & participation')
    expect(summary.closest('details')?.open).toBe(false)
    fireEvent.click(summary)
    expect(summary.closest('details')?.open).toBe(true)
    expect(screen.getByRole('button', { name: 'Withdraw horse' })).toBeTruthy()
    expect(screen.getByText('Before the session')).toBeTruthy()
    expect(screen.getByText('Original notes')).toBeTruthy()
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit details for Juniper' }),
    )
    expect(screen.getByLabelText('Before the session')).toBeTruthy()
    expect(screen.getByLabelText('Notes after the session')).toBeTruthy()
  })

  it('returns focus to the labelled horse row when successful withdrawal removes its trigger', async () => {
    const request = deferred()
    function Sample() {
      const [row, setRow] = useState(sampleRow)
      return (
        <EventHorseServiceDetailsView
          rows={[row]}
          onSave={async () => undefined}
          onWithdraw={async () => {
            await request.promise
            setRow((current) => ({
              ...current,
              eventHorse: { ...current.eventHorse, status: 'withdrawn' },
              canManage: false,
              canWithdraw: false,
            }))
          }}
        />
      )
    }
    render(<Sample />)
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw horse' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Withdraw horse' }),
    )
    await act(async () => request.resolve())
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(screen.queryByRole('button', { name: 'Withdraw horse' })).toBeNull()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('group', { name: 'Juniper service notes' }),
      ),
    )
  })

  it('does not steal initial focus, focuses the opened editor and restores its own trigger on cancel', () => {
    const first = sampleRow()
    const second = {
      ...first,
      eventHorse: {
        ...first.eventHorse,
        _id: 'another-row' as Id<'eventsHorses'>,
        requestedServiceNotes: undefined,
      },
    }
    render(
      <EventHorseServiceDetailsView
        rows={[first, second]}
        onSave={async () => undefined}
        onWithdraw={async () => undefined}
      />,
    )
    expect(document.activeElement).toBe(document.body)
    fireEvent.click(screen.getByRole('button', { name: 'Add details' }))
    expect(document.activeElement).toBe(
      screen.getByRole('textbox', { name: 'Requested notes' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Add details' }),
    )
  })

  it('keeps pending edits open, ignores repeated submits, retains a failed draft and closes only after retry succeeds', async () => {
    const first = deferred()
    const retry = deferred()
    const save = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => retry.promise)
    render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={save}
        onWithdraw={async () => undefined}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Edit details for Juniper' }),
    )
    const notes = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Requested notes',
    })
    fireEvent.change(notes, {
      target: { value: 'Check front shoes\nDiscuss follow-up' },
    })
    const form = notes.closest('form')!
    fireEvent.submit(form)
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
    fireEvent.submit(form)
    await act(async () => {})
    expect(save).toHaveBeenCalledTimes(1)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Saving...' })
        .disabled,
    ).toBe(true)
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Cancel' })
        .disabled,
    ).toBe(true)
    await act(async () => first.reject(new Error('Offline')))
    expect(screen.getByRole('alert').textContent).toBe(
      'Couldn’t save the service detailsYour entries are still here. You’re offline, so nothing changed. Reconnect and try again.',
    )
    expect(notes.value).toBe('Check front shoes\nDiscuss follow-up')
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }))
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2))
    expect(
      screen.queryByRole('button', { name: 'Edit details for Juniper' }),
    ).toBeNull()
    await act(async () => retry.resolve())
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Edit details for Juniper' }),
    )
    expect(
      screen.queryByRole('textbox', { name: 'Requested notes' }),
    ).toBeNull()
  })

  it('keeps withdrawal confirmation pending and on failure, then closes after a successful retry', async () => {
    const first = deferred()
    const second = deferred()
    const withdraw = vi
      .fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={withdraw}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw horse' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Withdraw horse' }),
    )
    await waitFor(() => expect(withdraw).toHaveBeenCalledTimes(1))
    const pending = within(dialog).getByRole<HTMLButtonElement>('button', {
      name: 'Withdrawing...',
    })
    expect(pending.disabled).toBe(true)
    fireEvent.click(pending)
    expect(withdraw).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await act(async () => first.reject(new Error('Offline')))
    const alert = within(dialog).getByRole('alert').textContent
    // The alert says what failed, why, and what to do.
    expect(alert).toContain('Couldn’t withdraw the horse')
    expect(alert).toContain('You’re offline, so nothing changed.')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Withdraw horse' }),
    )
    await waitFor(() => expect(withdraw).toHaveBeenCalledTimes(2))
    await act(async () => second.resolve())
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('greys out Withdraw on an event that already happened and says to edit the event instead', async () => {
    const withdraw = vi.fn()
    render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={withdraw}
        eventClosed
      />,
    )
    const button = screen.getByRole('button', { name: 'Withdraw horse' })
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.getAttribute('aria-describedby')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
    // A tap opens the reason too, since phones have no hover.
    fireEvent.click(button)
    expect((await screen.findByRole('dialog')).textContent).toContain(
      'edit the event and untick it',
    )
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(withdraw).not.toHaveBeenCalled()
  })

  it('offers Skip only from today on, but keeps undoing an earlier skip', () => {
    const dateSkip = (open: boolean, skipped: boolean) => ({
      label: '3 Mar',
      open,
      skipped: () => skipped,
      toggle: async () => undefined,
    })
    const view = render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={async () => undefined}
        dateSkip={dateSkip(false, false)}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Skip 3 Mar' })).toBeNull()
    view.rerender(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={async () => undefined}
        dateSkip={dateSkip(false, true)}
      />,
    )
    expect(screen.getByRole('button', { name: 'Join 3 Mar' })).toBeTruthy()
  })

  it('swaps in the same help when the server says the event has closed meanwhile', async () => {
    render(
      <EventHorseServiceDetailsView
        rows={[sampleRow()]}
        onSave={async () => undefined}
        onWithdraw={() =>
          Promise.reject(
            new ConvexError({ code: 'eventClosed', message: 'closed' }),
          )
        }
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Withdraw horse' }))
    const dialog = await screen.findByRole('alertdialog')
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Withdraw horse' }),
    )
    await within(dialog).findByText('This event already happened')
    expect(within(dialog).queryByRole('alert')).toBeNull()
  })

  it('associates validation errors with fields and allows independent editors without duplicate IDs', async () => {
    const first = sampleRow()
    const second = {
      ...first,
      eventHorse: {
        ...first.eventHorse,
        _id: 'another-row' as Id<'eventsHorses'>,
      },
    }
    render(
      <EventHorseServiceDetailsView
        rows={[first, second]}
        onSave={async () => undefined}
        onWithdraw={async () => undefined}
      />,
    )
    for (const edit of screen.getAllByRole('button', {
      name: 'Edit details for Juniper',
    }))
      fireEvent.click(edit)
    const inputs = screen.getAllByRole<HTMLTextAreaElement>('textbox', {
      name: 'Requested notes',
    })
    expect(inputs[0].id).not.toBe(inputs[1].id)
    fireEvent.change(inputs[0], { target: { value: 'x'.repeat(1001) } })
    fireEvent.submit(inputs[0].closest('form')!)
    await waitFor(() =>
      expect(inputs[0].getAttribute('aria-invalid')).toBe('true'),
    )
    const description = inputs[0].getAttribute('aria-describedby')
    expect(document.getElementById(description!)?.textContent).toContain(
      '1000 characters',
    )
    expect(inputs[1].value).toBe('Original notes')
  })
})
