// @vitest-environment jsdom
import { useState } from 'react'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CreateRecordDialog } from './CreateRecordDialog'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
function Sample() {
  const [open, setOpen] = useState(false)
  return (
    <CreateRecordDialog
      open={open}
      onOpenChange={setOpen}
      triggerLabel="Add reminder"
      title="Add care reminder"
      description="Sample reminder"
    >
      <button onClick={() => setOpen(false)}>Apply sample</button>
    </CreateRecordDialog>
  )
}

describe('responsive create dialog focus return', () => {
  it.each([true, false])(
    'returns to the surviving trigger after changing viewport (starts desktop: %s)',
    async (startsDesktop) => {
      let desktopVisible = startsDesktop
      // jsdom has no layout; emulate the CSS breakpoint hiding one trigger.
      vi.spyOn(HTMLElement.prototype, 'getClientRects').mockImplementation(
        function (this: HTMLElement) {
          const desktop = this.closest(
            '[data-slot="record-dialog-desktop-trigger"]',
          )
          const floating = this.matches(
            '[data-slot="record-dialog-floating-trigger"]',
          )
          const visible = desktop
            ? desktopVisible
            : floating
              ? !desktopVisible
              : true
          return (visible
            ? [new DOMRect(0, 0, 100, 40)]
            : []) as unknown as DOMRectList
        },
      )
      render(<Sample />)
      const triggers = screen.getAllByRole('button', { name: 'Add reminder' })
      const desktop = triggers.find((button) =>
        button.closest('[data-slot="record-dialog-desktop-trigger"]'),
      )!
      const floating = triggers.find((button) =>
        button.matches('[data-slot="record-dialog-floating-trigger"]'),
      )!
      const opener = startsDesktop ? desktop : floating
      opener.focus()
      fireEvent.click(opener)
      await screen.findByRole('dialog')
      desktopVisible = !startsDesktop
      fireEvent.click(screen.getByRole('button', { name: 'Apply sample' }))
      await waitFor(() =>
        expect(document.activeElement).toBe(startsDesktop ? floating : desktop),
      )
    },
  )
})
