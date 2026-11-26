import {
  expect,
  expectNoGenericError,
  pickHorse,
  test,
} from '../support/fixtures'

const closedHint =
  'This event already happened. To take the horse off, edit the event and untick it.'

test('@mobile withdraw is greyed out on a past event and tapping it explains why', async ({
  as,
  seed,
}) => {
  const member = await as('member')
  await member.goto(`/events/${seed.events.pastFarrier}`)
  const row = member.getByRole('group', { name: 'Clover service notes' })
  const withdraw = row.getByRole('button', { name: 'Withdraw horse' })
  await expect(withdraw).toHaveAttribute('aria-disabled', 'true')
  // A forced tap skips Playwright's hit check, so keep it clear of the phone's bottom bar.
  await withdraw.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await withdraw.click({ force: true }) // aria-disabled still answers a tap with the reason
  await expect(
    member.getByText(closedHint).filter({ visible: true }).first(),
  ).toBeVisible()
  // Nothing was sent: the horse is still on the event.
  await expect(
    member.getByRole('listitem').filter({ hasText: 'Clover' }),
  ).toContainText('Confirmed')
})

test('the organiser edits a past event and unticks a horse', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(`/events/${seed.events.pastFarrier}/edit`)
  await pickHorse(owner, 'Dusty', false)
  await owner.getByRole('button', { name: 'Save changes' }).click()
  await expect(
    owner.getByRole('heading', { name: 'Past farrier visit', level: 1 }),
  ).toBeVisible()
  await expect(
    owner.getByRole('listitem').filter({ hasText: 'Dusty' }),
  ).toContainText('Withdrawn')

  const dustyOwner = await as('member2')
  await dustyOwner.goto(`/events/${seed.events.pastFarrier}`)
  await expect(
    dustyOwner.getByRole('listitem').filter({ hasText: 'Dusty' }),
  ).toContainText('Withdrawn')
})

test('a past event whose horse has since left the stable can still be saved', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(`/events/${seed.events.pastDentistShared}/edit`)
  await owner.getByLabel('Title').fill('Past dentist round (notes added)')
  await owner.getByRole('button', { name: 'Save changes' }).click()
  await expect(
    owner.getByRole('heading', {
      name: 'Past dentist round (notes added)',
      level: 1,
    }),
  ).toBeVisible()
  await expectNoGenericError(owner)
})

test('a past event whose only horse has left the stable can still be saved', async ({
  as,
  seed,
}) => {
  const owner = await as('owner')
  await owner.goto(`/events/${seed.events.pastPhysioAlone}/edit`)
  await owner.getByLabel('Title').fill('Past physio (renamed)')
  await owner.getByRole('button', { name: 'Save changes' }).click()
  await expect(
    owner.getByRole('heading', { name: 'Past physio (renamed)', level: 1 }),
  ).toBeVisible()

  // Willow's owner still has the visit in Willow's history.
  const max = await as('member2')
  await max.goto(
    `/events/${seed.events.pastPhysioAlone}?horseId=${seed.horses.willow}`,
  )
  await expect(max.getByText('Willow').first()).toBeVisible()
  await expectNoGenericError(max)
})
