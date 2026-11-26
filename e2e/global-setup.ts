import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
import { saveStorageState, setupClerkTesting } from './support/auth'
import { pushFunctions, runInternal } from './support/convexCli'
import { e2eEnv } from './support/env'
import { seed } from './support/seed'
import { seedPath } from './support/seedData'
import { ensureClerkUser, userKeys } from './support/users'

export default async function globalSetup() {
  // Quick reruns while writing a test: keep the last seed and sessions (they mutate, so reseed before trusting a pass).
  if (process.env.E2E_REUSE_SEED === '1' && existsSync(seedPath)) {
    await setupClerkTesting()
    return
  }
  const started = Date.now()
  const log = (step: string) =>
    console.log(
      `[e2e] ${step} (${((Date.now() - started) / 1000).toFixed(1)}s)`,
    )

  pushFunctions()
  log(`pushed functions to ${e2eEnv.convexDeployment}`)
  runInternal('e2e:reset')
  log('wiped e2e deployment')

  const clerkUsers = Object.fromEntries(
    await Promise.all(
      userKeys.map(
        async (key) => [key, (await ensureClerkUser(key)).id] as const,
      ),
    ),
  ) as Record<(typeof userKeys)[number], string>
  const data = await seed(clerkUsers)
  mkdirSync('e2e/.auth', { recursive: true })
  writeFileSync(seedPath, JSON.stringify(data, null, 2))
  log('seeded users, stables, horses and activities')

  await setupClerkTesting()
  const browser = await chromium.launch()
  try {
    await Promise.all(userKeys.map((key) => saveStorageState(browser, key)))
  } finally {
    await browser.close()
  }
  log('signed in every test user')
}
