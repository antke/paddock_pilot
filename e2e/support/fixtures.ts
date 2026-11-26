import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test as base, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { seedData } from './seedData'
import type { SeedData } from './seedData'
import { storageStatePath } from './users'
import type { UserKey } from './users'

type Fixtures = {
  /** Opens a page signed in as a seeded user; several users can share one test. */
  as: (key: UserKey) => Promise<Page>
  seed: SeedData
}

export const test = base.extend<Fixtures>({
  // Playwright reads the fixture's dependencies from this destructuring, even when empty.
  // eslint-disable-next-line no-empty-pattern
  seed: async ({}, use) => use(seedData()),
  as: async ({ browser }, use, testInfo) => {
    const contexts: Array<Awaited<ReturnType<typeof browser.newContext>>> = []
    await use(async (key) => {
      const context = await browser.newContext({
        ...testInfo.project.use,
        storageState: storageStatePath(key),
      })
      contexts.push(context)
      // The dev-only TanStack Devtools button floats over bottom-right row actions.
      await context.addInitScript(() =>
        addEventListener('DOMContentLoaded', () => {
          const style = document.createElement('style')
          style.textContent =
            'button[aria-label="Open TanStack Devtools"]{display:none!important}'
          document.head.append(style)
        }),
      )
      const page = await context.newPage()
      await setupClerkTestingToken({ page })
      return page
    })
    for (const context of contexts) await context.close()
  },
})

export { expect }

/** No generic "something went wrong" may stand in for an explained refusal. */
export async function expectNoGenericError(page: Page) {
  await expect(
    page.getByText(
      /something went wrong|this page couldn.t load|unexpected error/i,
    ),
  ).toHaveCount(0)
}

/** Ticks a horse card in a form; the real checkbox is visually hidden behind the card. */
export async function pickHorse(
  scope: Page | Locator,
  name: string,
  checked = true,
) {
  const box = scope.getByRole('checkbox', { name: new RegExp(`^${name}\\b`) })
  if ((await box.isChecked()) !== checked) await box.dispatchEvent('click')
  await (checked ? expect(box).toBeChecked() : expect(box).not.toBeChecked())
}
