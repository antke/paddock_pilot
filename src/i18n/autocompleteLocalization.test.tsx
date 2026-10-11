// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { LocaleProvider, useLocale } from './LocaleProvider'
import {
  AutocompleteRoot,
  AutocompleteInput,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteList,
  AutocompleteItem,
} from '#/components/ui/autocomplete'

afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
it('translates both assistive dismiss controls while preserving the draft and dismissal behavior', async () => {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB'])
  let changeLocale!: ReturnType<typeof useLocale>['changeLocale']
  function Sample() {
    changeLocale = useLocale().changeLocale
    return (
      <AutocompleteRoot items={['Atlas', 'Łąka']}>
        <AutocompleteInput aria-label="Horse" triggerLabel="Show horses" />
        <AutocompleteContent>
          <AutocompleteEmpty>No matches</AutocompleteEmpty>
          <AutocompleteList>
            {(item: string) => (
              <AutocompleteItem value={item} key={item}>
                {item}
              </AutocompleteItem>
            )}
          </AutocompleteList>
        </AutocompleteContent>
      </AutocompleteRoot>
    )
  }
  render(
    <LocaleProvider>
      <Sample />
    </LocaleProvider>,
  )
  const input = screen.getByRole<HTMLInputElement>('combobox', {
    name: 'Horse',
  })
  fireEvent.click(screen.getByRole('button', { name: 'Show horses' }))
  await waitFor(() =>
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2),
  )
  const emptyStatus = screen.getByRole('status')
  expect(emptyStatus.getAttribute('aria-live')).toBe('polite')
  expect(emptyStatus.childElementCount).toBe(0)
  fireEvent.change(input, { target: { value: 'Unmatched' } })
  await screen.findByText('No matches')
  expect(emptyStatus.childElementCount).toBe(1)
  fireEvent.change(input, { target: { value: 'Ł' } })
  await waitFor(() => expect(emptyStatus.childElementCount).toBe(0))
  expect(screen.getByRole('status')).toBe(emptyStatus)
  await act(async () => {
    await changeLocale('pl')
  })
  await waitFor(() =>
    expect(screen.getAllByRole('button', { name: 'Zamknij' })).toHaveLength(2),
  )
  expect(input.value).toBe('Ł')
  expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
  fireEvent.click(screen.getAllByRole('button', { name: 'Zamknij' })[1])
  await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('false'))
  expect(input.value).toBe('Ł')
})
