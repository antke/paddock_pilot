// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ListFilterBar } from './ListFilterBar'
import type {
  ListFilterSelectedFacets,
  ListFilterUiConfig,
} from './listFiltering'

const config: ListFilterUiConfig = {
  searchLabel: 'Search records',
  searchPlaceholder: 'Search',
  facets: ['Horse', 'State', 'Category'].map((label) => ({
    id: label,
    label,
    allLabel: `All ${label}`,
    options: [{ value: 'chosen', label: `${label} choice` }],
  })),
}
const initial = { Horse: 'chosen', State: 'chosen', Category: 'chosen' }
function Harness({ withQuery = false }: { withQuery?: boolean }) {
  const [facets, setFacets] = useState<ListFilterSelectedFacets>(initial)
  const [query, setQuery] = useState(withQuery ? 'hay' : '')
  return (
    <>
      <button onClick={() => setFacets({})}>External update</button>
      <ListFilterBar
        config={config}
        selectedFacets={facets}
        query={query}
        onQueryChange={setQuery}
        onFacetChange={(key, value) =>
          setFacets((current) => ({ ...current, [key]: value }))
        }
        onReset={() => {
          setFacets({})
          setQuery('')
        }}
        isFiltering={Boolean(query) || Object.values(facets).some(Boolean)}
        sticky
      />
    </>
  )
}
function remove(label: string) {
  return screen.getByRole('button', {
    name: `Remove ${label}: ${label} choice filter`,
  })
}
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})
describe('shared filter control focus and hidden state', () => {
  it('moves a removed chip focus to the next, previous, then search when the last chip closes', () => {
    render(<Harness />)
    const middle = remove('State')
    middle.focus()
    fireEvent.click(middle)
    expect(document.activeElement).toBe(remove('Category'))
    fireEvent.click(remove('Category'))
    expect(document.activeElement).toBe(remove('Horse'))
    fireEvent.click(remove('Horse'))
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.queryByRole('button', { name: 'Clear all' })).toBeNull()
  })
  it('returns focused Clear all to search immediately while exit chips remain disabled', async () => {
    vi.useFakeTimers()
    render(<Harness withQuery />)
    const clear = screen.getByRole('button', { name: 'Clear all' })
    clear.focus()
    fireEvent.click(clear)
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.getByRole<HTMLInputElement>('searchbox').value).toBe('')
    const retained = screen.getByRole<HTMLButtonElement>('button', {
      name: 'Remove Horse: Horse choice filter',
      hidden: true,
    })
    expect(retained.disabled).toBe(true)
    expect(retained.closest('[aria-hidden="true"]')).toBeTruthy()
    await act(async () => {
      vi.advanceTimersByTime(200)
    })
    expect(
      screen.queryByRole('button', { name: /Remove Horse/, hidden: true }),
    ).toBeNull()
  })
  it('does not steal focus from an unrelated control when records update', () => {
    render(<Harness />)
    remove('State').focus()
    const external = screen.getByRole('button', { name: 'External update' })
    external.focus()
    fireEvent.click(external)
    expect(document.activeElement).toBe(external)
  })
  it('returns the last removed chip to search while a query keeps Clear all available', () => {
    render(<Harness withQuery />)
    remove('Horse').focus()
    fireEvent.click(remove('Horse'))
    fireEvent.click(remove('State'))
    fireEvent.click(remove('Category'))
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.getByRole<HTMLInputElement>('searchbox').value).toBe('hay')
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Clear all' })
        .disabled,
    ).toBe(false)
  })
  it('closes the panel with Escape, restores its toggle, and can immediately reopen', () => {
    render(<Harness />)
    const toggle = screen.getByRole('button', {
      name: 'Toggle filters, 3 active',
    })
    fireEvent.click(toggle)
    const select = screen.getByLabelText<HTMLSelectElement>('Horse')
    select.focus()
    fireEvent.keyDown(select, { key: 'Escape' })
    expect(document.activeElement).toBe(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(select.disabled).toBe(true)
    fireEvent.click(toggle)
    expect(select.disabled).toBe(false)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })
  it('keeps a newly selected facet after an interrupted chip exit and cancels timers on unmount', async () => {
    vi.useFakeTimers()
    const view = render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }))
    fireEvent.change(screen.getByLabelText('Horse'), {
      target: { value: 'chosen' },
    })
    await act(async () => {
      vi.advanceTimersByTime(250)
    })
    expect(remove('Horse')).toBeTruthy()
    fireEvent.click(remove('Horse'))
    view.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
  it('disables closed facet controls and does not dispatch a change from a hidden panel', () => {
    const change = vi.fn()
    render(
      <ListFilterBar
        config={config}
        query=""
        onQueryChange={() => {}}
        selectedFacets={{}}
        onFacetChange={change}
        onReset={() => {}}
        isFiltering={false}
      />,
    )
    const select = screen.getByLabelText<HTMLSelectElement>('Horse')
    expect(select.disabled).toBe(true)
    fireEvent.change(select, { target: { value: 'chosen' } })
    expect(change).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }))
    expect(select.disabled).toBe(false)
    fireEvent.change(select, { target: { value: '' } })
    expect(change).toHaveBeenCalledTimes(1)
  })
  it('recovers focus when a focused filter panel disappears, without depending on a stale toggle', () => {
    const props = {
      config,
      query: '',
      onQueryChange: () => {},
      selectedFacets: {},
      onFacetChange: () => {},
      onReset: () => {},
      isFiltering: false,
    }
    const view = render(<ListFilterBar {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Toggle filters' }))
    screen.getByLabelText('Horse').focus()
    view.rerender(
      <ListFilterBar {...props} config={{ ...config, facets: [] }} />,
    )
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
  })
})
