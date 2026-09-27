// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'
import { DocumentDownloadAction } from '#/components/documents/DocumentDownloadAction'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('shared tooltip description ownership', () => {
  it('associates an uncontrolled tooltip with its trigger and preserves an existing description', async () => {
    render(
      <TooltipProvider>
        <p id="hint">Existing hint.</p>
        <Tooltip>
          <TooltipTrigger aria-describedby="hint">Details</TooltipTrigger>
          <TooltipContent>Extra explanation.</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )
    const trigger = screen.getByRole('button', { name: 'Details' })
    expect(trigger.getAttribute('aria-describedby')).toBe('hint')
    act(() => trigger.focus())
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.id).toBeTruthy()
    expect(trigger.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'hint',
      tooltip.id,
    ])
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    expect(trigger.getAttribute('aria-describedby')).toBe('hint')
  })

  it('preserves explicit content IDs and controlled open state, while forwarding close requests', async () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(
      <Tooltip open onOpenChange={onOpenChange}>
        <TooltipTrigger>Details</TooltipTrigger>
        <TooltipContent id="custom-help">
          Controlled explanation.
        </TooltipContent>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Details' })
    await waitFor(() =>
      expect(trigger.getAttribute('aria-describedby')).toBe('custom-help'),
    )
    expect(screen.getByRole('tooltip').id).toBe('custom-help')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() =>
      expect(onOpenChange).toHaveBeenCalledWith(false, expect.any(Object)),
    )
    expect(screen.getByRole('tooltip')).toBeTruthy()
    rerender(
      <Tooltip open={false} onOpenChange={onOpenChange}>
        <TooltipTrigger>Details</TooltipTrigger>
        <TooltipContent id="replacement-help">
          Controlled explanation.
        </TooltipContent>
      </Tooltip>,
    )
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
    expect(trigger.hasAttribute('aria-describedby')).toBe(false)
  })

  it('honors defaultOpen and canceled uncontrolled close requests', async () => {
    render(
      <Tooltip
        defaultOpen
        onOpenChange={(open, details) => {
          if (!open) details.cancel()
        }}
      >
        <TooltipTrigger>Details</TooltipTrigger>
        <TooltipContent>Keep this help open.</TooltipContent>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Details' })
    expect(await screen.findByRole('tooltip')).toBeTruthy()
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.getByRole('tooltip')).toBeTruthy()
    expect(trigger.getAttribute('aria-describedby')).toBe(
      screen.getByRole('tooltip').id,
    )
  })

  it('describes a real unavailable document action without attempting a download', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    render(
      <TooltipProvider>
        <DocumentDownloadAction
          fileName="Passport.pdf"
          fileState="metadata-only"
        />
      </TooltipProvider>,
    )
    const unavailable = screen.getByLabelText(
      'Download unavailable: No file is attached',
    )
    expect(unavailable.tabIndex).toBe(0)
    act(() => unavailable.focus())
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.textContent).toContain('No file is attached')
    expect(unavailable.getAttribute('aria-describedby')).toBe(tooltip.id)
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Download unavailable for Passport.pdf: No file is attached',
      }),
    )
    expect(fetch).not.toHaveBeenCalled()
  })
})
