// @vitest-environment jsdom
import { useState } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FloatingActionsProvider } from '#/components/layout/FloatingActions'
import { MobileFloatingAction } from '#/components/layout/MobileFloatingAction'
import { CreateRecordDialog } from './CreateRecordDialog'

beforeEach(() => {
  // jsdom has no layout; treat every rendered control as visible.
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
    () => [new DOMRect(0, 0, 100, 40)] as unknown as DOMRectList,
  )
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function Sample({ label = 'Add reminder' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <CreateRecordDialog
      open={open}
      onOpenChange={setOpen}
      triggerLabel={label}
      title={`${label} form`}
      description="Sample record"
    >
      <button onClick={() => setOpen(false)}>Apply sample</button>
    </CreateRecordDialog>
  )
}

const titleTrigger = (name: string) =>
  screen
    .getAllByRole('button', { name })
    .find((button) =>
      button.closest('[data-slot="record-dialog-title-trigger"]'),
    )!

describe('create dialog triggers', () => {
  it('keeps the title-row trigger and returns focus to it', async () => {
    render(<Sample />)
    const trigger = titleTrigger('Add reminder')
    trigger.focus()
    fireEvent.click(trigger)
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'Apply sample' }))
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('falls back to a local phone shortcut without the app registry', () => {
    render(<Sample />)
    expect(
      document.querySelector('[data-slot="record-dialog-floating-trigger"]'),
    ).toBeTruthy()
  })

  it('mirrors a single section action as one direct shortcut that owns focus return', async () => {
    render(
      <FloatingActionsProvider>
        <Sample />
      </FloatingActionsProvider>,
    )
    expect(
      document.querySelector('[data-slot="record-dialog-floating-trigger"]'),
    ).toBeNull()
    const shortcut = await waitFor(() => {
      const element = document.querySelector<HTMLButtonElement>(
        '[data-slot="floating-create-action"]',
      )
      expect(element).toBeTruthy()
      return element!
    })
    expect(shortcut.getAttribute('aria-label')).toBe('Add reminder')
    expect(titleTrigger('Add reminder')).toBeTruthy()
    shortcut.focus()
    fireEvent.click(shortcut)
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'Apply sample' }))
    await waitFor(() => expect(document.activeElement).toBe(shortcut))
  })

  it('collects several section actions into one shortcut menu', async () => {
    render(
      <FloatingActionsProvider>
        <Sample label="Add provider" />
        <Sample label="Invite member" />
      </FloatingActionsProvider>,
    )
    await waitFor(() =>
      expect(
        document.querySelector('[data-slot="mobile-action-menu"]'),
      ).toBeTruthy(),
    )
    expect(
      document.querySelector('[data-slot="floating-create-action"]'),
    ).toBeNull()
  })

  it('stays out of the way when the page renders its own floating action', async () => {
    render(
      <FloatingActionsProvider>
        <Sample />
        <MobileFloatingAction>
          <button>Edit event</button>
        </MobileFloatingAction>
      </FloatingActionsProvider>,
    )
    await waitFor(() =>
      expect(
        document.querySelectorAll('[data-slot="mobile-floating-action"]'),
      ).toHaveLength(1),
    )
    expect(
      document.querySelector('[data-slot="floating-create-action"]'),
    ).toBeNull()
  })
})
