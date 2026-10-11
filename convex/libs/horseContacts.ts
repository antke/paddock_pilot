import { ConvexError } from 'convex/values'
import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

type HorseContacts = Pick<
  Doc<'horses'>,
  | 'vetProviderId'
  | 'farrierProviderId'
  | 'vetName'
  | 'vetPhone'
  | 'farrierName'
  | 'farrierPhone'
>
export async function validateHorseContacts(
  ctx: Pick<QueryCtx, 'db'>,
  stableId: Id<'stables'> | undefined,
  contacts: HorseContacts,
) {
  for (const kind of ['vet', 'farrier'] as const) {
    const id = contacts[`${kind}ProviderId`]
    if (!id) continue
    const provider = await ctx.db.get(id)
    if (!provider || provider.stableId !== stableId || provider.type !== kind) {
      throw new ConvexError('Choose a saved contact from this stable')
    }
    contacts[`${kind}Name`] = provider.name
    contacts[`${kind}Phone`] = provider.phone
  }
}

export async function resolveHorseContacts<
  T extends HorseContacts & { stableId?: Id<'stables'> },
>(ctx: Pick<QueryCtx, 'db'>, horse: T): Promise<T> {
  const resolved = { ...horse }
  for (const kind of ['vet', 'farrier'] as const) {
    const id = horse[`${kind}ProviderId`]
    const provider = id ? await ctx.db.get(id) : null
    if (provider && provider.stableId === horse.stableId) {
      resolved[`${kind}Name`] = provider.name
      resolved[`${kind}Phone`] = provider.phone
    }
  }
  return resolved
}
