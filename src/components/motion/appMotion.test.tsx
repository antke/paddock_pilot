// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useState } from 'react'
import { AppMotionProvider, useAppMotion } from './appMotion'
import { MotionList } from './MotionList'
import { MotionDisclosure } from './MotionDisclosure'
import { ActionFeedback } from '#/components/ui/action-feedback'

let reduced = false
const listeners = new Set<() => void>()
beforeEach(() => {
  reduced = false
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    addListener() {},
    removeListener() {},
  }))
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  listeners.clear()
})

describe('working application motion lifecycle', () => {
  it('makes an exiting record inert immediately, recovers focus and removes its DOM after exit', async () => {
    const ui = (items: string[]) => (
      <AppMotionProvider>
        <MotionList
          items={items}
          getKey={(item) => item}
          renderItem={(item) => <button>{item}</button>}
        />
      </AppMotionProvider>
    )
    const { rerender, container } = render(ui(['Juniper', 'Willow']))
    screen.getByRole('button', { name: 'Juniper' }).focus()
    rerender(ui(['Willow']))
    expect(screen.queryByRole('button', { name: 'Juniper' })).toBeNull()
    const exiting = container.querySelector('[data-exiting]')
    expect(exiting?.hasAttribute('inert')).toBe(true)
    expect(document.activeElement?.getAttribute('data-slot')).toBe(
      'motion-list',
    )
    await waitFor(() =>
      expect(container.querySelector('[data-exiting]')).toBeNull(),
    )
  })

  it('allows restoration during exit without duplicate nodes or stealing unrelated focus', async () => {
    const ui = (items: string[]) => (
      <AppMotionProvider>
        <button>Elsewhere</button>
        <MotionList
          items={items}
          getKey={(item) => item}
          renderItem={(item) => <button>{item}</button>}
        />
      </AppMotionProvider>
    )
    const { rerender, container } = render(ui(['Juniper', 'Willow']))
    screen.getByRole('button', { name: 'Elsewhere' }).focus()
    rerender(ui(['Willow']))
    rerender(ui(['Juniper', 'Willow']))
    expect(screen.getAllByRole('button', { name: 'Juniper' })).toHaveLength(1)
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Elsewhere' }),
    )
    await waitFor(() =>
      expect(container.querySelector('[data-exiting]')).toBeNull(),
    )
  })

  it('preserves a draft through rapid reversal and a live reduced-motion preference change', () => {
    function Form() {
      const [open, setOpen] = useState(true)
      return (
        <>
          <button onClick={() => setOpen(!open)}>Toggle</button>
          <MotionDisclosure open={open}>
            <input aria-label="Notes" defaultValue="Keep this" />
          </MotionDisclosure>
        </>
      )
    }
    render(
      <AppMotionProvider>
        <Form />
      </AppMotionProvider>,
    )
    const notes = screen.getByRole<HTMLInputElement>('textbox')
    fireEvent.change(notes, { target: { value: 'Edited notes' } })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.queryByRole('textbox')).toBeNull()
    act(() => {
      reduced = true
      listeners.forEach((fn) => fn())
    })
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('textbox')).toBe(notes)
    expect(notes.value).toBe('Edited notes')
    expect(notes.closest('[inert]')).toBeNull()
  })

  it('exposes only the authoritative submission label even when pending is superseded quickly', () => {
    const ui = (pending: boolean, confirmed: boolean) => (
      <AppMotionProvider>
        <button aria-busy={pending || undefined}>
          <ActionFeedback
            label="Save"
            pendingLabel="Saving…"
            confirmedLabel="Saved"
            pending={pending}
            confirmed={confirmed}
          />
        </button>
      </AppMotionProvider>
    )
    const { rerender } = render(ui(false, false))
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    rerender(ui(true, false))
    expect(
      screen.getByRole('button', { name: 'Saving…' }).getAttribute('aria-busy'),
    ).toBe('true')
    expect(screen.queryByRole('button', { name: 'Saved' })).toBeNull()
    rerender(ui(false, false))
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    rerender(ui(false, true))
    expect(screen.getByRole('button', { name: 'Saved' })).toBeTruthy()
  })
})

it('changes the shared spatial policy live without remounting the working controls', () => {
  function Probe() {
    const { spatial } = useAppMotion()
    return (
      <input
        aria-label="Working draft"
        data-spatial={spatial}
        defaultValue="Keep typing"
      />
    )
  }
  render(
    <AppMotionProvider>
      <Probe />
    </AppMotionProvider>,
  )
  const input = screen.getByRole<HTMLInputElement>('textbox')
  input.focus()
  fireEvent.change(input, { target: { value: 'Saved in progress' } })
  expect(input.dataset.spatial).toBe('true')
  act(() => {
    reduced = true
    listeners.forEach((fn) => fn())
  })
  expect(input.dataset.spatial).toBe('false')
  expect(document.activeElement).toBe(input)
  expect(input.value).toBe('Saved in progress')
  act(() => {
    reduced = false
    listeners.forEach((fn) => fn())
  })
  expect(input.dataset.spatial).toBe('true')
  expect(screen.getByRole('textbox')).toBe(input)
})

it('keeps focused row identity through sorting and does not replay initial entry', () => {
  const ui = (items: string[]) => (
    <AppMotionProvider>
      <MotionList
        items={items}
        getKey={(item) => item}
        renderItem={(item) => <input aria-label={item} defaultValue={item} />}
      />
    </AppMotionProvider>
  )
  const { rerender, container } = render(ui(['Juniper', 'Willow']))
  const input = screen.getByRole<HTMLInputElement>('textbox', {
    name: 'Juniper',
  })
  expect(
    container.querySelector('[role=listitem]')?.getAttribute('style'),
  ).not.toContain('opacity: 0;')
  input.focus()
  fireEvent.change(input, { target: { value: 'Edited' } })
  rerender(ui(['Willow', 'Juniper']))
  expect(screen.getByRole('textbox', { name: 'Juniper' })).toBe(input)
  expect(document.activeElement).toBe(input)
  expect(input.value).toBe('Edited')
})
