import { describe, expect, it } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

async function fixture() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async (ctx) => {
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
    const outsiderId = await ctx.db.insert('users', {
      clerkId: 'outsider',
      email: 'outsider@example.com',
      firstName: 'Outsider',
      createdAt: now,
      updatedAt: now,
    })
    const stableId = await ctx.db.insert('stables', {
      ownerId,
      name: 'Yard',
      location: 'Warsaw',
      emergencyPhone: '+48123456789',
    })
    const otherStableId = await ctx.db.insert('stables', {
      ownerId: outsiderId,
      name: 'Other yard',
      location: 'Warsaw',
    })
    await ctx.db.insert('stableMembers', {
      userId: memberId,
      stableId,
      role: 'member',
    })
    const providerId = await ctx.db.insert('stableProviders', {
      stableId,
      createdBy: ownerId,
      name: 'Dr A',
      type: 'vet',
      phone: '+48111111111',
      createdAt: now,
      updatedAt: now,
    })
    const otherProviderId = await ctx.db.insert('stableProviders', {
      stableId: otherStableId,
      createdBy: outsiderId,
      name: 'Private vet',
      type: 'vet',
      createdAt: now,
      updatedAt: now,
    })
    const farrierId = await ctx.db.insert('stableProviders', {
      stableId,
      createdBy: ownerId,
      name: 'Farrier',
      type: 'farrier',
      createdAt: now,
      updatedAt: now,
    })
    return { stableId, providerId, otherProviderId, farrierId }
  })
  return {
    t,
    ...ids,
    owner: t.withIdentity({ subject: 'owner' }),
    member: t.withIdentity({ subject: 'member' }),
    outsider: t.withIdentity({ subject: 'outsider' }),
  }
}

describe('shared contacts and current horse references', () => {
  it('lets members read operational information and contacts without granting administration', async () => {
    const f = await fixture()
    expect(
      await f.member.query(api.stables.get, { id: f.stableId }),
    ).toMatchObject({ emergencyPhone: '+48123456789' })
    expect(
      await f.member.query(api.stableProviders.listForStable, {
        stableId: f.stableId,
      }),
    ).toMatchObject({
      canManage: false,
      providers: expect.arrayContaining([
        expect.objectContaining({ name: 'Dr A' }),
      ]),
    })
    expect(
      await f.member.query(api.stableMembers.listByStable, {
        stableId: f.stableId,
      }),
    ).toHaveLength(2)
    await expect(
      f.member.query(api.stableMembers.listWithUsers, { stableId: f.stableId }),
    ).rejects.toThrow()
    await expect(
      f.member.mutation(api.stableProviders.remove, { id: f.providerId }),
    ).rejects.toThrow()
    await expect(
      f.outsider.query(api.stableProviders.listForStable, {
        stableId: f.stableId,
      }),
    ).rejects.toThrow()
  })
  it('reads updated saved contacts, and detaches with current details when a contact is removed', async () => {
    const f = await fixture()
    const horseId = await f.member.mutation(api.horses.add, {
      stableId: f.stableId,
      name: 'Willow',
      age: 7,
      vetProviderId: f.providerId,
    })
    await f.owner.mutation(api.stableProviders.update, {
      id: f.providerId,
      type: 'vet',
      name: 'Dr B',
      phone: '+48222222222',
    })
    expect(await f.member.query(api.horses.get, { id: horseId })).toMatchObject(
      { vetName: 'Dr B', vetPhone: '+48222222222' },
    )
    expect(
      await f.member.query(api.horseCareSummary.getForHorse, { horseId }),
    ).toMatchObject({ horse: { vetName: 'Dr B', vetPhone: '+48222222222' } })
    await f.owner.mutation(api.stableProviders.remove, { id: f.providerId })
    const horse = await f.member.query(api.horses.get, { id: horseId })
    expect(horse).toMatchObject({ vetName: 'Dr B', vetPhone: '+48222222222' })
    expect(horse?.vetProviderId).toBeUndefined()
  })
  it('preserves historical appointment details and detaches references when a contact changes type', async () => {
    const f = await fixture()
    const horseId = await f.member.mutation(api.horses.add, {
      stableId: f.stableId,
      name: 'Willow',
      age: 7,
      vetProviderId: f.providerId,
    })
    const eventId = await f.t.run(async (ctx) => {
      const provider = await ctx.db.get(f.providerId)
      return ctx.db.insert('events', {
        stableId: f.stableId,
        createdBy: provider!.createdBy,
        horseIds: [horseId],
        title: 'Vet visit',
        type: 'vet',
        date: '2026-09-01',
        time: '09:00',
        providerName: 'Dr A',
        providerPhone: '+48111111111',
      })
    })
    await f.owner.mutation(api.stableProviders.update, {
      id: f.providerId,
      name: 'Dr B',
      type: 'vet',
      phone: '+48222222222',
    })
    await f.owner.mutation(api.stableProviders.update, {
      id: f.providerId,
      name: 'Practice office',
      type: 'other',
      phone: '+48333333333',
    })
    const horse = await f.member.query(api.horses.get, { id: horseId })
    expect(horse).toMatchObject({ vetName: 'Dr B', vetPhone: '+48222222222' })
    expect(horse?.vetProviderId).toBeUndefined()
    expect(await f.t.run((ctx) => ctx.db.get(eventId))).toMatchObject({
      providerName: 'Dr A',
      providerPhone: '+48111111111',
    })
  })
  it('rejects links to other yards and the wrong contact type; preserves one-off contacts', async () => {
    const f = await fixture()
    for (const providerId of [f.otherProviderId, f.farrierId])
      await expect(
        f.member.mutation(api.horses.add, {
          stableId: f.stableId,
          name: 'Willow',
          age: 7,
          vetProviderId: providerId,
        }),
      ).rejects.toThrow('Choose a saved contact')
    const horseId = await f.member.mutation(api.horses.add, {
      stableId: f.stableId,
      name: 'Willow',
      age: 7,
      vetName: 'One-off vet',
      vetPhone: '+48333333333',
    })
    expect(await f.member.query(api.horses.get, { id: horseId })).toMatchObject(
      { vetName: 'One-off vet', vetPhone: '+48333333333' },
    )
  })
})
