import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import schema from './schema'
import { api, internal } from './_generated/api'
import { createEmailContent } from './libs/email/templates'

const modules = import.meta.glob('./**/*.ts')
const appUrl = 'https://paddock.example'

describe('email language delivery lifecycle', () => {
  it('snapshots welcome language and does not resend after preference changes', async () => {
    const t = convexTest(schema, modules)
    const user = t.withIdentity({ subject: 'A', email: 'a@example.com' })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'pl' })
    await user.mutation(api.users.setLocale, { locale: 'en' })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'en' })
    const deliveries = await t.run((ctx) =>
      ctx.db.query('emailDeliveries').collect(),
    )
    expect(deliveries).toHaveLength(1)
    expect(deliveries[0].locale).toBe('pl')
    const prepared = await t.mutation(internal.emailDeliveries.prepareSend, {
      deliveryId: deliveries[0]._id,
      provider: 'console',
    })
    expect(prepared.shouldSend).toBe(true)
    if (!prepared.shouldSend) throw new Error('Welcome should be sendable')
    expect(
      createEmailContent(
        prepared.delivery.template,
        appUrl,
        prepared.delivery.locale,
      ).subject,
    ).toBe('Witamy w Paddock Pilot')
    await t.mutation(internal.emailDeliveries.recordFailure, {
      deliveryId: deliveries[0]._id,
      error: 'temporary failure',
      retryable: true,
    })
    const retry = await t.run((ctx) => ctx.db.get(deliveries[0]._id))
    expect(retry?.locale).toBe('pl')
  })
  it('honors known recipients and defaults new invitees to the invitation language', async () => {
    const t = convexTest(schema, modules)
    const owner = t.withIdentity({
      subject: 'owner',
      email: 'owner@example.com',
    })
    const member = t.withIdentity({
      subject: 'member',
      email: 'member@example.com',
    })
    await owner.mutation(api.users.ensureCurrentUser, { locale: 'pl' })
    await member.mutation(api.users.ensureCurrentUser, { locale: 'en' })
    const stableId = await owner.mutation(api.stables.add, {
      name: 'Łąki',
      location: 'Warszawa',
    })
    await owner.mutation(api.stableInvitations.create, {
      stableId,
      email: 'member@example.com',
      role: 'member',
      locale: 'pl',
    })
    await owner.mutation(api.stableInvitations.create, {
      stableId,
      email: 'new@example.com',
      role: 'member',
    })
    await owner.mutation(api.stableInvitations.create, {
      stableId,
      email: 'english@example.com',
      role: 'member',
      locale: 'en',
    })
    const deliveries = await t.run((ctx) =>
      ctx.db.query('emailDeliveries').collect(),
    )
    const invitations = deliveries.filter(
      (delivery) => delivery.category === 'stable_invitation',
    )
    expect(
      invitations.map((delivery) => [delivery.recipient, delivery.locale]),
    ).toEqual([
      ['member@example.com', 'en'],
      ['new@example.com', 'pl'],
      ['english@example.com', 'en'],
    ])
    const outputs = invitations.map((delivery) =>
      createEmailContent(delivery.template!, appUrl, delivery.locale),
    )
    expect(outputs[0].html).toContain('<html lang="en">')
    expect(outputs[1].html).toContain('<html lang="pl">')
    expect(outputs[2].html).toContain('<html lang="en">')
  })
  it('keeps webhook-first welcome in English and deletion in the saved language', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'webhook',
      email: 'webhook@example.com',
      firstName: 'Antek',
    })
    const user = t.withIdentity({
      subject: 'webhook',
      email: 'webhook@example.com',
    })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'pl' })
    await t.mutation(internal.users.deleteUser, { clerkId: 'webhook' })
    const deliveries = await t.run((ctx) =>
      ctx.db.query('emailDeliveries').collect(),
    )
    expect(
      deliveries.map((delivery) => [delivery.category, delivery.locale]),
    ).toEqual([
      ['account_welcome', 'en'],
      ['account_deleted', 'pl'],
    ])
  })
})
