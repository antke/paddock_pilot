import {
  expect,
  expectNoGenericError,
  pickHorse,
  test,
} from '../support/fixtures'
import { dateKey } from '../support/seedData'

test('member creates an event, the owner approves their horse, and Delete offers Cancel instead', async ({
  as,
  seed,
}) => {
  const title = `Lunging clinic ${Date.now() % 100000}`
  const member = await as('member')
  await member.goto(`/stables/${seed.stables.hilltop}/events/create`)
  await member.getByLabel('Title').fill(title)
  await member.getByRole('button', { name: 'Other', exact: true }).click()
  await member.locator('#date').fill(dateKey(5))
  await member.locator('#time').fill('10:00')
  await pickHorse(member, 'Clover')
  await pickHorse(member, 'Bramble')
  // Another owner's horse is invited, never added silently.
  await expect(member.getByText('Added: 1 · Invited: 1')).toBeVisible()
  await member.getByRole('button', { name: 'Create event' }).click()
  await expect(
    member.getByRole('heading', { name: title, level: 1 }),
  ).toBeVisible()
  const eventUrl = member.url()

  const owner = await as('owner')
  await owner.goto(eventUrl)
  await owner
    .getByRole('button', { name: `Approve invitation for Bramble to ${title}` })
    .click()
  await expect(
    owner.getByText(`Bramble’s invitation to ${title} was approved.`),
  ).toBeVisible()

  await member.reload()
  await expect(
    member.getByRole('listitem').filter({ hasText: 'Bramble' }),
  ).toContainText('Confirmed')

  // Olivia's horse now takes part, so Mia can't delete: the dialog says why and offers Cancel.
  await member.getByRole('button', { name: 'More actions' }).click()
  await member.getByRole('menuitem', { name: 'Delete event' }).click()
  const blocked = member.getByRole('alertdialog')
  await expect(blocked).toContainText(`You can’t delete ${title}`)
  await expect(blocked).toContainText('You can cancel it instead')
  await blocked.getByRole('button', { name: 'Cancel event' }).click()
  await expect(member.getByText('Cancelled').first()).toBeVisible()
  await expectNoGenericError(member)

  await owner.reload()
  await expect(owner.getByText('Cancelled').first()).toBeVisible()
})

test('a horse owner declines an event invitation and the horse stays off the event', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(`/events/${seed.events.declineInvite}`)
  await member
    .getByRole('button', {
      name: 'Decline invitation for Clover to Hack to the lake',
    })
    .click()
  await expect(
    member.getByText('Clover’s invitation to Hack to the lake was declined.'),
  ).toBeVisible()

  const organiser = await as('member2')
  await organiser.goto(`/events/${seed.events.declineInvite}`)
  await expect(
    organiser.getByRole('listitem').filter({ hasText: 'Clover' }),
  ).toContainText('Declined')
  await expect(
    organiser.getByRole('listitem').filter({ hasText: 'Dusty' }),
  ).toContainText('Confirmed')
})
