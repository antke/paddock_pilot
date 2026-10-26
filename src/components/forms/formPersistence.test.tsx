// @vitest-environment jsdom
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from '../../../convex/_generated/api'
import schema from '../../../convex/schema'
import { EventHorseServiceDetailsForm } from '../events/EventHorseServiceDetailsForm'
import { StableProviderForm } from '../stables/StableProviderForm'
import { StableMemberDetailsFormView } from '../stables/StableMemberDetailsForm'

const modules = import.meta.glob('../../../convex/**/*.ts')
afterEach(cleanup)
async function setup() {
  const t = convexTest(schema, modules)
  const actor = t.withIdentity({ subject: 'owner', email: 'owner@test.dev' })
  await actor.mutation(api.users.ensureCurrentUser, {})
  const stableId = await actor.mutation(api.stables.add, {
    name: 'Yard',
    location: 'Warsaw',
  })
  return { t, actor, stableId }
}

it('persists participation edits and cleared costs through the rendered form and real Convex mutation', async () => {
  const { actor } = await setup()
  const horseId = await actor.mutation(api.horses.add, {
    name: 'Maple',
    age: 8,
  })
  const eventId = await actor.mutation(api.events.add, {
    horseIds: [horseId],
    title: 'Visit',
    type: 'vet',
    date: '2026-10-20',
    time: '10:00',
  })
  const read = async () =>
    (await actor.query(api.eventHorseDetails.listForEvent, { eventId })).rows[0]
      .eventHorse
  const { _id: id } = await read()
  await actor.mutation(api.eventHorseDetails.update, {
    id,
    requestedServiceNotes: 'Before',
    completionNotes: 'After',
    costShare: 120,
  })
  const save = vi.fn(async (values) => {
    await actor.mutation(
      api.eventHorseDetails.update,
      JSON.parse(JSON.stringify({ id, ...values })),
    )
  })
  render(
    <EventHorseServiceDetailsForm
      defaultValues={{
        requestedServiceNotes: 'Before',
        completionNotes: 'After',
        costShare: 120,
      }}
      onSubmit={save}
      onCancel={() => {}}
    />,
  )
  const textareas = screen.getAllByRole('textbox')
  fireEvent.change(textareas[0], { target: { value: 'Revised request' } })
  fireEvent.change(textareas[1], { target: { value: '' } })
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } })
  fireEvent.submit(textareas[0].closest('form')!)
  await waitFor(() => expect(save).toHaveBeenCalledOnce())
  await waitFor(async () =>
    expect(await read()).toMatchObject({
      requestedServiceNotes: 'Revised request',
    }),
  )
  expect((await read()).costShare).toBeUndefined()
  expect((await read()).completionNotes).toBeUndefined()
})

it('a provider form retains a rejected draft, retries once, and persists empty optional fields', async () => {
  const { actor, stableId } = await setup()
  const id = await actor.mutation(api.stableProviders.add, {
    stableId,
    type: 'vet',
    name: 'Original',
    phone: '123',
    email: 'vet@test.dev',
    notes: 'Old notes',
  })
  const read = async () =>
    (await actor.query(api.stableProviders.listForStable, { stableId }))
      .providers[0]
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockImplementation(async (values) =>
      actor.mutation(api.stableProviders.update, { id, ...values }),
    )
  render(<StableProviderForm provider={await read()} onSubmit={save} />)
  const inputs = screen.getAllByRole('textbox')
  fireEvent.change(inputs[0], { target: { value: 'Revised vet' } })
  for (const input of inputs.slice(1))
    fireEvent.change(input, { target: { value: '' } })
  fireEvent.submit(inputs[0].closest('form')!)
  await screen.findByRole('alert')
  expect((inputs[0] as HTMLInputElement).value).toBe('Revised vet')
  expect((await read()).name).toBe('Original')
  fireEvent.submit(inputs[0].closest('form')!)
  await waitFor(async () => expect((await read()).name).toBe('Revised vet'))
  expect(save).toHaveBeenCalledTimes(2)
  for (const key of ['phone', 'email', 'notes'] as const)
    expect((await read())[key]).toBeUndefined()
})

it('member detail changes persist before the form reports success, including clearing old contact data', async () => {
  const { t, actor, stableId } = await setup()
  const userId = (await actor.query(api.users.getCurrentUser, {}))!._id
  const id = await t.run((ctx) =>
    ctx.db.insert('stableMembers', {
      stableId,
      userId,
      role: 'member',
      phone: '123',
      emergencyContact: 'Original',
    }),
  )
  const member = (await t.run((ctx) => ctx.db.get(id)))!
  const onSaved = vi.fn()
  render(
    <StableMemberDetailsFormView
      member={member}
      onCancel={() => {}}
      onSaved={onSaved}
      onSave={async (values) => {
        await actor.mutation(api.stableMembers.updateDetails, { id, ...values })
        return true
      }}
    />,
  )
  const inputs = screen.getAllByRole('textbox')
  for (const input of inputs) fireEvent.change(input, { target: { value: '' } })
  fireEvent.submit(inputs[0].closest('form')!)
  await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
  const saved = await t.run((ctx) => ctx.db.get(id))
  expect(saved?.phone).toBeUndefined()
  expect(saved?.emergencyContact).toBeUndefined()
})
