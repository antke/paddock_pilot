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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardLabFixtureData } from '#/components/dashboard-lab/dashboardLabFixtures'
import { DocumentsPageLab } from './DocumentsPageLab'

vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => true }))
const createUrl = vi.fn<(file: Blob) => string>()
const revokeUrl = vi.fn()
beforeEach(() => {
  createUrl.mockReset()
  revokeUrl.mockReset()
  let next = 0
  createUrl.mockImplementation(() => `blob:sample-${++next}`)
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: createUrl,
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: revokeUrl,
  })
})
afterEach(() => {
  cleanup()
  Reflect.deleteProperty(URL, 'createObjectURL')
  Reflect.deleteProperty(URL, 'revokeObjectURL')
})
function setup() {
  const result = render(
    <DocumentsPageLab data={createDashboardLabFixtureData()} />,
  )
  fireEvent.change(screen.getByLabelText('Sample response time'), {
    target: { value: '100' },
  })
  return result
}
async function chooseSampleFile() {
  fireEvent.click(screen.getAllByRole('button', { name: 'Add document' })[0])
  const input = await screen.findByLabelText('File (required)')
  const file = new File(['Actual sample file bytes'], 'local-sample.txt', {
    type: 'text/plain',
  })
  const files = Object.assign([file], {
    item: (index: number) => (index === 0 ? file : null),
  })
  fireEvent.change(input, { target: { files } })
  const name = screen.getByLabelText<HTMLInputElement>('Document name')
  await waitFor(() => expect(name.value).toBe('local-sample.txt'))
  return { file, name, form: name.closest('form')! }
}

describe('DocumentsPageLab actual local interactions', () => {
  it('uses valid local file URLs and respects viewer and empty samples', () => {
    setup()
    const links = screen.getAllByRole<HTMLAnchorElement>('link', {
      name: /^Open /,
    })
    expect(
      links.every(
        (link) =>
          link.href.startsWith('blob:sample-') ||
          link.href.endsWith('/paddock-pilot-mark.svg'),
      ),
    ).toBe(true)
    expect(
      createUrl.mock.calls.every(
        ([blob]) => blob.type === 'text/plain' && blob.size > 0,
      ),
    ).toBe(true)
    fireEvent.change(screen.getByLabelText('Sample permissions'), {
      target: { value: 'viewer' },
    })
    expect(screen.queryByRole('button', { name: 'Add document' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    expect(
      screen.getAllByRole('button', { name: /^Download / }).length,
    ).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Show empty sample' }))
    expect(
      screen.getByText('No sample documents have been added.'),
    ).toBeTruthy()
    expect(revokeUrl).toHaveBeenCalledTimes(4)
  })

  it('keeps pending and rejected uploads visible, creates the acknowledged file, and returns focus after removing its last row', async () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Show empty sample' }))
    fireEvent.change(screen.getByLabelText('Next document request'), {
      target: { value: 'failure' },
    })
    const { file, name, form } = await chooseSampleFile()
    fireEvent.submit(form)
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Uploading…' })
          .hasAttribute('disabled'),
      ).toBe(true),
    )
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.getByRole('dialog')).toBeTruthy()
    await screen.findByText(
      'Could not add this document. Your file and details are still here. Please try again.',
    )
    expect(name.value).toBe('local-sample.txt')
    expect(createUrl).toHaveBeenCalledTimes(4)
    fireEvent.submit(form)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(createUrl).toHaveBeenLastCalledWith(file)
    const row = within(screen.getByRole('listitem'))
    expect(row.getByText('local-sample.txt')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Next document request'), {
      target: { value: 'failure' },
    })
    const remove = row.getByRole('button', { name: 'Remove' })
    fireEvent.click(remove)
    fireEvent.click(await screen.findByRole('button', { name: 'Keep record' }))
    await waitFor(() => expect(document.activeElement).toBe(remove))
    fireEvent.click(remove)
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove document' }),
    )
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' })
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    await screen.findByText('Could not remove this record. Please try again.')
    fireEvent.click(screen.getByRole('button', { name: 'Remove document' }))
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
    expect(
      screen.getByText('No sample documents have been added.'),
    ).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('group', { name: 'Documents' }),
      ),
    )
    expect(revokeUrl).toHaveBeenCalledWith('blob:sample-5')
  })

  it('does not create a late file URL when the sample unmounts during upload', async () => {
    const { unmount } = setup()
    const { form } = await chooseSampleFile()
    fireEvent.submit(form)
    await screen.findByRole('button', { name: 'Uploading…' })
    unmount()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(createUrl).toHaveBeenCalledTimes(4)
    expect(revokeUrl).toHaveBeenCalledTimes(4)
  })
})
