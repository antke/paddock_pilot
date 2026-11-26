import { clerk, clerkSetup } from '@clerk/testing/playwright'
import type { Browser } from '@playwright/test'
import { e2eEnv } from './env'
import { storageStatePath, users } from './users'
import type { UserKey } from './users'

export const setupClerkTesting = () =>
  clerkSetup({
    publishableKey: e2eEnv.clerkPublishableKey,
    secretKey: e2eEnv.clerkSecretKey,
  })

/** Signs in once through Clerk's ticket flow and saves the session for tests. */
export async function saveStorageState(browser: Browser, key: UserKey) {
  const context = await browser.newContext({ baseURL: e2eEnv.baseURL })
  const page = await context.newPage()
  await page.goto('/sign-in')
  await clerk.signIn({ page, emailAddress: users[key].email })
  await page.goto('/')
  await page.waitForFunction(() => window.Clerk?.user)
  await context.storageState({ path: storageStatePath(key) })
  await context.close()
}
