import type { Page } from '@playwright/test'
import { expect, expectNoGenericError, test } from '../support/fixtures'
import { dateKey } from '../support/seedData'

// The weekly lesson started 14 days ago, so -7, +7 and +14 are real occurrences.
const lesson = (id: string, offset: number) =>
  `/events/${id}?date=${dateKey(offset)}`

test('@mobile past dates of a series offer no per-date cancel or skip', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(lesson(seed.events.weeklyLesson, -7))
  const clover = member.getByRole('group', { name: 'Clover service notes' })
  await expect(clover).toBeVisible()
  await expect(clover.getByRole('button', { name: /^Skip / })).toHaveCount(0)

  const owner = await as('owner')
  await owner.goto(lesson(seed.events.weeklyLesson, -7))
  await expect(
    owner.getByRole('heading', { name: 'Weekly group lesson', level: 1 }),
  ).toBeVisible()
  await openEventActions(owner)
  await expect(
    owner.getByRole('menuitem', { name: /^Cancel only/ }),
  ).toHaveCount(0)
  await expect(
    owner.getByRole('menuitem', { name: 'Cancel event' }),
  ).toBeVisible()
})

test('a horse owner skips a future date of a series and undoes it', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(lesson(seed.events.weeklyLesson, 7))
  const clover = member.getByRole('group', { name: 'Clover service notes' })
  await clover.getByRole('button', { name: /^Skip / }).click()
  await expect(clover.getByRole('button', { name: /^Join / })).toBeVisible()

  // The organiser sees Clover sitting that date out.
  const owner = await as('owner')
  await owner.goto(lesson(seed.events.weeklyLesson, 7))
  await expect(
    owner
      .getByRole('group', { name: 'Clover service notes' })
      .getByRole('button', { name: /^Join / }),
  ).toBeVisible()

  await clover.getByRole('button', { name: /^Join / }).click()
  await expect(clover.getByRole('button', { name: /^Skip / })).toBeVisible()
})

test('the organiser cancels one future date of a series and restores it', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(lesson(seed.events.weeklyLesson, 14))
  await openEventActions(owner)
  await owner.getByRole('menuitem', { name: /^Cancel only/ }).click()
  await owner
    .getByRole('alertdialog')
    .getByRole('button', { name: /^Cancel only/ })
    .click()
  await expect(owner.getByRole('alertdialog')).toBeHidden()

  await openEventActions(owner)
  await owner.getByRole('menuitem', { name: /^Restore / }).click()
  await owner
    .getByRole('alertdialog')
    .getByRole('button', { name: /^Restore / })
    .click()
  await expect(owner.getByRole('alertdialog')).toBeHidden()
  await openEventActions(owner)
  await expect(
    owner.getByRole('menuitem', { name: /^Cancel only/ }),
  ).toBeVisible()
})

test('a skip or a cancel made before the date passed can still be undone', async ({
  as,
  seed,
}) => {
  // Seeded as if made while these dates were still ahead.
  const groundwork = (date: string) =>
    `/events/${seed.events.groundwork}?date=${date}`
  const member = await as('member')
  await member.goto(groundwork(seed.dates.groundworkSkipped))
  const clover = member.getByRole('group', { name: 'Clover service notes' })
  await clover.getByRole('button', { name: /^Join / }).click()
  // Clover is back in, and a past date can't be skipped again.
  await expect(
    clover.getByRole('button', { name: /^(Join|Skip) / }),
  ).toHaveCount(0)
  await expectNoGenericError(member)

  const owner = await as('owner')
  await owner.goto(groundwork(seed.dates.groundworkCancelled))
  await openEventActions(owner)
  await owner.getByRole('menuitem', { name: /^Restore / }).click()
  await owner
    .getByRole('alertdialog')
    .getByRole('button', { name: /^Restore / })
    .click()
  await expect(owner.getByRole('alertdialog')).toBeHidden()
  await openEventActions(owner)
  await expect(
    owner.getByRole('menuitem', { name: /^(Restore|Cancel only) / }),
  ).toHaveCount(0)
  await expectNoGenericError(owner)
})

/** Desktop shows "More actions"; phones fold the same items into "Actions". */
async function openEventActions(page: Page) {
  await page
    .getByRole('button', { name: /^(More actions|Actions)$/ })
    .first()
    .click()
}
