import { expect, expectNoGenericError, test } from '../support/fixtures'
import { users } from '../support/users'

test('a horse owner invites a rider to a session, who accepts from their training page', async ({
  as,
  seed,
}) => {
  const session = `/stables/${seed.stables.hilltop}/training/${seed.events.riderLesson}`
  const mia = await as('member')
  await mia.goto(session)
  await mia.getByLabel('Participant’s email').fill(users.outsider.email)
  await mia.getByRole('button', { name: 'Invite to this session' }).click()
  const invited = mia
    .getByRole('listitem')
    .filter({ hasText: users.outsider.email })
  await expect(invited).toContainText('Awaiting acceptance')

  // The rider needn't belong to the stable: the invite waits on their own Training page.
  const oscar = await as('outsider')
  await oscar.goto('/training')
  await expect(oscar.getByText('Clover jumping lesson · Clover')).toBeVisible()
  await oscar.getByRole('button', { name: 'Accept', exact: true }).click()
  await expect(
    oscar.getByRole('button', { name: 'Accept', exact: true }),
  ).toHaveCount(0)
  await expectNoGenericError(oscar)

  await expect(invited).toContainText('Accepted')
})

test('@mobile only the horse’s owner is offered the rider invite', async ({
  as,
  seed,
}) => {
  const max = await as('member2')
  await max.goto(
    `/stables/${seed.stables.hilltop}/training/${seed.events.riderLesson}`,
  )
  await expect(
    max.getByRole('heading', { name: 'Clover jumping lesson', level: 1 }),
  ).toBeVisible()
  await expect(
    max.getByRole('button', { name: 'Invite to this session' }),
  ).toHaveCount(0)
  await expectNoGenericError(max)
})
