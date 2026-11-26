import type { Page } from '@playwright/test'
import {
  expect,
  expectNoGenericError,
  pickHorse,
  test,
} from '../support/fixtures'

const everyoneAtHilltop = [
  'Max Member',
  'Mia Member',
  'Olivia Owner',
  'Piotr Polak',
]

// Who the "Assigned to" list should offer, per the server's assignee rule.
const cases = [
  {
    name: 'the owner’s own horse',
    horses: ['Bramble'],
    offered: ['Olivia Owner'],
  },
  { name: 'a member’s horse', horses: ['Clover'], offered: everyoneAtHilltop },
  {
    name: 'an unclaimed horse',
    horses: ['Mystery'],
    offered: everyoneAtHilltop,
  },
  {
    name: 'several horses at once',
    horses: ['Bramble', 'Clover'],
    offered: ['Olivia Owner'],
  },
]

for (const { name, horses, offered } of cases)
  test(`the Assigned to list for ${name} offers only people the save accepts`, async ({
    as,
    seed,
  }) => {
    const owner = await as('owner')
    await owner.goto(`/stables/${seed.stables.hilltop}/reminders`)
    const dialog = await openAddReminder(owner, horses)
    // The options follow the ticked horses through a live query, so poll until they settle.
    await expect
      .poll(async () => (await assigneeOptions(dialog)).sort())
      .toEqual(offered)

    for (const person of offered) {
      if (person !== offered[0]) await openAddReminder(owner, horses)
      const title = `Check rugs for ${person} ${Date.now() % 100000}`
      await dialog.getByLabel('Title').fill(title)
      await dialog
        .getByRole('combobox', { name: 'Assigned to' })
        .selectOption({ label: person })
      await dialog.getByRole('button', { name: /^Add reminders?$/ }).click()
      await expect(owner.getByText(/^Reminders? added$/).first()).toBeVisible()
      await expect(dialog).toBeHidden()
    }
    await expectNoGenericError(owner)
  })

test('an assigned member completes a stable reminder, and an outsider can’t reach it', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(`/stables/${seed.stables.hilltop}/reminders`)
  await member
    .getByRole('button', { name: 'Actions for Refill the haynets' })
    .click()
  await member.getByRole('menuitem', { name: 'Complete' }).click()
  await expect(member.getByText('Reminder completed').first()).toBeVisible()

  const owner = await as('owner')
  await owner.goto(`/stables/${seed.stables.hilltop}/reminders`)
  await owner.getByRole('button', { name: 'Done', exact: true }).click()
  await owner
    .getByRole('button', { name: 'Actions for Refill the haynets' })
    .click()
  await expect(owner.getByRole('menuitem', { name: 'Reopen' })).toBeVisible()

  const outsider = await as('outsider')
  await outsider.goto(`/stables/${seed.stables.hilltop}/reminders`)
  await expect(outsider.getByText('Refill the haynets')).toHaveCount(0)
  await expect(
    outsider.getByRole('button', { name: /^Actions for / }),
  ).toHaveCount(0)
})

test('a member assigned to someone else’s horse reminder completes it without gaining edit rights', async ({
  as,
  seed,
}) => {
  const max = await as('member2')
  await max.goto(`/stables/${seed.stables.hilltop}/reminders`)
  await max
    .getByRole('button', { name: 'Actions for Check Clover’s shoes' })
    .click()
  await expect(max.getByRole('menuitem', { name: /^Edit/ })).toHaveCount(0)
  await max.getByRole('menuitem', { name: 'Complete' }).click()
  await expect(max.getByText('Reminder completed').first()).toBeVisible()

  // Clover's owner sees it done.
  const mia = await as('member')
  await mia.goto(`/stables/${seed.stables.hilltop}/reminders`)
  await mia.getByRole('button', { name: 'Done', exact: true }).click()
  await mia
    .getByRole('button', { name: 'Actions for Check Clover’s shoes' })
    .click()
  await expect(mia.getByRole('menuitem', { name: 'Reopen' })).toBeVisible()
})

async function openAddReminder(page: Page, horses: Array<string>) {
  await page.getByRole('button', { name: 'Add reminder' }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Add reminder' })
  await dialog.getByRole('button', { name: 'Specific horses' }).click()
  for (const horse of horses) await pickHorse(dialog, horse)
  await expect(dialog.getByText(`${horses.length} selected`)).toBeVisible()
  return dialog
}

async function assigneeOptions(dialog: ReturnType<Page['getByRole']>) {
  const select = dialog.getByRole('combobox', { name: 'Assigned to' })
  return (await select.locator('option').allInnerTexts()).filter(
    (o) => o !== 'Unassigned',
  )
}
