// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

afterEach(cleanup)
function Sample({
  orientation = 'horizontal',
  activateOnFocus = false,
}: {
  orientation?: 'horizontal' | 'vertical'
  activateOnFocus?: boolean
}) {
  return (
    <Tabs orientation={orientation} defaultValue="care">
      <TabsList aria-label="Horse record" activateOnFocus={activateOnFocus}>
        <TabsTrigger value="care">Care</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="locked" disabled>
          Private notes
        </TabsTrigger>
      </TabsList>
      <TabsContent value="care">Care records</TabsContent>
      <TabsContent value="locked">Private records</TabsContent>
      <TabsContent value="history">Past visits</TabsContent>
    </Tabs>
  )
}

describe('shared tabs orientation contract', () => {
  it('forwards vertical semantics and uses Up/Down navigation and preserves disabled selection', async () => {
    render(<Sample orientation="vertical" activateOnFocus />)
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe(
      'vertical',
    )
    const care = screen.getByRole('tab', { name: 'Care' })
    const history = screen.getByRole('tab', { name: 'History' })
    act(() => care.focus())
    fireEvent.keyDown(care, { key: 'ArrowDown' })
    await waitFor(() => expect(document.activeElement).toBe(history))
    expect(history.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').textContent).toBe('Past visits')
    fireEvent.keyDown(history, { key: 'ArrowUp' })
    await waitFor(() => expect(document.activeElement).toBe(care))
    expect(screen.getByRole('tabpanel').textContent).toBe('Care records')
    fireEvent.click(screen.getByRole('tab', { name: 'Private notes' }))
    expect(care.getAttribute('aria-selected')).toBe('true')
  })

  it('keeps the default horizontal manual-selection and linked panel behavior', async () => {
    render(<Sample />)
    const care = screen.getByRole('tab', { name: 'Care' })
    const history = screen.getByRole('tab', { name: 'History' })
    act(() => care.focus())
    fireEvent.keyDown(care, { key: 'ArrowRight' })
    await waitFor(() => expect(document.activeElement).toBe(history))
    expect(care.getAttribute('aria-selected')).toBe('true')
    expect(history.getAttribute('aria-selected')).toBe('false')
    fireEvent.click(history)
    expect(history.getAttribute('aria-selected')).toBe('true')
    const panel = screen.getByRole('tabpanel')
    expect(panel.id).toBe(history.getAttribute('aria-controls'))
    expect(panel.getAttribute('aria-labelledby')).toBe(history.id)
    expect(panel.textContent).toBe('Past visits')
  })
})
