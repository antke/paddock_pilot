import { createClerkClient } from '@clerk/backend'
import { ConvexHttpClient } from 'convex/browser'
import { e2eEnv } from './env'

// +clerk_test addresses never receive real email in a Clerk dev instance.
const email = (key: string) => `pp-e2e-${key}+clerk_test@example.com`

export const users = {
  owner: { email: email('owner'), firstName: 'Olivia', lastName: 'Owner' },
  member: { email: email('member'), firstName: 'Mia', lastName: 'Member' },
  member2: { email: email('member2'), firstName: 'Max', lastName: 'Member' },
  editor: { email: email('editor'), firstName: 'Eddie', lastName: 'Editor' },
  viewer: { email: email('viewer'), firstName: 'Vera', lastName: 'Viewer' },
  outsider: {
    email: email('outsider'),
    firstName: 'Oscar',
    lastName: 'Outsider',
  },
  leaver: { email: email('leaver'), firstName: 'Lena', lastName: 'Leaver' },
  newcomer: {
    email: email('newcomer'),
    firstName: 'Nina',
    lastName: 'Newcomer',
  },
  polish: { email: email('polish'), firstName: 'Piotr', lastName: 'Polak' },
} as const

export type UserKey = keyof typeof users
export const userKeys = Object.keys(users) as Array<UserKey>
export const storageStatePath = (key: UserKey) => `e2e/.auth/${key}.json`

export const clerk = createClerkClient({ secretKey: e2eEnv.clerkSecretKey })

export async function ensureClerkUser(key: UserKey) {
  const user = users[key]
  const { data } = await clerk.users.getUserList({ emailAddress: [user.email] })
  return (
    data[0] ??
    (await clerk.users.createUser({
      emailAddress: [user.email],
      firstName: user.firstName,
      lastName: user.lastName,
      skipPasswordRequirement: true,
    }))
  )
}

/** A Convex client signed in as the Clerk user, the same way the browser is. */
export async function convexAs(clerkUserId: string) {
  const session = await clerk.sessions.createSession({ userId: clerkUserId })
  const client = new ConvexHttpClient(e2eEnv.convexUrl)
  // Clerk session tokens last a minute; fetch a fresh one per call.
  const fetchToken = async () =>
    (await clerk.sessions.getToken(session.id, 'convex')).jwt
  client.setAuth(await fetchToken())
  return {
    client,
    refresh: async () => client.setAuth(await fetchToken()),
    close: () => clerk.sessions.revokeSession(session.id),
  }
}
