import type { Page } from '@playwright/test'
import { expect, test } from '../support/fixtures'

test('archiving a stable with an unclaimed horse explains what to do, then works once it’s dealt with', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(`/stables/${seed.stables.oldBarn}/settings`)
  await archive(owner)
  await expect(owner.getByText('Couldn’t archive the stable')).toBeVisible()
  await expect(
    owner.getByText('Some horses here still don’t have an owner.', {
      exact: false,
    }),
  ).toBeVisible()

  await owner.goto(`/horses/${seed.horses.ghost}/manage`)
  await owner.getByRole('button', { name: 'Delete horse' }).click()
  await owner
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Delete this horse' })
    .click()
  await expect(owner).not.toHaveURL(/manage/)

  await owner.goto(`/stables/${seed.stables.oldBarn}/settings`)
  await archive(owner)
  await expect(owner.getByText('Stable archived')).toBeVisible()
  await expect(owner).toHaveURL(/\/stables\/?$/)
  await expect(owner.getByRole('link', { name: 'Old Barn' })).toHaveCount(0)
})

async function archive(page: Page) {
  await page.getByRole('button', { name: 'Archive stable' }).click()
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Archive stable' })
    .click()
}
