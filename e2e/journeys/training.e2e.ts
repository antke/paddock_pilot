import { expect, pickHorse, test } from '../support/fixtures'
import { dateKey } from '../support/seedData'

test('a horse owner plans a training session and records it as completed', async ({
  as,
  seed,
}) => {
  const title = `Pole work ${Date.now() % 100000}`
  const member = await as('member')
  await member.goto(`/stables/${seed.stables.hilltop}/training/create`)
  await member.getByLabel('Title').fill(title)
  await member.getByRole('button', { name: 'Flatwork' }).click()
  await member.locator('#date').fill(dateKey(0))
  await member.locator('#time').fill('09:00')
  await pickHorse(member, 'Clover')
  await member.getByRole('button', { name: 'Create training session' }).click()
  await expect(member.getByText('Training session created')).toBeVisible()

  await member.goto(`/stables/${seed.stables.hilltop}/training`)
  await member
    .getByRole('link', { name: new RegExp(title) })
    .first()
    .click()
  await expect(
    member.getByRole('heading', { name: title, level: 1 }),
  ).toBeVisible()
  await member
    .getByRole('button', { name: `Mark complete: Clover · ${title}` })
    .first()
    .click()
  await expect(member.getByText('Training completed.')).toBeVisible()
  await expect(
    member
      .getByRole('button', { name: `Mark incomplete: Clover · ${title}` })
      .first(),
  ).toBeVisible()
})

test('a future session can’t be created as completed', async ({ as, seed }) => {
  const member = await as('member')
  await member.goto(`/stables/${seed.stables.hilltop}/training/create`)
  await member.getByLabel('Title').fill('Future completed session')
  await member.getByRole('button', { name: 'Flatwork' }).click()
  await member.locator('#date').fill(dateKey(0))
  await member.locator('#time').fill('09:00')
  await pickHorse(member, 'Clover')
  await member.getByText('More details').click()
  const status = member.getByRole('group', { name: 'Session status' })
  const completed = status.getByRole('button', { name: 'Completed' })
  await completed.click()
  await expect(completed).toHaveAttribute('aria-pressed', 'true')

  // Moving the date ahead greys Completed out and says why, so the save can't be refused.
  await member.locator('#date').fill(dateKey(6))
  await expect(completed).toBeDisabled()
  await expect(completed).toHaveAttribute('aria-pressed', 'false')
  await expect(member.getByText('This date hasn’t come yet')).toBeVisible()
  await member.getByRole('button', { name: 'Create training session' }).click()
  await expect(member.getByText('Training session created')).toBeVisible()
})

test('moving a training record’s date changes which statuses can be picked', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(`/events/${seed.events.cloverTraining}?date=${dateKey(0)}`)
  await member.getByRole('button', { name: 'Add training record' }).click()
  const status = member.getByRole('combobox', {
    name: 'Status for this horse and date',
  })
  await status.selectOption({ label: 'Scheduled' })
  await member.getByRole('button', { name: 'Save training record' }).click()
  await expect(member.getByText('Training record saved.')).toBeVisible()

  await member.getByRole('button', { name: 'Edit training record' }).click()
  const completed = status.locator('option', { hasText: 'Completed' })
  await expect(completed).toBeEnabled()
  await member.getByLabel('Date', { exact: true }).fill(dateKey(7))
  await expect(completed).toBeDisabled()
  await member.getByLabel('Date', { exact: true }).fill(dateKey(0))
  await expect(completed).toBeEnabled()
})

test('@mobile people without recording rights get no Record or Complete controls', async ({
  as,
  seed,
}) => {
  const session = `/events/${seed.events.cloverTraining}?date=${dateKey(0)}`
  for (const key of ['viewer', 'member2'] as const) {
    const page = await as(key)
    await page.goto(session)
    await expect(
      page.getByRole('heading', { name: 'Clover flatwork', level: 1 }),
    ).toBeVisible()
    await expect(page.getByText('an editing carer or a stable admin can log its training')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /^Mark (in)?complete/ }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('button', { name: /training record/ }),
    ).toHaveCount(0)
  }

  // An editor carer can record it.
  const editor = await as('editor')
  await editor.goto(session)
  await expect(
    editor.getByRole('button', { name: /^Mark (in)?complete: Clover/ }).first(),
  ).toBeVisible()
})
