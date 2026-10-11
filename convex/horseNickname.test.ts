import { expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'
import { getHorseDisplayName } from '../shared/horses/horseDisplayName'

const modules = import.meta.glob('./**/*.ts')
async function setup() {
  const t = convexTest(schema, modules)
  const stableId = await t.run(async (ctx) => {
    const now = Date.now()
    const ownerId = await ctx.db.insert('users', {
      clerkId: 'owner',
      email: 'owner@example.com',
      firstName: 'Owner',
      createdAt: now,
      updatedAt: now,
    })
    const memberId = await ctx.db.insert('users', {
      clerkId: 'member',
      email: 'member@example.com',
      firstName: 'Member',
      createdAt: now,
      updatedAt: now,
    })
    const createdStableId = await ctx.db.insert('stables', {
      name: 'Yard',
      location: 'Warsaw',
      ownerId,
    })
    await ctx.db.insert('stableMembers', {
      stableId: createdStableId,
      userId: memberId,
      role: 'member',
    })
    return createdStableId
  })
  return {
    t,
    stableId,
    owner: t.withIdentity({ subject: 'owner' }),
    member: t.withIdentity({ subject: 'member' }),
  }
}
const profile = { name: 'Secretariat', ownerName: 'Owner', age: 10 }

it('persists both names and the preference through create, edit, disable, and clear', async () => {
  const { owner, stableId } = await setup()
  const id = await owner.mutation(api.horses.add, {
    ...profile,
    stableId,
    nickname: ' Big Red ',
    useNickname: true,
  })
  const read = () => owner.query(api.horses.get, { id })
  expect(await read()).toMatchObject({
    name: 'Secretariat',
    nickname: 'Big Red',
    useNickname: true,
  })
  await owner.mutation(api.horses.update, { id, ...profile, age: 11 })
  expect(getHorseDisplayName(await read())).toBe('Big Red')
  await owner.mutation(api.horses.update, {
    id,
    ...profile,
    nickname: 'Red',
    useNickname: false,
  })
  expect(await read()).toMatchObject({
    name: 'Secretariat',
    nickname: 'Red',
    useNickname: false,
  })
  expect(getHorseDisplayName(await read())).toBe('Secretariat')
  await owner.mutation(api.horses.update, {
    id,
    ...profile,
    nickname: '',
    useNickname: false,
  })
  expect((await read())?.nickname).toBeUndefined()
  await expect(
    owner.mutation(api.horses.update, {
      id,
      ...profile,
      nickname: ' ',
      useNickname: true,
    }),
  ).rejects.toThrow('Enter a nickname')
})

it('preserves display preference in restricted roster and training projections', async () => {
  const { owner, member, stableId } = await setup()
  await owner.mutation(api.horses.add, {
    ...profile,
    stableId,
    nickname: 'Red',
    useNickname: true,
  })
  const [horse] = await member.query(api.horses.list, { stableId })
  expect(horse.canRead).toBe(false)
  expect(horse.name).toBe('Secretariat')
  expect(getHorseDisplayName(horse)).toBe('Red')
  const training = await member.query(api.training.listForStable, { stableId })
  expect(getHorseDisplayName(training.horses[0])).toBe('Red')
})

it('uses the current preference in existing reminder labels after editing the horse', async () => {
  const { owner, stableId } = await setup()
  const id = await owner.mutation(api.horses.add, { ...profile, stableId })
  await owner.mutation(api.careReminders.add, {
    stableId,
    horseId: id,
    title: 'Check water',
    category: 'other',
    priority: 'medium',
    status: 'pending',
    dueDate: '2026-10-12',
  })
  const reminders = () =>
    owner.query(api.careReminders.listForHorse, { horseId: id })
  expect((await reminders()).items?.[0]?.horseName).toBe('Secretariat')
  await owner.mutation(api.horses.update, {
    id,
    ...profile,
    nickname: 'Red',
    useNickname: true,
  })
  expect((await reminders()).items?.[0]?.horseName).toBe('Red')
})

it('supports onboarding and unclaimed horses with the same nickname validation', async () => {
  const { owner, stableId } = await setup()
  const id = await owner.mutation(api.horseCollaboration.addUnclaimed, {
    stableId,
    name: 'Secretariat',
    age: 10,
    nickname: 'Red',
    useNickname: true,
  })
  await owner.mutation(api.horses.updateOnboardingBasics, {
    id,
    name: 'Secretariat II',
    age: 11,
    nickname: 'Big Red',
    useNickname: true,
  })
  expect(await owner.query(api.horses.get, { id })).toMatchObject({
    name: 'Secretariat II',
    nickname: 'Big Red',
    useNickname: true,
  })
  await expect(
    owner.mutation(api.horseCollaboration.addUnclaimed, {
      stableId,
      name: 'Secretariat',
      age: 10,
      nickname: '',
      useNickname: true,
    }),
  ).rejects.toThrow('Enter a nickname')
})
