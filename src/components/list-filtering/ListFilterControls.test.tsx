// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ListFilterControls } from './ListFilterControls'
import type { ListFilterConfig } from './listFiltering'
import { useListFiltering } from './useListFiltering'

const config: ListFilterConfig<string> = {
  searchLabel: 'Search records',
  searchPlaceholder: 'Search',
  searchFields: [{ id: 'name', weight: 1, getValues: (item) => [item] }],
  facets: [],
}
function Sample({ items }: { items: string[] }) {
  const filtering = useListFiltering({ items, config })
  return (
    <>
      <ListFilterControls config={config} filtering={filtering} hideWhenEmpty />
      <input aria-label="Unrelated input" />
      <output aria-label="Result count">{filtering.resultCount}</output>
    </>
  )
}
afterEach(cleanup)
describe('empty-source filter controls', () => {
  it('preserves focused search when source records disappear, then hides after focus leaves', () => {
    const view = render(<Sample items={['Maple']} />)
    const search = screen.getByRole('searchbox')
    act(() => search.focus())
    view.rerender(<Sample items={[]} />)
    expect(document.activeElement).toBe(search)
    const outside = screen.getByLabelText('Unrelated input')
    act(() => outside.focus())
    expect(document.activeElement).toBe(outside)
    expect(screen.queryByRole('searchbox')).toBeNull()
  })
  it('preserves an active query when the source empties and lets Clear all return to search', () => {
    const view = render(<Sample items={['Maple']} />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Maple' },
    })
    view.rerender(<Sample items={[]} />)
    const clear = screen.getByRole('button', { name: 'Clear all' })
    act(() => clear.focus())
    fireEvent.click(clear)
    expect(document.activeElement).toBe(screen.getByRole('searchbox'))
    expect(screen.getByRole<HTMLInputElement>('searchbox').value).toBe('')
  })
  it('hides untouched empty controls without moving unrelated focus and restores controls for new source data', () => {
    const view = render(<Sample items={['Maple']} />)
    const outside = screen.getByLabelText('Unrelated input')
    act(() => outside.focus())
    view.rerender(<Sample items={[]} />)
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(document.activeElement).toBe(outside)
    view.rerender(<Sample items={['Juniper']} />)
    expect(screen.getByRole('searchbox')).toBeTruthy()
    expect(document.activeElement).toBe(outside)
  })
  it('does not confuse zero filtered results with zero source records', () => {
    render(<Sample items={['Maple']} />)
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'Juniper' },
    })
    expect(screen.getByLabelText('Result count').textContent).toBe('0')
    expect(screen.getByRole('searchbox')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeTruthy()
  })
})
