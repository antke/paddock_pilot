// @vitest-environment jsdom
import { StrictMode } from 'react'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type * as ConvexReact from 'convex/react'
import { getFunctionName } from 'convex/server'
import { HorseProfileForm } from '#/components/horses/HorseProfileForm'
import type { PersonNameScope } from './PersonNameField'

const auth = vi.hoisted(() => ({ isAuthenticated: true }))
// Keep the real provider, useConvex and useQueries so subscription render loops
// cannot be hidden by a mocked query hook.
vi.mock('convex/react', async (importOriginal) => ({
  ...(await importOriginal<typeof ConvexReact>()),
  useConvexAuth: () => auth,
}))
vi.mock('#/lib/devAuthBypass', () => ({ useDevAuthBypassEnabled: () => false }))

type People = Array<{ name: string; isCurrentUser: boolean }>
const clients: Array<ConvexReactClient> = []
beforeEach(() => {
  auth.isAuthenticated = true
})
afterEach(async () => {
  cleanup()
  await Promise.all(clients.splice(0).map((client) => client.close()))
  vi.restoreAllMocks()
})

function setup(initial: People | Error | undefined) {
  const client = new ConvexReactClient('https://unused.convex.cloud', {
    logger: false,
  })
  clients.push(client)
  let result = initial
  const listeners = new Set<() => void>()
  const watch = vi.spyOn(client, 'watchQuery').mockImplementation((...args) => {
    const [query] = args
    expect(getFunctionName(query)).toBe('people:suggestNames')
    return {
      onUpdate: (callback) => {
        listeners.add(callback)
        return () => {
          listeners.delete(callback)
        }
      },
      localQueryResult: () => {
        if (result instanceof Error) throw result
        return result
      },
      localQueryLogs: () => undefined,
      journal: () => undefined,
    }
  })
  const save = vi.fn().mockResolvedValue('horse')
  const onSaved = vi.fn()
  const editor = (scope: PersonNameScope = { horseIds: ['horse'] }) => (
    <StrictMode>
      <ConvexProvider client={client}>
        <HorseProfileForm
          mode="edit"
          initialValues={{ name: 'Juniper', ownerName: 'Alex Rider', age: 10 }}
          ownerSuggestionScope={scope}
          uploadImage={vi.fn()}
          save={save}
          onSaved={onSaved}
        />
      </ConvexProvider>
    </StrictMode>
  )
  const view = render(editor())
  return {
    ...view,
    save,
    watch,
    listeners,
    rerenderScope: (scope?: PersonNameScope) => view.rerender(editor(scope)),
    publish: async (next: People | Error | undefined) => {
      await act(async () => {
        result = next
        listeners.forEach((listener) => listener())
      })
    },
  }
}

const suggestions = [{ name: 'Alex Rider', isCurrentUser: true }]
const owner = () =>
  screen.getByRole<HTMLInputElement>('combobox', { name: 'Owner name' })
const open = () =>
  fireEvent.click(
    screen.getByRole('button', { name: 'Show owner name suggestions' }),
  )

it('opens and saves the horse edit form with a real live-query subscription', async () => {
  const view = setup(suggestions)
  expect(
    screen.getByRole('heading', { name: 'Edit horse profile', level: 1 }),
  ).toBeTruthy()
  open()
  fireEvent.click(
    await screen.findByRole('option', { name: 'Alex Rider (me)' }),
  )
  fireEvent.change(screen.getByLabelText('Horse name'), {
    target: { value: 'Juniper II' },
  })
  fireEvent.submit(owner().closest('form')!)
  await waitFor(() => {
    const errors = [...document.querySelectorAll('[data-slot=field-error]')]
      .map((node) => node.textContent)
      .filter(Boolean)
    if (errors.length) throw new Error(errors.join('; '))
    expect(view.save).toHaveBeenCalledOnce()
  })
  expect(view.save).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'Juniper II', ownerName: 'Alex Rider' }),
    undefined,
  )
  expect(view.listeners.size).toBe(1)
})

it('keeps the edit form and owner draft usable through loading, query failure and recovery', async () => {
  const view = setup(undefined)
  open()
  await screen.findByText('Loading people. You can also enter a name.')
  fireEvent.change(owner(), { target: { value: 'Independent owner' } })
  await view.publish(new Error('Suggestion service unavailable'))
  await screen.findByText(
    'People could not be loaded. You can still enter a name.',
  )
  expect(owner().value).toBe('Independent owner')
  await view.publish(suggestions)
  expect(owner().value).toBe('Independent owner')
  fireEvent.keyDown(owner(), { key: 'Escape' })
  expect(owner().value).toBe('Independent owner')
  fireEvent.submit(owner().closest('form')!)
  await waitFor(() => {
    const errors = [...document.querySelectorAll('[data-slot=field-error]')]
      .map((node) => node.textContent)
      .filter(Boolean)
    if (errors.length) throw new Error(errors.join('; '))
    expect(view.save).toHaveBeenCalledOnce()
  })
  expect(view.save).toHaveBeenCalledWith(
    expect.objectContaining({ ownerName: 'Independent owner' }),
    undefined,
  )
})

it('handles skipped authentication and changing horse context without a render loop or stale subscription', async () => {
  auth.isAuthenticated = false
  const view = setup(suggestions)
  expect(view.watch).not.toHaveBeenCalled()
  auth.isAuthenticated = true
  view.rerenderScope()
  expect(view.listeners.size).toBe(1)
  view.rerenderScope({
    stableId: 'yard',
    horseIds: ['other-horse', 'other-horse'],
  })
  expect(view.watch).toHaveBeenLastCalledWith(
    expect.anything(),
    { stableId: 'yard', horseIds: ['other-horse'] },
    {},
  )
  expect(view.listeners.size).toBe(1)
  expect(owner().value).toBe('Alex Rider')
  view.unmount()
  expect(view.listeners.size).toBe(0)
})
