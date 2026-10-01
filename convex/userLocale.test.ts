import { convexTest } from 'convex-test'
import { describe, expect, it } from 'vitest'
import schema from './schema'
import { api, internal } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')

describe('account language', () => {
  it('initializes a language and preserves it through profile synchronization', async () => {
    const t = convexTest(schema, modules)
    const user = t.withIdentity({
      subject: 'polish-user',
      email: 'user@example.com',
    })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'pl' })
    expect((await user.query(api.users.getCurrentUser))?.locale).toBe('pl')
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'polish-user',
      email: 'user@example.com',
      firstName: 'Antek',
      locale: 'en',
    })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'en' })
    expect((await user.query(api.users.getCurrentUser))?.locale).toBe('pl')
  })
  it('allows only an authenticated user to change their own preference', async () => {
    const t = convexTest(schema, modules)
    const a = t.withIdentity({ subject: 'A' })
    const b = t.withIdentity({ subject: 'B' })
    await a.mutation(api.users.ensureCurrentUser, {})
    await b.mutation(api.users.ensureCurrentUser, { locale: 'en' })
    await expect(
      t.mutation(api.users.setLocale, { locale: 'pl' }),
    ).rejects.toThrow()
    await a.mutation(api.users.setLocale, { locale: 'pl' })
    expect((await a.query(api.users.getCurrentUser))?.locale).toBe('pl')
    expect((await b.query(api.users.getCurrentUser))?.locale).toBe('en')
    await expect(
      // @ts-expect-error Also verify validation at the network boundary.
      a.mutation(api.users.setLocale, { locale: 'fr' }),
    ).rejects.toThrow()
  })
  it('initializes webhook-created users on first browser bootstrap', async () => {
    const t = convexTest(schema, modules)
    await t.mutation(internal.users.upsertUser, {
      clerkId: 'webhook',
      email: '',
      firstName: 'Antek',
    })
    const user = t.withIdentity({ subject: 'webhook' })
    await user.mutation(api.users.ensureCurrentUser, { locale: 'pl' })
    expect((await user.query(api.users.getCurrentUser))?.locale).toBe('pl')
  })
})
